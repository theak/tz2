import React, {Component} from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Snackbar from 'material-ui/Snackbar';
import {GridList} from 'material-ui/GridList';
import Geo from './Geo';
import Timezone from './Timezone';
import NewTimezone from './NewTimezone';
import NewTimezoneDialog from './NewTimezoneDialog';
import SettingsDialog from './SettingsDialog';
import Welcome from './Welcome';
import Ticker from './Ticker';
import './App.css';
import injectTapEventPlugin from 'react-tap-event-plugin';

injectTapEventPlugin();

const tzLocalKey = 'timeZones';
const settingsLocalKey = 'settings';
const placeholderImg = 'grey.png';
const initialTimezones = [{
  name: null,
  offset: 0 - new Date().getTimezoneOffset(),
  imgIndex: 0,
  photos: [{imgUrl: placeholderImg}],
  units: 'f'
}];

function getTimeAtOffset(offset) {
  const rawTime = Date.now() / 1000 + offset * 60;
  return rawTime - (rawTime % 60);
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

function hasKeys(obj, keys) {
  return keys.every((key) => key in obj);
}

class App extends Component {
  constructor() {
    super();
    const lastTimezones = localStorage.getItem(tzLocalKey);
    let timeZones = initialTimezones;
    this.returnVisit = false;
    if (lastTimezones) {
      const lastTimezonesArr = JSON.parse(lastTimezones);
      if (lastTimezonesArr.length > 0 
          && hasKeys(lastTimezonesArr[0], Object.keys(initialTimezones[0]))) {
        timeZones = lastTimezonesArr;
        this.returnVisit = true;
      }
    }

    const settings = this.returnVisit && localStorage.getItem(settingsLocalKey)
      && JSON.parse(localStorage.getItem(settingsLocalKey));

    this.state = {
      width: window.innerWidth,
      height: window.innerHeight,
      timeZones: timeZones,
      seconds: Math.floor(new Date().getSeconds()),
      snackbarOpen: false,
      dragState: {active: false},
      welcomeDismissed: this.returnVisit,
      settings: settings ? settings : {units: 'f'}
    };

    this.geo = new Geo();
    this.handleNewCity = this.handleNewCity.bind(this);
    this.handleChangeImage = this.handleChangeImage.bind(this);
    this.handleToggleUnits = this.handleToggleUnits.bind(this);
    this.handleHomeCity = this.handleHomeCity.bind(this);
    this.removeTimezone = this.removeTimezone.bind(this);
    this.updateDimensions = this.updateDimensions.bind(this);
    this.undoRemoveTimezone = this.undoRemoveTimezone.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.startDrag = this.startDrag.bind(this);
    this.endDrag = this.endDrag.bind(this);
  }

  componentDidMount() {
    this.updateTime();

    if (!this.state.timeZones[0].name || !this.state.timeZones[0].photos
        || (this.state.timeZones[0].photos.length === 0)) {
      this.geo.getCity(this.handleHomeCity);
    }

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
    localStorage.setItem(tzLocalKey, JSON.stringify(this.state.timeZones));
    localStorage.setItem(settingsLocalKey, JSON.stringify(this.state.settings));
  }

  handleNewCity(city) {
    const newTz = {
      name: city.text, 
      offset: city.value.utcOffset,
      photos: city.value.photos,
      imgIndex: 0
    };
    this.setState({
      timeZones: this.state.timeZones.concat(newTz)}, () => {
        this.updateTime();
        this.updateLocalStorage();
      });
  }

  askForHomeCity(text=null) {
    const introText = text ? "Edit" : "To get started, enter";
    if (this.state.welcomeDismissed)
      this.refs.homeCityDialog.open(introText + " your home city", text);
    else this.setState({askForHomeCity: true});
  }

  handleHomeCity(city) {
    if (!city) {
      this.askForHomeCity();
      return;
    }
    const timeZones = this.state.timeZones.slice();
    timeZones[0].name = city;
    this.setState({timeZones: timeZones});
    this.geo.getPhotosForCity(city, (photos) => {
      timeZones[0].imgIndex = 0;
      timeZones[0].photos = photos;
      this.setState({timeZones: timeZones});
      this.updateLocalStorage();
    });
  }

  handleChangeImage(tzIndex, imgIndex) {
    const timeZones = this.state.timeZones.slice();
    timeZones[tzIndex].imgIndex = imgIndex;
    this.setState({timeZones: timeZones}, this.updateLocalStorage);
  }

  handleToggleUnits(callback=null) {
    const settings = this.state.settings;
    settings.units = (settings.units === 'f') ? 'c' : 'f';
    this.setState({settings: settings}, () => {
      if (callback) callback();
      this.updateLocalStorage();
    });
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
    const timeZones = this.state.timeZones.map((timeZone, index) => {
      const dragged = (this.state.dragState.active
          && this.state.dragState.startIndex === index);
      return <Timezone key={index} timeZone={timeZone} index={index}
          units={this.state.timeZones.length && this.state.settings.units}
          onToggleUnits={this.handleToggleUnits}
          dragged={dragged} onChangeImage={this.handleChangeImage}
          onEditHomeCity={() => this.askForHomeCity(this.state.timeZones[0].name)}
          onDrag={this.startDrag} onDelete={this.removeTimezone} />;
    });

    const removed = this.state.lastDeleted;
    const snackbar = (
      <Snackbar 
        open={this.state.snackbarOpen} 
        message={removed ? ('Removed ' + getFirstPart(this.state.lastDeleted.name)) 
                         : 'Removal undone'}
        action={removed && 'undo'}
        autoHideDuration={removed ? 5000 : 1000}
        onActionTouchTap={this.undoRemoveTimezone}
        onRequestClose={() => this.setState({snackbarOpen: false})}
      />);

    const rootStyle = {display: 'flex', flexWrap: 'wrap'}
    const gridListStyle = {display: 'flex', flexWrap: 'nowrap', overflowX: 'auto'}

    return (
      <div style={rootStyle}>
        <MuiThemeProvider>
          <Welcome
              onClose={() => this.setState({welcomeDismissed: true}, () => {
                  if (this.state.askForHomeCity) this.askForHomeCity();
                })}
              open={!this.state.welcomeDismissed}/>
        </MuiThemeProvider>
        <MuiThemeProvider>
          <NewTimezoneDialog
            ref='homeCityDialog'
            title='Enter your home city'
            onSelect={(city) => this.handleHomeCity(city.text)} />
        </MuiThemeProvider>
        <MuiThemeProvider>
          <GridList cellHeight={this.state.height} cols={2.2} padding={0}
              style={gridListStyle}
              id='gridList'
              className='condensed'
              onMouseUp={this.endDrag}
              onMouseMove={this.handleMouseMove}>
            {timeZones}
            <NewTimezone
              ref='newTz'
              education={(this.state.timeZones.length < 2) && this.state.welcomeDismissed}
              onAddCity={this.handleNewCity}/>
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
        <MuiThemeProvider>
          <SettingsDialog
            settings={this.state.settings}
            onToggleUnits={() => this.handleToggleUnits()}
          />
        </MuiThemeProvider>
      </div>
    );
  }
}

export default App;
