module.exports = function (exec) {
  try {
    return { e: false, v: exec() };
  } catch (e) {
    return { e: true, v: e };
  }
};



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/_perform.js
// module id = 118
// module chunks = 0