const tests = [
  {
    "id": "instancing",
    "engine": "three.js",
    "entry": "index.html",
    "name": "instanced circle billboards"
  },
  {
    "id": "billboard_particles",
    "engine": "three.js",
    "entry": "index2.html",
    "name": "instancing demo (single triangle)"
  }
];

var app = new Vue({
  el: '#app',
  data: {
    tests: tests
  }
});      
