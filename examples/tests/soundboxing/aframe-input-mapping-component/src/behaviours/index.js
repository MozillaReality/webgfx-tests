AFRAME.inputBehaviours = {};

AFRAME.registerInputBehaviour = function (name, definition) {
  AFRAME.inputBehaviours[name] = definition;
};

require('./dpad.js');


//////////////////
// WEBPACK FOOTER
// ./~/aframe-input-mapping-component/src/behaviours/index.js
// module id = 148
// module chunks = 0