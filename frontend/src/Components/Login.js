import React, { Component, Fragment } from 'react';
import * as fetch from 'node-fetch';

class Login extends Component {

	constructor() {
		super();

		this.handleSubmit = this.handleSubmit.bind(this);
		this.state = {user: undefined, submitted: false}
	}

	async handleSubmit(e) {
		e.preventDefault();
		var st = this.state;

		var res = await fetch('/api/login', {
			method: "POST",
			body: JSON.stringify(st),
			headers: {
				"Content-Type": "application/json"
			}
		});

		if(res.status == 200) {
			this.setState({submitted: true, user: await res.json()})
			this.props.history.push('/')
		} else {
			this.setState({submitted: true})
		}
	}

	render(){
		return(
			<div className="App-login">
			<p>Enter your token below. You can get this with "pk;token"</p>
			<p style={{color: "red"}}>{this.state.submitted && !this.state.user ? "Something went wrong, please try again." : ""}</p>
			<form onSubmit={this.handleSubmit}>
				<input type="text"
				floatinglabeltext="Token"
            	onChange = {(event,newValue) => {this.setState({token:event.target.value})}}
            	/>
            	<button type="submit">Submit</button>
			</form>
			</div>
		);
	}
}

export default Login;