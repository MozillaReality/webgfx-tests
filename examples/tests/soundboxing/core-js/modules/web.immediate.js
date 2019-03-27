var $export = require('./_export');
var $task = require('./_task');
$export($export.G + $export.B, {
  setImmediate: $task.set,
  clearImmediate: $task.clear
});



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/web.immediate.js
// module id = 384
// module chunks = 0