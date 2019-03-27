var $export = require('./_export');
var $parseFloat = require('./_parse-float');
// 18.2.4 parseFloat(string)
$export($export.G + $export.F * (parseFloat != $parseFloat), { parseFloat: $parseFloat });



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/es6.parse-float.js
// module id = 269
// module chunks = 0