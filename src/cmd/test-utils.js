const fs = require('fs');
const internalIp = require('internal-ip');

function addGET(url, parameter) {
  if (url.indexOf('?') != -1) return url + '&' + parameter;
  else return url + '?' + parameter;
}

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

function runTest(device, browser, test, callback) {
  const serverIP = internalIp.v4.sync() || 'localhost';
  const baseURL = `http://${serverIP}:3000/tests/`;
  var url = baseURL + test.url;

  var options = {
    showKeys: false,
    showMouse: false,
    noCloseOnFail: false
  };

  console.log('* Running:', test.id);
  url = buildTestURL(url, test, options, {});
  
  const killOnStart = true;

  if (killOnStart) {
    device.killBrowser(browser).then(() => {
      device.launchBrowser(browser, url); //.then(runNextTest);
    });  
  } else {
    device.launchBrowser(browser, url); //.then(runNextTest);
  }
}

var browserToRun;
var testsToRun;

function runNextTest() {
  var test = testsToRun.shift();
  if (test) {
    runTest(device, browserToRun, test, runNextTest);
  }
}

function runTests(tests, browser) {
  testsToRun = tests;
  browserToRun = browser;
  runNextTest();
}

const testsFilename = __dirname + '/../server/tests.json';
var testsDb = JSON.parse(fs.readFileSync(testsFilename, 'utf8'));

function listTests() {
  if (testsDb) {
    testsDb.forEach(test => {
      console.log(`- ${test.id}: ${test.name}`);
    });
  }  
}

module.exports = {
  runTests: runTests,
  testsDb: testsDb,
  listTests: listTests
}