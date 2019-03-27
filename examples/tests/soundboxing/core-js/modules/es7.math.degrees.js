// https://rwaldron.github.io/proposal-math-extensions/
var $export = require('./_export');
var RAD_PER_DEG = 180 / Math.PI;

$export($export.S, 'Math', {
  degrees: function degrees(radians) {
    return radians * RAD_PER_DEG;
  }
});



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/es7.math.degrees.js
// module id = 338
// module chunks = 0