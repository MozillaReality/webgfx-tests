'use strict';
// B.2.3.6 String.prototype.fixed()
require('./_string-html')('fixed', function (createHTML) {
  return function fixed() {
    return createHTML(this, 'tt', '', '');
  };
});



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/es6.string.fixed.js
// module id = 298
// module chunks = 0