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
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('[Socket] Baglandi:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Ayrildi:', reason);
  });

  socket.on('connect_error', (err) => {
    console.error('[Socket] Baglanti hatasi:', err.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
