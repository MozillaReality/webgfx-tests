// 19.1.2.5 Object.freeze(O)
var isObject = require('./_is-object');
var meta = require('./_meta').onFreeze;

require('./_object-sap')('freeze', function ($freeze) {
  return function freeze(it) {
    return $freeze && isObject(it) ? $freeze(meta(it)) : it;
  };
});



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/es6.object.freeze.js
// module id = 256
// module chunks = 0