var express = require('express');
var path = require('path');
var fs = require('fs');
var cheerio = require('cheerio');
var path = require('path')
const chalk = require('chalk');
const internalIp = require('internal-ip');
var bodyParser = require('body-parser')

const testsDb = require('../cmd/test-utils').testsDb;

function initServer(port) {
  port = port || 3000;

  let server = express();

  server
    .use('/', express.static('src/frontapp'))
    .use('/static', express.static('src/tests'))
    .use('/tests.json', express.static('src/server/tests.json'))
    .use(bodyParser.json());
  
  server
    .get('/tests/gfx-perftests.js', (req, res) => {
      var html = fs.readFileSync(__dirname+'/../../dist/gfx-perftests.js', 'utf8');
      res.send(html);
    })
    .post('/store_test_start', (req, res) => {
      console.log('Starting a new test', req.body);
      res.send('');
    })
    .post('/store_system_info', (req, res) => {
      console.log('Storing system info', req.body);
      res.send('');
    })
    .get('/tests*', (req, res) => {
      var url = req.url.split('?')[0]; // Remove params like /file.json?p=whatever
      var pathf = path.join(__dirname+'/../', url);
      var ext = path.extname(url);
      if (ext === '.html') {
        var test = testsDb.find(test => test.url === url.replace(/\/tests\//, ''));
        if (test) {
          var html = fs.readFileSync(pathf, 'utf8');
          var $ = cheerio.load(html);
          var head = $('head');
          
          if (test.skipReferenceImageTest !== true) {
            const referenceImageName = test.referenceImage || test.id;
            const path = __dirname + '/../tests/referenceimages/' + referenceImageName + '.png';
            if (!fs.existsSync(path)) {
              console.log(`ERROR: Reference image for test <${test.id}> "${referenceImageName}" not found! Disabling reference test. Please consider adding 'skipReferenceImageTest: true' to this test or generate a reference image.`);
            }
          }
          
          test.serverIP = internalIp.v4.sync() || 'localhost';
          head.append(`<script>var GFXPERFTESTS_CONFIG = ${JSON.stringify(test, null, 2)};</script>`)
              .append('<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.1.1/socket.io.js"></script>')
              .append('<script src="/tests/gfx-perftests.js"></script>')
          res.send($.html());    
        } else {
          res.send('Not test found');
        }
      } else {
        res.sendFile(pathf);
      }
    });
  
  server.listen(port, function(){
    console.log(chalk.white('listening on ') + chalk.yellow('*:' + port));
  });  
}

module.exports = initServer;