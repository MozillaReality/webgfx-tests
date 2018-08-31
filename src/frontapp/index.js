const tests = [
  {
    "id": "instancing",
    "engine": "three.js",
    "entry": "/static/index.html"
  },
  {
    "id": "billboard_particles",
    "engine": "three.js",
    "entry": "/tests/index2.html"
  }
];

var app = new Vue({
  el: '#app',
  data: {
    tests: tests
  }
});      
