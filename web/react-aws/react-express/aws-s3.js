const path = require('path');

const imageUpload = async (base64, bucket, filename) => {
  
  console.log("starting upload");
  // You can either "yarn add aws-sdk" or "npm i aws-sdk"
  const AWS = require('aws-sdk');

  //RUNNING IN EC2 should auto set config
  // // Configure AWS with your access and secret key.
  // Not sure needs to raw coded if running from ec2 instance
  //ACCESS_KEY_ID ="";
  //SECRET_ACCESS_KEY="";
  AWS_REGION="us-east-1";
  S3_BUCKET= bucket;

  // var credentials = new AWS.SharedIniFileCredentials({profile: 'default'});
  // AWS.config.credentials = credentials;

  // // Configure AWS to use promise
  //AWS.config.setPromisesDependency(require('bluebird'));
  AWS.config.update({ region: AWS_REGION });

  // Create an s3 instance
  const s3 = new AWS.S3();
  // Ensure that you POST a base64 data to your server.
  // Let's assume the variable "base64" is one.
  const base64Data = new Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ""), 'base64');
  console.log(base64Data);
  // Getting the file type, ie: jpeg, png or gif
  const type = base64.split(';')[0].split('/')[1];
  console.log(type);
  // Generally we'd have an userId associated with the image
  // For this example, we'll simulate one

  // With this setup, each time your user uploads an image, will be overwritten.
  // To prevent this, use a different Key each time.
  // This won't be needed if they're uploading their avatar, hence the filename, userAvatar.js.
  const params = {
    Bucket: bucket,
    //Key: "images/" + Date.now()+"-"+ path.basename(filename),
    Key: `${Date.now()}-${filename}`, // type is not required
    Body: base64Data,
    ACL: 'public-read',
    ContentEncoding: 'base64', // required
    ContentType: `image/${type}` // required. Notice the back ticks
  }

  // The upload() is used instead of putObject() as we'd need the location url and assign that to our user profile/database
  // see: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property
  let location = '';
  let key = '';
  let url = '';
  try {
    const { Location, Key } = await s3.upload(params).promise();
    location = Location;
    key = Key;
    var getSignedUrlParams = {
    	Bucket: bucket,
    	Key: key,
    	Expires: 3600 //expires in 1 hour
    };

    const url = await s3.getSignedUrl('getObject', getSignedUrlParams);
    console.log("Generated Signed Url: ", url);
      return(url);
  } catch (error) {
     console.log(error)
  }
  // Save the Location (url) to your database and Key if needs be.
  //console.log(location, key);
  
  //return location;
  
  // To delete, see: https://gist.github.com/SylarRuby/b3b1430ca633bc5ffec29bbcdac2bd52
}
module.exports = imageUpload;