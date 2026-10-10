const WebSocket = require('ws');
const url = require('url');

let clients = {
  storefront: new Set(),
  admin: new Set(),
  orders: new Map() // orderId -> Set of ws clients
};

function initWebSocket(server) {
  const wss = new WebSocket.Server({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const pathname = url.parse(request.url).pathname;
    if (pathname.startsWith('/api/ws')) {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  wss.on('connection', (ws, req) => {
    const pathname = url.parse(req.url).pathname;

    if (pathname === '/api/ws/admin') {
      ws.channel = 'admin';
      clients.admin.add(ws);
    } else if (pathname === '/api/ws/storefront') {
      ws.channel = 'storefront';
      clients.storefront.add(ws);
    } else if (pathname.startsWith('/api/ws/orders/')) {
      const orderId = pathname.split('/').pop();
      ws.channel = 'order';
      ws.orderId = orderId;
      if (!clients.orders.has(orderId)) {
        clients.orders.set(orderId, new Set());
      }
      clients.orders.get(orderId).add(ws);
    }

    ws.on('close', () => {
      if (ws.channel === 'admin') clients.admin.delete(ws);
      if (ws.channel === 'storefront') clients.storefront.delete(ws);
      if (ws.channel === 'order' && clients.orders.has(ws.orderId)) {
        clients.orders.get(ws.orderId).delete(ws);
      }
    });
  });
}

function broadcast(channel, data) {
  const msg = JSON.stringify(data);
  if (channel === 'admin') {
    clients.admin.forEach(c => { if (c.readyState === WebSocket.OPEN) c.send(msg); });
  } else if (channel === 'storefront') {
    clients.storefront.forEach(c => { if (c.readyState === WebSocket.OPEN) c.send(msg); });
  } else if (channel.startsWith('order_')) {
    const orderId = channel.replace('order_', '');
    if (clients.orders.has(orderId)) {
      clients.orders.get(orderId).forEach(c => { if (c.readyState === WebSocket.OPEN) c.send(msg); });
    }
  }
}

module.exports = { initWebSocket, broadcast };
