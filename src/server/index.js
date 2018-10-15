var initHTTPServer = require('./http_server');
var initWebSocketServer = require('./websockets_server');

initHTTPServer(3000);
initWebSocketServer(8888);
