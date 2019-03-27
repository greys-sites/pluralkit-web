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
		var sys = await fetch((process.env.REACT_APP_API_URL || "")+"/s",{
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

//<System id="kndhm" />