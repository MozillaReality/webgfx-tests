// https://github.com/benjamingr/RexExp.escape
var $export = require('./_export');
var $re = require('./_replacer')(/[\\^$*+?.()|[\]{}]/g, '\\$&');

$export($export.S, 'RegExp', { escape: function escape(it) { return $re(it); } });



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/core.regexp.escape.js
// module id = 194
// module chunks = 0