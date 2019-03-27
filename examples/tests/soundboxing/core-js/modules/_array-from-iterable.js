var forOf = require('./_for-of');

module.exports = function (iter, ITERATOR) {
  var result = [];
  forOf(iter, false, result.push, result, ITERATOR);
  return result;
};



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/_array-from-iterable.js
// module id = 95
// module chunks = 0