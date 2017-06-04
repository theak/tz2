import React from 'react';
import Avatar from 'material-ui/Avatar';
import Dialog from 'material-ui/Dialog';
import Checkbox from 'material-ui/Checkbox';
import Settings from 'material-ui/svg-icons/action/settings';
import './SettingsDialog.css';

const styles = {
  settingsStyle: {position: 'absolute', right: 26, top: 20,
    cursor: 'pointer', backgroundColor: 'rgba(60, 60, 60, 0.85)', width: 40, height: 40,
    transition: 'all ease 0.3s'},
  titleStyle: {fontFamily: 'Lato, sans-serif', fontSize: 24, paddingBottom: 24},
  checkbox: {paddingBottom: 18}
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
        <Avatar
          className='gear'
          icon={<Settings/>}
          style={styles.settingsStyle}
          onTouchTap={this.handleOpen}
          />
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
          <Checkbox
            label="Use 24 hour time"
            style={styles.checkbox}
            checked={this.props.settings.military}
            onCheck={this.props.onToggleMilitary}
          />
          <Checkbox
            label="Use Celsius"
            style={styles.checkbox}
            checked={this.props.settings.units === 'c'}
            onCheck={this.props.onToggleUnits}
          />
          <Checkbox
            label="Show UTC Time"
            style={styles.checkbox}
            checked={this.props.hasUtcTime}
            onCheck={(_, checked) => {
              if (checked) this.props.onAddUtcTime();
              else this.props.onRemoveUtcTime();
            }}
          />
        </Dialog>
      </div>
    );
  }
}