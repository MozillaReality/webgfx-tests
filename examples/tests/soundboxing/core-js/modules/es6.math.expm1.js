// 20.2.2.14 Math.expm1(x)
var $export = require('./_export');
var $expm1 = require('./_math-expm1');

$export($export.S + $export.F * ($expm1 != Math.expm1), 'Math', { expm1: $expm1 });



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/es6.math.expm1.js
// module id = 229
// module chunks = 0