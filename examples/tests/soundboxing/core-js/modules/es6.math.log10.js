// 20.2.2.21 Math.log10(x)
var $export = require('./_export');

$export($export.S, 'Math', {
  log10: function log10(x) {
    return Math.log(x) * Math.LOG10E;
  }
});



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/es6.math.log10.js
// module id = 233
// module chunks = 0