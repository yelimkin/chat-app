import { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { io } from 'socket.io-client';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);

  const { data: session } = useSession();
  const token = session?.token;

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL, {
      auth: {
        token: token// Get your auth token here
      }
    });

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socket.on('message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    setSocket(socket);

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = async (roomId, content) => {
    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, content })
      });

      if (!response.ok) throw new Error('Failed to send message');
      
      // WebSocket server will handle broadcasting to other clients
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <ChatContext.Provider value={{ socket, messages, sendMessage }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within ChatProvider');
  return context;
};