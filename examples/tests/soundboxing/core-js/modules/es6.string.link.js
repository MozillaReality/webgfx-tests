'use strict';
// B.2.3.10 String.prototype.link(url)
require('./_string-html')('link', function (createHTML) {
  return function link(url) {
    return createHTML(this, 'a', 'href', url);
  };
});



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/es6.string.link.js
// module id = 305
// module chunks = 0