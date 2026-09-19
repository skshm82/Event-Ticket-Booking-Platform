const { Server } = require('socket.io');
const { SOCKET_EVENTS } = require('../../../shared/constants');

let io = null;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin)) {
          return callback(null, true);
        }
        return callback(null, false);
      },
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join an event room to receive live seat updates
    socket.on(SOCKET_EVENTS.JOIN_EVENT, ({ eventId }) => {
      socket.join(`event:${eventId}`);
      console.log(`Socket ${socket.id} joined room event:${eventId}`);
    });

    // Leave an event room
    socket.on(SOCKET_EVENTS.LEAVE_EVENT, ({ eventId }) => {
      socket.leave(`event:${eventId}`);
      console.log(`Socket ${socket.id} left room event:${eventId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized. Call initSocket first.');
  }
  return io;
};

module.exports = { initSocket, getIO };
