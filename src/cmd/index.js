#!/usr/bin/env node

var program = require('commander');
var initHTTPServer = require('../server/http_server');
var initWebSocketServer = require('../server/websockets_server');
const fs = require('fs');

const ADBDevice = require('./adb-device');
const LocalDevice = require('./local-device');
const TestUtils = require('./test-utils');

const package = require('../../package.json');

program
  .version(package.version);

program
  .command('list-tests')
  .description('Lists tests')
  .action((options) => {
    console.log('Tests list\n----------');
    TestUtils.listTests();
  });

program
  .command('list-browsers')
  .description('List browsers')
  .option("-a, --adb [deviceserial]", "Use ADB to connect to an android device")
  .action((options) => {
    device = options.adb ? ADBDevice : LocalDevice;

    device.getBrowsers()
    .then(browsers => {
      console.log('Installed browsers:\n-------------------');
      console.log(browsers);
    })
    .catch(error => console.error(error));
  });

program
  .command('start-server')
  .description('Start tests server')
  .option("-p, --port <port_number>", "HTTP Server Port number (Default 3333)")
  .option("-w, --wsport <port_number>", "WebSocket Port number (Default 8888)")
  .action(options => {
    initHTTPServer(options.port);
    initWebSocketServer(options.wsport);
  });

program
  .command('run [testIDs]')
  .description('run tests')
  .option("-p, --port <port_number>", "HTTP Server Port number (Default 3333)")
  .option("-w, --wsport <port_number>", "WebSocket Port number (Default 8888)")
  .option("-b, --browser [browser name]", "Which browser to use")
  .option("-a, --adb [devices]", "Use android devices through ADB")
  .option("-n, --numtimes [number]", "Number of times to run each test")
  .option("-s, --storefile [file]", "Store test results on a local file")
  .action((testIDs, options) => {
    var testsToRun = TestUtils.testsDb;

    device = options.adb ? ADBDevice : LocalDevice;

    if (testIDs) {
      var testsIDs = testIDs.split(',');
      testsToRun = TestUtils.testsDb.filter(test => testsIDs.indexOf(test.id) !== -1);
    }

    var numOutputTests = 0;

    initHTTPServer(options.port);
    initWebSocketServer(options.wsport, function (data) {
      if (options.storefile) {
        fs.appendFile(options.storefile, (numOutputTests === 0 ? '' : ',') + JSON.stringify(data, null, 2), (err) => {  
          if (err) throw err;
          numOutputTests++;
        });
      }
      device.killBrowser(TestUtils.getRunningTest().browser).then(() => {
        TestUtils.runNextTest();
      });
    });

    function onTestsFinish() {
      console.log('TESTS FINISHED!');
      if (options.storefile) {
        fs.appendFile(options.storefile, ']', (err) => {  
          if (err) throw err;
          process.exit();
        });
      } else {
        process.exit();
      }
    }

    if (testsToRun.length === 0) {
      console.log('Tests not found.');
    } else {
      console.log('Test to run:', testsToRun.map(t => t.id));
      device.getBrowsers().then(browsers => {
        browsersToRun = browsers;
        if (options.browser && options.browser !== 'all') {
          var browserOptions = options.browser.split(',');
          browsersToRun = browsers.filter(b => browserOptions.indexOf(b.code) !== -1);
        } 

        if (options.storefile) {
          fs.writeFile(options.storefile, '[', err => {
            if (err) throw err;
          });
        }

        console.log('Browser to run:', browsersToRun.map(b => b.name));
        TestUtils.runTests(testsToRun, browsersToRun, onTestsFinish, {numTimes: options.numtimes || 1});
      });
    }
});

program.parse(process.argv);

if (program.args.length === 0) {
  program.help();
}