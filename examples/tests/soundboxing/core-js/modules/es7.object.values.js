// https://github.com/tc39/proposal-object-values-entries
var $export = require('./_export');
var $values = require('./_object-to-array')(false);

$export($export.S, 'Object', {
  values: function values(it) {
    return $values(it);
  }
});



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/es7.object.values.js
// module id = 354
// module chunks = 0