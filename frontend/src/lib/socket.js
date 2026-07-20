import { io } from 'socket.io-client';
import { getAccessToken } from '../api/axiosInstance';

let socket = null;

export const getSocket = () => socket;

export const connectSocket = () => {
  if (socket?.connected) return socket;

  const token = getAccessToken();
  if (!token) return null;

  const url = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';

  socket = io(url, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {});
  socket.on('disconnect', () => {});
  socket.on('connect_error', () => {});

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
