// 20.1.2.4 Number.isNaN(number)
var $export = require('./_export');

$export($export.S, 'Number', {
  isNaN: function isNaN(number) {
    // eslint-disable-next-line no-self-compare
    return number != number;
  }
});



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/es6.number.is-nan.js
// module id = 244
// module chunks = 0