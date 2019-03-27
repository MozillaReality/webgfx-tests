// 9.4.2.3 ArraySpeciesCreate(originalArray, length)
var speciesConstructor = require('./_array-species-constructor');

module.exports = function (original, length) {
  return new (speciesConstructor(original))(length);
};



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/_array-species-create.js
// module id = 66
// module chunks = 0