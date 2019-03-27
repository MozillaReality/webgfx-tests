// 20.2.2.20 Math.log1p(x)
module.exports = Math.log1p || function log1p(x) {
  return (x = +x) > -1e-8 && x < 1e-8 ? x - x * x / 2 : Math.log(1 + x);
};



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/_math-log1p.js
// module id = 108
// module chunks = 0