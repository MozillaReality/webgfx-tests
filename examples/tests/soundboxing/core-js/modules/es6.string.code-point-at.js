'use strict';
var $export = require('./_export');
var $at = require('./_string-at')(false);
$export($export.P, 'String', {
  // 21.1.3.3 String.prototype.codePointAt(pos)
  codePointAt: function codePointAt(pos) {
    return $at(this, pos);
  }
});



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/es6.string.code-point-at.js
// module id = 296
// module chunks = 0