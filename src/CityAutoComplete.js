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
      this.clear();
      this.geo.getDetails(suggestion.value.placeId, (response)=> {
        suggestion.value.utcOffset = response.utc_offset;
        this.props.onSelect(suggestion);
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
    this.refs.autoComplete.focus();
  }

  render() {
    return (
      <div>
        <AutoComplete
          ref="autoComplete"
          hintText="Enter city name"
          dataSource={this.state.dataSource}
          onUpdateInput={this.handleUpdateInput}
          filter={(searchText, key) => true}
        />
      </div>
    );
  }
}