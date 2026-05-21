import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:4000', {
      transports: ['websocket'],
      withCredentials: true,
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
