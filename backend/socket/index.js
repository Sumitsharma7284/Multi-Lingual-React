const { Server } = require('socket.io');

let io = null;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        // Allow all origins (local dev, Render, Vercel, Railway, mobile clients)
        callback(null, true);
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] New client connected: ${socket.id}`);

    // Join public notifications room
    socket.join('public_orders');

    socket.on('disconnect', (reason) => {
      console.log(`[Socket.IO] Client disconnected (${socket.id}): ${reason}`);
    });
  });

  console.log('[Socket.IO] Real-Time Gateway initialized.');
  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO is not initialized! Call initSocket first.');
  }
  return io;
};

/**
 * Emit real-time notification to all connected public users
 */
const emitNewOrder = (order) => {
  if (!io) return;
  console.log(`[Socket.IO] Broadcasting NEW_GOVERNMENT_ORDER event for Order #${order.orderNumber}`);
  io.to('public_orders').emit('NEW_GOVERNMENT_ORDER', {
    message: 'A new official government order has been published.',
    order,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Emit update notification when an order is updated or status toggled
 */
const emitOrderUpdated = (order) => {
  if (!io) return;
  console.log(`[Socket.IO] Broadcasting ORDER_UPDATED event for Order #${order.orderNumber}`);
  io.to('public_orders').emit('ORDER_UPDATED', {
    order,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Emit deletion notification
 */
const emitOrderDeleted = (orderId) => {
  if (!io) return;
  console.log(`[Socket.IO] Broadcasting ORDER_DELETED event for Order ID: ${orderId}`);
  io.to('public_orders').emit('ORDER_DELETED', {
    orderId,
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  initSocket,
  getIO,
  emitNewOrder,
  emitOrderUpdated,
  emitOrderDeleted,
};
