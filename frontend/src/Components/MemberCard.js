import React, { Component, Fragment as Frag } from 'react';
import showdown from 'showdown';
import sanitize from 'sanitize-html';

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

	selectProxy = async (proxy, index, lastindex) => {
		if(proxy.name) {
			if(proxy.name == "Add new") {
				await this.setState(state => {
					if(!state.edit.proxylist[lastindex].val.prefix &&
						!state.edit.proxylist[lastindex].val.suffix) {
						state.edit.proxylist.splice(lastindex, 1);
						index = index-1;
					}
					state.edit.proxy = {prefix: null, suffix: null};
					state.edit.proxylist.push({name: "(empty)", val: state.edit.proxy});
					state.edit.proxy_index = index;
					return state;
				})
			} else {
				await this.setState((state) => {
					if(!state.edit.proxylist[lastindex].val.prefix &&
						!state.edit.proxylist[lastindex].val.suffix &&
						state.edit.proxylist.length > 1) {
						state.edit.proxylist.splice(lastindex, 1);
						if(index > lastindex) index = index-1;
					}
					state.edit.proxy = state.edit.proxylist[index].val;
					state.edit.proxy_index = index;
					return state;
				});
			}
			return {
				list: this.state.edit.proxylist.concat({name: "Add new"}),
				selected: this.state.edit.proxylist[this.state.edit.proxy_index],
				index: this.state.edit.proxy_index
			}
		}
	}

	editProxy = (e) => {
		var name = e.name;
		var val = e.value;
		var key = this.state.edit.proxy_index;
		console.log(key);
		var proxy = this.state.edit.proxylist[key].val;
		if(name == "prefix") {
			this.setState((state) => {
				state.edit.proxylist[key].name = (!val && !proxy.suffix ? "(empty)" : `${val || ""}text${proxy.suffix || ""}`);
				state.edit.proxylist[key].val = {prefix: val, suffix: proxy.suffix || ""}
				state.edit.proxy = state.edit.proxylist[key].val;
				return state;
			});
		} else if(name == "suffix") {
			this.setState((state) => {
				state.edit.proxylist[key].name = (!proxy.prefix && !val ? "(empty)" : `${proxy.prefix || ""}text${val || ""}`);
				state.edit.proxylist[key].val = {prefix: proxy.prefix || "", suffix: val || ""}
				state.edit.proxy = state.edit.proxylist[key].val;
				return state;
			});
		}	
	}

	enableEdit = (member)=> {
		if(!this.state.editable) return;
		this.setState((state)=> {
			var m = Object.assign({}, member);
			var proxylist = m.proxy_tags && m.proxy_tags[0] ?
				m.proxy_tags.map(p => {
					return {
						name: `${p.prefix}text${p.suffix}`,
						val: p
					}
				}) : [{name: "(empty)", val: {prefix: null, suffix: null}}];
			state.edit = {enabled: true, member: m, proxy: proxylist[0].val, proxylist: proxylist, proxy_index: 0};
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
		const target = e.target;
		const n = name;
		const val = target.value;
		this.setState((state) => {
			if(["prefix","suffix"].includes(n)) {
				this.editProxy(target);
			} else {
				state.edit.member[n] = val != "" ? val : null;
			}
			
			return state;
		})
	}

	handleSubmit = async (e) => {
		e.preventDefault();
		var st = this.state.edit.member;
		st.proxy_tags = this.state.edit.proxylist.map(p => p.val);

		if(((st.proxy_tags[0].prefix == "" && st.proxy_tags[0].suffix == "") ||
					(st.proxy_tags[0].prefix == null && st.proxy_tags[0].suffix == null)) &&
			st.proxy_tags.length == 1) st.proxy_tags = [];

		delete st.prefix;
		delete st.suffix;
		delete st.tmpdescription;
		delete st.created;

		st.proxy_tags.forEach((tag,i) => {
			if(!tag.prefix && !tag.suffix) st.proxy_tags.splice(i, 1);
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
					<p style={{width: "90%"}}>
						<Dropdown style={{width: "100%", margin: 0}} list = {edit.proxylist.concat({name: "Add new"})} callback = {this.selectProxy} />
						<input style={{width: '25%'}} type="text" placeholder="prefix" name="prefix" value={edit.proxy.prefix || ""} onChange={(e)=>this.handleChange("prefix",e)}/>
						text
						<input style={{width: '25%'}} type="text" placeholder="suffix" name="suffix" value={edit.proxy.suffix || ""} onChange={(e)=>this.handleChange("suffix",e)}/>
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
					{(memb.proxy_tags[0]) && < Dropdown style={{width: "90%"}} list={[{name: "Proxy list"}, ...memb.proxy_tags.map(p => {return {name: `${p.prefix || ""}text${p.suffix || ""}`}})]} type="1" />}
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