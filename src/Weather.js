import React, {Component} from 'react';
import './Weather.css'

export default class Weather extends Component {
  constructor(props) {
    super(props);
    this.state = {weather: null};

    this.updateWeather = this.updateWeather.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.units !== nextProps.units) {
      this.updateWeather(nextProps);
    }
  }

  updateWeather(props=this.props) {
    if (window && window.jQuery && window.jQuery.simpleWeather) {
      const simpleWeather = window.jQuery.simpleWeather;
      simpleWeather({
        location: props.location,
        woeid: '',
        unit: props.units,
        success: (weather) => {
          this.setState({weather: weather, renderedUnits: props.units});
        }
      });
    }
  }
  render() {
    const weather = this.state.weather;
    if (!weather) {
      if (this.props.location) this.updateWeather();
      return <div/>;
    }
    return (
      <div className='weather'>
        <div className='iconWrapper'><i className={'icon-' + weather.code}></i></div>
        <div className='weatherText'
            onMouseDown={(e) => e.stopPropagation() }
            onTouchTap={() => {
              this.props.onToggleUnits(this.updateWeather);
            }}>
          {weather.temp}&deg;{weather.units.temp}
        </div>
      </div>
    );
  }
}