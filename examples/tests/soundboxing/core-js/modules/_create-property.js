'use strict';
var $defineProperty = require('./_object-dp');
var createDesc = require('./_property-desc');

module.exports = function (object, index, value) {
  if (index in object) $defineProperty.f(object, index, createDesc(0, value));
  else object[index] = value;
};



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/_create-property.js
// module id = 67
// module chunks = 0