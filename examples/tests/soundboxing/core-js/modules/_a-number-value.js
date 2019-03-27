var cof = require('./_cof');
module.exports = function (it, msg) {
  if (typeof it != 'number' && cof(it) != 'Number') throw TypeError(msg);
  return +it;
};



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/_a-number-value.js
// module id = 93
// module chunks = 0