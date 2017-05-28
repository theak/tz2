import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

export default class Welcome extends React.Component {
  constructor(props) {
    super(props);
    this.state = {open: props.open};
  }

  handleClose = () => {
    this.setState({open: false});
    this.props.onClose();
  };

  render() {
    const actions = [
      <FlatButton
        label="Got it"
        primary={true}
        onTouchTap={this.handleClose}
      />
    ];

    return (
      <div>
        <Dialog
          className='welcome'
          title="Welcome!"
          actions={actions}
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose}
          bodyStyle={{fontSize: '18px'}}
          titleStyle={{fontSize: '32px'}}
          contentStyle={{maxWidth: '512px'}}
        >
          Use the + button to add cities to your world clock:<br/>
          <div><img onTouchTap={this.handleClose} className='screenshot' src='/screenshot.png' width='343'/></div>
          Your cities are saved locally and will appear whenever you visit iwantmytime.com on this computer.
        </Dialog>
      </div>
    );
  }
}