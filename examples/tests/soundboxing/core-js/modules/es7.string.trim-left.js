'use strict';
// https://github.com/sebmarkbage/ecmascript-string-left-right-trim
require('./_string-trim')('trimLeft', function ($trim) {
  return function trimLeft() {
    return $trim(this, 1);
  };
}, 'trimStart');



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/es7.string.trim-left.js
// module id = 374
// module chunks = 0