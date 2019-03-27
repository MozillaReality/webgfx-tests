'use strict';
// B.2.3.3 String.prototype.big()
require('./_string-html')('big', function (createHTML) {
  return function big() {
    return createHTML(this, 'big', '', '');
  };
});



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/es6.string.big.js
// module id = 293
// module chunks = 0