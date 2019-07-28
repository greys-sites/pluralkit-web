import React, { Component, Fragment } from 'react';

class Loading extends Component {
	constructor() {
		super();
	}

	render() {
		return (
			<div className="App-load">
				<div className="App-ball">
				</div>
				<div style={{animationDelay: '.5s'}} className="App-ball">
				</div>
				<div style={{animationDelay: '1s'}} className="App-ball">
				</div>
				<div style={{animationDelay: '1.5s'}} className="App-ball">
				</div>
			</div>
		)
	}
}

export default Loading;