// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var $export = require('./_export');

$export($export.P + $export.R, 'Map', { toJSON: require('./_collection-to-json')('Map') });



//////////////////
// WEBPACK FOOTER
// ./~/core-js/modules/es7.map.to-json.js
// module id = 335
// module chunks = 0