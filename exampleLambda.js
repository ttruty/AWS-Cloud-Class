const AWS = require('aws-sdk');

const AWS_REGION="us-east-1";
const region = 'us-east-1';
const apiVersion = 'latest';
AWS.config.update({ region: AWS_REGION });
var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});


exports.handler = async (event, context, callback) => {
    // const response = {
    //     statusCode: 200,
    //     body: JSON.stringify('Hello from Lambda!'),
    // };
    var params = {
        TableName: 'tpt-records',
        Item: {
          'Receipt' : {S: event.receipt},
          'Email' : {S: event.email},
          'Phone' : {S: event.phone},
          'Filename' : {S : event.filename},
          'S3rawurl' : {S : event.s3rawurl},
          'S3finishedurl' : {S : event.s3finishedurl},
          'Status' : {BOOL : event.status},
          'Issubscribed' : {BOOL : event.issubscribed}
          }
      };

    try
    {
        var result = await ddb.putItem(params).promise();
        console.log(result);
        //Handle your result here!
    }
    catch(err)
    {
        console.log(err);
    }
      
    //   await ddb.putItem(params, function(err, data) {
    //     if (err) {
    //       console.log("Error", err);
    //     } else {
    //       console.log("Success", data);
    //       //res.send(data);
    //     }
    //   });

      var params = {
        Message: 'Image processed \n: ' + event.s3finishedurl, /* required */
        PhoneNumber: '+100' + event.phone,
      };
      
      // Create promise and SNS service object
      var publishTextPromise = new AWS.SNS({apiVersion: '2010-03-31'}).publish(params).promise();
      
      try
      {
          var result = await publishTextPromise.then(
            function(data) {
              console.log("MessageID is " + data.MessageId);
            }).catch(
              function(err) {
              console.error(err, err.stack);
            });
          console.log(result);
          //Handle your result here!
      }
      catch(err)
      {
          console.log(err);
      }
    const response = {
        statusCode: 200,
        body: event,
    };
    
    return response;
}
