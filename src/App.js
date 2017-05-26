import React, {Component} from 'react';
import Timestamp from 'react-timestamp';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ActionDelete from 'material-ui/svg-icons/action/delete';
import Snackbar from 'material-ui/Snackbar';
import {GridList, GridTile} from 'material-ui/GridList';
import Geo from './Geo';
import NewTimezone from './NewTimezone.js';
import ImageFetch from './ImageFetch';
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
  return Date.now() / 1000 + offset * 60;
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
      height: window.innerHeight,
      timeZones: timeZones,
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
    window.addEventListener("resize", this.updateDimensions);
    this.updateInterval = setInterval(() => this.forceUpdate(), 5000);
  }

  updateDimensions() {
    this.setState({height: window.innerHeight});
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
    timeZones[index].imgSrc = null;
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
    this.setState({dragState: 
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
    const titleStyle = {marginTop: '-30px', marginBottom: '-30px'};
    const timeZones = this.state.timeZones.map((timeZone, index) => {
      const timeValue = getTimeAtOffset(timeZone.offset);
      const tzImg = <img alt={timeZone.name} src={timeZone.imgSrc} className="leftImg" 
          onError={(e) => this.reloadImage(index)}
          onMouseDown={(e) => {this.startDrag(e.clientX, index); e.preventDefault()}} />;
      const tzDelete = index ? (<ActionDelete 
        color='#DDD' className='delete'
        onTouchTap={() => this.removeTimezone(index)}
        />) : <div/>;
      const time = <h1 className='time'><Timestamp time={timeValue} format='time' utc={false}/></h1>;
      const dragged = this.state.dragState.active && this.state.dragState.startIndex === index;
      const tzTile = (
        <GridTile 
            className={'tz' + (dragged ? ' dragged' : '')}
            key={index} subtitle={<h1 className='city'>{timeZone.name}</h1>} title={time}
            titleBackground='linear-gradient(to bottom, rgba(0,0,0,0) 0%,rgba(0,0,0,0.1) 70%,rgba(0,0,0,0) 100%)'
            titleStyle={titleStyle}>{tzDelete}{tzImg} </GridTile>
        );
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

    return (
      <div>
        <MuiThemeProvider>
          <GridList cellHeight={this.state.height} cols={4} padding={0}
              onMouseUp={this.endDrag}
              onMouseMove={this.handleMouseMove}>
            {timeZones}
            <NewTimezone onAddCity={this.handleNewCity}/>
          </GridList>
        </MuiThemeProvider>
        <MuiThemeProvider>{snackbar}</MuiThemeProvider>
      </div>
    );
  }
}

export default App;
