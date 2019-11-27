import React, { Component, Fragment as Frag } from 'react';

class Dropdown extends Component {
	constructor(props) {
		super(props);
		var def = this.props.def ?
				this.props.list[this.props.def] :
				this.props.list[0];
		this.state = {
			visible: false,
			list: this.props.list,
			def: def,
			selected: def,
			index: this.props.def || 0,
			callback: this.props.callback,
			type: this.props.type || 0
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

	selectItem = async (e) => {
		e.preventDefault();
		if(this.state.type == 1) return;
		var lastindex = this.state.index;
		var target = e.target;
		var index = [...target.parentNode.children].indexOf(target);
		if(lastindex == index) return this.setState({visible: false});
		var item = target.innerHTML ? this.state.list.find(i => i.name == target.innerHTML) : this.state.def;
		if(this.state.callback) {
			var data = await this.state.callback(item, index, lastindex);
			this.setState(data ? {...data, visible: false} : {selected: item, visible: false, index: index});
		} else {
			this.setState({selected: item, visible: false, index: index});
		}
		
	}

	render() {
		return (
			<div className="App-dropdown" style={this.props.style}>
				<div className="App-dropTitle" onClick={this.toggleVisibility}>{this.state.selected.name}</div>
				{this.state.visible && (
					<ul onClick={(e)=> e.stopPropagation()}>
					{this.state.list.map((v,i)=> {
						if(!(this.state.type == 1 && i == 0))
							return <li className="App-dropitem" key={v+i} onClick={this.selectItem}>{v.name}</li>
					})}
					</ul>
				)}
			</div>
		);
	}
}

export default Dropdown;