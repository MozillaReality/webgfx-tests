'use strict';
// B.2.3.4 String.prototype.blink()
require('./_string-html')('blink', function (createHTML) {
  return function blink() {
    return createHTML(this, 'blink', '', '');
  };
});



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/es6.string.blink.js
// module id = 294
// module chunks = 0