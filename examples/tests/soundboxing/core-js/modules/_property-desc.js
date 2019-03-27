module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/_property-desc.js
// module id = 37
// module chunks = 0