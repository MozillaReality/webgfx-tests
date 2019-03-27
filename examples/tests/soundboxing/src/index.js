require('babel-polyfill');

function requireAll (req) { req.keys().forEach(req); }

require('aframe-animation-component');
require('aframe-cubemap-component');
require('aframe-event-set-component');
require('aframe-haptics-component');
require('aframe-layout-component');
require('aframe-input-mapping-component');
require('aframe-particle-system-component');
require('aframe-proxy-event-component');
require('aframe-state-component');
require('aframe-slice9-component');

window.AFRAME.ASSETS_PATH = 'assets';
require ('./lib/aframe-material.min');

requireAll(require.context('./components/', true, /\.js$/));
requireAll(require.context('./state/', true, /\.js$/));

//navigator.serviceWorker.register('serviceWorker.js');



// WEBPACK FOOTER //
// ./src/index.js