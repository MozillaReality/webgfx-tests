// https://github.com/ljharb/proposal-is-error
var $export = require('./_export');
var cof = require('./_cof');

$export($export.S, 'Error', {
  isError: function isError(it) {
    return cof(it) === 'Error';
  }
});



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/es7.error.is-error.js
// module id = 331
// module chunks = 0