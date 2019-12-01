import React from 'react';
import './form.css'
import './table.css'

export default class Read extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            response: '',
            post: '',
            responseToPost: '',
            items: [],
          };
    }

    componentDidMount() {
        this.callApi()
          .then(res => this.setState({ response: res.express }))
          .catch(err => console.log(err));
      }
      
      callApi = async () => {
        const response = await fetch('/api/users');
        const body = await response.json();
        if (response.status !== 200) throw Error(body.message);
        console.log(body);
        this.state["items"] = body;
        for(let val of body) {
            console.log(val)
            console.log(val.S3rawurl.S);
        }
        return body;
      };

    render(){
        return(
        <div className="form">  
        <center>
            <table className="ReactTable">
            
            <tbody>
            <tr>
              <th>Raw</th>
              <th>Email</th>
              <th>Filename</th>
              <th>Processed</th>
            </tr>
            {this.state.items.map(( listValue, index ) => {
          return (            
            <tr key={index}>
              <img src={listValue.S3rawurl.S}  style={{width: 130, height:130}} alt="new"/>
              <td>{listValue.Email.S}</td>
              <td>{listValue.Filename.S}</td>
              <img src={listValue.S3finishedurl.S}  style={{width: 130, height:130}} alt="new"/>
              {/* <td>{listValue.phone}</td>
              <td>{listValue.s3rawurl}</td> */}   
            </tr>
          );
        })}
                {/* <tr>
                    <p>{this.state.responseToPost}</p>
                </tr> */}
            </tbody>
            </table>
            </center>
            </div>
        );
    }
}