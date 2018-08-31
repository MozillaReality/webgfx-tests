var express = require('express');
var path = require('path');
var fs = require('fs');
var cheerio = require('cheerio');
var path = require('path')
const chalk = require('chalk');
const internalIp = require('internal-ip');

let server = express();

var testsDb = JSON.parse(fs.readFileSync(__dirname + '/tests.json', 'utf8'));

server.use('/', express.static('src/frontapp'));

server.use('/static', express.static('src/tests'));

server.get('/tests/gfx-perftests.js', (req, res) => {
  var html = fs.readFileSync(__dirname+'/../../dist/gfx-perftests.js', 'utf8');
  res.send(html);
});

server.get('/tests*', (req, res) => {
  var pathf = path.join(__dirname+'/../', req.url);
  var ext = path.extname(req.url);
  if (ext === '.html') {
    var test = testsDb.find(test => test.entry === req.url.replace(/\/tests\//, ''));
    if (test) {
      var html = fs.readFileSync(pathf, 'utf8');
      var $ = cheerio.load(html);
      var head = $('head');
      head.append(`<script>var GFXPERFTEST_CONFIG = {serverIP: '${internalIp.v4.sync()}', test_id: '${test.id}'};</script>`)
          .append('<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.1.1/socket.io.js"></script>')
          .append('<script src="gfx-perftests.js"></script>');
      res.send($.html());    
    } else {
      res.send('Not test found');
    }
  } else {
    res.sendFile(pathf);
  }
});



server.listen(3000, function(){
  console.log(chalk.white('listening on ') + chalk.yellow('*:3000'));
});
