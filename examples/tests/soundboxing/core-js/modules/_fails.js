module.exports = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/_fails.js
// module id = 3
// module chunks = 0