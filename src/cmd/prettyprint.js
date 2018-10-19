var prettyjson = require('prettyjson');
var colorize = require('json-colorizer');

module.exports = {
  json: function(json) {
    console.log(colorize(JSON.stringify(json, null, 2)));
  }
}