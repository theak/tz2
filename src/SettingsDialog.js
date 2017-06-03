import React from 'react';
import Dialog from 'material-ui/Dialog';
import Checkbox from 'material-ui/Checkbox';
import Settings from 'material-ui/svg-icons/action/settings';
import './SettingsDialog.css';

const styles = {
  settingsStyle: {position: 'absolute', right: 20, bottom: 20,
    cursor: 'pointer', opacity: 0.5, width: 32, height: 32,
    transition: 'all ease 0.3s'},
  titleStyle: {fontFamily: 'Lato, sans-serif', fontSize: 24, paddingBottom: 24}
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
          <br/>
        </Dialog>
      </div>
    );
  }
}