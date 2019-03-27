// 7.1.4 ToInteger
var ceil = Math.ceil;
var floor = Math.floor;
module.exports = function (it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/_to-integer.js
// module id = 25
// module chunks = 0