// 19.1.2.17 Object.seal(O)
var isObject = require('./_is-object');
var meta = require('./_meta').onFreeze;

require('./_object-sap')('seal', function ($seal) {
  return function seal(it) {
    return $seal && isObject(it) ? $seal(meta(it)) : it;
  };
});



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/es6.object.seal.js
// module id = 266
// module chunks = 0