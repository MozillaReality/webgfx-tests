var express = require('express');
var path = require('path');
var fs = require('fs');
var cheerio = require('cheerio');
var path = require('path')
const chalk = require('chalk');
const internalIp = require('internal-ip');
var bodyParser = require('body-parser')

const baseFolder = '/../../../';

function initServer(port, config) {
  port = port || 3000;

  let server = express();

  var configFilePath = path.dirname(config.path);
  var testsFolder = path.resolve(path.join(configFilePath, config.testsFolder));
  var definitionFolder = path.join(configFilePath, config.definitions);

  server
    .use('/', express.static(path.join(__dirname, '../../frontapp')))
    .use('/static', express.static(testsFolder))
    .use('/app.bundle.js', express.static(path.join(__dirname,'../../../dist/app.bundle.js')))
    .use('/tests.json', express.static(definitionFolder))
    .use(bodyParser.json());
  
  server
    .get('/gfx-tests.js', (req, res) => {
      var html = fs.readFileSync(__dirname + baseFolder + 'dist/gfx-tests.js', 'utf8');
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
      var pathf = path.join(testsFolder, url.replace(/\/tests\//, ''));
      
      var ext = path.extname(url);
      if (ext === '.html') {
        var test = config.tests.find(test => test.url === url.replace(/\/tests\//, ''));
        if (test) {
          var html = fs.readFileSync(pathf, 'utf8');
          var $ = cheerio.load(html);
          var head = $('head');
          
          if (test.skipReferenceImageTest !== true) {
            const referenceImageName = test.referenceImage || test.id;
            const referenceImagesFolder = path.join(testsFolder, config.referenceImagesFolder);
            const filepath = path.join(referenceImagesFolder, referenceImageName + '.png');

            if (!fs.existsSync(filepath)) {
              console.log(`ERROR: Reference image for test <${test.id}> "${referenceImageName}" not found! Disabling reference test. Please consider adding 'skipReferenceImageTest: true' to this test or generate a reference image.`);
            }
          }
          
          test.serverIP = internalIp.v4.sync() || 'localhost';
          head.append(`<script>var GFXTESTS_CONFIG = ${JSON.stringify(test, null, 2)};</script>`)
              .append(`<script>var GFXTESTS_REFERENCEIMAGE_BASEURL = 'tests/${config.referenceImagesFolder}';</script>`)
              .append('<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.1.1/socket.io.js"></script>')
              .append('<script src="/gfx-tests.js"></script>')
          res.send($.html());    
        } else {
          res.send('Not test found');
        }
      } else {
        res.sendFile(pathf);
      }
    });
  
  server.listen(port, function(){
    console.log('* HTTP Tests server listening on ' + chalk.yellow('*:' + port));
  });  
}

module.exports = initServer;