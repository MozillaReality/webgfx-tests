// 19.1.2.14 Object.keys(O)
var toObject = require('./_to-object');
var $keys = require('./_object-keys');

require('./_object-sap')('keys', function () {
  return function keys(it) {
    return $keys(toObject(it));
  };
});



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/es6.object.keys.js
// module id = 264
// module chunks = 0