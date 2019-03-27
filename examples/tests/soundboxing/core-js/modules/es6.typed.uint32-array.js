require('./_typed-array')('Uint32', 4, function (init) {
  return function Uint32Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/es6.typed.uint32-array.js
// module id = 323
// module chunks = 0