#!/bin/bash

lb=$(aws elbv2 describe-load-balancers --names tpt-loadbalancer --query 'LoadBalancers[*].LoadBalancerArn')

#delete elb listener
listener_arn=$(aws elbv2 describe-listeners --load-balancer-arn $lb --query 'Listeners[*].ListenerArn')
echo Delete Listener: $listener_arn
aws elbv2 delete-listener --listener-arn $listener_arn

#delete target group, >hard coded target group name
tg=$(aws elbv2 describe-target-groups --names tpt-targets --query 'TargetGroups[*].TargetGroupArn')
echo Delete Target Group: $tg
aws elbv2 delete-target-group --target-group-arn $tg

#delete load balancer >hard coding load balancer name
echo Delete Load Balancer: $lb
aws elbv2 delete-load-balancer --load-balancer-arn $lb

#delete rds
#rds get name 
#rdsname=$(aws rds describe-db-instances --query 'DBInstances[*].DBInstanceIdentifier')
#aws rds delete-db-instance --db-instance-identifier $rdsname --skip-final-snapshot

#delete dynamoDB
db_name='tpt-records'
echo Deleting DynamoDB: $db_name
aws dynamodb delete-table --table-name $db_name

#delete LAMBDA functions
lambda_name='exampleLambda'
echo Deleting Lambda: $lambda_name
aws lambda delete-function \
    --function-name $lambda_name

#Delete Rest Apigateway
api_id=$(aws apigateway get-rest-apis --query 'items[*].id')
echo Deleting REST API Gateway: id: $api_id
aws apigateway delete-rest-api --rest-api-id $api_id

#Delete SQS
sqs_url=$(aws sqs list-queues --query 'QueueUrls[*]')
echo Deleting SQS: $sqs_url
aws sqs delete-queue --queue-url $sqs_url

#delete role
#role=lambda-basic-execution
#detach policy from role
#policy_arn=$(aws iam list-attached-role-policies --role-name lambda-basic-execution --query 'AttachedPolicies[*].PolicyArn')
#aws iam detach-role-policy --role-name $role --policy-arn $policy_arn
#delete role
#echo Deleting Role: $role
#aws iam delete-role --role-name $role

#delete instaces
echo Terminate instances
instance_id=$(aws ec2 describe-instances --query "Reservations[].Instances[].InstanceId")
terminate=$(aws ec2 terminate-instances --instance-ids $instance_id)

echo Deleting AutoScaling Group
aws autoscaling delete-auto-scaling-group --auto-scaling-group-name tpt-asg --force-delete

echo Deleting Launch Configuration
aws autoscaling delete-launch-configuration --launch-configuration-name launch-config

# Log the date time of instance terminate info
# date >> logs.txt
# echo "======Terminating Instance======" >> logs.txt
# #pwd >> logs.txt
# echo $terminate >> logs.txt
# echo ""
