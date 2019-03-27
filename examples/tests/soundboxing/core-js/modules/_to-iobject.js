// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = require('./_iobject');
var defined = require('./_defined');
module.exports = function (it) {
  return IObject(defined(it));
};



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/_to-iobject.js
// module id = 17
// module chunks = 0