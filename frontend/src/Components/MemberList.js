import React, { Component, Fragment } from 'react';
import MemberCard from './MemberCard';

class MemberList extends Component {
	constructor(props) {
		super(props);
		this.state = {members: this.props.members};
	}

	render() {
		return (
			<Fragment>
			<h1 style={{textAlign: 'center'}}>Members</h1>
			<section className="App-memberList">
	            {
            	this.state.members.map((m,i) => {
            		return (
            			<MemberCard key={i} member={m} />
            		)
            	})
	            }
	        </section>
	        </Fragment>
		)
	}
}

export default MemberList;