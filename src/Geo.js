import fetchJsonp from 'fetch-jsonp';

const GEOLOC_URL = 'http://www.geoplugin.net/json.gp';

let instance = null;

function _simplifySecondary(secondary_text) {
  if (!secondary_text) return '';
  const parts = secondary_text.split(',');
  const isUsa = secondary_text.indexOf("United States") > -1;
  return parts[(isUsa || parts.length === 1) ? 0 : 1] + (isUsa ? ', US' : '');
}

export default class Geo {
  constructor() {
    if(!instance) {
      instance = this;

      if (typeof window === 'undefined') return;
      var googleMaps = (window.google && window.google.maps);
      this.autocompleteService = new googleMaps.places.AutocompleteService();
      this.placesService = new googleMaps.places.PlacesService(document.createElement('div'));
    }

    return instance;
  }

  getCities(query, callback) {
    this.autocompleteService.getPlacePredictions({
      types: ['(cities)'],
      input: query
    }, callback);
  }

  getDetails(placeId, callback) {
    return this.placesService.getDetails({placeId: placeId}, callback)
  }

  getPrediction(text, value) {
    return {text: text, value: value};
  }
  getPredictionFormat() {
    return this.getPrediction('text', 'value');
  }

  renderPrediction(prediction) {
    const structuredFormat = prediction.structured_formatting;
    const cityStr = structuredFormat.main_text + ', ' 
        + _simplifySecondary(structuredFormat.secondary_text);
    return this.getPrediction(cityStr, {placeId: prediction.place_id});
  }

  getCity(callback) {
    fetchJsonp(GEOLOC_URL, {jsonpCallback: 'jsoncallback'})
        .then((response) => {return response.json()})
        .then((json) => {
          const main_text = json.geoplugin_city;
          const secondary_text = _simplifySecondary(json.geoplugin_region 
              + ', ' + json.geoplugin_countryName);
          callback(main_text + ', ' + secondary_text);
        })
        .catch((err) => {
          console.log('json parsing failed :(');
        });
  }

}