var id = 0;
var px = Math.random();
module.exports = function (key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/_uid.js
// module id = 41
// module chunks = 0