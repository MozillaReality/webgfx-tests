// https://github.com/tc39/proposal-object-values-entries
var $export = require('./_export');
var $entries = require('./_object-to-array')(true);

$export($export.S, 'Object', {
  entries: function entries(it) {
    return $entries(it);
  }
});



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/es7.object.entries.js
// module id = 350
// module chunks = 0