import React from 'react';
import './form.css'


export default class Write extends React.Component {
        constructor(props) {
            super(props)
            
            this.state = {          
                email: '',
                phone: '',
                filename: '',
                s3rawurl: '',
                s3finishedurl: '',
                status: 0,
                issubscribed: 0
            }
          }

    handleChange(event) {
    event.preventDefault();
      let formValues = this.state;
      let name = event.target.name;
      let value = event.target.value;

      formValues[name] = value;

      this.setState({formValues})
    }

    handleSubmit = async e => {
      e.preventDefault();
      const response = await fetch('/api/newuser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: this.state["email"],
          phone: this.state["phone"],
          filename: this.state["filename"],
          s3rawurl: this.state["s3rawurl"],
          s3finishedurl: this.state["s3finishedurl"],
          status: this.state["status"],
          issubscribed: this.state["issubscribed"]
          }),
      });

      const body = await response.text();
      console.log(body);
      this.setState({ responseToPost: body });
    };

    render(){
        return (
          <div className="form">
          <form onSubmit={this.handleSubmit.bind(this)}>
            <label> Email:
              <input type="text" name="email" placeholder="email" value={this.state["email"]} onChange={this.handleChange.bind(this)}/>
            </label><br />
            <label> Phone:
              <input type="text" name="phone" placeholder="phone" value={this.state["phone"]} onChange={this.handleChange.bind(this)}/>
            </label><br />
            <label> Filename:
              <input type="text" name="filename" placeholder="filename" value={this.state["filename"]} onChange={this.handleChange.bind(this)}/>
            </label><br />
            <label> s3rawurl:
              <input type="text" name="s3rawurl" placeholder="cs3rawurlountry" value={this.state["s3rawurl"]} onChange={this.handleChange.bind(this)}/>
            </label><br />
            <label> s3finishedurl:
              <input type="text" name="s3finishedurl" placeholder="s3finishedurl" value={this.state["s3finishedurl"]} onChange={this.handleChange.bind(this)}/>
            </label><br />
            <label> status:
              <input type="text" name="status" placeholder="status" value={this.state["status"]} onChange={this.handleChange.bind(this)}/>
            </label><br />
            <label> issubscribed:
              <input type="text" name="issubscribed" placeholder="issubscribed" value={this.state["issubscribed"]} onChange={this.handleChange.bind(this)}/>
            </label><br />
            <label> HOST= {process.env.REACT_APP_DB_CONNECTION}  </label><br />    
            <label> USERNAME= {process.env.REACT_APP_DB_USERNAME}  </label><br />    
            <label> PASSWORD= {process.env.REACT_APP_DB_PASSWORD}  </label><br />    
            <label> NAME= {process.env.REACT_APP_DB_NAME}      </label><br />

            <input className="btn btn-primary" type="submit" value="Submit"/>
          </form>
          </div>
        )
      }
  }