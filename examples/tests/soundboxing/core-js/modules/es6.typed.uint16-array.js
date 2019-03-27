require('./_typed-array')('Uint16', 2, function (init) {
  return function Uint16Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/es6.typed.uint16-array.js
// module id = 322
// module chunks = 0