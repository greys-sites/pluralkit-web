import React, { Component, Fragment } from 'react';
import cookie from 'react-cookies';
import System from './System';

class Profile extends Component {

	constructor() {
		super();

		this.state = {id: null, members: null, fronters: null, token: null};
	}

	async componentDidMount() {
		await this.setState({ token: cookie.load('token') });
		var sys = await fetch("http://localhost:8080/api/s",{
			method: "POST",
			headers: {
				'X-Token': this.state.token
			}
		});
		this.setState({ id: (await sys.text())})
	}

	render () {
		return (
			<p>{this.state.id}</p>
		);
	}
}

export default Profile;