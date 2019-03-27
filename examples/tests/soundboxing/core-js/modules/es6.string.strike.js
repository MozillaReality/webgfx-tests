'use strict';
// B.2.3.12 String.prototype.strike()
require('./_string-html')('strike', function (createHTML) {
  return function strike() {
    return createHTML(this, 'strike', '', '');
  };
});



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/es6.string.strike.js
// module id = 310
// module chunks = 0