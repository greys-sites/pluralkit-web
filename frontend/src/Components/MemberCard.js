import React, { Component, Fragment as Frag } from 'react';

class MemberCard extends Component {
	constructor(props) {
		super(props);

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
		this.setState({edit: {enabled: true, member: member}});
	}

	handleChange = (name, e) => {
		console.log(this.state.edit);
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
				state.edit= {enabled: false};
				return state;
			})
		} else {
			this.setState({submitted: false});
		}
	}

	render() {
		var memb = this.state.member
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
					<p><input type="text" name="pronouns" value={edit.member.pronouns} onChange={(e)=>this.handleChange("pronouns",e)}/><br/><input type="text" pattern="\d{4}-\d{2}-\d{2}" name="birthday" value={edit.member.birthday} onChange={(e)=>this.handleChange("birthday",e)}/> </p>
					<textarea onChange={(e)=>this.handleChange("description",e)}>{edit.member.description}</textarea>
				
					<button className="App-button" type="submit">Save</button>
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
					<p style={{overflowY: 'auto', height: '80px'}}>{memb.description || "(no description)"}</p>
				</div>
				);
			}
		} else {
			return null;
		}
	}
}

export default MemberCard;