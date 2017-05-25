import axios from 'axios';

const IMG_URL = 'https://pixabay.com/api';
const IMG_KEY = '3447327-4862a38728b3e10a8a5e52323';
const IMG_TYPE = 'photo';

let instance = null;

export default class ImageFetch {
  constructor() {
    if(!instance) instance = this;
    return instance;
  }

  _getImgUrl(query) {
    return (IMG_URL + '/?key=' + IMG_KEY + '&q=' + query 
        + '&image_type=' + IMG_TYPE);
  }

  _getImageRequest(cityName) {
    const request = axios.get(this._getImgUrl(cityName));
    return request;
  }

  getImageUrl(cityName, callback) {
    this._getImageRequest(cityName).then((response) => {
      const hits = response.data.hits;
      const imgSrc = hits.length 
          && hits[0].webformatURL.replace('_640', '_960');
      callback(imgSrc);
    });
  }

}