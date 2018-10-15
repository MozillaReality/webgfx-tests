#!/usr/bin/env node

var fs = require('fs');
const internalIp = require('internal-ip');
const findProcess = require('find-process');
const detectBrowsers = require('detect-browsers');
const { spawn } = require('child_process');
var killProcess = require('kill-process');
var program = require('commander');
const opn = require('opn');

const testsFilename = __dirname + '/../server/tests.json';
var testsDb = JSON.parse(fs.readFileSync(testsFilename, 'utf8'));    

/*

npm run test -- run misc_fps
npm run test -- --listbrowsers
npm run test -- --listtests


-h --help
--kill_start
--kill_exit
--no_server
--no_browser
--verbose
--log_stdout
--log_stderr
--timeout
--list_browsers
--android
--system_info
--browser_info
--json
*/

function buildTestURL(baseURL, test, testOptions, globalOptions) {
  var url = baseURL;
  
  if (test.numframes) url = addGET(url, 'num-frames=' + test.numframes);
  if (test.windowsize) url = addGET(url, 'width=' + test.windowsize.width + '&height=' + test.windowsize.height);  
  if (globalOptions.fakeWebGL) url = addGET(url, 'fake-webgl');

  var record = false;
  if (record) {
    url = addGET(url, 'recording');
  } else if (test.input) {
    url = addGET(url, 'replay');
    if (testOptions.showKeys) url = addGET(url, 'show-keys');
    if (testOptions.showMouse) url = addGET(url, 'show-mouse');
  }
  if (testOptions.noCloseOnFail) url = addGET(url, 'no-close-on-fail');

  if (globalOptions.skipReferenceImageTest) url = addGET(url, 'skip-reference-image-test');
  if (globalOptions.referenceImage) url = addGET(url, 'reference-image');
  /*
  if (this.progress) {
    url = addGET(url, 'order-test=' + this.progress.tests[id].current + '&total-test=' + this.progress.tests[id].total);
    url = addGET(url, 'order-global=' + this.progress.currentGlobal + '&total-global=' + this.progress.totalGlobal);
    this.progress.tests[id].current++;
    this.progress.currentGlobal++;
  }
  */
  return url;
}

function addGET(url, parameter) {
  if (url.indexOf('?') != -1) return url + '&' + parameter;
  else return url + '?' + parameter;
}

program
  .version('0.1.0')
  .option('-l, --listtests', 'List tests')
  .option('--listbrowsers', 'List browsers');

program
  .command('run [testIDs]')
  .description('run tests')
  .option("-b, --browser [browser name]", "Which browser to use")
  .action((testIDs, options) => {
    var testsToRun = testsDb;

    if (testIDs) {
      var testsIDs = testIDs.split(',');
      testsToRun = testsDb.filter(test => testsIDs.indexOf(test.id) !== -1);
    }

    if (testsToRun.length === 0) {
      console.log('Tests not found.');
    } else {
      console.log('TESTS TO RUN', testsToRun.map(t => t.id));
      getBrowsers().then(browsers => {
        browserToRun = options.browser && browsers.filter(b => b.name === options.browser)[0] || browsers[0];
        runTests(testsToRun);
      });
    }
});

var browserToRun;
var testsToRun;
function runTest(test, callback) {
  const serverIP = internalIp.v4.sync() || 'localhost';
  const baseURL = `http://${serverIP}:3000/tests/`;
  var url = baseURL + test.url;

  var options = {
    showKeys: false,
    showMouse: false,
    noCloseOnFail: false
  };

  console.log('Running:', test.id);
  url = buildTestURL(url, test, options, {});
  
  //var child = opn(url, {app: 'firefox'}).then(() => {
  const browser = 'chrome';
  killStart().then(() => {
    //var cp = spawn(browserToRun.executablePath, ['http://fernandojsg.com']);
    var cp = opn(url, {app: browserToRun.executablePath}).then(() => {
      console.log('!!!!!!!!!!!!!!!');
    });
  });

  /*
  setTimeout(() => {
    killProcess(child.pid);
  }, 5000);
  */
}

function killStart() {
  return new Promise(resolve => {    
    findProcess('cmd', browserToRun.executablePath).then(list => {
      list.forEach(p => killProcess(p.pid));
      resolve();
    });
  });
}

function runNextTest() {
  var test = testsToRun.shift();
  if (test) {
    runTest(test, runNextTest);
  }
}

function runTests(tests, browser) {
  testsToRun = tests;
  runNextTest();
}

program.parse(process.argv);


function getBrowsers() {
  return new Promise((resolve, reject) => {
    detectBrowsers.getInstalledBrowsers()
    .then(browsers => {
      resolve(browsers.map(browser => {browser.name = browser.name.toLowerCase(); return browser}));
    })
    .catch( error => reject(error));
  });
}


if (program.listtests) {
  console.log('List tests\n----------');
  testsDb.forEach(test => {
    console.log(`- ${test.id}: ${test.name}`);
  });
} else if (program.listbrowsers) {
  getBrowsers()
    .then(browsers => {
      console.log('Installed browsers:\n-------------------');
      console.log(browsers);
    })
    .catch( error => console.error(error));
}
