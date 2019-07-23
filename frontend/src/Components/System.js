import React, { Component } from 'react';
import * as fetch from 'node-fetch';

class System extends Component {
	constructor(props) {
		super(props);

		console.log(this.props)
		this.state = {
			sys: this.props.sys,
			edit: false
		};
	}

	render() {
		if(this.state.sys) {
			var sys = this.state.sys;
			var membs = this.state.sys.members;
			var frnt = this.state.sys.fronters;
			return (
				<div className="App-syscontainer">
				<img className="App-avatar" src={sys.avatar_url ? sys.avatar_url : "/default.png"} alt="System avatar" />
				<div className="App-systeminfo">
				<p><strong>{sys.name || "(no name)"} ({sys.id})</strong></p>
				<p className={sys.tag ? "" : "App-hidden"}><strong>Tag:</strong> {sys.tag}</p>
				<p><strong>Member count:</strong> {membs ? membs.length : "No members found"}</p>
				<p><strong>Current fronter{frnt && frnt.members && frnt.members.length > 1 ? 's' : ''}:</strong> {frnt && frnt.members ? frnt.members.map(m => m.name).join(", ") : "None"}</p>
				<br/>
				{sys.description && <p className="App-scroll"><strong>Description: </strong>{sys.description}</p>}
				</div>
				</div>
			);
		}
		return (
			<p>Loading...</p>
		);
	}
}

export default System;