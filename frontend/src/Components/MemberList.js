import React, { Component, Fragment as Frag } from 'react';
import axios from 'axios';
import MemberCard from './MemberCard';
import Dropdown from './Dropdown';

class MemberList extends Component {
	constructor(props) {
		super(props);
		this.state = {
			members: this.props.members,
			editable: this.props.editable,
			token: this.props.token,
			editClass: '',
			query: null,
			showHidden: true,
			new: null,
			sortmethods: [
				{
					name: "Alphabetical",
					func: (members)=> {
						return members.sort((a,b) => {
							a = (a.display_name || a.name).toLowerCase();
   							b = (b.display_name || b.name).toLowerCase();
							return a > b ? 1 : a < b ? -1 : 0
						});
					}
				},
				{
					name: "Reverse Alphabetical",
					func: (members)=> {
						return members.sort((a,b) => {
							a = (a.display_name || a.name).toLowerCase();
   							b = (b.display_name || b.name).toLowerCase();
							return a > b ? 1 : a < b ? -1 : 0
						}).reverse();
					}
				},
				{
					name: "Alphabetical by ID",
					func: (members)=> {
						return members.sort((a,b) => a.id > b.id ? 1 : a.id < b.id ? -1 : 0);
					}
				},
				{
					name: "Reverse Alphabetical by ID",
					func: (members)=> {
						return members.sort((a,b) => a.id > b.id ? 1 : a.id < b.id ? -1 : 0).reverse();
					}
				},
				{
					name: "Oldest to Newest",
					func: (members)=> {
						return members.sort((a,b) => {
							a = new Date(a.created);
							b = new Date(b.created);
							return a > b ? 1 : a < b ? -1 : 0;
						});
					}
				},
				{
					name: "Newest to Oldest",
					func: (members)=> {
						return members.sort((a,b) => {
							a = new Date(a.created);
							b = new Date(b.created);
							return a > b ? 1 : a < b ? -1 : 0;
						}).reverse();
					}
				}
			],
			sortmethod: {
				name: "Alphabetical",
				func: (members)=> {
					return members.sort((a,b) => {
						a = (a.display_name || a.name).toLowerCase();
   						b = (b.display_name || b.name).toLowerCase();
						return a > b ? 1 : a < b ? -1 : 0
					});
				}
			}
		};
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

	onCreate = async (member) => {
		this.setState((state)=> {
			state.members.push(member);
			state.members = this.state.sortmethod.func(state.members);
			state.new = member.id;
			return state;
		});
	}

	deleteMember = async (id) => {
		var res = await axios('/pkapi/m/'+id, {
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
		});
	}

	toggleHidden = () => {
		this.setState({showHidden: !this.state.showHidden});
	}

	render() {
		var query = this.state.query;
		var hide = this.state.showHidden;
		return (
			<Frag>
			<div className="App-memberMethods">
			<input className="App-searchbar" type="text" name="search" placeholder="search" value={query ? query : null} onChange={this.searchMembers} />
			<Dropdown style={{width: '50%'}} list={this.state.sortmethods} callback={this.sortMembers}/>
			{this.state.editable && <button className="App-button" onClick={this.toggleHidden}>{hide ? "Hide" : "Show"} hidden members</button>}
			</div>
			<section className="App-memberList">
				{(this.props.editable && !query) &&
					<MemberCard member={{id: "new"}} editable={this.state.editable} token={this.state.token} onEdit={this.onEdit} onCreate={this.onCreate} />
				}
	            {
	            	this.state.members.map((m) => {
	            		var qmatch = !query || 
	            					 (m.name.toLowerCase().includes(query.toLowerCase()) || 
	            					  m.displayname && m.displayname.toLowerCase().includes(query.toLowerCase()));
	            		var hmatch = hide || m.visibility == "public";

	            		if(qmatch && hmatch) return (
	            			<MemberCard
	            				key={m.id}
	            				isNew={(this.state.new == m.id)}
	            				member={m}
	            				editable={this.state.editable}
	            				token={this.state.token}
	            				deleteMember={this.deleteMember}
	            				onEdit={this.onEdit}
	            			/>
	            		)
	            		else return null;
            	})
	            }
	        </section>
	        </Frag>
		)
	}
}

export default MemberList;