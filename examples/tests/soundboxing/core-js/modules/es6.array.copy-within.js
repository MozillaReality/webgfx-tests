// 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)
var $export = require('./_export');

$export($export.P, 'Array', { copyWithin: require('./_array-copy-within') });

require('./_add-to-unscopables')('copyWithin');



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/es6.array.copy-within.js
// module id = 195
// module chunks = 0