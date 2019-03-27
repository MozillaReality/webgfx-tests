AFRAME.inputActivators = {};

AFRAME.registerInputActivator = function (name, definition) {
  AFRAME.inputActivators[name] = definition;
};

require('./longpress.js');
require('./doubletouch.js');
require('./doublepress.js');
require('./simpleactivator.js');


//////////////////
// WEBPACK FOOTER
// ./~/aframe-input-mapping-component/src/activators/index.js
// module id = 144
// module chunks = 0