const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const s3uploader = require('./aws-s3.js');
const AWS = require('aws-sdk');

//UUID dependency
const uuid = require('uuid');

//AWS Configs
const apiVersion = 'latest';
  
const AWS_REGION="us-east-1";
AWS.config.update({ region: AWS_REGION });

var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
var sqs = new AWS.SQS({apiVersion: '2012-11-05'});

const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit:50000}));

//file upload
app.post('/api/upload', async (req, res) => {
  //console.log(req.body.processedimage);
  const rawurl = await s3uploader(req.body.image, "tpt-raw-images", req.body.name);
  const processurl = await s3uploader(req.body.processedimage, "tpt-processed-images", "BW_" + req.body.name);
  
  console.log('rawurl' + rawurl);
  console.log('processurl' + processurl);
  res.send(
    {
      rawurl:rawurl,
      processurl:processurl
    }
  );
});

// Creating a GET route that returns data from the 'users' table.
app.get('/api/users', (req, res) => {
  var params = {
    TableName: 'tpt-records',
  };
  // https://stackoverflow.com/questions/49683179/pass-data-from-callback-aws-dynamodb-scan-to-outside
  var tmp= []
  ddb.scan(params, (error, data) => {
    if(error) { 
      console.error("Unable to scan the table. Error JSON:", JSON.stringify(error, null, 2));
    } 
    else {
      // print all the movies
      console.log("Scan succeeded.");
      data.Items.forEach(function(item) {
        //  console.log(item);
         tmp.push(item)
      });

      // continue scanning if we have more movies, because
      // scan can retrieve a maximum of 1MB of data
      if (typeof data.LastEvaluatedKey != "undefined") {
          console.log("Scanning for more...");
          params.ExclusiveStartKey = data.LastEvaluatedKey;
          docClient.scan(params, onScan);
      }
    }
    console.log(tmp);
    res.send(tmp);
  });
  });

app.post('/api/newuser', function (req, res) {
  //generate uuid 
  var receipt = uuid.v4();

  // UPDATE SQS 
  var params = {
    QueueName: 'tpt-queue', /* required */
  };
  sqs.getQueueUrl(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else {
      console.log(data.QueueUrl);           // successful response
      var params = {
        DelaySeconds: 10,
        MessageBody: receipt,
        // MessageDeduplicationId: "TheWhistler",  // Required for FIFO queues
        // MessageId: "Group1",  // Required for FIFO queues
        QueueUrl: data.QueueUrl
      };
      sqs.sendMessage(params, function(err, data) {
        if (err) {
          console.log("Error", err);
        } else {
          console.log("Success", data.MessageId);
        }
      });
    }    
  });

  // LAMBDA FUNCTION TO WRITE TO DYNAMO AND SNS MESSAGE SEND
  const lambda = new AWS.Lambda({ apiVersion, AWS_REGION });
  const invokeParams = { 
    FunctionName: 'exampleLambda',
    Payload: 
    JSON.stringify({"receipt" : receipt,
      "email" : req.body.email,
      "phone" : req.body.phone,
      "filename" : req.body.filename,
      "s3rawurl" : req.body.s3rawurl,
      "s3finishedurl" : req.body.s3finishedurl,
      "status" : false,
      "issubscribed" : false
    })
  };
  lambda.invoke(invokeParams, function(err, data) {
      if (err) {
        console.log("Error", err);
      } else {
        console.log("Success", data);
        console.log()
        res.send(data);
        }
  });
});

if (process.env.NODE_ENV === 'production') {
    // Serve any static files
    app.use(express.static(path.join(__dirname, 'client/build')));
      
    // Handle React routing, return all requests to React app
    app.get('*', function(req, res) {
      res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
    });
  }

  function onScan(err, data) {
    var posts = {
      "items": []
    };
    if (err) {
        console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        // print all the movies
        console.log("Scan succeeded.");
        data.Items.forEach(function(item) {
           console.log(item);
           posts.items.push(item)
        });

        // continue scanning if we have more movies, because
        // scan can retrieve a maximum of 1MB of data
        if (typeof data.LastEvaluatedKey != "undefined") {
            console.log("Scanning for more...");
            params.ExclusiveStartKey = data.LastEvaluatedKey;
            docClient.scan(params, onScan);
        }
    }
    return posts;
}

app.listen(port, () => console.log(`Listening on port ${port}`));