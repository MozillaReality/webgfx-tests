module.exports = function (it, Constructor, name, forbiddenField) {
  if (!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)) {
    throw TypeError(name + ': incorrect invocation!');
  } return it;
};



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/_an-instance.js
// module id = 31
// module chunks = 0