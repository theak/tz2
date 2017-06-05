import React, {Component} from 'react';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import NewTimezoneDialog from './NewTimezoneDialog';
import './NewTimezone.css';

export default class NewTimezone extends Component {
  constructor(props) {
    super(props);
    this.state = {education: props.education, hover: false, educationTimeout: false};

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

  handleHover(mouseEntering) {
    this.setState({hover: mouseEntering});
  }

  componentDidMount() {
    //setTimeout(() => this.setState({educationTimeout: true}), 3000);
  }

  displayStyle(isVisible) {
    return {display: isVisible ? 'block' : 'none'}
  }

  render() {
    const showText = (this.state.education && !this.state.educationTimeout) || this.state.hover;
    return (<div className='fabWrapper'>
      <NewTimezoneDialog 
          ref='newTimezoneDialog'
          title='Add new timezone'
          onSelect={this.onSelect} />
        <div className={'instructions' + (this.state.education ? ' education' : '')}>
          <b className={'buttonText' + (showText ? ' show' : '')}>{this.state.education ? 'Add a timezone »': 'Add timezone'}</b>
          <FloatingActionButton 
              className={'add'}
              onTouchTap={this.handleTap}
              onMouseEnter={() => this.handleHover(true)}
              onMouseLeave={() => this.handleHover(false)}
              backgroundColor='#b71c1c'>
            <ContentAdd />
          </FloatingActionButton>
        </div>
      </div>);
  }
}