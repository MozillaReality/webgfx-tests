import {yyyymmddhhmmss} from '../../frontapp/utils';
import {generateUUID, hashToUUID} from '../../frontapp/UUID';
import {buildTestURL} from './common';

export function TestsManagerBrowser(tests, options) {
  this.tests = tests;
  this.options = options;
  this.currentlyRunningTest = {};
  this.testsQueuedToRun = [];
  this.progress = null;
}

TestsManagerBrowser.prototype = {
  runFiltered: function(filterFn, generalOptions, testsOptions) {
    this.options = testsOptions; // ?
    this.selectedTests = this.tests.filter(filterFn);
    const numTimesToRunEachTest = Math.min(Math.max(parseInt(generalOptions.numTimesToRunEachTest), 1), 1000); // Clamp
    this.progress = {
      totalGlobal: numTimesToRunEachTest * this.selectedTests.length,
      currentGlobal: 1,
      tests: {}
    };
      
    this.testsQueuedToRun = [];
  
    for(var i = 0; i < this.selectedTests.length; i++) {
      for(var j = 0; j < numTimesToRunEachTest; j++) {
        this.testsQueuedToRun.push(this.selectedTests[i]);
        this.progress.tests[this.selectedTests[i].id] = {
          current: 1,
          total: numTimesToRunEachTest
        }
      }
    }
  
    this.runningTestsInProgress = true;
  
    console.log('Browser tests', this.testsQueuedToRun);
    this.runNextQueuedTest();
  },
  runNextQueuedTest: function() {
    if (this.testsQueuedToRun.length == 0) {
      this.progress = null;
      console.log('Finished!');
      return false;
    }
    var t = this.testsQueuedToRun[ 0 ];
    this.testsQueuedToRun.splice(0, 1);
    this.runTest(t.id, 'replay', this.options);
    return true;
  },

  runTest: function(id, mode, options) {
    var test = this.tests.find(t => t.id === id);
    if (!test) {
      console.error('Test not found, id:', id);
      return;
    }
    console.log('Running test:', test.name);

    const baseURL = 'http://localhost:3000/';
    const url = buildTestURL(baseURL, test, mode, options, this.progress);
  
    this.currentlyRunningTest.test = test;
    this.currentlyRunningTest.startTime = yyyymmddhhmmss();
    this.currentlyRunningTest.runUUID = generateUUID();
    this.currentlyRunningTest.options = options;
    
    if (this.progress) {
      this.progress.tests[id].current++;
      this.progress.currentGlobal++;
    }

    window.open(url);
  /*
    var testData = {
      'browserUUID': this.browserUUID,
      'id': test.id,
      'name': test.name,
      'startTime': yyyymmddhhmmss(),
      'result': 'unfinished',
      //'FakeWebGL': data.options.fakeWebGL,
      'runUUID': this.currentlyRunningTest.runUUID,
      //!!!!!!!!!! 'runOrdinal': this.vueApp.resultsById[test.id] ? (this.vueApp.resultsById[test.id].length + 1) : 1
    };
  
    //if (data.nativeSystemInfo && data.nativeSystemInfo.UUID) testData.hardwareUUID = data.nativeSystemInfo.UUID;
    //this.resultsServer.storeStart(testData);
  */
  }
  

}