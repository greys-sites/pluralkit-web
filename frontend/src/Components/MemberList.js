import React, { Component, Fragment as Frag } from 'react';
import MemberCard from './MemberCard';

class MemberList extends Component {
	constructor(props) {
		super(props);
		this.state = {members: this.props.members, editable: this.props.editable, token: this.props.token, edit: {enabled: false}, editClass: '', query: null};
	}

	enableEdit = ()=> {
		if(!this.state.editable) return;
		this.setState((state)=> {
			state.edit = {enabled: true, member: {}};
			state.editClass = 'App-edit';
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

	handleChange = (name, e) => {
		const n = name;
		const val = e.target.value;
		this.setState((state) => {
			if(["prefix","suffix"].includes(n)) {
				if(!state.edit.member.proxy_tags) state.edit.member.proxy_tags = [{prefix: "", suffix: ""}];
				state.edit.member.proxy_tags[0][n] = val != "" ? val : "";
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
				state.members = state.members.sort((a,b) => ((a.display_name ? a.display_name.toLowerCase() : a.name.toLowerCase()) > (b.display_name ? b.display_name.toLowerCase() : b.name.toLowerCase())) ? 1 : (((b.display_name ? b.display_name.toLowerCase() : b.name.toLowerCase()) > (a.display_name ? a.display_name.toLowerCase() : a.name.toLowerCase())) ? -1 : 0));
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
			state.members = state.members.sort((a,b) => ((a.display_name ? a.display_name.toLowerCase() : a.name.toLowerCase()) > (b.display_name ? b.display_name.toLowerCase() : b.name.toLowerCase())) ? 1 : (((b.display_name ? b.display_name.toLowerCase() : b.name.toLowerCase()) > (a.display_name ? a.display_name.toLowerCase() : a.name.toLowerCase())) ? -1 : 0));
			return state;
		})
	}

	render() {
		var edit = this.state.edit;
		var query = this.state.query;
		return (
			<Frag>
			<input style={{marginBottom: '20px', width: '200px'}} type="text" name="search" placeholder="search" value={query ? query : null} onChange={this.searchMembers} />
			<section className="App-memberList">
				{this.props.editable && 
				(edit.enabled ?
				<form className={`App-memberCard ${this.state.editClass}`} style={{"cursor": "pointer"}} onSubmit={this.handleSubmit}>
					<img className="App-memberAvatar" style={{boxShadow: "0 0 0 5px #"+(edit.member.color ? edit.member.color : "aaa")}} src={edit.member.avatar_url || "/default.png"} alt={edit.member.name + "'s avatar"}/>
					<input placeholder="name" type="text" name="name" value={edit.member.name} onChange={(e)=>this.handleChange("name",e)}/>
					<input placeholder="display name" type="text" name="display_name" value={edit.member.display_name} onChange={(e)=>this.handleChange("display_name",e)}/>
					<input placeholder="avatar url" type="text" name="avatar_url" value={edit.member.avatar_url} onChange={(e)=>this.handleChange("avatar_url",e)}/>
					<input placeholder="color" pattern="[A-Fa-f0-9]{6}" type="text" name="color" value={edit.member.color} onChange={(e)=>this.handleChange("color",e)}/>
					<p><input style={{width: '50px'}} type="text" placeholder="prefix" name="prefix" value={edit.member.proxy_tags ? edit.member.proxy_tags[0].prefix : null} onChange={(e)=>this.handleChange("prefix",e)}/>text<input placeholder="suffix" style={{width: '50px'}} type="text" name="suffix" value={edit.member.proxy_tags ? edit.member.proxy_tags[0].suffix : null} onChange={(e)=>this.handleChange("suffix",e)}/></p>
					<input placeholder="pronouns" type="text" name="pronouns" value={edit.member.pronouns} onChange={(e)=>this.handleChange("pronouns",e)}/>
					<input placeholder="birthday (yyyy-mm-dd)" type="text" pattern="\d{4}-\d{2}-\d{2}" name="birthday" value={edit.member.birthday} onChange={(e)=>this.handleChange("birthday",e)}/>
					<textarea placeholder="description" onChange={(e)=>this.handleChange("description",e)}>{edit.member.description}</textarea>
				
					<div><button className="App-button" type="submit">Save</button> <button className="App-button" type="button" onClick={this.cancelEdit}>Cancel</button></div>
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