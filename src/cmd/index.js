#!/usr/bin/env node

//const cmd = require('./command');

var program = require('commander');
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
  .option("-b, --browser [browser name]", "Which browser to use")
  .action((testIDs, options) => {
    var testsToRun = TestUtils.testsDb;

    device = program.adb ? ADBDevice : LocalDevice;

    if (testIDs) {
      var testsIDs = testIDs.split(',');
      testsToRun = TestUtils.testsDb.filter(test => testsIDs.indexOf(test.id) !== -1);
    }

    if (testsToRun.length === 0) {
      console.log('Tests not found.');
    } else {
      console.log('Test to run:', testsToRun.map(t => t.id));
      device.getBrowsers().then(browsers => {
        browserToRun = options.browser && browsers.filter(b => b.name === options.browser)[0] || browsers[0];
        console.log('Browser to run:', browserToRun.name);
        TestUtils.runTests(testsToRun, browserToRun);
      });
    }
});

program.parse(process.argv);
