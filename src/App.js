import React, {Component} from 'react';
import Timestamp from 'react-timestamp';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import ActionDelete from 'material-ui/svg-icons/action/delete';
import Snackbar from 'material-ui/Snackbar';
import {GridList, GridTile} from 'material-ui/GridList';
import Geo from './Geo';
import NewTimezone from './NewTimezone';
import ImageFetch from './ImageFetch';
import Ticker from './Ticker';
import './App.css';
import injectTapEventPlugin from 'react-tap-event-plugin';

injectTapEventPlugin();

const localKey = 'timeZones';
const initialTimezones = [{
  name: '',
  offset: 0 - new Date().getTimezoneOffset(),
  imgSrc: null
}];

function getTimeAtOffset(offset) {
  const rawTime = Date.now() / 1000 + offset * 60;
  return rawTime - (rawTime % 60);
}

function displayOffset(tzOffset) {
  return ((tzOffset > 0) ? '+' : '') + (tzOffset / 60);
}

function getFirstPart(str) {
  return str.split(',')[0];
}

function move(arr, old_index, new_index) {
  const out = arr.slice();
  const tmp = out[new_index];
  out[new_index] = out[old_index];
  out[old_index] = tmp;
  return out;
};

class App extends Component {
  constructor() {
    super();
    const lastTimezones = localStorage.getItem(localKey);
    let timeZones = initialTimezones;
    if (lastTimezones) {
      const lastTimezonesArr = JSON.parse(lastTimezones);
      if (lastTimezonesArr.length > 0) timeZones = lastTimezonesArr;
    }

    this.state = {
      width: window.innerWidth,
      height: window.innerHeight,
      timeZones: timeZones,
      seconds: Math.floor(new Date().getSeconds()),
      snackbarOpen: false,
      dragState: {active: false}
    };
    this.imageFetch = new ImageFetch();

    const geo = new Geo();
    geo.getCity((city) => {
      const timeZones = this.state.timeZones.slice();
      timeZones[0].name = city;
      this.setState({timeZones: timeZones}, () => {this.populateImages()});
    });

    this.handleNewCity = this.handleNewCity.bind(this);
    this.updateDimensions = this.updateDimensions.bind(this);
    this.undoRemoveTimezone = this.undoRemoveTimezone.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.endDrag = this.endDrag.bind(this);
  }

  componentDidMount() {
    window.addEventListener('resize', this.updateDimensions);
    this.updateInterval = setInterval(() => this.updateTime(), 1000);
    if (window.jQuery) window.jQuery('#gridList').mousewheel((event, delta) => {
      window.jQuery('#gridList')[0].scrollLeft -= (delta * 30);
      event.preventDefault();
    });
  }

  updateTime() {
    const timeZones = this.state.timeZones.slice();
    for (var timeZone of timeZones)
      timeZone.timestamp = getTimeAtOffset(timeZone.offset);
    const seconds = new Date().getSeconds();
    this.setState({timeZones: timeZones, seconds: seconds});
  }

  updateDimensions() {
    this.setState({height: window.innerHeight, width: window.innerWidth});
  }

  updateLocalStorage() {
    localStorage.setItem(localKey, JSON.stringify(this.state.timeZones));
  }

  populateImages() {
    const timeZones = this.state.timeZones.slice();
    for (var timeZone of timeZones) {
      if (!timeZone.imgSrc) ((timeZone) => {
        this.imageFetch.getImageUrl(getFirstPart(timeZone.name), (imgUrl) => {
          timeZone.imgSrc = imgUrl;
          this.setState({timeZones: timeZones}, this.updateLocalStorage);
        });
      })(timeZone);
    }
  }

  reloadImage(index) {
    const timeZones = this.state.timeZones.slice();
    if (timeZones[index].reloaded) return;
    timeZones[index].imgSrc = null;
    timeZones[index].reloaded = true;
    this.setState({timeZones: timeZones}, this.populateImages);
  }

  handleNewCity(city) {
    const newTz = {
      name: city.text, offset: city.value.utcOffset, imgSrc: null
    };
    this.setState({
      timeZones: this.state.timeZones.concat(newTz)}, this.populateImages);
  }

  startDrag(clientX, clientIndex) {
    if (clientIndex) this.setState({dragState: 
        {active: true, startX: clientX, startIndex: clientIndex}});
  }
  endDrag() {
    this.setState({dragState: {active: false}});
  }

  handleMouseMove(event) {
    if (!this.state.dragState.active) return;
    const clientX = event.clientX;
    const delta = clientX - this.state.dragState.startX;
    const roundFunc = (delta > 0) ? Math.floor : Math.ceil;
    const tzs = document.getElementsByClassName('tz');
    if (!tzs || !tzs.length) return;
    const tzWidth = tzs[0].offsetWidth;
    const posChange = roundFunc(delta / tzWidth);
    const newPos = this.state.dragState.startIndex + posChange;
    if (posChange !== 0 && newPos > 0 && newPos < this.state.timeZones.length) {
      const timeZones = move(this.state.timeZones, this.state.dragState.startIndex, newPos);
      this.setState({timeZones: timeZones}, this.updateLocalStorage);
      this.startDrag(clientX, newPos);
    }
  }

  removeTimezone(index) {
    const timeZones = this.state.timeZones.slice();
    timeZones[index].index = index;
    this.setState({
      timeZones: timeZones.filter((_, i) => i !== index),
      lastDeleted: timeZones[index],
      snackbarOpen: true
    }, this.updateLocalStorage);
  }

  undoRemoveTimezone() {
    const index = this.state.lastDeleted.index;
    this.setState({
      timeZones: this.state.timeZones.slice(0, index).concat(this.state.lastDeleted)
          .concat(this.state.timeZones.slice(index)),
      lastDeleted: null
    }, this.updateLocalStorage);
  }

  render() {
    if (this.state.seconds === 0) setTimeout(() => this.setState({seconds: 1}), 500);
    const titleStyle = {marginTop: '-30px', marginBottom: '-30px'};
    const timeZones = this.state.timeZones.map((timeZone, index) => {
      const tzImg = <img alt={timeZone.name} src={timeZone.imgSrc} className="leftImg" 
          onError={(e) => this.reloadImage(index)} />;
      const tzDelete = index ? (<ActionDelete 
        color='#DDD' className='delete'
        onTouchTap={() => this.removeTimezone(index)}
        />) : <div/>;
      const header = <div className={'header col' + (index % 4)}/>;
      const time = <h1 className='time'><Timestamp time={timeZone.timestamp} format='time' utc={false}/></h1>;
      const dragged = this.state.dragState.active && this.state.dragState.startIndex === index;
      const offset = <h3 className='offset'>GMT {displayOffset(timeZone.offset)}</h3>
      const tzTile = (
        <GridTile
            onMouseDown={(e) => {this.startDrag(e.clientX, index); e.preventDefault()}}
            className={'tz' + (dragged ? ' dragged' : '') + ((this.state.seconds === 0) ? ' pulsed' : '')}
            key={index} title={time}
            onTouchTap={() => this.refs.newTz.setState({active: false})}
            subtitle={<div className='subtitle'>
              <h1 className='city'>{timeZone.name}</h1>{offset}</div>}
            titleBackground='rgba(0, 0, 0, 0)'
            titleStyle={titleStyle}>
          {header}{tzDelete}{tzImg}
        </GridTile>);
      return tzTile;
    });

    const removed = this.state.lastDeleted;
    const snackbar = (
      <Snackbar 
        open={this.state.snackbarOpen} 
        message={removed ? ('Removed ' + getFirstPart(this.state.lastDeleted.name)) : 'Removal undone'}
        action={removed && 'undo'}
        autoHideDuration={removed ? 5000 : 1000}
        onActionTouchTap={this.undoRemoveTimezone}
        onRequestClose={() => this.setState({snackbarOpen: false})}
      />);
    const root = {
      display: 'flex',
      flexWrap: 'wrap'
    }
    const gridList = {
      display: 'flex',
      flexWrap: 'nowrap',
      overflowX: 'auto',
    }

    return (
      <div style={root}>
        <MuiThemeProvider>
          <GridList cellHeight={this.state.height} cols={2.2} padding={0}
              style={gridList}
              id='gridList'
              className='condensed'
              onMouseUp={this.endDrag}
              onMouseMove={this.handleMouseMove}>
            {timeZones}
            <NewTimezone ref='newTz' onAddCity={this.handleNewCity}/>
          </GridList>
        </MuiThemeProvider>
        <MuiThemeProvider>{snackbar}</MuiThemeProvider>
        <MuiThemeProvider>
          <Ticker
              seconds={this.state.seconds}
              width={window.jQuery && window.jQuery('.tz') 
                  && (window.jQuery('.tz').width() * this.state.timeZones.length)}
          />
        </MuiThemeProvider>
      </div>
    );
  }
}

export default App;
