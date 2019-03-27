// 19.1.2.13 Object.isSealed(O)
var isObject = require('./_is-object');

require('./_object-sap')('isSealed', function ($isSealed) {
  return function isSealed(it) {
    return isObject(it) ? $isSealed ? $isSealed(it) : false : true;
  };
});



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/es6.object.is-sealed.js
// module id = 262
// module chunks = 0