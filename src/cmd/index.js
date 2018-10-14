#!/usr/bin/env node

var fs = require('fs');
const detectBrowsers = require('detect-browsers');
const { spawn } = require('child_process');

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

/**
 * Module dependencies.
 */
 
var program = require('commander');
const opn = require('opn');

program
  .version('0.1.0')
  .option('-l, --listtests', 'List tests')
  .option('--listbrowsers', 'List browsers');

program
  .command('run [testIDs]')
  .action((testIDs, options) => {        
    const testsFilename = __dirname + '/../server/tests.json';
    console.log(testsFilename);
    var testsDb = JSON.parse(fs.readFileSync(testsFilename, 'utf8'));    
    var testsToRun = testsDb;

    if (testIDs) {
      var testsIDs = testIDs.split(',');
      testsToRun = testsDb.filter(test => testsIDs.indexOf(test.id) !== -1);
    }

    if (testsToRun.length === 0) {
      console.log('Tests not found.');
      return;
    }
    
    console.log('TESTS TO RUN', testsToRun.map(t => t.id));

    runTests(testsToRun);
});

var testsToRun;
function runTest(test, callback) {
  console.log('RRuninggggg:', test.id);
  const baseURL = 'http://localhost:3000/tests/';
  var url = baseURL + test.url;

  var options = {
    showKeys: false,
    showMouse: false,
    noCloseOnFail: false
  };

  console.log('Running:', test.id);
  url = buildTestURL(url, test, options, {});
  
  opn(url, {app: 'firefox'}).then(() => {
    console.log('>>>>> exit browser');
    callback();
  });
}

function runNextTest() {
  var test = testsToRun.shift();
  if (test) {
    runTest(test, runNextTest);
  }
}

function runTests(tests) {
  testsToRun = tests;
  runNextTest();
}

program.parse(process.argv);

if (program.listtests) {
  console.log('List tests\n----------');
  testsDb.forEach(test => {
    console.log(`- ${test.id}: ${test.name}`);
  });
} else if (program.listbrowsers) {
  detectBrowsers.getInstalledBrowsers()
    .then( browsers => console.log('Installed browsers:\n', browsers))
    .catch( error => console.error(error));
}
