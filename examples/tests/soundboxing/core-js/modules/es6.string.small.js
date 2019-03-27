'use strict';
// B.2.3.11 String.prototype.small()
require('./_string-html')('small', function (createHTML) {
  return function small() {
    return createHTML(this, 'small', '', '');
  };
});



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/es6.string.small.js
// module id = 308
// module chunks = 0