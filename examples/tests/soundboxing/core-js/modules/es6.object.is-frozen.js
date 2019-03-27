// 19.1.2.12 Object.isFrozen(O)
var isObject = require('./_is-object');

require('./_object-sap')('isFrozen', function ($isFrozen) {
  return function isFrozen(it) {
    return isObject(it) ? $isFrozen ? $isFrozen(it) : false : true;
  };
});



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/es6.object.is-frozen.js
// module id = 261
// module chunks = 0