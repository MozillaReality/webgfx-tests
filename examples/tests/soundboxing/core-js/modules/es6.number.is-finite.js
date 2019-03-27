// 20.1.2.2 Number.isFinite(number)
var $export = require('./_export');
var _isFinite = require('./_global').isFinite;

$export($export.S, 'Number', {
  isFinite: function isFinite(it) {
    return typeof it == 'number' && _isFinite(it);
  }
});



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/es6.number.is-finite.js
// module id = 242
// module chunks = 0