var isObject = require('./_is-object');
module.exports = function (it, TYPE) {
  if (!isObject(it) || it._t !== TYPE) throw TypeError('Incompatible receiver, ' + TYPE + ' required!');
  return it;
};



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/_validate-collection.js
// module id = 45
// module chunks = 0