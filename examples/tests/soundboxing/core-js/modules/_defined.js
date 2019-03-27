// 7.2.1 RequireObjectCoercible(argument)
module.exports = function (it) {
  if (it == undefined) throw TypeError("Can't call method on  " + it);
  return it;
};



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/_defined.js
// module id = 23
// module chunks = 0