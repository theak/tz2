import fetchJsonp from 'fetch-jsonp';

const GEOLOC_URL = 'https://ip.iwantthetime.com/json.gp?ip=' 
    + (window && window.clientIp);

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
      this.placesService = new googleMaps.places.PlacesService(
        document.createElement('div'));
      this.types = ['(cities)'];
      this.bounds = new googleMaps.LatLngBounds(
        new googleMaps.LatLng(-90, -180),
        new googleMaps.LatLng(90, 180));
    }

    return instance;
  }

  getCities(query, callback) {
    this.autocompleteService.getPlacePredictions({
      types: this.types,
      bounds: this.bounds,
      input: query
    }, callback);
  }

  selectPhoto(photos) {
    const photo = photos[0];
    const height = (window.innerHeight) * window.devicePixelRatio;
    const width = Math.floor(photo.width / photo.height * height);
    const imgUrl = photo.getUrl({maxWidth: width, maxHeight: height});
    const thumbUrl = photo.getUrl({maxWidth: 128, maxHeight: 128});
    return {thumbUrl: thumbUrl, imgUrl: imgUrl};
  }

  getDetails(placeId, callback) {
    return this.placesService.getDetails({placeId: placeId}, (response)=> {
        callback({utc_offset: response.utc_offset,
                  photo: this.selectPhoto(response.photos)});
      });
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
        });
  }

  getPhotoForCity(city, callback) {
    this.getCities(city, (predictions, status) => {
      if (predictions && predictions.length) {
        this.getDetails(predictions[0].place_id, (response) => {
          callback(response.photo);
        });
      }
    });
  }

}