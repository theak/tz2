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
  }

  handleTap() {
    this.setState({active: true});
  }

  onSelect(value) {
    this.props.onAddCity(value);
    this.setState({active: false});
  }

  render() {
    let content = null;
    if (!this.state.active) {
      content = (
        <div>
          <FloatingActionButton className="add" onTouchTap={this.handleTap}>
            <ContentAdd />
          </FloatingActionButton>
          <p><b>ADD LOCATION</b></p>
        </div>
      );
      if (this.focusTimeout) clearTimeout(this.focusTimeout);
    } else {
      content = (
        <div>
          <CityAutoComplete ref="cityName" onSelect={this.onSelect}/>
        </div>
      );
      this.focusTimeout = setTimeout(() => { this.refs.cityName.focus() }, 50);
    }

    return (
      <GridTile key="new" style={{width: '280px'}}>
        <div className="fabWrapper">{content}</div>
      </GridTile>
    );
  }
}