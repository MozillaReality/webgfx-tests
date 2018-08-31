var express = require('express');
var path = require('path');
var fs = require('fs');
var cheerio = require('cheerio');
var path = require('path')
const chalk = require('chalk');

let server = express();

var testsDb = JSON.parse(fs.readFileSync(__dirname + '/tests.json', 'utf8'));

server.get('/static/tester.js', (req, res) => {
  var html = fs.readFileSync(__dirname+'/../../dist/perftests.js', 'utf8');
  res.send(html);
});

server.get('/static*', (req, res) => {
  var pathf = path.join(__dirname+'/../', req.url);
  var ext = path.extname(req.url);
  if (ext === '.html') {
    var test = testsDb.find(test => test.entry === req.url);
    if (test) {
      var html = fs.readFileSync(pathf, 'utf8');
      var $ = cheerio.load(html);
      var head = $('head');
      head.append(`<script>var TEST_ID = '${test.id}';</script>\n`)
          .append('<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.1.1/socket.io.js"></script>')
          .append('<script src="tester.js"></script>');
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
