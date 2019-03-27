'use strict';
// B.2.3.2 String.prototype.anchor(name)
require('./_string-html')('anchor', function (createHTML) {
  return function anchor(name) {
    return createHTML(this, 'a', 'name', name);
  };
});



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/es6.string.anchor.js
// module id = 292
// module chunks = 0