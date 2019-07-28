import React, { Component, Fragment as Frag } from 'react';
import System from './System';
import MemberList from './MemberList';
import Loading from './Loading';

class Profile extends Component {

	constructor(props) {
		super(props);

		this.state = {id: this.props.match.params.id || null, user: undefined};
	}

	async componentDidMount() {
		if(!this.state.id) return console.log("ID = null");
		var sys = await fetch('/api/user/'+this.state.id);
		if(sys.status == 200) {
			this.setState({ user: await sys.json()});
		} else if(sys.status == 404) {
			this.setState({user: "404"})
		} else {
			this.setState({user: null})
		}
	}

	render () {
		if(this.state.user && this.state.user != "404") {
			return (
				<Frag>
				<h1 style={{textAlign: 'center'}}>System</h1>
				<System sys={this.state.user} editable={false} />
				<h1 style={{textAlign: 'center'}}>Members</h1>
				<MemberList members={this.state.user.members} editable={false} token={null} />
				</Frag>
			);
		} else if(this.state.user == "404") {
			return (
				<p>System not found D:</p>
			);
		} else {
			return (
				<Loading />
			);
		}
	}
}

export default Profile;