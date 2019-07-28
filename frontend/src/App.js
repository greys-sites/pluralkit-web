import React, { Component, Fragment as Frag } from 'react';
import {BrowserRouter as Router, Route, Link, Redirect} from 'react-router-dom';
import * as fetch from 'node-fetch';
import './App.css';

import System from './Components/System';
import Profile from './Components/Profile';
import Dashboard from './Components/Dashboard';
import Footer from './Components/Footer';
import Login from './Components/Login';
import Loading from './Components/Loading';

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

	logOut = async () => {
		await fetch('/api/logout');
		this.setState({user: undefined, check: true})
	}

	logIn = async (e) => {
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
		} else {
			this.setState({submitted: true})
		}
	}

	render() {
		if(!this.state.check) return <Loading />;
		return (
			<div className="App">
			<Router>
			<header className="App-header">
			<a className="App-link" href="/">
			PluralKit Web
			</a>
			<div className="App-buttons">
			{this.state.user &&
				<button className="App-button" onClick={()=>this.logOut()}>Logout</button>
			}
			</div>
			</header>
			{this.state.user ?
				<Route exact path="/" render={(props)=> <Dashboard {...props} user={this.state.user} />} /> :
				<Route exact path="/" render={(props)=> 
					<Frag>
						<div className="App-login">
						<p>Enter your token below. You can get this with "pk;token"</p>
						<p style={{color: "red"}}>{this.state.submitted && !this.state.user ? "Something went wrong, please try again." : ""}</p>
						<form onSubmit={this.logIn}>
							<input type="text"
							floatinglabeltext="Token"
			            	onChange = {(event,newValue) => {this.setState({token:event.target.value})}}
			            	/>
			            <a className="App-button" onClick={this.logIn}>Submit</a>
						</form>
						</div>
					</Frag>
				}
				/>
			}
			
			<Route path="/profile/:id" component={Profile} />

			</Router>
			<Footer />
			</div>
			);
	}
}


export default App;
