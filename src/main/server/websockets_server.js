var http = require('http');
const PrettyPrint = require('../prettyprint');
const chalk = require('chalk');

function initWebSocketServer(port, testFinishedCallback, verbose) {
  verbose = verbose || false;
  port = port || 8888;

  function log(msg) {
    //if (verbose) 
    { 
      console.log(msg); 
    }
  }

  var server = http.createServer(function(req,res){
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
    res.setHeader('Access-Control-Allow-Headers', '*');
    if ( req.method === 'OPTIONS' ) {
      res.writeHead(200);
      res.end();
      return;
    }

    // ...
  });
  var io = require('socket.io').listen(server);

  io.set('origins', '*:*');

  io.sockets.on('connection', function (socket) {
    // log('Client connected');
    socket.on('disconnect', () => {

    });
    
    socket.on('log', (data) => {
      log(`[LOGGER]`, data);
    });

    socket.on('test_started', (data) => {
      log(`  - Test started: ${chalk.yellow(data.id)}`);
    });

    socket.on('test_finish', function (data) {
      var res = data.result === 'pass' ? chalk.green('pass') : chalk.red(`failed (${data.failReason})`);
      log(`  - Completed in ${ data.totalTime.toFixed(2) }ms. Result: ${res}`);
      if (verbose) {
        PrettyPrint.json(data);
      }
      io.emit('test_finished', data);
      if (testFinishedCallback) {
        testFinishedCallback(data);
      }
    });

  });

  server.listen(port, function () {
    log('- WebSocket results server listening on *:' + port);
  });
}

module.exports = initWebSocketServer;