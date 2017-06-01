import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import CityAutoComplete from './CityAutoComplete';

export default class NewTimezoneDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {open: false};

    this.onSelect = this.onSelect.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.open = this.open.bind(this);
  }

  open() {
  	this.setState({open: true}, 
  		() => this.refs.cityAutoComplete.focus());
  }

  handleClose() {
    this.setState({open: false});
  }

  onSelect(value) {
  	this.props.onSelect(value);
    this.setState({open: false});
  }

  render() {
    const actions = [
      <FlatButton
        label="Add"
        primary={false}
        style={{marginBottom: 10}}
        onTouchTap={this.handleClose}
      />
    ];

    return (
      <div>
        <Dialog
          title={this.props.title}
          actions={actions}
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose}
          bodyStyle={{fontSize: '18px'}}
          titleStyle={{fontSize: '28px'}}
          contentStyle={{maxWidth: '512px'}}
        >
          <CityAutoComplete ref='cityAutoComplete' onSelect={this.onSelect} />
        </Dialog>
      </div>
    );
  }
}