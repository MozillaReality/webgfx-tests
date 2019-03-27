'use strict';
// https://github.com/sebmarkbage/ecmascript-string-left-right-trim
require('./_string-trim')('trimRight', function ($trim) {
  return function trimRight() {
    return $trim(this, 2);
  };
}, 'trimEnd');



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/es7.string.trim-right.js
// module id = 375
// module chunks = 0