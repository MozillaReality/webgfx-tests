import browserFeatures from 'browser-features';
import webglInfo from 'webgl-info';
import {generateUUID, hashToUUID} from './uuid';
import ResultsServer from './results-server';
import queryString from 'query-string';
import {TestsManagerBrowser} from '../main/testsmanager/browser';
import {yyyymmddhhmmss} from './utils';


const parameters = queryString.parse(location.search);

const VERSION = '1.0';

export default class TestApp {
  parseParameters() {
    const parameters = queryString.parse(location.search);
    if (parameters['num-times']) {
      this.vueApp.options.general.numTimesToRunEachTest = parseInt(parameters['num-times']);
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
    this.resultsServer = new ResultsServer();
    this.testsQueuedToRun = [];

    fetch('tests.json')
      .then(response => { return response.json(); })
      .then(json => {
        json = json.filter(test => test.available !== false);
        /*
        json.forEach(test => {
          test.selected = true;
        });
        */
        this.tests = vueApp.tests = vueApp.checkedTests = json;
        this.testsManager = new TestsManagerBrowser(this.tests);

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
    
    this.socket.on('test_finished', (result) => {
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
      testResults.startTime = this.testsManager.currentlyRunningTest.startTime;
      testResults.fakeWebGL = this.testsManager.currentlyRunningTest.options.fakeWebGL;
      //testResults.id = this.testsManager.currentlyRunningTest.id;
      testResults.finishTime = yyyymmddhhmmss();
      testResults.name = this.testsManager.currentlyRunningTest.name;
      testResults.runUUID = this.testsManager.currentlyRunningTest.runUUID;
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
          testResultsAverage.test_id = testID;
          testResultsAverage.numSamples = results.length;
        
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
      this.testsManager.runNextQueuedTest();
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
    this.testsManager.runFiltered(
      x => x.selected, 
      this.vueApp.options.general,
      this.vueApp.options.tests
    );
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

  autoRun() {
    if (!this.isCurrentlyRunningTest && location.search.toLowerCase().indexOf('autorun') !== -1) {
      this.runSelectedTests();
    }
  } 
}
