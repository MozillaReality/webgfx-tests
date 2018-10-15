#!/usr/bin/env node

//const cmd = require('./command');

var program = require('commander');
var initHTTPServer = require('../server/http_server');
var initWebSocketServer = require('../server/websockets_server');

const ADBDevice = require('./adb-device');
const LocalDevice = require('./local-device');
const TestUtils = require('./test-utils');

const package = require('../../package.json');

program
  .version(package.version);

program
  .command('listtests')
  .description('Lists tests')
  .action((options) => {
    console.log('Tests list\n----------');
    TestUtils.listTests();
  });

program
  .command('listbrowsers')
  .description('List browsers')
  .option("-a, --adb", "Use ADB to connect to an android device")
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
  .command('run [testIDs]')
  .description('run tests')
  .option("-p, --port <port_number>", "HTTP Server Port number (Default 3333)")
  .option("-w, --wsport <port_number>", "WebSocket Port number (Default 8888)")
  .option("-b, --browser [browser name]", "Which browser to use")
  .action((testIDs, options) => {
    var testsToRun = TestUtils.testsDb;

    device = program.adb ? ADBDevice : LocalDevice;

    if (testIDs) {
      var testsIDs = testIDs.split(',');
      testsToRun = TestUtils.testsDb.filter(test => testsIDs.indexOf(test.id) !== -1);
    }

    initHTTPServer(options.port);
    initWebSocketServer(options.wsport, function (data) {
      device.killBrowser(TestUtils.getRunningTest().browser).then(() => {
        TestUtils.runNextTest();
      });
    });

    if (testsToRun.length === 0) {
      console.log('Tests not found.');
    } else {
      console.log('Test to run:', testsToRun.map(t => t.id));
      device.getBrowsers().then(browsers => {
        browsersToRun = browsers;
        if (options.browser && options.browser !== 'all') {
          var browserOptions = options.browser.split(',');
          browsersToRun = browsers.filter(b => browserOptions.indexOf(b.name) !== -1);
        } 
        console.log('Browser to run:', browsersToRun.map(b => b.name));
        TestUtils.runTests(testsToRun, browsersToRun);
      });
    }
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

program.parse(process.argv);
