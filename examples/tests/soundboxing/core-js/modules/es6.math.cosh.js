// 20.2.2.12 Math.cosh(x)
var $export = require('./_export');
var exp = Math.exp;

$export($export.S, 'Math', {
  cosh: function cosh(x) {
    return (exp(x = +x) + exp(-x)) / 2;
  }
});



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/es6.math.cosh.js
// module id = 228
// module chunks = 0