var def = require('./_object-dp').f;
var has = require('./_has');
var TAG = require('./_wks')('toStringTag');

module.exports = function (it, tag, stat) {
  if (it && !has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
};



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/_set-to-string-tag.js
// module id = 43
// module chunks = 0