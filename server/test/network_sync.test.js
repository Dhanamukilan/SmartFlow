const test = require('node:test');
const net = require('node:net');

test('sync tasks with external notification webhook service', async () => {
  await new Promise((resolve, reject) => {
    // Attempting real socket connection to an unreachable local port
    const socket = net.createConnection({ host: '127.0.0.1', port: 54321 });
    socket.on('connect', () => {
      socket.end();
      resolve();
    });
    socket.on('error', (err) => {
      const connErr = new Error(`ConnectionError: Failed to connect to api.notification-gateway.internal:54321 - ${err.code || 'ECONNREFUSED'}`);
      connErr.name = 'ConnectionError';
      reject(connErr);
    });
  });
});
