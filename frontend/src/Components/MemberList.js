import React, { Component, Fragment } from 'react';
import MemberCard from './MemberCard';

class MemberList extends Component {
	constructor(props) {
		super(props);
		this.state = {members: this.props.members, editable: this.props.editable, token: this.props.token};
	}

	render() {
		return (
			<Fragment>
			<section className="App-memberList">
	            {
            	this.state.members.map((m,i) => {
            		return (
            			<MemberCard key={i} member={m} editable={this.state.editable} token={this.state.token}/>
            		)
            	})
	            }
	        </section>
	        </Fragment>
		)
	}
}

export default MemberList;