const fs = require('fs');
const internalIp = require('internal-ip');
const chalk = require('chalk');

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


const testsFilename = __dirname + '/../server/tests.json';
var testsDb = JSON.parse(fs.readFileSync(testsFilename, 'utf8'));

function TestsManager(device, tests, browsers, onFinish, options) {
  this.tests = tests;
  this.device = device;
  this.browsers = browsers;
  this.onFinish = onFinish;
  this.options = options;
  this.testsToRun = [];
  this.runningTest = null;
}

TestsManager.prototype = {
  runTests: function() {
    this.testsToRun = [];
    this.browsers.forEach(browser => {
      this.tests.forEach(test => {
        for (let i = 0; i < this.options.numTimes; i++) {
          this.testsToRun.push({
            test: test,
            browser: browser
          });
        }
      });
    });
    this.runNextTest();
  },
  runNextTest: function() {
    if (this.testsToRun.length > 0) {
      this.runningTest = this.testsToRun.shift();
      this.runTest(this.runningTest.browser, this.runningTest.test);
    } else if (this.onFinish) {
      this.onFinish();
    }
  },
  getRunningTest: function() {
    return this.runningTest;
  },
  runTest: function(browser, test) {

    var testUUID = testData.storeTestData({
      test: test,
      browser: browser,
      device: this.device
    });

    const serverIP = internalIp.v4.sync() || 'localhost';
    const baseURL = `http://${serverIP}:3000/tests/`;
    var url = baseURL + test.url;
  
    var options = {
      showKeys: false,
      showMouse: false,
      noCloseOnFail: false
    };
  
    console.log('* Running test:', chalk.yellow(test.id), 'on browser', chalk.yellow(browser.name),'on device', chalk.green(this.device.deviceProduct));
    url = buildTestURL(url, test, options, {});
    url = addGET(url, 'test-uuid=' + testUUID);
    
    const killOnStart = false; //true;
  
    if (killOnStart) {
      this.device.killBrowser(browser).then(() => {
        this.device.launchBrowser(browser, url); //.then(runNextTest);
      });  
    } else {
      this.device.launchBrowser(browser, url); //.then(runNextTest);
    }
  }  
};

function TestsData() {
  this.uuidNext = 0;
  this.testsData = {};
}

TestsData.prototype = {
  getTestData: function(uuid) {
    return this.testsData['uuid' + uuid];
  },
  storeTestData: function(testData) {
    this.uuidNext++;
    this.testsData['uuid' + this.uuidNext] = testData;
    return this.uuidNext;
  }
}

var testData = new TestsData();

module.exports = {
  TestsData: testData,
  TestsManager: TestsManager,
  testsDb: testsDb,
}