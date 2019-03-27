// 20.2.2.22 Math.log2(x)
var $export = require('./_export');

$export($export.S, 'Math', {
  log2: function log2(x) {
    return Math.log(x) / Math.LN2;
  }
});



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/es6.math.log2.js
// module id = 235
// module chunks = 0