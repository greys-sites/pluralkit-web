import React, { Component, Fragment as Frag } from 'react';
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
			];

var conv = new showdown.Converter();


class MemberCard extends Component {
	constructor(props) {
		super(props);
		if(this.props.member.description) {
			this.props.member.tmpdescription = sanitize(conv.makeHtml(this.props.member.description),
			{
				allowedTags: tags
			});
			this.props.member.tmpdescription = this.props.member.tmpdescription.replace(/\|{2}(.*?)\|{2}/gs, "<span class='App-spoiler' onclick='event.stopPropagation()'>$1</span>");
			
		}
		this.state = {
			key: 	this.props.key,
			member: this.props.member,
			edit: {enabled: false},
			editable: this.props.editable,
			token: this.props.token,
			submitted: false,
			deleteMember: this.props.deleteMember,
			onEdit: this.props.onEdit
		}
	}

	formatTime = (date) => {
		if(typeof date == "string") date = new Date(date);

		return `${(date.getMonth()+1) < 10 ? "0"+(date.getMonth()+1) : (date.getMonth()+1)}.${(date.getDate()) < 10 ? "0"+(date.getDate()) : (date.getDate())}.${date.getFullYear()} at ${date.getHours() < 10 ? "0"+date.getHours() : date.getHours()}:${date.getMinutes() < 10 ? "0"+date.getMinutes() : date.getMinutes()}`
	}

	enableEdit = (member)=> {
		if(!this.state.editable) return;
		this.setState((state)=> {
			state.edit = {enabled: true, member: Object.assign({},member)};
			return state;
		})
	}

	cancelEdit = ()=> {
		this.setState((state)=> {
			state.edit = {enabled: false, member: null};
			state.member = this.state.member;
			return state;
		})
	}

	handleChange = (name, e) => {
		const n = name;
		const val = e.target.value;
		this.setState((state) => {
			if(["prefix","suffix"].includes(n)) {
				if(!state.edit.member.proxy_tags[0]) state.edit.member.proxy_tags[0] = {prefix: null, suffix: null};
				state.edit.member.proxy_tags[0][n] = val != "" ? val : null;
			} else {
				state.edit.member[n] = val != "" ? val : null;
			}
			
			return state;
		})
	}

	handleSubmit = async (e) => {
		e.preventDefault();
		var st = this.state.edit.member;

		if(((st.proxy_tags[0].prefix == "" && st.proxy_tags[0].suffix == "") ||
					(st.proxy_tags[0].prefix == null && st.proxy_tags[0].suffix == null)) &&
			st.proxy_tags.length == 1) st.proxy_tags = [];

		delete st.prefix;
		delete st.suffix;

		st.proxy_tags.forEach((tag,i) => {
			if(tag.prefix == null && tag.sufix == null) st.proxy_tags.splice(i, 1);
			if(tag.prefix == null) tag.prefix = "";
			if(tag.suffix == null) tag.suffix = "";
		})

		var res = await fetch('/pkapi/m/'+st.id, {
			method: "PATCH",
			body: JSON.stringify(st),
			headers: {
				"Content-Type": "application/json",
				"Authorization": this.state.token

			}
		});

		if(res.status == 200) {
			await this.setState((state)=> {
				state.submitted = true;
				state.member = this.state.edit.member;
				if(state.member.description) {
					state.member.tmpdescription = sanitize(conv.makeHtml(this.state.edit.member.description),
					{
						allowedTags: tags
					});
					state.member.tmpdescription = state.member.tmpdescription.replace(/\|{2}(.*?)\|{2}/gs, "<span class='App-spoiler' onclick='event.stopPropagation()'>$1</span>");
					
				} else {
					state.member.tmpdescription = null;
				}
				state.edit = {enabled: false, member: null};
				return state;
			})
			await this.state.onEdit(this.state.member)
		} else {
			this.setState({submitted: false});
		}
	}

	render() {
		var memb = this.state.member;
		var edit = this.state.edit;
		if(memb) {
			if(edit.enabled) {
				return (
				<form className="App-memberCard" style={{"cursor": "pointer"}} onSubmit={this.handleSubmit}>
					<img className="App-memberAvatar" style={{boxShadow: "0 0 0 5px #"+(edit.member.color ? edit.member.color : "aaa")}} src={edit.member.avatar_url || "/default.png"} alt={edit.member.name + "'s avatar"}/>
					<input placeholder="name" type="text" name="name" value={edit.member.name} onChange={(e)=>this.handleChange("name",e)}/>
					<input placeholder="display name" type="text" name="display_name" value={edit.member.display_name} onChange={(e)=>this.handleChange("display_name",e)}/>
					<input placeholder="avatar url" type="text" name="avatar_url" value={edit.member.avatar_url} onChange={(e)=>this.handleChange("avatar_url",e)}/>
					<input placeholder="color" pattern="[A-Fa-f0-9]{6}" type="text" name="color" value={edit.member.color} onChange={(e)=>this.handleChange("color",e)}/>
					<p>
						<input style={{width: '50px'}} type="text" placeholder="prefix" name="prefix" value={edit.member.proxy_tags[0] ? edit.member.proxy_tags[0].prefix : null} onChange={(e)=>this.handleChange("prefix",e)}/>
						text
						<input placeholder="suffix" style={{width: '50px'}} type="text" name="suffix" value={edit.member.proxy_tags[0] ? edit.member.proxy_tags[0].suffix : null} onChange={(e)=>this.handleChange("suffix",e)}/>
					</p>
					<input placeholder="pronouns" type="text" name="pronouns" value={edit.member.pronouns} onChange={(e)=>this.handleChange("pronouns",e)}/>
					<input placeholder="birthday (yyyy-mm-dd)" type="text" pattern="\d{4}-\d{2}-\d{2}" name="birthday" value={edit.member.birthday} onChange={(e)=>this.handleChange("birthday",e)}/>
					<textarea placeholder="description" onChange={(e)=>this.handleChange("description",e)}>{edit.member.description}</textarea>
				
					<div>
					<button className="App-button" type="submit">Save</button>{" "}
					<button className="App-button" type="button" onClick={this.cancelEdit}>Cancel</button>
					<button className="App-button" type="button" onClick={()=>this.state.deleteMember(memb.id)}>Delete</button>
					</div>
				</form>
				)
			} else {
				return (
				<div className="App-memberCard" style={{"cursor": (this.state.editable ? "pointer" : "default")}} onClick={()=> this.enableEdit(memb)}>
					<h1>
						{memb.display_name ? memb.display_name.toUpperCase() : memb.name.toUpperCase()} ({memb.id})
					</h1>
					<img className="App-memberAvatar" style={{boxShadow: "0 0 0 5px #"+(memb.color ? memb.color : "aaa")}} src={memb.avatar_url || "/default.png"} alt={memb.name + "'s avatar"}/>
					{memb.display_name && <span className="App-tagline">aka {memb.name}</span>}
					{(memb.proxy_tags[0]) && <span className="App-tagline">{memb.proxy_tags[0].prefix}text{memb.proxy_tags[0].suffix}</span>}
					<span className="App-tagline">{memb.pronouns || "(N/A)"} || {memb.birthday || "(N/A)"}</span>
					<span className="App-tagline">Created: {this.formatTime(memb.created)}</span>
					<div className="App-description" dangerouslySetInnerHTML={{__html: memb.tmpdescription || "<p>(no description)</p>"}}></div>
				</div>
				);
			}
		} else {
			return null;
		}
	}
}

export default MemberCard;