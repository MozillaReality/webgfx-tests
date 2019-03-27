// https://rwaldron.github.io/proposal-math-extensions/
var $export = require('./_export');
var DEG_PER_RAD = Math.PI / 180;

$export($export.S, 'Math', {
  radians: function radians(degrees) {
    return degrees * DEG_PER_RAD;
  }
});



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/es7.math.radians.js
// module id = 344
// module chunks = 0