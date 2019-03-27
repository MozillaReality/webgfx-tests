// 20.2.2.9 Math.cbrt(x)
var $export = require('./_export');
var sign = require('./_math-sign');

$export($export.S, 'Math', {
  cbrt: function cbrt(x) {
    return sign(x = +x) * Math.pow(Math.abs(x), 1 / 3);
  }
});



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/es6.math.cbrt.js
// module id = 226
// module chunks = 0