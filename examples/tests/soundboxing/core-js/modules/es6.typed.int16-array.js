require('./_typed-array')('Int16', 2, function (init) {
  return function Int16Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/es6.typed.int16-array.js
// module id = 319
// module chunks = 0