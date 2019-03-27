// check on default Array iterator
var Iterators = require('./_iterators');
var ITERATOR = require('./_wks')('iterator');
var ArrayProto = Array.prototype;

module.exports = function (it) {
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/_is-array-iter.js
// module id = 73
// module chunks = 0