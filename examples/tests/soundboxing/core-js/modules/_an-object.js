var isObject = require('./_is-object');
module.exports = function (it) {
  if (!isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/_an-object.js
// module id = 1
// module chunks = 0