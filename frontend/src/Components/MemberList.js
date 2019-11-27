import React, { Component, Fragment as Frag } from 'react';
import MemberCard from './MemberCard';
import Dropdown from './Dropdown';

class MemberList extends Component {
	constructor(props) {
		super(props);
		this.state = {
			members: this.props.members,
			editable: this.props.editable,
			token: this.props.token,
			edit: {enabled: false},
			editClass: '',
			query: null,
			sortmethods: [
				{
					name: "Alphabetical",
					func: (members)=> {
						return members.sort((a,b) => ((a.display_name ? a.display_name.toLowerCase() : a.name.toLowerCase()) > (b.display_name ? b.display_name.toLowerCase() : b.name.toLowerCase())) ? 1 : (((b.display_name ? b.display_name.toLowerCase() : b.name.toLowerCase()) > (a.display_name ? a.display_name.toLowerCase() : a.name.toLowerCase())) ? -1 : 0));
					}
				},
				{
					name: "Reverse Alphabetical",
					func: (members)=> {
						return members.sort((a,b) => ((a.display_name ? a.display_name.toLowerCase() : a.name.toLowerCase()) > (b.display_name ? b.display_name.toLowerCase() : b.name.toLowerCase())) ? 1 : (((b.display_name ? b.display_name.toLowerCase() : b.name.toLowerCase()) > (a.display_name ? a.display_name.toLowerCase() : a.name.toLowerCase())) ? -1 : 0)).reverse();
					}
				},
				{
					name: "Alphabetical by ID",
					func: (members)=> {
						return members.sort((a,b) => a.id > b.id ? 1 : -1);
					}
				},
				{
					name: "Reverse Alphabetical by ID",
					func: (members)=> {
						return members.sort((a,b) => a.id > b.id ? 1 : -1).reverse();
					}
				},
				{
					name: "Oldest to Newest",
					func: (members)=> {
						return members.sort((a,b) => new Date(a.created) > new Date(b.created) ? 1 : (new Date(a.created) < new Date(b.created) ? -1 : 0));
					}
				},
				{
					name: "Newest to Oldest",
					func: (members)=> {
						return members.sort((a,b) => new Date(a.created) > new Date(b.created) ? 1 : (new Date(a.created) < new Date(b.created) ? -1 : 0)).reverse();
					}
				}
			],
			sortmethod: {
				name: "Alphabetical",
				func: (members)=> {
					return members.sort((a,b) => ((a.display_name ? a.display_name.toLowerCase() : a.name.toLowerCase()) > (b.display_name ? b.display_name.toLowerCase() : b.name.toLowerCase())) ? 1 : (((b.display_name ? b.display_name.toLowerCase() : b.name.toLowerCase()) > (a.display_name ? a.display_name.toLowerCase() : a.name.toLowerCase())) ? -1 : 0));
				}
			}
		};
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
			state.editClass = 'App-unedit';
			state.member = this.state.member;
			return state;
		})
	}

	searchMembers = (e) => {
		e.preventDefault();
		var val = e.target.value ? e.target.value : null;
		this.setState({query: val});
	}

	sortMembers = (method) => {
		if(method.name) this.setState({members: method.func(this.state.members), sortmethod: method});
		else this.setState({members: this.state.sortmethods[0].func(this.state.members), sortmethod: this.state.sortmethods[0]})
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

		if((!st.proxy_tags) || (st.proxy_tags[0].prefix == "" && st.proxy_tags[0].suffix == "") ||
			(st.proxy_tags[0].prefix == null && st.proxy_tags[0].suffix == null)) st.proxy_tags = [];

		var res = await fetch('/pkapi/m', {
			method: "POST",
			body: JSON.stringify(st),
			headers: {
				"Content-Type": "application/json",
				"Authorization": this.state.token

			}
		});

		if(res.status == 200) {
			var member = await res.json();
			this.setState((state)=> {
				state.submitted = true;
				state.members.push(member);
				state.members = this.state.sortmethod.func(state.members);
				state.edit = {enabled: false, member: null};
				return state;
			})
		} else {
			this.setState({submitted: false});
		}
	}

	deleteMember = async (id) => {
		var res = await fetch('/pkapi/m/'+id, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
				"Authorization": this.state.token

			}
		});

		if(res.status == 200) {
			this.setState((state)=> {
				state.deleted = true;
				state.members = state.members.filter(m => m.id != id);
				return state;
			})
		} else {
			this.setState({delete: false});
		}
	}

	onEdit = async (member)=> {
		this.setState(state => {
			var ind = state.members.findIndex(mb => mb.id == member.id);
			state.members[ind] = member;
			state.members = this.state.sortmethod.func(state.members);
			return state;
		})
	}

	render() {
		var edit = this.state.edit;
		var query = this.state.query;
		return (
			<Frag>
			<div className="App-memberMethods">
			<input className="App-searchbar" type="text" name="search" placeholder="search" value={query ? query : null} onChange={this.searchMembers} />
			<Dropdown style={{width: '50%'}} list={this.state.sortmethods} callback={this.sortMembers}/>
			</div>
			<section className="App-memberList">
				{this.props.editable && 
				(edit.enabled ?
				<form className={`App-memberCard ${this.state.editClass}`} style={{"cursor": "pointer"}} onSubmit={this.handleSubmit}>
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
					</div>
				</form> :
				!query &&
					(<div className={`App-memberCard ${this.state.editClass}`} style={{"cursor": (this.state.editable ? "pointer" : "default")}} onClick={()=> this.enableEdit()}>
						<h1 style={{fontSize: 'calc(72px + 2vmin)', opacity: .5}}>
							+
						</h1>
					</div>)
				
				)
				}
	            {
	            	this.state.members.map((m) => {
	            		if(query)
	            			if(m.name.toLowerCase().includes(query.toLowerCase()))
		            			return ( <MemberCard key={m.id} member={m} editable={this.state.editable} token={this.state.token} deleteMember={this.deleteMember} onEdit={this.onEdit}/> )
		            		else
		            			return ( null )
	            		else
	            			return ( <MemberCard key={m.id} member={m} editable={this.state.editable} token={this.state.token} deleteMember={this.deleteMember} onEdit={this.onEdit}/> )
            	})
	            }
	        </section>
	        </Frag>
		)
	}
}

export default MemberList;