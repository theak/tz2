import React, {Component} from 'react';
import Timestamp from 'react-timestamp';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {GridList, GridTile} from 'material-ui/GridList';
import Geo from './Geo';
import NewTimezone from './NewTimezone.js';
import getImage from './getImage';
import './App.css';

import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

function getTimeAtOffset(offset) {
  return Date.now() / 1000 + offset * 60;
}

class App extends Component {
  constructor() {
    super();
    this.getTimeAtOffset = getTimeAtOffset;
    this.state = {
      height: window.innerHeight,
      timeZones: [{
        name: "San Francisco, CA, US",
        offset: 0 - new Date().getTimezoneOffset(),
        imgSrc: null
      }]
    };
    const geo = new Geo();
    geo.getCity((city) => {
      const timeZones = this.state.timeZones.slice();
      timeZones[0].name = city;
      this.setState({timeZones: timeZones}, () => {this.populateImages()});
    });
    this.handleNewCity = this.handleNewCity.bind(this);
  }

  populateImages() {
    var timeZones = this.state.timeZones.slice();
    for (var timeZone of timeZones) {
      if (!timeZone.imgSrc) 
        getImage(timeZone.name.split(',')[0]).then((response) => {
          const hits = response.data.hits;
          timeZone.imgSrc = hits.length && hits[0].webformatURL.replace('_640', '_960');
          this.setState({timeZones: timeZones});
          console.log(timeZones);
        });
    }
  }

  handleNewCity(city) {
    //TODO: if city already exists, do nothing
    //Handle adding the city
    const newTz = {name: city.text, offset: city.value.utcOffset, imgSrc: null};
    this.setState({timeZones: this.state.timeZones.concat(newTz)}, this.populateImages);
  }

  render() {
    const titleStyle = {marginTop: '-30px', marginBottom: '-30px'};
    const timeZones = this.state.timeZones.map((timeZone, index) => {
      const timeValue = getTimeAtOffset(timeZone.offset);
      const tzImg = <img src={timeZone.imgSrc} className="leftImg" />;
      const time = <h1><Timestamp time={timeValue} format='time' utc={false}/></h1>;
      const tzTile = (
        <GridTile 
            key={index} 
            subtitle={<h3>{timeZone.name}</h3>} 
            title={time}
            titleBackground="linear-gradient(to top, rgba(0,0,0,0.7) 0%,rgba(0,0,0,0.3) 70%,rgba(0,0,0,0) 100%)"
            titleStyle={titleStyle}>{tzImg}</GridTile>
        );
      return tzTile;
    });
    return (
      <div><MuiThemeProvider>
        <GridList cellHeight={this.state.height} cols={3.6}>
          {timeZones}
          <NewTimezone onAddCity={this.handleNewCity}/>
        </GridList>
      </MuiThemeProvider></div>
    );
  }
}

export default App;
