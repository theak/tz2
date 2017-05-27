import React, {Component} from 'react';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import {GridTile} from 'material-ui/GridList';
import CityAutoComplete from './CityAutoComplete';
import './NewTimezone.css';

export default class NewTimezone extends Component {
  constructor() {
    super();
    this.state = {active: false};
    this.handleTap = this.handleTap.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.onBlur = this.onBlur.bind(this);
  }

  handleTap() {
    this.setState({active: true});
  }

  onSelect(value) {
    this.props.onAddCity(value);
    this.setState({active: false});
  }

  onBlur() {
    this.setState({active: false});
  }

  displayStyle(isVisible) {
    return {display: isVisible ? 'block' : 'none'}
  }

  render() {
    let content = (<div>
        <div className='fabWrapper' style={this.displayStyle(!this.state.active)}>
          <FloatingActionButton 
              className='add' onTouchTap={this.handleTap}
              backgroundColor='#1565c0'>
            <ContentAdd />
          </FloatingActionButton>
          <p><b>ADD LOCATION</b></p>
        </div>
        <div style={this.displayStyle(this.state.active)} className='inputWrapper'>
          <CityAutoComplete ref='cityName' onSelect={this.onSelect}
              onBlur={this.onBlur} />
        </div>
      </div>);
    if (!this.state.active) {
      if (this.focusTimeout) clearTimeout(this.focusTimeout);
    } else {
      this.focusTimeout = setTimeout(() => { this.refs.cityName.focus() }, 50);
    }

    return (
      <GridTile key='new'>{content}</GridTile>
    );
  }
}