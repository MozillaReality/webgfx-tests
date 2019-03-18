import TestApp from './app';

var data = {
  tests: [],
  filter: '',
  show_json: false,
  browserInfo: null,
  webglInfo: null,
  nativeSystemInfo: {},
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
  checkedTests: [],
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
      prettyPrint(value) {
        return prettyPrintJson.toHtml(value);
      },
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
        return data.browserInfo ? data.browserInfo : 'Checking browser features...';
      }
    },
    computed: {
      selectedTests () {
        return this.checkedTests; // @todo Apply filter here too
      },
      filteredTests() {
        var filter = this.filter.toLowerCase();
        return this.tests.filter(test => {
          return test.id && test.id.toLowerCase().indexOf(filter) > -1 ||
          test.engine && test.engine.toLowerCase().indexOf(filter) > -1 ||
          test.apis && test.apis.join(' ').toLowerCase().indexOf(filter) > -1 ||
          test.name && test.name.toLowerCase().indexOf(filter) > -1;
       })
      }
    }
  });

  testApp = new TestApp(vueApp);

}
