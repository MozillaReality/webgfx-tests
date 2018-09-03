import browserFeatures from './browserFeatures';
window.onload = (x) => {
  //console.log(gpuReport());
  browserFeatures(features => data.browser_info = features);
}

const tests = [
  /*
  {
    "id": "instancing",
    "engine": "three.js",
    "url": "threejs/index.html",
    "name": "instanced circle billboards"
  },*/
  {
    "id": "billboard_particles",
    "engine": "three.js",
    "url": "threejs/index2.html",
    "name": "instancing demo (single triangle)"
  },
  {
    "id": "simple",
    "engine": "babylon.js",
    "url": "babylon/simple.html",
    "name": "simple example"
  },
  {
    "id": "playcanvas",
    "engine": "playcanvas",
    "url": "playcanvas/animation.html",
    "name": "animation example"
  }
];

var data = {
  tests: tests,
  show_json: false,
  browser_info: null,
  results: []
};

var app = new Vue({
  el: '#app',
  data: data,
  methods: {
    runTest: function(test, interactive) {
      runTest(test.id, interactive);
    },
    getBrowserInfo: function () {
      return data.browser_info ? JSON.stringify(data.browser_info, null, 4) : 'Checking browser features...';
    }
  }
});      

var testsQueuedToRun = [];

function runSelectedTests() {
  testsQueuedToRun = ['billboard_particles', 'simple', 'playcanvas'];
  /*
  testsQueuedToRun = getSelectedTests();
  var numTimesToRunEachTest = parseInt(document.getElementById('numTimesToRunEachTest').value);
  if (numTimesToRunEachTest > 1) {
    if (numTimesToRunEachTest > 100000) numTimesToRunEachTest = 100000; // Arbitrary max cap

    var multiples = [];
    for(var i = 0; i < testsQueuedToRun.length; ++i) {
      for(var j = 0; j < numTimesToRunEachTest; ++j) {
        multiples.push(testsQueuedToRun[i]);
      }
    }
    testsQueuedToRun = multiples;
  }
  */
 runningTestsInProgress = true;
 runNextQueuedTest();
}

function runNextQueuedTest() {  
  if (testsQueuedToRun.length == 0) return false;
  var t = testsQueuedToRun[ 0 ];
  testsQueuedToRun.splice(0, 1);
  runTest(t, false);
  return true;
}

function runTest(id, interactive) {
  var test = tests.find(t => t.id === id);
  if (!test) {
    console.error('Test not found, id:', id);
    return;
  }
  console.log('Running test: ', test.name);
  /*
  currentlyRunningTest = test;
  currentlyRunningTest.startTime = new Date();
  currentlyRunningTest.runUuid = generateUUID();
  currentlyRunningNoVsync = noVsync && test.noVsync;
  currentlyRunningFakeGL = fakeGL;
  currentlyRunningCpuProfiler = cpuProfiler;
  */
  var url = (interactive ? 'static/': 'tests/') + test.url;
  console.log(url);
  /*
  function addGET(url, get) {
    if (url.indexOf('?') != -1) return url + '&' + get;
    else return url + '?' + get;
  }
  if (!interactive) url = addGET(url, 'playback');
  if (noVsync && test.noVsync) url = addGET(url, 'novsync');
  if (fakeGL) url = addGET(url, 'fakegl');
  if (cpuProfiler) url = addGET(url, 'cpuprofiler');
  if (test.length) url = addGET(url, 'numframes=' + test.length);

  var parallelTortureMode = document.getElementById('parallelTortureMode').checked;
  var numSpawnedWindows = parallelTortureMode ? document.getElementById('numParallelWindows').value : 1;
  */
 var numSpawnedWindows = 1;
  for(var i = 0; i < numSpawnedWindows; ++i) {
    window.open(url);
  }
  /*
  var data = {
    'browserUuid': browserUuid,
    'key': test.key,
    'name': test.name,
    'startTime': new Date().yyyymmddhhmmss(),
    'result': 'unfinished',
    'noVsync': noVsync,
    'fakeGL': fakeGL,
    'cpuProfiler': cpuProfiler,
    'runUuid': currentlyRunningTest.runUuid,
    'runOrdinal': allTestResultsByKey[test.key] ? (allTestResultsByKey[test.key].length + 1) : 1
  };
  if (browserInfo.nativeSystemInfo && browserInfo.nativeSystemInfo.uuid) data.hardwareUuid = browserInfo.nativeSystemInfo.uuid;
  resultsServer_StoreTestStart(data);
  // If chaining parallel and sequential torture modes, uncheck the parallel torture mode checkbox icon so that the new tests don't multiply when finished!
  if (document.getElementById('tortureMode').checked) document.getElementById('parallelTortureMode').checked = false;
  updateNumParallelWindowsEnabled();
  */
}

var serverUrl = 'http://localhost:8888';

function initSocket () {
  var socket = io.connect(serverUrl);

  socket.on('connect', function(data) {
    console.log('Connected to testing server');
  });
  
  socket.on('benchmark_finished', (result) => {
    result.json = JSON.stringify(result, null, 4);
    console.log(result.json);
    data.results.push(result);
    runNextQueuedTest();
  });
  
  socket.on('error', (error) => {
    console.log(error);
  });
  
  socket.on('connect_error', (error) => {
    console.log(error);
  });  
}

initSocket();