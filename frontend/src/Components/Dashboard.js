import React, { Component, Fragment as Frag } from 'react';
import System from './System';
import MemberList from './MemberList';
import Loading from './Loading';

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
				<Loading />
			);
		} else if(this.state.check && this.state.user) {
			return (
				<Frag>
				<div style={{display: 'flex', alignItems: 'baseline'}}>
				<h1 style={{textAlign: 'center'}}>System</h1>
				<p style={{textAlign: 'center', fontStyle: 'italic'}}>(click to edit)</p>
				</div>
				<System sys={this.state.user} token={this.state.user.token} editable={true} />
				<div style={{display: 'flex', alignItems: 'baseline'}}>
				<h1 style={{textAlign: 'center'}}>Members</h1>
				<p style={{textAlign: 'center', fontStyle: 'italic'}}>(click a member to edit)</p>
				</div>
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