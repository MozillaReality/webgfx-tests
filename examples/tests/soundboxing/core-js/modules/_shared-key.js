var shared = require('./_shared')('keys');
var uid = require('./_uid');
module.exports = function (key) {
  return shared[key] || (shared[key] = uid(key));
};



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/_shared-key.js
// module id = 81
// module chunks = 0