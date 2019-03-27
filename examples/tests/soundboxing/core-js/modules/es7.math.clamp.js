// https://rwaldron.github.io/proposal-math-extensions/
var $export = require('./_export');

$export($export.S, 'Math', {
  clamp: function clamp(x, lower, upper) {
    return Math.min(upper, Math.max(lower, x));
  }
});



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/es7.math.clamp.js
// module id = 336
// module chunks = 0