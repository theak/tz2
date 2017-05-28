import React, {Component} from 'react';
import LinearProgress from 'material-ui/LinearProgress';
import './Ticker.css'

export default class Ticker extends Component {
  render() {
    const seconds = this.props.seconds;
    const widthProp = this.props.width;
    const width = widthProp ? widthProp : '100%';
    return (<LinearProgress
        className={'ticker' + (widthProp ? ' visible':'')}
        color='#322'
        style={{width: width}}
        mode='determinate' 
        value={seconds / 60 * 100} />)
  }
}