'use strict';
// B.2.3.5 String.prototype.bold()
require('./_string-html')('bold', function (createHTML) {
  return function bold() {
    return createHTML(this, 'b', '', '');
  };
});



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/es6.string.bold.js
// module id = 295
// module chunks = 0