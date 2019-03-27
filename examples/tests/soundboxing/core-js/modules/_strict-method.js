'use strict';
var fails = require('./_fails');

module.exports = function (method, arg) {
  return !!method && fails(function () {
    // eslint-disable-next-line no-useless-call
    arg ? method.call(null, function () { /* empty */ }, 1) : method.call(null);
  });
};



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/_strict-method.js
// module id = 20
// module chunks = 0