#!/bin/bash
## EC2 Instance template = 
# ./install.sh ami-022e07c2ebf41727f 3 t2.micro acer-kp sg-07618656 inclass-2019 subnet-dcee97e2 subnet-7f4a7f18 arn:aws:iam::338921987459:role/lambda-basic-execution
#AWS CONFIG OUTPUT NEEDS TO BE SET TO TEXT!

## Positional args
## $1 = Image ID
## $2 = desired count
## $3 = Instance Type
## $4 = Keypair Name
## $5 = Security group ID
## $6 = User
## $7 = Subnet
## $8 = Subnet2 (for elbv2)

## uncomment for hardcoding values
#image id from ami previously created
#image_id="ami-05c1fa8df71875112" #US-east-2
image_id=$1
count=$2

#INSTANCE TYPE
#image_type="t2.micro"
image_type=$3

#INSTALL APPLICATION SPECS FILE
install_file="file://install-app.sh"
zone="us-east-1e"
key_name=$4

#SECURITY GROUP
security_group_id=$5

#QUERY FOR SECURITY GROUP ID
#securty_group_id=$(aws ec2 describe-security-groups --query 'SecurityGroups[*aws ec2 describe-security-groups --query 'SecurityGroups[*].{ID:GroupId}'].{ID:GroupId}')
#QUERY FOR VPCID FOR SECURITY GROUP
vpcid=$(aws ec2 describe-security-groups --group-ids $security_group_id --query 'SecurityGroups[*].VpcId')

#NAME FOR IAM group
iam_name=$6

#query for subnet id
#subnet_id=$(aws ec2 describe-subnets --query 'Subnets[0].{ID:SubnetId}') #grab first subnet in region
#authorize security group http
#aws ec2 authorize-security-group-ingress --group-id $security_group_id --protocol tcp --port 80 --cidr 0.0.0.0/0
#authorize security group ssh
#aws ec2 authorize-security-group-ingress --group-id $security_group_id --protocol tcp --port 22 --cidr 0.0.0.0/0

#SUBNET ID
#subnet2_id="subnet-e77f099d" #us-east-2
#subnet_id="subnet-dcee97e2" #us-east-1
subnet_id=$7
subnet2_id=$8

#role arn for creating lambda function
lambda_role_arn=$9

region='us-east-1'

#SSH KEY CREATION
#uncomment to create keypair in code
#key_name="ubuntu_ssh_key"
#key_pair_filename="ubuntu_ssh_key.pem"
#aws ec2 create-key-pair --key-name $key_name --query 'KeyMaterial' --output text > $key_pair_filename
# change permissions of key-pair file
#chmod 400 $key_pair_filename
#ec2_id=$(aws ec2 run-instances --image-id $image_id --count $count --instance-type $image_type --key-name $key_name --user-data $install_file --security-group-ids $security_group_id --subnet-id $subnet_id --associate-public-ip-address)

# SQL DATABASE (uncomment to use the SQL RDS)
# db_id=awsreactdb
# echo Createing Database
# aws rds create-db-instance \
#     --allocated-storage 20 --db-instance-class db.t2.micro \
#     --db-instance-identifier $db_id \
#     --availability-zone $zone \
#     --engine mysql \
#     --enable-cloudwatch-logs-exports '["audit","error","general","slowquery"]' \
#     --master-username $db_username \
#     --master-user-password secret99

#CREATE Dynamo DB FOR AWS
echo Creating DynamoDB
dynamo_name=tpt-records
dynamo_db=$(aws dynamodb create-table --table-name $dynamo_name --attribute-definitions AttributeName=Receipt,AttributeType=S AttributeName=Email,AttributeType=S --key-schema AttributeName=Receipt,KeyType=HASH AttributeName=Email,KeyType=RANGE --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5)

# WAIT DynamoDB to be AVAILABLE
aws dynamodb wait table-exists \
    --table-name $dynamo_name
echo DynamoDB $dynamo_name Created

#RUN INSTANCE (Instances without autoscaling)
#ec2_id=$(aws ec2 run-instances --image-id $image_id --count $count --instance-type $image_type --key-name $key_name --user-data $install_file --security-group-ids $security_group_id --subnet-id $subnet_id --associate-public-ip-address --iam-instance-profile Name=$iam_name)

# AUTO SCALING LAUNCH CONFIGS
echo Creating Launch Config
launch_name='launch-config'
#Create Auto Scale launch configureation
aws autoscaling create-launch-configuration \
    --launch-configuration-name $launch_name \
    --key-name $key_name --image-id $image_id \
    --instance-type $image_type \
    --user-data $install_file \
    --security-groups $security_group_id \
    --associate-public-ip-address \
    --iam-instance-profile $iam_name
echo Lauch Config name= $launch_name Created

#CREATE LOAD BALANCER
#*need 2 different subnets in 2 avail zones
load_balancer_name='tpt-loadbalancer'
aws elbv2 create-load-balancer --name $load_balancer_name --subnets $subnet_id $subnet2_id --security-groups $security_group_id
vpcid=$(aws elbv2 describe-load-balancers --name $load_balancer_name --query 'LoadBalancers[*].VpcId')
lb_arn=$(aws elbv2 describe-load-balancers --name $load_balancer_name --query 'LoadBalancers[*].LoadBalancerArn')

echo "Creating Load Balancer"
aws elbv2 wait load-balancer-available --names $load_balancer_name
echo Load Balancer name= $load_balancer_name Created

#TARGET GROUP FOR LOAD BALANCER
echo "Creating Target Group"
target_name='tpt-targets'
aws elbv2 create-target-group --name $target_name --protocol HTTP --port 80 --vpc-id $vpcid
echo Target Group name= $target_name Created
#QUERY ARN FROM TARGET GROUP
targetgrouparn=$(aws elbv2 describe-target-groups --names $target_name --query 'TargetGroups[*].TargetGroupArn')

# FOR SINGLE EC2 run instances without auto scaling
#echo "Adding Instances to Load Balancer"
#NAME=$(echo "$ec2_id" | awk '/^INSTANCE/ {print $7}')
#echo $NAME

# AUto scaling
min_size=2
max_size=4
desired_size=$count
autoscale_name='tpt-asg'
echo "Creating AutoScale Group: $autoscale_name"
aws autoscaling create-auto-scaling-group \
--auto-scaling-group-name  $autoscale_name \
--launch-configuration-name $launch_name \
--target-group-arns $targetgrouparne \
--vpc-zone-identifier $subnet_id \
--min-size $min_size --max-size $max_size \
--desired-capacity $desired_size
echo AutoScale name= $autoscale_name Created
echo Min=$min_size Max=$max_size
echo Desired=$desired_size

# Add ec2 run instanges to target group without auto scaling
# for instance_id in $NAME
# 	do
# 		aws ec2 wait instance-status-ok --instance-ids $instance_id
# 		echo $instance_id running
# 		echo adding $instance_id to $targetgrouparn
# 		aws elbv2 register-targets --target-group-arn $targetgrouparn --targets Id=$instance_id
# 	done

echo "Adding ELB Listener"
aws elbv2 create-listener --load-balancer-arn $lb_arn --protocol HTTP --port 80 --default-actions Type=forward,TargetGroupArn=$targetgrouparn

sqs_name='tpt-queue'
echo "Creating SQS Queue: $sqs_name"
aws sqs create-queue --queue-name $sqs_name

#create role to run lambda with trust policy
#>>>>uncomment to create role
#role_name=lambda-basic-execution
#echo Creating Role: $role_name
#aws iam create-role --role-name $role_name --assume-role-policy-document file://trustPolicy.json
#wait for role to be created
#aws iam wait role-exists --role-name $role_name
#Wait role-exists throws error, adding sleep to make sure IAM role 
# is replicated across regions
# TODO see why role-exists causes:
# aws: error: argument subcommand: Invalid choice, valid choices are:
#instance-profile-exists                  | user-exists
#sleep 5
#policy_arn=arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
#aws iam attach-role-policy --role-name $role_name --policy-arn $policy_arn
#wait for policy to attache
#aws iam wait policy-exists --policy-arn $policy_arn
#sleep 5

#zip the js
zip_name=exampleLambda.zip
lambda_file=exampleLambda.js
zip $zip_name $lambda_file

#lambda
lambda_name='exampleLambda'
echo "CREATING Lambda Functions: $lambda_name"
aws lambda create-function --function-name $lambda_name --runtime nodejs8.10 --role $lambda_role_arn  --handler $lambda_name.handler --zip-file fileb://$zip_name
echo "Lambda Function Created"
#get lambda arn
lambda_arn=$(aws lambda get-function --function-name $lambda_name --query 'Configuration.FunctionArn')

echo "Creating REST API Gateway"
## FOR FUTURE DEVELOPMENT:
#tutorial rest-api gateway: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-custom-integrations.html
aws apigateway create-rest-api --name 'HelloWorld (AWS CLI)' --region $region
#get rest api id
api_id=$(aws apigateway get-rest-apis --query 'items[*].id')
#get resource id
resource_id=$(aws apigateway get-resources --rest-api-id $api_id --region $region --query 'items[*].id')
#create resource
aws apigateway create-resource --rest-api-id $api_id \
      --region $region \
      --parent-id $resource_id \
      --path-part greeting

# put method for api
aws apigateway put-method --rest-api-id $api_id \
       --region $region \
       --resource-id $resource_id \
       --http-method GET \
       --authorization-type "NONE" \
       --request-parameters method.request.querystring.greeter=false

aws apigateway put-method-response \
        --region $region \
        --rest-api-id $api_id \
        --resource-id $resource_id \
        --http-method GET \
        --status-code 200

aws apigateway put-integration \
        --region $region \
        --rest-api-id $api_id \
        --resource-id $resource_id \
        --http-method GET \
        --type AWS \
        --integration-http-method POST \
        --uri arn:aws:apigateway:$region:lambda:path/2015-03-31/functions/$lambda_arn/invocations \
        --request-templates file://integration-request-template.json \
        --credentials $lambda_role_arn

 aws apigateway put-integration-response \
        --region $region \
        --rest-api-id $api_id \
        --resource-id $resource_id \
        --http-method GET \
        --status-code 200 \
        --selection-pattern ""  

aws apigateway create-deployment --rest-api-id $api_id --stage-name test
