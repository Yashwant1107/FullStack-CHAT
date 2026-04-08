import { Server } from 'socket.io';

const getConnectedUserLabel = (socket) => {
  const { fullName, username, userId } = socket.handshake.auth ?? {};
  return fullName || username || userId || socket.id;
};

export let io;

export const getReceiverSocketId = (receiverId) => {
    console.log("Looking up receiver socket for ID:", receiverId, typeof receiverId);
    console.log("Current userSocketMap:", userSocketMap);
    return userSocketMap[receiverId];
}

const userSocketMap = {}; // {userId->socketId}

export const setupSocket = (server, corsOptions) => {
  io = new Server(server, {
    cors: {
      origin: corsOptions.origin,
      methods: ["GET", "POST"],
      credentials: corsOptions.credentials,
    },
  });

  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId || socket.handshake.auth?.userId;
    const userLabel = getConnectedUserLabel(socket);
    
    if (userId) {
        userSocketMap[userId] = socket.id;
    }

    console.log(`User connected: ${userLabel} (${socket.id})`);

    // Emit the list of currently online users to all clients
    io.emit('getOnlineUsers', Object.keys(userSocketMap));

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userLabel} (${socket.id})`);
      if (userId) {
          delete userSocketMap[userId];
      }
      io.emit('getOnlineUsers', Object.keys(userSocketMap));
    });
  });
  






  return io;
};
