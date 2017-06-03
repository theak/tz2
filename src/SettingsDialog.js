import React from 'react';
import Dialog from 'material-ui/Dialog';
//import FlatButton from 'material-ui/FlatButton';
import Checkbox from 'material-ui/Checkbox';
import Settings from 'material-ui/svg-icons/action/settings';
import './SettingsDialog.css';

const styles = {
  settingsStyle: {position: 'absolute', right: 10, bottom: 10,
    cursor: 'pointer', opacity: 0.5, width: 32, height: 32,
    transition: 'all ease 0.3s'},
  titleStyle: {fontFamily: 'Lato, sans-serif', fontSize: '24px'}
};

export default class SettingsDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {open: false};

    this.handleClose = this.handleClose.bind(this);
    this.handleOpen = this.handleOpen.bind(this);
  }

  handleOpen() {
    this.setState({open: true});
  };

  handleClose() {
    this.setState({open: false});
  };

  render() {
    const actions = [];

    return (
      <div>
        <Settings
          className='gear'
          style={styles.settingsStyle}
          onTouchTap={this.handleOpen}/>
        <Dialog
          className='welcome'
          title="Settings"
          actions={actions}
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose}
          titleStyle={styles.titleStyle}
          contentStyle={{maxWidth: '512px'}}
        >
          <br/>
          <Checkbox
            label="Use Celsius"
            style={styles.checkbox}
            checked={this.props.settings.units === 'c'}
            onCheck={this.props.onToggleUnits}
          />
          <br/>
        </Dialog>
      </div>
    );
  }
}