'use strict';
// B.2.3.9 String.prototype.italics()
require('./_string-html')('italics', function (createHTML) {
  return function italics() {
    return createHTML(this, 'i', '', '');
  };
});



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/es6.string.italics.js
// module id = 303
// module chunks = 0