// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var $export = require('./_export');

$export($export.P + $export.R, 'Set', { toJSON: require('./_collection-to-json')('Set') });



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/es7.set.to-json.js
// module id = 369
// module chunks = 0