'use strict';
// B.2.3.13 String.prototype.sub()
require('./_string-html')('sub', function (createHTML) {
  return function sub() {
    return createHTML(this, 'sub', '', '');
  };
});



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/es6.string.sub.js
// module id = 311
// module chunks = 0