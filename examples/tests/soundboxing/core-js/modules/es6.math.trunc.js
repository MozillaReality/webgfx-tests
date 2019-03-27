// 20.2.2.34 Math.trunc(x)
var $export = require('./_export');

$export($export.S, 'Math', {
  trunc: function trunc(it) {
    return (it > 0 ? Math.floor : Math.ceil)(it);
  }
});



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/es6.math.trunc.js
// module id = 239
// module chunks = 0