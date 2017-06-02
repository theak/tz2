import React, {Component} from 'react';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import ExpandLess from 'material-ui/svg-icons/navigation/expand-less';
import {GridTile} from 'material-ui/GridList';
import NewTimezoneDialog from './NewTimezoneDialog';
import './NewTimezone.css';

export default class NewTimezone extends Component {
  constructor(props) {
    super(props);
    this.state = {education: props.education};
    this.handleTap = this.handleTap.bind(this);
    this.onSelect = this.onSelect.bind(this);
  }

  handleTap() {
    this.refs.newTimezoneDialog.open();
  }

  onSelect(value) {
    this.props.onAddCity(value);
    this.setState({education: false});
  }

  displayStyle(isVisible) {
    return {display: isVisible ? 'block' : 'none'}
  }

  render() {
    let content = (<div>
        <div className='fabWrapper'>
        <NewTimezoneDialog 
            ref='newTimezoneDialog'
            title='Add new timezone'
            onSelect={this.onSelect} />
          <FloatingActionButton 
              className={'add' + (this.state.education ? ' education' : '')}
              onTouchTap={this.handleTap}
              backgroundColor='#1565c0'>
            <ContentAdd />
          </FloatingActionButton>
          <p className='instructions' style={this.displayStyle(!this.state.education)}><b>ADD LOCATION</b></p>
          <div className='instructions' style={this.displayStyle(this.state.education)}>
            <ExpandLess className='arrow'/>
            <br/>Add a new city to your world clock
          </div>
        </div>
      </div>);
    return (
      <GridTile key='new'>{content}</GridTile>
    );
  }
}