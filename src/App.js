import React, {Component} from 'react';
import Timestamp from 'react-timestamp';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentDeleteSweep from 'material-ui/svg-icons/content/delete-sweep';
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

class App extends Component {
  constructor() {
    super();
    const lastTimezones = localStorage.getItem(localKey);

    this.state = {
      height: window.innerHeight,
      timeZones: lastTimezones ? JSON.parse(lastTimezones) : initialTimezones,
      snackbarOpen: false
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
  }

  componentDidMount() {
    window.addEventListener("resize", this.updateDimensions);
    this.updateInterval = setInterval(() => this.forceUpdate(), 5000);
  }

  updateDimensions() {
    this.setState({height: window.innerHeight});
  }

  componentDidUpdate(prevProps, prevState) {
    localStorage.setItem(localKey, JSON.stringify(this.state.timeZones));
  }

  populateImages() {
    var timeZones = this.state.timeZones.slice();
    for (var timeZone of timeZones) {
      if (!timeZone.imgSrc) 
        this.imageFetch.getImageUrl(getFirstPart(timeZone.name), (imgUrl) => {
          timeZone.imgSrc = imgUrl;
          this.setState({timeZones: timeZones});
        });
    }
  }

  handleNewCity(city) {
    const newTz = {
      name: city.text, offset: city.value.utcOffset, imgSrc: null
    };
    this.setState({
      timeZones: this.state.timeZones.concat(newTz)}, this.populateImages);
  }

  removeTimezone(index) {
    this.state.timeZones[index].index = index;
    this.setState({
      timeZones: this.state.timeZones.filter((_, i) => i !== index),
      lastDeleted: this.state.timeZones[index],
      snackbarOpen: true
    });
  }
  
  undoRemoveTimezone() {
    const index = this.state.lastDeleted.index;
    this.setState({
      timeZones: this.state.timeZones.slice(0, index).concat(this.state.lastDeleted)
          .concat(this.state.timeZones.slice(index)),
      lastDeleted: null
    });
  }

  render() {
    const titleStyle = {marginTop: '-30px', marginBottom: '-30px'};
    const timeZones = this.state.timeZones.map((timeZone, index) => {
      const timeValue = getTimeAtOffset(timeZone.offset);
      const tzImg = <img alt={timeZone.name} src={timeZone.imgSrc} className="leftImg" />;
      const tzDelete = index ? (
        <FloatingActionButton className="delete" mini={true} secondary={true} 
            onTouchTap={() => this.removeTimezone(index)}>
          <ContentDeleteSweep />
        </FloatingActionButton>
      ) : <div/>;
      const time = <h1><Timestamp time={timeValue} format='time' utc={false}/></h1>;
      const tzTile = (
        <GridTile 
            key={index} 
            subtitle={<h3>{timeZone.name}</h3>} 
            title={time}
            titleBackground='linear-gradient(to top, rgba(0,0,0,0.7) 0%,rgba(0,0,0,0.3) 70%,rgba(0,0,0,0) 100%)'
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
        style={{position: 'absolute'}}
        onRequestClose={() => this.setState({snackbarOpen: false})}
      />);

    return (
      <div>
        <MuiThemeProvider>
          <GridList cellHeight={this.state.height} cols={3.6}>
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
