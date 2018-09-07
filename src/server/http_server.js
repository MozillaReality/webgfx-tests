var express = require('express');
var path = require('path');
var fs = require('fs');
var cheerio = require('cheerio');
var path = require('path')
const chalk = require('chalk');
const internalIp = require('internal-ip');
var bodyParser = require('body-parser')

let server = express();

var testsDb = JSON.parse(fs.readFileSync(__dirname + '/tests.json', 'utf8'));

server.use('/', express.static('src/frontapp'));

server.use('/static', express.static('src/tests'));

server.get('/tests/gfx-perftests.js', (req, res) => {
  var html = fs.readFileSync(__dirname+'/../../dist/gfx-perftests.js', 'utf8');
  res.send(html);
});

server.use('/tests.json', express.static('src/server/tests.json'));

server.use(bodyParser.json());

server.post('/store_test_start', (req, res) => {
  console.log('Starting a new test', req.body);
  res.send('');
});

server.post('/store_system_info', (req, res) => {
  console.log('Storing system info', req.body);
  res.send('');
});

server.get('/tests*', (req, res) => {
  var url = req.url.split('?')[0]; // Remove params like /file.json?p=whatever
  var pathf = path.join(__dirname+'/../', url);
  var ext = path.extname(url);
  if (ext === '.html') {
    var test = testsDb.find(test => test.url === url.replace(/\/tests\//, ''));
    if (test) {
      var html = fs.readFileSync(pathf, 'utf8');
      var $ = cheerio.load(html);
      var head = $('head');
      head.append(`<script>var GFXPERFTEST_CONFIG = {serverIP: '${internalIp.v4.sync()}', test_id: '${test.id}'};</script>`)
          .append('<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.1.1/socket.io.js"></script>')
          .append('<script src="/tests/gfx-perftests.js"></script>');
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
