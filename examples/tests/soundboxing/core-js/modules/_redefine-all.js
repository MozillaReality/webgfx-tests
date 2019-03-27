var redefine = require('./_redefine');
module.exports = function (target, src, safe) {
  for (var key in src) redefine(target, key, src[key], safe);
  return target;
};



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/_redefine-all.js
// module id = 38
// module chunks = 0