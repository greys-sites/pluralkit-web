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

		this.cardRef = React.createRef();

		this.state = {
			key: 	this.props.key,
			member: this.props.member,
			edit: {enabled: false},
			editable: this.props.editable,
			token: this.props.token,
			submitted: false,
			error: null,
			deleteMember: this.props.deleteMember,
			onEdit: this.props.onEdit,
			expanded: false,
			delete: 0
		}
	}

	componentDidMount() {
		if(this.props.isNew) window.scrollTo(0, this.cardRef.current.offsetTop)
	}

	formatTime = (date) => {
		if (!date) return `null`;
		
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

	enableEdit = ()=> {
		if(!this.state.editable) return;
		if(this.state.edit.enabled) return;
		this.setState((state)=> {
			var m = Object.assign({}, state.member);
			var proxylist = m.proxy_tags && m.proxy_tags[0] ?
				m.proxy_tags.map(p => {
					return {
						name: `${p.prefix || ""}text${p.suffix || ""}`,
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
			state.expanded = false;
			state.delete = 0;
			return state;
		})
	}

	handleChange = (name, e) => {
		const target = e.target;
		const n = name;
		const val = target.checked || target.value;
		this.setState((state) => {
			if(["prefix","suffix"].includes(n)) {
				this.editProxy(target);
			} else if(n == "visibility" || n.includes('privacy')) {
				state.edit.member[n] = val == true ? "private" : "public";
			} else {
				state.edit.member[n] = val != "" ? val : null;
			}
			
			return state;
		})
	}

	handleSubmit = async (e) => {
		e.preventDefault();
		var st = Object.assign({}, this.state.edit.member);
		st.proxy_tags = this.state.edit.proxylist.map(p => p.val);

		if(((st.proxy_tags[0].prefix == "" && st.proxy_tags[0].suffix == "") ||
			(st.proxy_tags[0].prefix == null && st.proxy_tags[0].suffix == null)) &&
			st.proxy_tags.length == 1) st.proxy_tags = [];

		delete st.prefix;
		delete st.suffix;
		delete st.tmpdescription;
		delete st.created;
		delete st.privacy;

		if(st.birthday && st.birthday.match(new RegExp(/^\d{2}-\d{2}$/))) st.birthday = "0004-" + st.birthday;
    
		//nullify empty strings, just in case
		Object.keys(st).forEach(k => {
			if(st[k] === "") st[k] = null;
		})

		st.proxy_tags.forEach((tag,i) => {
			if(!tag.prefix && !tag.suffix) st.proxy_tags.splice(i, 1);
			if(tag.prefix == null) tag.prefix = "";
			if(tag.suffix == null) tag.suffix = "";
		});

		if(st.id != "new") {
			try {
				var res = await axios.patch('/pkapi/m/'+st.id, st);
			} catch(e) {
				console.log(e.response);
				this.setState({submitted: true, error: e.response.data});
				setTimeout(()=> this.setState({error: null}), 5000);
				return;
			}

			var newmember = res.data;
			await this.setState((state)=> {
				state.submitted = true;
				state.member = newmember;
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
				state.expanded = false;
				return state;
			})
			await this.state.onEdit(this.state.member)
		} else {
			try {
				var res = await axios.post('/pkapi/m', st);
			} catch(e) {
				console.log(e);
				this.setState({submitted: true, error: e.response.data});
				setTimeout(()=> this.setState({error: null}), 5000);
				return;
			}
			
			var member = res.data;
			await this.setState({
				member: {id: "new"},
				edit: {enabled: false, member: null},
				expanded: false,
				delete: 0
			})
			await this.props.onCreate(member);
		}
	}

	deleteMember = () => {
		if(this.state.delete == 0) {
			this.setState({delete: 1})
		} else this.state.deleteMember(this.state.member.id);
	}

	cancelDelete = () => {
		this.setState({delete: 0})
	}

	expand = () => {
		if(this.state.expanded) window.scrollTo(0, this.cardRef.current.offsetTop);
		else window.scrollTo(0, this.cardRef.current.offsetTop + 500);
		this.setState({expanded: !this.state.expanded})
	}

	render() {
		var memb = this.state.member;
		var edit = this.state.edit;
		if(memb && memb.id == "new" && !edit.enabled) {
			return (
				<div className={`App-memberCard ${this.state.editClass}`} style={{"cursor": (this.state.editable ? "pointer" : "default")}} onClick={()=> this.enableEdit()}>
					<h1 style={{fontSize: 'calc(72px + 2vmin)', opacity: .5, margin: 'auto'}}>
						+
					</h1>
				</div>
			);
		} else if(memb) {
			return (
				<div className={`App-memberCard ${edit.enabled ? "editEnabled" : ""} ${this.state.expanded ? "expand" : ""}`} ref={this.cardRef}>
				{
					edit.enabled ? 
					(
						<form onSubmit={this.handleSubmit}>
							<div className="App-memberWrapper">
							<div id="properties-panel">
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
								<input placeholder="birthday ([yyyy-]mm-dd)" type="text" pattern="(?:\d{4}-)?\d{2}-\d{2}" name="birthday" value={edit.member.birthday} onChange={(e)=>this.handleChange("birthday",e)}/>
								<textarea placeholder="description" onChange={(e)=>this.handleChange("description",e)}>{edit.member.description}</textarea>
							</div>
							<div id="privacy-panel">
								<p>
								<label for="visibility">Make member private?</label>{" "}
								<input type="checkbox" name="visibility" checked={edit.member.visibility == "private" ? true : false} onChange={(e)=>this.handleChange("visibility",e)}/>
								</p>

								<p>
								<label for="name_privacy">Make member name private?</label>{" "}
								<input type="checkbox" name="name_privacy" checked={edit.member.name_privacy == "private" ? true : false} onChange={(e)=>this.handleChange("name_privacy",e)}/>
								</p>

								<p>
								<label for="description_privacy">Make member description private?</label>{" "}
								<input type="checkbox" name="description_privacy" checked={edit.member.description_privacy == "private" ? true : false} onChange={(e)=>this.handleChange("description_privacy",e)}/>
								</p>

								<p>
								<label for="birthday_privacy">Make member birthday private?</label>{" "}
								<input type="checkbox" name="birthday_privacy" checked={edit.member.birthday_privacy == "private" ? true : false} onChange={(e)=>this.handleChange("birthday_privacy",e)}/>
								</p>

								<p>
								<label for="pronoun_privacy">Make member pronouns private?</label>{" "}
								<input type="checkbox" name="pronoun_privacy" checked={edit.member.pronoun_privacy == "private" ? true : false} onChange={(e)=>this.handleChange("pronoun_privacy",e)}/>
								</p>

								<p>
								<label for="avatar_privacy">Make member avatar private?</label>{" "}
								<input type="checkbox" name="avatar_privacy" checked={edit.member.avatar_privacy == "private" ? true : false} onChange={(e)=>this.handleChange("avatar_privacy",e)}/>
								</p>

								<p>
								<label for="metadata_privacy">Make member metadata (message count, etc) private?</label>{" "}
								<input type="checkbox" name="metadata_privacy" checked={edit.member.metadata_privacy == "private" ? true : false} onChange={(e)=>this.handleChange("metadata_privacy",e)}/>
								</p>
							</div>
							</div>
							{this.state.delete == 1 && <p className="App-error">Are you sure you want to delete this member?</p>}
							{this.state.error && <p className="App-error">ERR: {this.state.error}</p>}
							{this.state.delete == 0 ? (
								<div id="button-panel">
									<button className="App-button" type="submit">Save</button>
									<button className="App-button" type="button" onClick={this.cancelEdit}>Cancel</button>
									{memb.id != "new" && <button className="App-button" type="button" onClick={()=>this.deleteMember()}>Delete</button>}
									<button className="App-button" type="button" onClick={this.expand}>{this.state.expanded ? "Contract" : "Expand"}</button>
								</div>
							) : (
								<div id="button-panel">
									<button className="App-button" type="button" onClick={()=>this.deleteMember()}>I'm sure!</button>
									<button className="App-button" type="button" onClick={this.cancelDelete}>Wait no</button>
								</div>
							)}
							
						</form>
					) :
					(
						<Frag>
						<div className="App-memberWrapper">
							<div id="properties-panel">
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
						</div>
						{this.state.editable && (
							<div id="button-panel">
							<button className="App-button" type="button" onClick={this.enableEdit}>Edit</button>
							</div>
						)}
						</Frag>
					)
				}
				{this.state.err && <p className="App-error">ERR: {this.state.err}</p>}
				</div>
			)
		} else {
			return null;
		}
	}
}

export default MemberCard;
