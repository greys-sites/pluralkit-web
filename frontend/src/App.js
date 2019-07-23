import React, { Component, Fragment } from 'react';
import {BrowserRouter as Router, Route, Link, Redirect} from 'react-router-dom';
import * as fetch from 'node-fetch';
import './App.css';

import System from './Components/System';
import Profile from './Components/Profile';
import Dashboard from './Components/Dashboard';
import Footer from './Components/Footer';
import Login from './Components/Login';

class App extends Component {

	constructor() {
		super();

		this.state = {user: undefined, check: false}
	}

	async componentDidMount() {
		var user = await fetch('/api/user');
		if(user.status != 200) user = undefined
		else user = await user.json();

		this.setState({user: user, check: true})
	}

	render() {
		if(!this.state.check) return null;
		return (
			<div className="App">
			<Router>
			<header className="App-header">
			<a className="App-link" href="/">
			PluralKit Web
			</a>
			<div className="App-buttons">
			<a href={this.state.user ? "logout" : "login"}
			className="App-button"
			>
			{this.state.user ? "Logout" : "Login"}
			</a>
			<a
			className="App-button"
			href='/dashboard'
			>
			Dash
			</a>
			</div>
			</header>
			{this.state.user ?
				<Route exact path="/" render={(props)=> <Dashboard {...props} user={this.state.user} />} /> :
				<Route exact path="/" render={(props)=> <Login {...props} />} />
			}
			
			<Route path="/logout" component={Logout} />
			<Route path="/profile/:id" component={Profile} />

			</Router>
			<Footer />
			</div>
			);
	}
}

// <Route exact path="/logout" component={Logout} />
// <Route exact path="/submit" component={Submit} />

class Index extends Component {
	render() {
		return(
			<p>WORK IN PROGRESS</p>
		);
	}
}

class Logout extends Component {
	constructor() {
		super();

		this.state = {success: undefined};
	}

	async componentDidMount() {
		var res = await fetch('/api/logout');
		if(res.status == 200) {
			this.setState({succes: true});
			this.props.history.push('/')
		} else {
			this.setState({success: false});
		}
	}
	render() {
		return (
			<div>
			<p>Logging out...</p>
			<p style={{color: "red"}}>{this.state.success == false && "Something went wrong."}</p>
			</div>
		)
	}
}

// class Submit extends Component {
// 	constructor() {
// 		super();

// 		this.state = {ready: false};
// 	}

// 	componentDidMount() {
// 		setTimeout(()=>{
// 			this.setState({ready: true});
// 		},1000)
// 	}
// 	render() {
// 		return(
// 			<Fragment>
// 			<p>Done! Redirecting...</p>
// 			{(this.state && this.state.ready) && <Redirect to="/" />}
// 			</Fragment>
// 		);
// 	}
// }


export default App;
