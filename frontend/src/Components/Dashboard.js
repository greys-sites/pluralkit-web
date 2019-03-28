import React, { Component, Fragment } from 'react';
import cookie from 'react-cookies';
import System from './System';

class Dashboard extends Component {

	constructor(props) {
		super(props);
		
		this.state = {token: this.props.token, sys: "loading", members: null, fronters: null};
	}

	async componentDidMount() {
		if(!this.state.token) {
			this.setState({sys: null});
			return console.log("token = null");
		}
		var sys = await fetch('/api/s',{
			method: "POST",
			headers: {
				'X-Token': this.state.token 
			}
		});
		if(sys.status == 200) {
			this.setState({ sys: await sys.json()});
		} else if(sys.status == 404) {
			this.setState({sys: "404"})
		} else {
			this.setState({sys: null})
		}
	}

	render () {
		if(this.state.sys == "loading") {
			return (
				<p>Loading...</p>
			);
		} else if(this.state.sys && this.state.sys != "404") {
			return (
				<System sys={this.state.sys} />
			);
		} else if(this.state.sys == "404") {
			return (
				<p>System not found D:</p>
			);
		} else {
			return (
				<p>Something went wrong :(</p>
			);
		}
	}
}

export default Dashboard;