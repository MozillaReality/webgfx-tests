require('./_typed-array')('Float64', 8, function (init) {
  return function Float64Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/es6.typed.float64-array.js
// module id = 318
// module chunks = 0