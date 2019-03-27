require('./_typed-array')('Uint8', 1, function (init) {
  return function Uint8Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/es6.typed.uint8-array.js
// module id = 324
// module chunks = 0