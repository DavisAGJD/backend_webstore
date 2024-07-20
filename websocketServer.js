const WebSocket = require('ws');

function startWebSocketServer(server) {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    console.log('WebSocket connection established');

    ws.on('message', (message) => {
      console.log('received: %s', message);
    });

    ws.on('close', (code, reason) => {
      console.log('WebSocket connection closed: ', code, reason);
    });

    ws.send('Welcome to WebSocket server');
  });

  wss.on('error', (error) => {
    console.error('WebSocket server error: ', error);
  });
}

module.exports = startWebSocketServer;
