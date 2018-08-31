const tests = [
  {
    "id": "instancing",
    "engine": "three.js",
    "entry": "index.html"
  },
  {
    "id": "billboard_particles",
    "engine": "three.js",
    "entry": "index2.html"
  }
];

var app = new Vue({
  el: '#app',
  data: {
    tests: tests
  }
});      
