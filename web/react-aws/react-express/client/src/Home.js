import React from 'react';

export default class Home extends React.Component {            
    render() {
        return (
          <div className="form">  
          <h1>AWS Image and Notification Uploader</h1>
          <h3>This project will upload your images, transform them to black and white, then send a text with the processed image url.</h3>          
              <p>
                Final Project for Cloud Computing Technologies: Fall 2019: ITMO 544
              </p>
              <p>
               This project demonstrates the use of Amazon Web Services(AWS) to make a cloud native architecture.
               </p>
               <h2>Technologies Used:</h2>
               <ul>
                <li>AWS</li>
                <li>Vagrant/Packer</li>
                <li>Bash Shell Scripts</li>
                <li>AWS CLI</li>
                <li>Lambda</li>
                <li>NodeJS</li>
                <li>ExpressJS</li>
                <li>AWS DynamoDB</li>
                <li>AWS S3</li>
                <li>Load Balancers</li>
                <li>AutoScaling Groups/Launch Configs</li>
                <li>EC2</li>
                <li>SQS</li>
                <li>SNS</li>
              </ul>
              <p>
               <strong>User the navigation at the top (or side if on mobile).
                 <br />
                 Head over to upload image to test out uploading, then check the gallery to see the processed image </strong>
              </p>
          </div>
        );
      }
    }