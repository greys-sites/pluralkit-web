import React, { Component, Fragment as Frag } from 'react';
import {BrowserRouter as Router, Route, Link, Redirect} from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons'
import './App.css';

import System from './Components/System';
import Profile from './Components/Profile';
import Dashboard from './Components/Dashboard';
import Login from './Components/Login';
import Loading from './Components/Loading';

class App extends Component {

	constructor() {
		super();

		this.state = {user: undefined, check: false}
	}

	async componentDidMount() {
		var user;
		try {
			user = await axios('/api/user');
		} catch(e) {
			user = e.message;
		}

		if(user.data) this.setState({user: user.data, check: true});
		else this.setState({check: true, err: user});
	}

	logOut = async () => {
		var err;
		try {
			await axios('/api/logout');
		} catch(e) {
			err = e.message;
		}
		
		this.setState({user: undefined, check: true, err})
	}

	logIn = async (e) => {
		e.preventDefault();
		var st = this.state;

		try {
			var res = await axios.post('/api/login', st);
		} catch(e) {
			console.log(e);
			res = e.message;
		}
		

		if(res.data) this.setState({submitted: true, user: res.data});
		else this.setState({submitted: true, user: null, error: res});
	}

	scrollToTop = () => {
		window.scrollTo(0,0);
	}

	scrollToBottom = () => {
		this.footerRef.scrollIntoView();
	}

	render() {
		if(!this.state.check) return <Loading />;
		return (
			<div className="App">
			<div className="App-scrollButtons">
			<button type="button" className="App-button" onClick={this.scrollToTop}><FontAwesomeIcon icon={faArrowUp} /></button>
			<button type="button" className="App-button" onClick={this.scrollToBottom}><FontAwesomeIcon icon={faArrowDown} /></button>
			</div>
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
							<form style={{textAlign: "center"}} onSubmit={this.logIn}>
								<input type="text"
								placeholder="token"
				            	onChange = {(event,newValue) => {this.setState({token:event.target.value})}}
				            	/>
				            <button type="submit" className="App-button">Submit</button>
							</form>
							</div>
						</Frag>
					}
					/>
				}
				
				<Route path="/profile/:id" component={Profile} />
			</Router>
			<footer className="App-footer" ref={(el) => this.footerRef = el}>
				<a className="App-link" href="https://github.com/xSke/PluralKit">PluralKit by @xSke</a> | <a className="App-link" href="https://github.com/greysdawn/pluralkit-web">Site by @greysdawn</a>
			</footer>
			</div>
			);
	}
}


export default App;
