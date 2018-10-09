import browserFeatures from 'browser-features';
import webglInfo from 'webgl-info';
import {generateUUID, hashToUUID} from './UUID';
import ResultsServer from './results-server';
import queryString from 'query-string';
import {addGET, yyyymmddhhmmss} from './utils';

const parameters = queryString.parse(location.search);

const VERSION = '1.0';

export default class TestApp {
  parseParameters() {
    const parameters = queryString.parse(location.search);
    if (parameters['numtimes']) {
      this.vueApp.options.general.numTimesToRunEachTest = parseInt(parameters.numtimes);
    }

    if (typeof parameters['fake-webgl'] !== 'undefined') {
      this.vueApp.options.tests.fakeWebGL = true;
    }
    
    if (parameters['selected']) {
      const selected = parameters['selected'].split(',');
      this.vueApp.tests.forEach(test => test.selected = false);
      selected.forEach(id => {
        var test = this.vueApp.tests.find(test => test.id === id);
        if (test) test.selected = true;
      })
    }

  }

  constructor(vueApp) {
    console.log(`Test App v.${VERSION}`);

    this.vueApp = vueApp;
    this.tests = [];
    this.isCurrentlyRunningTest = false;
    this.browserUUID = null;
    this.currentlyRunningTest = {};
    this.resultsServer = new ResultsServer();
    this.testsQueuedToRun = [];
    this.progress = null;

    fetch('tests.json')
      .then(response => { return response.json(); })
      .then(json => {
        json.forEach(test => {
          test.selected = true;
        });
        this.tests = vueApp.tests = json;

        this.parseParameters();
        this.autoRun();
      })

    this.initWSServer();

    this.webglInfo = vueApp.webglInfo = webglInfo();
    browserFeatures(features => {
      this.browserInfo = vueApp.browserInfo = features;
      this.onBrowserResultsReceived({});
    });
  }

  initWSServer() {
    var serverUrl = 'http://localhost:8888';

    this.socket = io.connect(serverUrl);
  
    this.socket.on('connect', function(data) {
      console.log('Connected to testing server');
    });
    
    this.socket.on('benchmark_finished', (result) => {
      result.json = JSON.stringify(result, null, 4);
      var options = JSON.parse(JSON.stringify(this.vueApp.options.tests));

      // To remove options 
      delete options.fakeWebGL;
      delete options.showKeys;
      delete options.showMouse;
      delete options.noCloseOnFail;

      result.options = options;

      var testResults = {
        result: result
      };
      testResults.browserUUID = this.browserUUID;
      testResults.startTime = this.currentlyRunningTest.startTime;
      testResults.fakeWebGL = this.currentlyRunningTest.fakeWebGL;
      //testResults.id = this.currentlyRunningTest.id;
      testResults.finishTime = yyyymmddhhmmss();
      testResults.name = this.currentlyRunningTest.name;
      testResults.runUUID = this.currentlyRunningTest.runUUID;
      //if (browserInfo.nativeSystemInfo && browserInfo.nativeSystemInfo.UUID) testResults.hardwareUUID = browserInfo.nativeSystemInfo.UUID;
      testResults.runOrdinal = this.vueApp.resultsById[testResults.id] ? (this.vueApp.resultsById[testResults.id].length + 1) : 1;
      this.resultsServer.storeTestResults(testResults);

      // Accumulate results in dictionary.
      //if (testResults.result != 'FAIL') 
      {
        if (!this.vueApp.resultsById[result.test_id]) this.vueApp.resultsById[result.test_id] = [];
        this.vueApp.resultsById[result.test_id].push(testResults);
      }

      // Average
      this.vueApp.resultsAverage = [];
  
      Object.keys(this.vueApp.resultsById).forEach(testID => {
        var results = this.vueApp.resultsById[testID];
        if (results.length > 1) {
          var testResultsAverage = {};
          testResultsAverage.test_id = `${testID} (${results.length} samples)`;
        
          function get70PercentAverage(getField) {
            function get70PercentArray() {
              function cmp(a, b) {
                return getField(a) - getField(b);
              }
              if (results.length <= 3) return results.slice(0);
              var frac = Math.round(0.7 * results.length);
              var resultsC = results.slice(0);
              resultsC.sort(cmp);
              var numElementsToRemove = results.length - frac;
              var numElementsToRemoveFront = Math.floor(numElementsToRemove/2);
              var numElementsToRemoveBack = numElementsToRemove - numElementsToRemoveFront;
              return resultsC.slice(numElementsToRemoveFront, resultsC.length - numElementsToRemoveBack);
            }
            var arr = get70PercentArray();
            var total = 0;
            for(var i = 0; i < arr.length; ++i) total += getField(arr[i]);
            return total / arr.length;
          }  
          testResultsAverage.totalTime = get70PercentAverage(function(p) { return p.result.totalTime; });
          testResultsAverage.cpuIdlePerc = get70PercentAverage(function(p) { return p.result.cpuIdlePerc; });
          testResultsAverage.cpuIdleTime = get70PercentAverage(function(p) { return p.result.cpuIdleTime; });
          testResultsAverage.cpuTime = get70PercentAverage(function(p) { return p.result.cpuTime; });
          testResultsAverage.pageLoadTime = get70PercentAverage(function(p) { return p.result.pageLoadTime; });
          testResultsAverage.avgFps = get70PercentAverage(function(p) { return p.result.avgFps; });
          testResultsAverage.timeToFirstFrame = get70PercentAverage(function(p) { return p.result.timeToFirstFrame; });
          testResultsAverage.numStutterEvents = get70PercentAverage(function(p) { return p.result.numStutterEvents; });
          /*totalRenderTime     totalTime*/
          this.vueApp.resultsAverage.push(testResultsAverage);
        }
      });
    

      this.vueApp.results.push(result);
      /*
      if (runningTestsInProgress) {
        var testStarted = runNextQueuedTest();
        if (!testStarted) {
          if (tortureMode) {
            testsQueuedToRun = getSelectedTests();
            runSelectedTests();
          } else {
            runningTestsInProgress = false;
            currentlyRunningTest = null;
          }
        }
      } else {
        currentlyRunningTest = null;
      }
      */
      this.runNextQueuedTest();
    });
    
    this.socket.on('error', (error) => {
      console.log(error);
    });
    
    this.socket.on('connect_error', (error) => {
      console.log(error);
    });  
  }

  onBrowserResultsReceived() {
    console.log('Browser UUID:', this.getBrowserUUID());
    var systemInfo = {
      browserUUID: this.browserUUID,
      webglInfo: this.webglInfo,
      browserInfo: this.browserInfo
    };

    this.resultsServer.storeSystemInfo(systemInfo);
  }

  runSelectedTests() {
    this.testsQueuedToRun = this.tests.filter(x => x.selected);
    
    //if (data.numTimesToRunEachTest > 1) {
    //  data.numTimesToRunEachTest = Math.max(data.numTimesToRunEachTest, 1000);
    const numTimesToRunEachTest = this.vueApp.options.general.numTimesToRunEachTest;
    this.progress = {
      totalGlobal: numTimesToRunEachTest * this.testsQueuedToRun.length,
      currentGlobal: 1,
      tests: {}
    };

    {
      var multiples = [];
      for(var i = 0; i < this.testsQueuedToRun.length; i++) {
        for(var j = 0; j < numTimesToRunEachTest; j++) {
          multiples.push(this.testsQueuedToRun[i]);
          this.progress.tests[this.testsQueuedToRun[i].id] = {
            current: 1,
            total: numTimesToRunEachTest
          }
        }
      }
      this.testsQueuedToRun = multiples;
    }

    this.runningTestsInProgress = true;
    this.runNextQueuedTest();
  }
  
  runNextQueuedTest() {  
    if (this.testsQueuedToRun.length == 0) {
      this.progress = null;
      return false;
    }
    var t = this.testsQueuedToRun[ 0 ];
    this.testsQueuedToRun.splice(0, 1);
    this.runTest(t.id, false);
    return true;
  }

  getBrowserUUID() {
    var hardwareUUID = '';
    if (this.nativeSystemInfo && this.nativeSystemInfo.UUID) {
      hardwareUUID = this.nativeSystemInfo.UUID;
    } else {
      hardwareUUID = localStorage.getItem('UUID');
      if (!hardwareUUID) {
        hardwareUUID = generateUUID();
        localStorage.setItem('UUID', hardwareUUID);
      }
    }
  
    // We now have all the info to compute the browser UUID
    var browserUUIDString = hardwareUUID + (this.browserInfo.userAgent.browserVersion || '') + (this.browserInfo.navigator.buildID || '');
    this.browserUUID = hashToUUID(browserUUIDString);

    return this.browserUUID;
  }

  runTest(id, interactive, record) {
    var test = this.tests.find(t => t.id === id);
    if (!test) {
      console.error('Test not found, id:', id);
      return;
    }
    console.log('Running test:', test.name);
  
    var fakeWebGL = this.vueApp.options.tests.fakeWebGL;
    this.currentlyRunningTest.test = test;
    this.currentlyRunningTest.startTime = yyyymmddhhmmss();
    this.currentlyRunningTest.runUUID = generateUUID();
    this.currentlyRunningTest.fakeWebGL = fakeWebGL;
    
    var url = (interactive ? 'static/': 'tests/') + test.url;
    if (!interactive) url = addGET(url, 'playback');
    if (fakeWebGL) url = addGET(url, 'fake-webgl');
    if (test.numframes) url = addGET(url, 'numframes=' + test.numframes);
    if (test.windowsize) url = addGET(url, 'width=' + test.windowsize.width + '&height=' + test.windowsize.height);
    if (record) {
      url = addGET(url, 'recording');
    } else if (test.input) {
      url = addGET(url, 'replay');
      if (this.vueApp.options.tests.showKeys) url = addGET(url, 'show-keys');
      if (this.vueApp.options.tests.showMouse) url = addGET(url, 'show-mouse');
    }

    if (this.vueApp.options.tests.noCloseOnFail) url = addGET(url, 'no-close-on-fail');
    if (test.skipReferenceImageTest) url = addGET(url, 'skip-reference-image-test');
    if (test.referenceImage) url = addGET(url, 'reference-image');

    if (this.progress) {
      url = addGET(url, 'order-test=' + this.progress.tests[id].current + '&total-test=' + this.progress.tests[id].total);
      url = addGET(url, 'order-global=' + this.progress.currentGlobal + '&total-global=' + this.progress.totalGlobal);
      this.progress.tests[id].current++;
      this.progress.currentGlobal++;
    }

    window.open(url);
  
    var testData = {
      'browserUUID': this.browserUUID,
      'id': test.id,
      'name': test.name,
      'startTime': yyyymmddhhmmss(),
      'result': 'unfinished',
      //'FakeWebGL': data.options.fakeWebGL,
      'runUUID': this.currentlyRunningTest.runUUID,
      'runOrdinal': this.vueApp.resultsById[test.id] ? (this.vueApp.resultsById[test.id].length + 1) : 1
    };
  
    //if (data.nativeSystemInfo && data.nativeSystemInfo.UUID) testData.hardwareUUID = data.nativeSystemInfo.UUID;
    //this.resultsServer.storeStart(testData);
  }
  
  autoRun() {
    if (!this.isCurrentlyRunningTest && location.search.toLowerCase().indexOf('autorun') !== -1) {
      this.runSelectedTests();
    }
  } 
}

/*
  // Fetch information about native system if we are running as localhost.
  function fetchNativeSystemInfo() {
    var promise = new Promise(function(resolve, reject) {
      var nativeSystemInfo = null;
      var systemInfo = new XMLHttpRequest();
      systemInfo.onreadystatechange = function() {
        if (systemInfo.readyState != 4) return;
        var nativeSystemInfo = JSON.parse(systemInfo.responseText);
        resolve(nativeSystemInfo);
      }
      systemInfo.open('POST', 'system_info', true);
      systemInfo.send();
    });
    return promise;
  }

var nativeInfoPromise;
if (location.href.indexOf('http://localhost') == 0) {
  nativeInfoPromise = fetchNativeSystemInfo();
} else {
  nativeInfoPromise = new Promise(function(resolve, reject) { setTimeout(function() { resolve(); }, 1); });
}

Promise.all([browserInfoPromise, nativeInfoPromise]).then(function(allResults) {
  var browserInfo = allResults[0];
  var nativeInfo = allResults[1];
  if (nativeInfo) {
    browserInfo['nativeSystemInfo'] = nativeInfo['system'];
    browserInfo['browserInfo'] = nativeInfo['browser'];
  }
  browserInfo['browserUUID'] = browserUUID;
  onBrowserResultsReceived(browserInfo);
}, function() {
  console.error('browser info test failed!');
});
*/

