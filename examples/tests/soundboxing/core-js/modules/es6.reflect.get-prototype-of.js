// 26.1.8 Reflect.getPrototypeOf(target)
var $export = require('./_export');
var getProto = require('./_object-gpo');
var anObject = require('./_an-object');

$export($export.S, 'Reflect', {
  getPrototypeOf: function getPrototypeOf(target) {
    return getProto(anObject(target));
  }
});



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/es6.reflect.get-prototype-of.js
// module id = 278
// module chunks = 0