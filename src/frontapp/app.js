import browserFeatures from 'browser-features';
import webglInfo from 'webgl-info';
import jsSHA from 'jssha';
import generateUUID from './uuid';
import ResultsServer from './results-server';

function addGET(url, parameter) {
  if (url.indexOf('?') != -1) return url + '&' + parameter;
  else return url + '?' + parameter;
}


// Hashes the given text to a UUID string of form 'xxxxxxxx-yyyy-zzzz-wwww-aaaaaaaaaaaa'.
function hashToUUID(text) {
  var shaObj = new jsSHA('SHA-256', 'TEXT');
  shaObj.update(text);
  return shaObj.getHash('HEX');
  /*
  var hash = shaObj.getHash('ARRAYBUFFER');
  var n = '';
  for(var i = 0; i < hash.byteLength/2; ++i) {
    var s = (hash[i] ^ hash[i+8]).toString(16);
    if (s.length == 1) s = '0' + s;
    n += s;
  }
  return n.slice(0, 8) + '-' + n.slice(8, 12) + '-' + n.slice(12, 16) + '-' + n.slice(16, 20) + '-' + n.slice(20);
  */
}


function yyyymmddhhmmss() {
  var date = new Date();
  var yyyy = date.getFullYear();
  var mm = date.getMonth() < 9 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1); // getMonth() is zero-based
  var dd  = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
  var hh = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
  var min = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
  var sec = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
  return yyyy + '-' + mm + '-' + dd + ' ' + hh + ':' + min + ':' + sec;
}
//import vsyncEstimate from './vsyncestimate';


//var displayRefreshRate = -1;
//vsyncEstimate().then(hz => displayRefreshRate = Math.random(hz));


// Aggregates all test results by test name, e.g. allTestResultsByKey['angrybots'] is an array containing results of each run of that demo.
var allTestResultsByKey = {};

const VERSION = '1.0';

export default class TestApp {
  constructor(vueApp) {
    this.tests = [];
    this.currentlyRunningTest = false;
    this.browserUUID = null;
    this.currentlyRunning = {};
    this.resultsServer = new ResultsServer();
    this.testsQueuedToRun = [];

    this.initWSServer();

    fetch('tests.json')
      .then(response => { return response.json(); })
      .then(json => {
        json.forEach(test => {
          test.selected = true;
        });
        this.tests = vueApp.tests = json;
        this.autoRun();
      });

    this.vueApp = vueApp;
    vueApp.browserInfo = {asdf:1,wer:3};
    console.log(`Test App v.${VERSION}`);
    browserFeatures(features => {
      this.browserInfo = vueApp.browserInfo = features;
      this.onBrowserResultsReceived({});
    });
    vueApp.webglInfo = webglInfo();

  }

  initWSServer() {
    var serverUrl = 'http://localhost:8888';

    this.socket = io.connect(serverUrl);
  
    this.socket.on('connect', function(data) {
      console.log('Connected to testing server');
    });
    
    this.socket.on('benchmark_finished', (result) => {
      result.json = JSON.stringify(result, null, 4);
      console.log(result.json);
      this.vueApp.results.push(result);
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
    //resultsServer.storeSystemInfo();
    //autoRun();
  }
    
  runSelectedTests() {
    this.testsQueuedToRun = this.tests.filter(x => x.selected);
    console.log('>>>>', this.testsQueuedToRun);
    /*
    this.testsQueuedToRun = getSelectedTests();
    */
  
    //if (data.numTimesToRunEachTest > 1) {
    //  data.numTimesToRunEachTest = Math.max(data.numTimesToRunEachTest, 1000);
    const numTimesToRunEachTest = 1;
    {
      var multiples = [];
      for(var i = 0; i < this.testsQueuedToRun.length; i++) {
        for(var j = 0; j < numTimesToRunEachTest; j++) {
          multiples.push(this.testsQueuedToRun[i]);
        }
      }
      this.testsQueuedToRun = multiples;
    }
    this.runningTestsInProgress = true;
    this.runNextQueuedTest();
  }
  
  runNextQueuedTest() {  
    if (this.testsQueuedToRun.length == 0) return false;
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

  runTest(id, interactive) {
    var test = this.tests.find(t => t.id === id);
    if (!test) {
      console.error('Test not found, id:', id);
      return;
    }
    console.log('Running test:', test.name);
  
    this.currentlyRunning.test = test;
    this.currentlyRunning.startTime = new Date();
    this.currentlyRunning.runUUID = generateUUID();
    //this.currentlyRunning.fakeGL = data.options.fakeGL;
    
    var url = (interactive ? 'static/': 'tests/') + test.url;
    if (!interactive) url = addGET(url, 'playback');
    /*
    if (fakeGL) url = addGET(url, 'fakegl');
    if (test.length) url = addGET(url, 'numframes=' + test.length);
    */
    window.open(url);
  
    var testData = {
      'browserUUID': this.browserUUID,
      'id': test.id,
      'name': test.name,
      'startTime': yyyymmddhhmmss(),
      'result': 'unfinished',
      //'fakeGL': data.options.fakeGL,
      'runUUID': this.currentlyRunning.runUUID,
      'runOrdinal': allTestResultsByKey[test.key] ? (allTestResultsByKey[test.id].length + 1) : 1
    };
  
    //if (data.nativeSystemInfo && data.nativeSystemInfo.UUID) testData.hardwareUUID = data.nativeSystemInfo.UUID;
    this.resultsServer.storeStart(testData);
  }
  
  autoRun() {
    if (!this.currentlyRunningTest && location.search.toLowerCase().indexOf('autorun') !== -1) {
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

