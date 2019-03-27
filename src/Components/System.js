import React, { Component } from 'react';
import cookie from 'react-cookies';
import * as fetch from 'node-fetch';

class System extends Component {
	constructor(props) {
		super(props);

		this.state = {
			data: null,
			id: props.id
		};
	}
	async componentDidMount() {
		console.log(this.state)
		var sys = await fetch("https://pkapi.astrid.fun/s/"+this.state.id);
		this.setState({data: await sys.json()})
	}

	render() {
		if(this.state.data) {
			var sys = this.state.data;
			console.log(this.state.path);
			return (
				<div className="App-syscontainer">
				<img className="App-avatar" src={sys.avatar_url} alt="System avatar" />
				<div className="App-systeminfo" style={{backgroundColor: '#fff', color: '#000'}}>
				<p><strong>{sys.name || "(no name)"} ({sys.id})</strong></p>
				<p className={sys.tag ? "" : "App-hidden"}><strong>Tag:</strong> {sys.tag}</p>
				<p><strong>Member count:</strong> WIP<button onclick="window.open('/members','_self')">View members</button></p>
				<p><strong>Current fronters:</strong><br/> WIP</p>
				<br/>
				<p className={sys.description ? "" : "App-hidden"}><strong>Description</strong>:</p>
				<p className={sys.description ? "App-scroll" : "App-hidden"}>{sys.description}</p>
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