import React, { useRef, useState} from "react";
import Jimp from 'jimp';
import './Image.css';


export default function Image(props) {
  const AWS = require('aws-sdk');

  // // Configure AWS
  const AWS_REGION="us-east-1";
  AWS.config.update({ region: AWS_REGION });

  //state variables
  const file = useRef(null);
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");;
  const [status, setStatus] = useState("");
  const [issubscribed, setIssubscribed] = useState("")
  const [isLoading, setIsLoading] = useState(false);
  const [uploads, setUploads] = useState([]);
  const [filename, setFilename] = useState([]);

  //write to the database
  async function dbWrite(rawurl, processedurl) {
    console.log("writing")
    const response = await fetch('/api/newuser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        phone: userPhone,
        filename: filename.filename.name,
        s3rawurl: rawurl,
        s3finishedurl: processedurl,
        status: status,
        issubscribed: issubscribed
        }),
    });
  }


  async function imagePost(reader) {
    let bw = '';
    try {
      //convert image to base64 data
      const base64Data = new Buffer.from(reader.result.replace(/^data:image\/\w+;base64,/, ""), 'base64');
      Jimp.read(base64Data, (err, image) => {
        if (err) throw err;
        else {
          //convert image to black and white
          image.greyscale()
            .quality(100)
            .getBase64(Jimp.AUTO, async function (err, src) {
              //src is base64 image
              //console.log(src);

              // upload the image to s3 bucket
              const response = await fetch('/api/upload', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },          
                body : JSON.stringify({
                  name : filename.filename.name,
                  image : reader.result,
                  processedimage : src
                  })
              });
              const body = await response.json();
              console.log(body);
                //this.setState({ responseToPost: body });
              alert('File uploaded!');
        
              dbWrite(body.rawurl, body.processurl);
        
              clearStates();
              
            })
        }
      });
    } 
    catch (e) {
      alert(e);
      setIsLoading(false);
    }
  }

  function getBase64(e) {
    var file = e
    let reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      //console.log(reader.result);
      
      console.log(filename.filename);        
        imagePost(reader);
    };
    reader.onerror = function (error) {
      console.log('Error: ', error);
    }
  }

  function clearStates() {
    setIsLoading({});
    setUploads([]);
    setFilename([]);
  }

  function handleFileChange(event) {
    file.current = event.target.files[0];
    setFilename({filename : file.current});
    if (event.target.files[0]) {
      var uploadlist = []
      for (var key in event.target.files) {
        if (!event.target.files.hasOwnProperty(key)) continue;
        let upload = event.target.files[key]
        uploadlist.push(URL.createObjectURL(upload))
        
      }
      setUploads({uploadlist: uploadlist})
    } else {
        setUploads({uploads: []})
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    getBase64(filename.filename);
    // PROCESS FILE HERE AND UPLOAD THAT TOO
    
    if (file.current && file.current.size > 5000000) {
      alert(
        `Please pick a file smaller than 5000000 /
          1000000} MB.`
      );
      return;
    }    
    setIsLoading(true);
    
    }
  
  return (
    <div className="form">
      <center>
        <input type="text" placeholder="name" value={userName} onChange={e => setUserName(e.target.value)} />
        <input type="text" placeholder="email" value={email} onChange={e => setEmail(e.target.value)} />
        <input type="text" placeholder="phone number" value={userPhone} onChange={e => setUserPhone(e.target.value)} />
        <small>Phone number needs to be 10 digits (16305551234)</small>
      </center>
    <div className="image_p">
      { /* File uploader */ }
        <section className="hero">
          <label className="fileUploaderContainer">
            Click here to upload images
            <input type="file" id="fileUploader" onChange={handleFileChange}/>
          </label>

          <center>
          <div>
            {uploads.uploadlist && uploads.uploadlist.map((value,index) => (
              <img key={index} src={value} width="100px" alt="upload" />
            ))}
          </div>
          </center>

          <button className="button" onClick={handleSubmit}>Upload</button>
        </section>
   
    </div>
    
    </div>
    
  );
}