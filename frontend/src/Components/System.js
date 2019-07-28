import React, { Component } from 'react';
import showdown from 'showdown';
import sanitize from 'sanitize-html';

showdown.setOption('simplifiedAutoLink', true);
showdown.setOption('simpleLineBreaks', true);
showdown.setOption('openLinksInNewWindow', true);
showdown.setOption('underline', true);
showdown.setOption('strikethrough', true);

var tags = [
				'em',
				'strong',
				'i',
				'b',
				'del',
				'u',
				'p',
				'a',
				'code',
				'pre',
				'br',
				'blockquote'
			]

var conv = new showdown.Converter();

class System extends Component {
	constructor(props) {
		super(props);
		this.props.sys.tmpdescription = sanitize(conv.makeHtml(this.props.sys.description),
			{
				allowedTags: tags
			});
		this.props.sys.tmpdescription = this.props.sys.tmpdescription.replace(/\|{2}(.*?)\|{2}/gs, "<span class='App-spoiler' onclick='event.stopPropagation()'>$1</span>");
		this.state = {
			sys: this.props.sys,
			edit: {enabled: false},
			editable: this.props.editable,
			token: this.props.token
		};
	}

	enableEdit = ()=> {
		if(!this.state.editable) return;
		this.setState((state)=> {
			state.edit = {enabled: true, vals: Object.assign({},this.state.sys)};
			return state;
		})
	}

	cancelEdit = ()=> {
		this.setState((state)=> {
			state.edit = {enabled: false, vals: null};
			state.sys = this.state.sys;
			return state;
		})
	}

	handleChange = (name, e) => {
		const n = name;
		const val = e.target.value;
		this.setState((state) => {
			state.edit.vals[n] = val;
			return state;
		})
	}

	handleSubmit = async (e) => {
		e.preventDefault();
		var st = this.state.edit.vals;

		var res = await fetch('/pkapi/s', {
			method: "PATCH",
			body: JSON.stringify(st),
			headers: {
				"Content-Type": "application/json",
				"Authorization": this.state.token

			}
		});

		if(res.status == 200) {
			this.setState((state)=> {
				state.submitted = true;
				state.sys = this.state.edit.vals;
				state.sys.tmpdescription = sanitize(conv.makeHtml(this.state.edit.vals.description),
				{
					allowedTags: tags
				});
				state.sys.tmpdescription = state.sys.tmpdescription.replace(/\|{2}(.*?)\|{2}/gs, "<span class='App-spoiler' onclick='event.stopPropagation()'>$1</span>");
				state.edit = {enabled: false, vals: null};
				return state;
			})
		} else {
			this.setState({submitted: false});
		}
	}

	render() {
		if(this.state.sys) {
			var sys = this.state.sys;
			var membs = this.state.sys.members;
			var frnt = this.state.sys.fronters;
			var edit = this.state.edit;
			if(edit.enabled) {
				return (
					<form onSubmit={this.handleSubmit} className="App-syscontainer">
						<img className="App-avatar" src={edit.vals.avatar_url ? edit.vals.avatar_url : "/default.png"} alt="System avatar" />
						<div className="App-systeminfo">
						<input type="text" name="avatar_url" onChange={(e)=>this.handleChange("avatar_url", e)} value={edit.vals.avatar_url} />
						<input type="text" name="name" onChange={(e)=>this.handleChange("name", e)} value={edit.vals.name} />
						<input type="text" name="tag" onChange={(e)=>this.handleChange("tag", e)} value={edit.vals.tag} />
						<p><strong>Member count:</strong> {membs ? membs.length : "No members found"}</p>
						<p><strong>Current fronter{frnt && frnt.members && frnt.members.length > 1 ? 's' : ''}:</strong> {frnt && frnt.members ? frnt.members.map(m => m.name).join(", ") : "None"}</p>
						<textarea onChange={(e)=>this.handleChange("description",e)}>{edit.vals.description}</textarea>
						<div><button className="App-button" type="submit">Save</button> <button className="App-button" type="button" onClick={this.cancelEdit}>Cancel</button></div>
						</div>
					</form>
				);
			} else {
				return (
					<div className="App-syscontainer">
					<img className="App-avatar" src={sys.avatar_url ? sys.avatar_url : "/default.png"} alt="System avatar" />
					<div className="App-systeminfo" style={{"cursor": (this.state.editable ? "pointer" : "default")}} onClick={this.enableEdit}>
					<p><strong>{sys.name || "(no name)"} ({sys.id})</strong></p>
					<p className={sys.tag ? "" : "App-hidden"}><strong>Tag:</strong> {sys.tag}</p>
					<p><strong>Member count:</strong> {membs ? membs.length : "No members found"}</p>
					<p><strong>Current fronter{frnt && frnt.members && frnt.members.length > 1 ? 's' : ''}:</strong> {frnt && frnt.members ? frnt.members.map(m => m.name).join(", ") : "None"}</p>
					{sys.description && <div><p><strong>Description:</strong></p><p className="App-description" dangerouslySetInnerHTML={{__html: sys.tmpdescription}}></p></div>}
					</div>
					</div>
				);
			}
		}
		return (
			<p>Loading...</p>
		);
	}
}

export default System;