import React, {Component} from 'react';
import AutoComplete from 'material-ui/AutoComplete';
import Geo from './Geo';

export default class CityAutoComplete extends Component {
  state = {
    dataSource: [],
  };

  componentWillMount() {
    if (typeof window === 'undefined') return;
    this.geo = new Geo();
    this.dataSourceConfig = this.geo.getPredictionFormat();
  }

  getSuggestion(text) {
    for (var suggestion of this.state.dataSource) {
      if (suggestion.text === text) return suggestion;
    }
    return false;
  }

  handleUpdateInput = (value) => {
    const suggestion = this.getSuggestion(value);
    //Value was selected
    if (suggestion) {
      this.geo.getDetails(suggestion.value.placeId, (response)=> {
        console.log(response);
        suggestion.value.utcOffset = response.utc_offset;
        suggestion.value.photo = response.photo;
        this.props.onSelect(suggestion);
        this.clear();
      });
      return;
    }

    if (value) this.geo.getCities(value, (predictions, status) => {
      if (predictions && predictions.length) this.setState({
        dataSource: predictions.map((prediction) => {
          return prediction ? this.geo.renderPrediction(prediction) : '';
        }),
        dataSourceConfig: this.dataSourceConfig
      });
    });
  };

  clear() {
    this.refs.autoComplete.setState({searchText: ''})
  }

  focus() {
    if (this.refs.autoComplete.state.searchText === '') this.refs.autoComplete.focus();
    if (window && window.jQuery) window.jQuery('#root>div>div').scrollLeft(4000)
  }
  
  onBlur() {
    if (this.refs.autoComplete.state.searchText.length === 0) this.props.onBlur();
  }

  render() {
    return (
      <div id='search'>
        <AutoComplete
          ref="autoComplete"
          inputStyle={{fontSize: '24px'}}
          hintStyle={{fontSize: '24px'}}
          className='autoComplete'
          hintText="Start typing the city to add"
          fullWidth={true}
          dataSource={this.state.dataSource}
          onUpdateInput={this.handleUpdateInput}
          onBlur={() => this.onBlur()}
          filter={(searchText, key) => true}
        />
      </div>
    );
  }
}