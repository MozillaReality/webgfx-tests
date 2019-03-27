require('./_typed-array')('Uint8', 1, function (init) {
  return function Uint8ClampedArray(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
}, true);



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/es6.typed.uint8-clamped-array.js
// module id = 325
// module chunks = 0