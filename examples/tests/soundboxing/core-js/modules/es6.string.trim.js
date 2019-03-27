'use strict';
// 21.1.3.25 String.prototype.trim()
require('./_string-trim')('trim', function ($trim) {
  return function trim() {
    return $trim(this, 3);
  };
});



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/es6.string.trim.js
// module id = 313
// module chunks = 0