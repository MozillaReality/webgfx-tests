var http = require('http');
const https = require('https');
const fs = require('fs');
const PrettyPrint = require('../prettyprint');
const chalk = require('chalk');

//function initWebSocketServer(port, testFinishedCallback, verbose) {
function initWebSocketServer(port, callbacks, verbose, secure) {
  verbose = verbose || false;
  port = port || 8888;

  function log(msg) {
    //if (verbose)
    {
      console.log(msg);
    }
  }

  const app = (req, res) => {
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
  };

  let server;
  if (secure) {
    if (!fs.existsSync('./key.pem') || !fs.existsSync('./cert.pem')) {
      console.log('You need key.pem and cert.pem files to run HTTPS server.');
    }
    server = https.createServer({
      key: fs.readFileSync('./key.pem', 'utf8'),
      cert: fs.readFileSync('./cert.pem', 'utf8')
    }, app);
  } else {
    server = http.createServer(app);
  }

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
      if (callbacks && callbacks.testFinished) {
        callbacks.testStarted(data);
      }
      log(`  - Test started: ${chalk.yellow(data.id)}`);
    });

    socket.on('test_finish', function (data) {
      var res = data.result === 'pass' ? chalk.green('pass') : chalk.red(`failed (${data.failReason})`);
      if (data.totalTime) {
        log(`  - Completed in ${ data.totalTime.toFixed(2) }ms. Result: ${res}`);
      }

      if (callbacks && callbacks.testFinished) {
        callbacks.testFinished(data, io);
      }
    });

  });

  server.listen(port, function () {
    log('* WebSocket results server listening on *:' + port);
  });

  return {
    server: server,
    io: io
  }
}

module.exports = initWebSocketServer;