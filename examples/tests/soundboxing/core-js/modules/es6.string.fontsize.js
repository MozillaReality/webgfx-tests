'use strict';
// B.2.3.8 String.prototype.fontsize(size)
require('./_string-html')('fontsize', function (createHTML) {
  return function fontsize(size) {
    return createHTML(this, 'font', 'size', size);
  };
});



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/es6.string.fontsize.js
// module id = 300
// module chunks = 0