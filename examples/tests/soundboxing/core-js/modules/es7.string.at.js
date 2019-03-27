'use strict';
// https://github.com/mathiasbynens/String.prototype.at
var $export = require('./_export');
var $at = require('./_string-at')(true);

$export($export.P, 'String', {
  at: function at(pos) {
    return $at(this, pos);
  }
});



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/es7.string.at.js
// module id = 370
// module chunks = 0