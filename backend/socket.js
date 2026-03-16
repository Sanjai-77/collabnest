let io;

module.exports = {
  init: (server, allowedOrigins) => {
    const { Server } = require('socket.io');
    io = new Server(server, {
      cors: {
        origin: allowedOrigins,
        credentials: true,
      },
    });
    return io;
  },
  getIo: () => {
    if (!io) {
      throw new Error('Socket.io not initialized');
    }
    return io;
  },
};
