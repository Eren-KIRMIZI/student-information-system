import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { startSystemMetricsJob } from '../observability/systemMetricsJob.js';

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      credentials: true,
    },
    pingInterval: 25000,
    pingTimeout: 60000,
    maxHttpBufferSize: 1e6,
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Token gerekli'));
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.data.user = { id: payload.sub, role: payload.role, email: payload.email };
      next();
    } catch {
      next(new Error('Token gecersiz'));
    }
  });

  io.on('connection', (socket) => {
    const { id, role } = socket.data.user;
    socket.join(`role:${role.toLowerCase()}`);
    socket.join(`${role.toLowerCase()}:${id}`);
    socket.on('disconnect', () => {});
  });

  startSystemMetricsJob(io);

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket.IO baslatilmamis');
  return io;
};
