import React, { Component, Fragment } from 'react';
import {BrowserRouter as Router, Route, Link, Redirect} from 'react-router-dom';
import cookie from 'react-cookies';
import * as fetch from 'node-fetch';
import logo from './pkicon.png';
import './App.css';

import System from './Components/System';
import Profile from './Components/Profile';

class App extends Component {

	constructor() {
		super();

		this.logIn = this.logIn.bind(this);
		this.logOut = this.logOut.bind(this);
	}


	logIn(token) {
		this.setState({token});
		cookie.save('token', token, {path: '/'});
	}

	logOut() {
		this.setState({token: null});
		cookie.remove('token', {path: '/'})
	}

	componentDidMount() {
		console.log(cookie.load('token'));
		this.setState({token: cookie.load('token')});
	}

	render() {

		return (
			<div className="App">
			<Router>
			<header className="App-header">
			<img src={logo} className="App-logo" alt="logo" />
			<p>
			PluralKit
			</p>
			<div className="App-buttons">
			<button
			className="App-button"
			onClick={()=> window.open('http://localhost:3000/'+(this.state && this.state.token ? "logout" : "login"),'_self')}
			>
			{this.state && this.state.token ? "Logout" : "Login"}
			</button>
			<button
			className="App-button"
			onClick={()=> window.open('http://localhost:3000/dashboard','_self')}
			>
			Boop beep
			</button>
			</div>
			</header>

			<Route exact path="/" component={Index} />
			
			<Route exact path="/login" component={Login} />
			<Route exact path="/logout" component={Logout} />
			<Route exact path="/submit" component={Submit} />

			<Route path="/profile/:id" component={Profile} />

			</Router>
			</div>
			);
		return (
			<p>Loading...</p>
			);
	}
}

class Index extends Component {
	render() {
		return(
			<p>WORK IN PROGRESS</p>
		);
	}
}

class Login extends Component {
	render(){
		return(
			<Fragment>
			<p>Enter your token below. You can get this with "pk;token"</p>
			<form action="/submit">
				<input type="text"
				floatinglabeltext="Token"
            	onChange = {(event,newValue) => {console.log(event.target.value); this.setState({token:event.target.value})}}
            	/> <button onClick={()=>{console.log(this.state); cookie.save('token',this.state.token,{path: "/"})}}>Submit</button>
			</form>
			</Fragment>
		);
	}
}


class Logout extends Component {
	constructor() {
		super();

		this.state = {ready: false};
	}

	componentDidMount() {
		setTimeout(()=>{
			this.setState({ready: true});
		},1000)
	}
	render() {
		cookie.remove('token',{path: '/'})
		return(
			<Fragment>
			<p>Done! Redirecting...</p>
			{(this.state && this.state.ready) && <Redirect to="/" />}
			</Fragment>
		);
	}
}

class Submit extends Component {
	constructor() {
		super();

		this.state = {ready: false};
	}

	componentDidMount() {
		setTimeout(()=>{
			this.setState({ready: true});
		},1000)
	}
	render() {
		return(
			<Fragment>
			<p>Done! Redirecting...</p>
			{(this.state && this.state.ready) && <Redirect to="/" />}
			</Fragment>
		);
	}
}


export default App;
