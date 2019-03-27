module.exports = !require('./_descriptors') && !require('./_fails')(function () {
  return Object.defineProperty(require('./_dom-create')('div'), 'a', { get: function () { return 7; } }).a != 7;
});



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/_ie8-dom-define.js
// module id = 102
// module chunks = 0