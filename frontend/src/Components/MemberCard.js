import React, { Component } from 'react';

class MemberCard extends Component {
	constructor(props) {
		super(props);

		this.state = {
			key: 	this.props.key,
			member: this.props.member  
		}
	}

	render() {
		var memb = this.state.member
		console.log(memb.color);
		if(memb) {
			return (
				<div className="App-memberCard">
				<h1>
					{memb.name.toUpperCase()}
				</h1>
				<img className="App-memberAvatar" style={{boxShadow: "0 0 0 5px #"+(memb.color ? memb.color : "aaa")}} src={memb.avatar_url || "/default.png"} alt={memb.name + "'s avatar"}/>
				<span className="App-tagline">{memb.prefix}</span>
				<span className="App-tagline">{memb.pronouns || "(N/A)"} || {memb.birthday || "(N/A)"}</span>
				<p style={{overflowY: 'auto', height: '80px'}}>{memb.description || "(no description)"}</p>
				</div>
			);
		} else {
			return null;
		}
	}
}

export default MemberCard;