import TestApp from './app';

var data = {
  tests: [],
  show_json: false,
  browserInfo: null,
  webglInfo: null,
  nativeSystemInfo: {},
  showInfo: false,
  options: {
    general: {
      numTimesToRunEachTest: 1,
    },
    tests: {
      fakeWebGL: false,
      showKeys: false,
      showMouse: false,
      noCloseOnFail: false
    }
  },
  results: [],
  resultsAverage: [],
  resultsById: {}
};

var testApp = null;

window.onload = (x) => {
  var vueApp = new Vue({
    el: '#app',
    data: data,
    methods: {
      formatNumeric(value) {
        return value.toFixed(2);
      },
      runTest: function(test, interactive, recording) {
        testApp.testsQueuedToRun = [];
        var mode = interactive ? 'interactive' : (recording ? 'record' : 'replay');
        testApp.testsManager.runTest(test.id, mode, data.options.tests);
      },
      runSelectedTests: function() {
        testApp.runSelectedTests();
      },
      getBrowserInfo: function () {
        return data.browserInfo ? JSON.stringify(data.browserInfo, null, 4) : 'Checking browser features...';
      }
    }
  });
  
  testApp = new TestApp(vueApp);

}
