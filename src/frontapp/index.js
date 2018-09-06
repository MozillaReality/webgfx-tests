import TestApp from './app';

var data = {
  tests: [],
  show_json: false,
  browserInfo: null,
  webglInfo: null,
  numTimesToRunEachTest: 10,
  nativeSystemInfo: {},
  options: {
    fakeGL: false,
  },
  results: []
};

var vueApp = new Vue({
  el: '#app',
  data: data,
  methods: {
    runTest: function(test, interactive) {
      testApp.runTest(test.id, interactive);
    },
    runSelectedTests: function() {
      console.log('<<<<');
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
