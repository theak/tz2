import axios from 'axios';

const IMG_URL = 'https://pixabay.com/api';
const IMG_KEY = '3447327-4862a38728b3e10a8a5e52323';
const IMG_TYPE = 'photo';

function getImgUrl(query) {
  return IMG_URL + '/?key=' + IMG_KEY + '&q=' + query + '&image_type=' + IMG_TYPE;
}

const getImage = (cityName) => {
  const request = axios.get(getImgUrl(cityName));
  return request;
}

export default getImage;