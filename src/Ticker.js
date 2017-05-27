import React, {Component} from 'react';
import LinearProgress from 'material-ui/LinearProgress';
import './Ticker.css'

export default class Ticker extends Component {
  render() {
    const seconds = this.props.seconds;
    let ticks = [];
    [...Array(60)].map((e, i) => {
      return ticks.push(
        <span 
            className={'tick' + ((i <= seconds) ? ' show' : '')}
            key={i}>|</span>);
    });
    //return <div className='ticker'>[{ticks}]</div>
    return (<LinearProgress
        className='ticker'
        color='#880e4f'
        mode='determinate' 
        value={seconds / 60 * 100} />)
  }
}