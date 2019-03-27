// 20.1.2.3 Number.isInteger(number)
var isObject = require('./_is-object');
var floor = Math.floor;
module.exports = function isInteger(it) {
  return !isObject(it) && isFinite(it) && floor(it) === it;
};



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/_is-integer.js
// module id = 104
// module chunks = 0