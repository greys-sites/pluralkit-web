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
			]

var conv = new showdown.Converter();


class MemberCard extends Component {
	constructor(props) {
		super(props);
		this.props.member.tmpdescription = sanitize(conv.makeHtml(this.props.member.description),
			{
				allowedTags: tags
			});
		this.props.member.tmpdescription = this.props.member.tmpdescription.replace(/\|{2}(.*?)\|{2}/gs, "<span class='App-spoiler'>$1</span>");
		this.state = {
			key: 	this.props.key,
			member: this.props.member,
			edit: {enabled: false},
			editable: this.props.editable,
			token: this.props.token,
			submitted: false
		}
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
			state.edit.member[n] = val;
			return state;
		})
	}

	handleSubmit = async (e) => {
		e.preventDefault();
		var st = this.state.edit.member;

		var res = await fetch('/pkapi/m/'+st.id, {
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
				state.member = this.state.edit.member;
				state.member.tmpdescription = sanitize(conv.makeHtml(this.state.edit.member.description),
				{
					allowedTags: tags
				});
				state.member.tmpdescription = state.member.tmpdescription.replace(/\|{2}(.*?)\|{2}/gs, "<span class='App-spoiler'>$1</span>");
				state.edit = {enabled: false, member: null};
				return state;
			})
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
					<input type="text" name="name" value={edit.member.name} onChange={(e)=>this.handleChange("name",e)}/>
					<img className="App-memberAvatar" style={{boxShadow: "0 0 0 5px #"+(edit.member.color ? edit.member.color : "aaa")}} src={edit.member.avatar_url || "/default.png"} alt={edit.member.name + "'s avatar"}/>
					<input type="text" name="avatar_url" value={edit.member.avatar_url} onChange={(e)=>this.handleChange("avatar_url",e)}/>
					<input pattern="[A-Fa-f0-9]{6}" type="text" name="color" value={edit.member.color} onChange={(e)=>this.handleChange("color",e)}/>
					<p><input style={{width: '50px'}} type="text" name="prefix" value={edit.member.prefix} onChange={(e)=>this.handleChange("prefix",e)}/>text<input style={{width: '50px'}} type="text" name="suffix" value={edit.member.suffix} onChange={(e)=>this.handleChange("suffix",e)}/></p>
					<input type="text" name="pronouns" value={edit.member.pronouns} onChange={(e)=>this.handleChange("pronouns",e)}/>
					<input type="text" pattern="\d{4}-\d{2}-\d{2}" name="birthday" value={edit.member.birthday} onChange={(e)=>this.handleChange("birthday",e)}/>
					<textarea onChange={(e)=>this.handleChange("description",e)}>{edit.member.description}</textarea>
				
					<div><button className="App-button" type="submit">Save</button> <button className="App-button" type="button" onClick={this.cancelEdit}>Cancel</button></div>
				</form>
				)
			} else {
				return (
				<div className="App-memberCard" style={{"cursor": (this.state.editable ? "pointer" : "default")}} onClick={()=> this.enableEdit(memb)}>
					<h1>
						{memb.name.toUpperCase()}
					</h1>
					<img className="App-memberAvatar" style={{boxShadow: "0 0 0 5px #"+(memb.color ? memb.color : "aaa")}} src={memb.avatar_url || "/default.png"} alt={memb.name + "'s avatar"}/>
					<span className="App-tagline">{memb.prefix}text{memb.suffix}</span>
					<span className="App-tagline">{memb.pronouns || "(N/A)"} || {memb.birthday || "(N/A)"}</span>
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