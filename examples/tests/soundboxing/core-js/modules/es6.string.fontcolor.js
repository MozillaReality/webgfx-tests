'use strict';
// B.2.3.7 String.prototype.fontcolor(color)
require('./_string-html')('fontcolor', function (createHTML) {
  return function fontcolor(color) {
    return createHTML(this, 'font', 'color', color);
  };
});



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/es6.string.fontcolor.js
// module id = 299
// module chunks = 0