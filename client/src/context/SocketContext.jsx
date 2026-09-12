import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
const SocketContext = createContext();
export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  useEffect(() => {
    if (!user) return;
    const newSocket = io('http://localhost:5000');
    newSocket.on('connect', () => {
      newSocket.emit('user_online', user.id);
    });
    newSocket.on('online_users', (userIds) => {
      setOnlineUsers(userIds);
    });
    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, [user]);
  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {' '}
      {children}{' '}
    </SocketContext.Provider>
  );
}
export function useSocket() {
  return useContext(SocketContext);
}
