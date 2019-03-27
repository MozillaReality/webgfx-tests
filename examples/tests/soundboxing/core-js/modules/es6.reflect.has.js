// 26.1.9 Reflect.has(target, propertyKey)
var $export = require('./_export');

$export($export.S, 'Reflect', {
  has: function has(target, propertyKey) {
    return propertyKey in target;
  }
});



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/es6.reflect.has.js
// module id = 280
// module chunks = 0