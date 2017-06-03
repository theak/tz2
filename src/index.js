import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
//import registerServiceWorker from './registerServiceWorker';
import './index.css';

ReactDOM.render(<App />, document.getElementById('root'));
// This shit just causes problems and is poorly documented >:(
// registerServiceWorker();
// https://github.com/facebookincubator/create-react-app/issues/2398

// Delete all the bullshit service workers that were created in the past
navigator.serviceWorker.getRegistrations().then(function(registrations) {
 for(let registration of registrations) {
  registration.unregister()
} })