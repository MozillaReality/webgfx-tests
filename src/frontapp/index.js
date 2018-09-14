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
      numTimesToRunEachTest: 1
    },
    tests: {
      fakeWebGL: false
    }
  },
  results: [],
  resultsAverage: [],
  resultsById: {}
};

var vueApp = new Vue({
  el: '#app',
  data: data,
  methods: {
    formatNumeric(value) {
      return value.toFixed(2);
    },
    runTest: function(test, interactive) {
      testApp.runTest(test.id, interactive);
    },
    runSelectedTests: function() {
      testApp.runSelectedTests();
    },
    getBrowserInfo: function () {
      return data.browserInfo ? JSON.stringify(data.browserInfo, null, 4) : 'Checking browser features...';
    }
  }
});

var testApp = null;
window.onload = (x) => {
  testApp = new TestApp(vueApp);
}
