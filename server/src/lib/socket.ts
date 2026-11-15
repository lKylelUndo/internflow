import { Server } from 'socket.io';
import type { Server as HttpServer } from 'http';

// Minimal Socket.IO bootstrap — mirrors the alumnai pattern.
// Extend here with room routing (user:{id}, role:*) and cookie-based
// handshake auth once the auth module exists.
export const initSocket = (server: HttpServer, frontendUrl: string) => {
  const io = new Server(server, {
    cors: {
      origin: frontendUrl,
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};
