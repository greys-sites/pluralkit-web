import React, { Component, Fragment as Frag } from 'react';
import cookie from 'react-cookies';
import System from './System';
import MemberList from './MemberList';

class Dashboard extends Component {

	constructor(props) {
		super(props);
		
		this.state = {user: this.props.user, check: false};
	}

	async componentDidMount() {
		if(!this.state.user) {
			this.setState({user: null, check: true});
			return;
		} else {
			this.setState({check: true})
		}
	}

	render () {
		if(!this.state.check) {
			return (
				<p>Loading...</p>
			);
		} else if(this.state.check && this.state.user) {
			return (
				<Frag>
				<System sys={this.state.user} />
				<h1 style={{textAlign: 'center'}}>Members</h1>
				<p style={{textAlign: 'center', fontStyle: 'italic'}}>click a member to edit</p>
				<MemberList members={this.state.user.members} editable={true} token={this.state.user.token} />
				</Frag>
			);
		} else {
			return (
				<p>System not found D:</p>
			);
		}
	}
}

export default Dashboard;