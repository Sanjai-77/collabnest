import { io } from 'socket.io-client';
import { API_BASE_URL } from './api';

const socket = io(API_BASE_URL, {
  transports: ['websocket'],
  withCredentials: true,
  autoConnect: false, // Recommended to connect manually after logic
});

export default socket;
