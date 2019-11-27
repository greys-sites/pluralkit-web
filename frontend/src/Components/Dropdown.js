import React, { Component, Fragment as Frag } from 'react';

class Dropdown extends Component {
	constructor(props) {
		super(props);
		var def = this.props.def ?
				this.props.list.find(i => i.name == this.props.def) :
				this.props.list[0];
		this.state = {
			visible: false,
			list: this.props.list,
			def: def,
			selected: def,
			callback: this.props.callback
		};
	}

	componentDidMount() {
		window.addEventListener('click', this.hide)
	}

	componentWillUnmount() {
		window.removeEventListener('click', this.hide)
	}

	hide = () => {
		if(this.state.visible) this.setState({visible: false})
	}

	toggleVisibility = (e) => {
		e.stopPropagation();
		e.preventDefault();
		this.setState({visible: !this.state.visible});
	}

	selectItem = (e) => {
		e.preventDefault();
		var item = e.target.innerHTML ? this.state.list.find(i => i.name == e.target.innerHTML) : this.state.def;
		this.setState({selected: item, visible: false});
		if(this.state.callback) this.state.callback(item);
	}

	render() {
		return (
			<div className="App-dropdown" style={this.props.style}>
				<div className="App-dropTitle" onClick={this.toggleVisibility}>{this.state.selected.name}</div>
				{this.state.visible && (
					<ul onClick={(e)=> e.stopPropagation()}>
					{this.state.list.map((v,i)=> {
						return <li className="App-dropitem" key={i} onClick={this.selectItem}>{v.name}</li>
					})}
					</ul>
				)}
			</div>
		);
	}
}

export default Dropdown;