const fs = require('fs');
const path = require('path');
const internalIp = require('internal-ip');
const chalk = require('chalk');
const buildTestURL = require('./common').buildTestURL;

function addGET(url, parameter) {
  if (url.indexOf('?') != -1) return url + '&' + parameter;
  else return url + '?' + parameter;
}

function loadJSON(path) {
  // @fixme Use async version
  try {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch(err) {
    throw err;
  }  
}

var config = null;
var testsDb = null;

function getConfig(configFile) {
  if (!fs.existsSync(configFile)) {
    return false;
  } else {
    try {
      config = loadJSON(configFile);
      config.path = path.resolve(configFile);
      testsDb = loadJSON(path.join(path.dirname(configFile), config.definitions));
      config.tests = testsDb;  
      return config;  
    } catch(err) {
      return false;
    }
  }
}

function getTestsDb(configFile) {
  if (!testsDb) {
    config = getConfig(configFile);
    if (config === false) {
      return false;
    }
  }
  return testsDb;
}

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
    this.runNextQueuedTest();
  },
  runNextQueuedTest: function() {
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

    // @fixme
    const mode = 'replay';
    const progress = null;

    url = buildTestURL(url, test, mode, options, progress);
    url = addGET(url, 'test-uuid=' + testUUID);
    
    const killOnStart = false; //true;
  
    if (killOnStart) {
      this.device.killBrowser(browser).then(() => {
        this.device.launchBrowser(browser, url); //.then(runNextQueuedTest);
      });  
    } else {
      this.device.launchBrowser(browser, url); //.then(runNextQueuedTest);
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
  getTestsDb: getTestsDb,
  getConfig: getConfig,
  config: config
}