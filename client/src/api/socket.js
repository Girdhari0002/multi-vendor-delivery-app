import { io } from 'socket.io-client';

const SOCKET_URL = (import.meta.env.VITE_SERVER_API || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

let socket = null;

// Returns a shared, lazily-created socket connection so pages don't each open their own.
export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });
  }
  return socket;
};
