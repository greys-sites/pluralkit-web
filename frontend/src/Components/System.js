import React, { Component, Fragment as Frag } from 'react';
import showdown from 'showdown';
import sanitize from 'sanitize-html';
import axios 	from 'axios';

import Dropdown from './Dropdown';

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

var privacyVals = [
	{name: "Set Member Privacy"},
	{name: "Private", val: "private"},
	{name: "Public", val: "public"},
	{name: "Keep Same", val: "keep"}
]

async function sleep(ms) {
	return new Promise(res => setTimeout(res, ms))
}

class System extends Component {
	constructor(props) {
		super(props);
		this.cardRef = React.createRef();

		if(this.props.system.description) {
			this.props.system.tmpdescription = sanitize(conv.makeHtml(this.props.system.description),
			{
				allowedTags: tags
			});
		} else this.props.system.tmpdescription = "(no description)";
		this.props.system.tmpdescription = this.props.system.tmpdescription.replace(/\|{2}(.*?)\|{2}/gs, "<span class='App-spoiler' onclick='event.stopPropagation()'>$1</span>");
	
		this.state = {
			sys: this.props.system,
			members: this.props.members,
			fronters: this.props.fronters,
			edit: {enabled: false},
			editable: this.props.editable,
			token: this.props.token,
			expanded: false,
			progress: null
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
		if(this.state.progress) return;
		if(this.state.expanded) this.expand();

		this.setState((state)=> {
			state.edit = {enabled: false, vals: null};
			state.sys = this.state.sys;
			return state;
		})
	}

	handleChange = (name, e) => {
		const n = name;
		const target = e.target;
		const val = target.checked || target.value;
		this.setState((state) => {
			if(n.includes("privacy")) {
				state.edit.vals[n] = val == true ? "private" : "public";
			} else {
				state.edit.vals[n] = val != "" ? val : null;
			}
			
			return state;
		})
	}

	handleSubmit = async (e) => {
		e.preventDefault();
		if(this.state.progress) return;
		var st = this.state.edit.vals;

		if(st.member_privacy != null) await this.setAllMembers(st.member_privacy);

		delete st.created;
		delete st.tmpdescription;
		delete st.member_privacy;

		try {
			var res = await axios('/pkapi/s', {
				method: "PATCH",
				data: JSON.stringify(st),
				headers: {
					"Content-Type": "application/json",
					"Authorization": this.state.token

				}
			});
		} catch(e) {
			this.setState({submitted: true, error: e.response.data});
			return;
		}

		if(this.state.expanded) this.expand();

		this.setState((state)=> {
			state.submitted = true;
			state.sys = res.data;
			state.sys.tmpdescription = sanitize(conv.makeHtml(this.state.edit.vals.description),
			{
				allowedTags: tags
			});
			state.sys.tmpdescription = state.sys.tmpdescription.replace(/\|{2}(.*?)\|{2}/gs, "<span class='App-spoiler' onclick='event.stopPropagation()'>$1</span>");
			state.edit = {enabled: false, vals: null};
			return state;
		});
	}

	expand = () => {
		if(this.state.expanded) window.scrollTo(0, this.cardRef.current.offsetTop);
		else window.scrollTo(0, this.cardRef.current.offsetTop + 300);
		this.setState({expanded: !this.state.expanded})
	}

	async setAllMembers(val) {
		return new Promise(async res => {
			for (let i = 0; i < this.state.members.length; i++) {
				var member = this.state.members[i];
				member.visibility = val;
				delete member.privacy;
				await axios("/pkapi/m/"+member.id, {
					method: "PATCH",
					data: member,
					headers: {
						Authorization: this.state.token
					}
				})
				this.setState({progress: i});
				await sleep(500);
			}

			res();
		})
	}

	setMemberPrivacy = (_, index) => {
		var option = privacyVals[index];
		this.setState(state => {
			switch(option.val) {
				case "private":
					state.edit.vals.member_privacy = "private";
					break;
				case "public":
					state.edit.vals.member_privacy = "public";
					break;
				default:
					state.edit.vals.member_privacy = null;
					break;
			}
			return state;
		})	
	}

	render() {
		if(this.state.sys) {
			var sys = this.state.sys;
			var membs = this.state.members;
			var frnt = this.state.fronters;
			var edit = this.state.edit;
			return (
				<div className={`App-syscontainer ${edit.enabled ? "editEnabled" : ""} ${this.state.expanded ? "expand" : ""}`} ref={this.cardRef}>
				{edit.enabled ? (
					<form onSubmit={this.handleSubmit}>
					<img className="App-avatar" src={edit.vals.avatar_url ? edit.vals.avatar_url : "/default.png"} alt="System avatar" />
					<div className="App-sysWrapper">
						<div id="properties-panel">
							<input placeholder="avatar url" type="text" name="avatar_url" onChange={(e)=>this.handleChange("avatar_url", e)} value={edit.vals.avatar_url} />
							<input placeholder="name" type="text" name="name" onChange={(e)=>this.handleChange("name", e)} value={edit.vals.name} />
							<input placeholder="tag" type="text" name="tag" onChange={(e)=>this.handleChange("tag", e)} value={edit.vals.tag} />
							<textarea placeholder="description" onChange={(e)=>this.handleChange("description",e)}>{edit.vals.description}</textarea>
						</div>
						<div id="privacy-panel">
							<p>
								<label for="description_privacy">Make description private?</label>{" "}
								<input type="checkbox" name="description_privacy" checked={edit.vals.description_privacy == "private" ? true : false} onChange={(e)=>this.handleChange("description_privacy",e)}/>
							</p>
							<p>
								<label for="member_list_privacy">Make member list private?</label>{" "}
								<input type="checkbox" name="member_list_privacy" checked={edit.vals.member_list_privacy == "private" ? true : false} onChange={(e)=>this.handleChange("member_list_privacy",e)}/>
							</p>
							<p>
								<label for="front_privacy">Make current fronters private?</label>{" "}
								<input type="checkbox" name="front_privacy" checked={edit.vals.front_privacy == "private" ? true : false} onChange={(e)=>this.handleChange("front_privacy",e)}/>
							</p>
							<p>
								<label for="front_history_privacy">Make front history private?</label>{" "}
								<input type="checkbox" name="front_history_privacy" checked={edit.vals.front_history_privacy == "private" ? true : false} onChange={(e)=>this.handleChange("front_history_privacy",e)}/>
							</p>
							<Dropdown list = {privacyVals} callback = {this.setMemberPrivacy} />
						</div>
					</div>
					{this.state.error && <p className="App-error">ERR: {this.state.error}</p>}
					{this.state.progress && (
						<div className="App-progressWrapper">
						This might take a while...
						<div className="App-progressBar" style={{width: this.state.progress / this.state.members.length * 100 + "%"}}>
						</div>
						</div>
					)}
					<div id="button-panel">
						<button className="App-button" type="submit">Save</button>
						<button className="App-button" type="button" onClick={this.cancelEdit}>Cancel</button>
						<button className="App-button" type="button" onClick={this.expand}>{this.state.expanded ? "Contract" : "Expand"}</button>
					</div>
					</form>
				) : (
					<Frag>
					<img className="App-avatar" src={sys.avatar_url ? sys.avatar_url : "/default.png"} alt="System avatar" />
					<div className="App-sysWrapper">
						<div id="properties-panel">
							<p><strong>{sys.name || "(no name)"} ({sys.id})</strong></p>
							{sys.tag && <p><strong>Tag:</strong> {sys.tag}</p>}
							<p><strong>Member count:</strong> {membs && membs[0] ? membs.length : (membs.private ? "(private)" : 0)}</p>
							<p><strong>Current fronter{frnt && frnt.members && frnt.members.length != 1 ? 's' : ''}:</strong> {frnt && frnt.members && frnt.members.length > 0 ? frnt.members.map(m => m.name).join(", ") : (frnt.private ? "This user's fronters are private" : "(none)")}</p>
							{sys.description && (
								<Frag>
								<p>
								<strong>Description:</strong>
								</p>
								<p className="App-description" dangerouslySetInnerHTML={{__html: sys.tmpdescription}}></p>
								</Frag>
							)}
							{sys.description && <div></div>}
						</div>
					</div>
					{this.state.editable && (
						<div id="button-panel">
						<button className="App-button" type="button" onClick={this.enableEdit}>Edit</button>
						</div>
					)}
					</Frag>
				)}
				</div>
			);
		} else {
			return (
				<p>Loading...</p>
			);
		}
	}
}

export default System;