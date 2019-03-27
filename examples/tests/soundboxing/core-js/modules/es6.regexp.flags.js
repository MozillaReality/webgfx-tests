// 21.2.5.3 get RegExp.prototype.flags()
if (require('./_descriptors') && /./g.flags != 'g') require('./_object-dp').f(RegExp.prototype, 'flags', {
  configurable: true,
  get: require('./_flags')
});



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/es6.regexp.flags.js
// module id = 124
// module chunks = 0