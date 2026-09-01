import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

// Backend REST API http://localhost:5000/api pe hai, Socket.IO usi server
// (bina /api prefix ke) pe chalta hai.
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

// Chat page ke liye socket connection - JWT access token se authenticate
// hota hai (backend/src/sockets/chat.socket.js dekho). Sirf logged-in hone
// pe connect hota hai, page/app se hatte hi disconnect ho jaata hai.
export function useChatSocket() {
  const { isAuthenticated } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    const token = localStorage.getItem('accessToken');
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated]);

  return { socket: socketRef, connected };
}
