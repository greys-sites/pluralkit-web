import React, { Component, Fragment } from 'react';
import cookie from 'react-cookies';
import System from './System';

class Profile extends Component {

	constructor(props) {
		super(props);

		this.state = {id: this.props.match.params.id || null, sys: null, members: null, fronters: null};
	}

	async componentDidMount() {
		if(!this.state.id) return console.log("ID = null");
		var sys = await fetch('/api/s/'+this.state.id);
		if(sys.status == 200) {
			this.setState({ sys: await sys.json()});
			var membs = await fetch(`/api/s/${this.state.id}/members`);
			this.setState({members: await membs.json()});
			var fronters = await fetch(`/api/s/${this.state.id}/fronters`);
			this.setState({members: (await fronters.json()).members || []});
		} else if(sys.status == 404) {
			this.setState({sys: "404"})
		} else {
			this.setState({sys: null})
		}
	}

	render () {
		if(this.state.sys && this.state.sys != "404") {
			return (
				<System sys={this.state.sys} />
			);
		} else if(this.state.sys == "404") {
			return (
				<p>System not found D:</p>
			);
		} else {
			return (
				<p>Loading...</p>
			);
		}
	}
}

export default Profile;