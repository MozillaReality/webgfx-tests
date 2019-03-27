var TO_PRIMITIVE = require('./_wks')('toPrimitive');
var proto = Date.prototype;

if (!(TO_PRIMITIVE in proto)) require('./_hide')(proto, TO_PRIMITIVE, require('./_date-to-primitive'));



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/es6.date.to-primitive.js
// module id = 218
// module chunks = 0