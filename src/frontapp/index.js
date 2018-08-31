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
var data = {
  tests: tests,
  results: []
};

var app = new Vue({
  el: '#app',
  data: data
});      

var serverUrl = 'http://localhost:8888';

this.socket = io.connect(serverUrl);

this.socket.on('connect', function(data) {
  console.log('Connected to testing server');
});

this.socket.on('benchmark_finished', (result) => {
  console.log(result);
  data.results.push(result);
});

this.socket.on('error', (error) => {
  console.log(error);
});

this.socket.on('connect_error', (error) => {
  console.log(error);
});
