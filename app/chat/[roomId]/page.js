"use client"

import { useState, useEffect } from "react";

export default function ChatRoom({ roomId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  useEffect(() => {
    // 메시지 불러오기
    async function fetchMessages() {
      const response = await fetch(`/api/chat/messages?roomId=${roomId}`);
      const data = await response.json();
      setMessages(data);
    }
    fetchMessages();
  }, [roomId]);
  
  const sendMessage = async () => {
    await fetch('/api/chat/messages', {
      method: 'POST',
      body: JSON.stringify({ roomId, content: newMessage })
    });
    setNewMessage('');
  };
  
  return (
    <div className="flex flex-col h-screen">
      <div className="flex-grow overflow-y-auto p-4">
        {messages.map(msg => (
          <div 
            key={msg._id} 
            className={`mb-2 p-2 rounded ${
              msg.senderId === currentUser.id 
                ? 'bg-blue-100 self-end' 
                : 'bg-gray-100 self-start'
            }`}
          >
            {msg.content}
          </div>
        ))}
      </div>
      <div className="p-4 border-t flex">
        <input 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-grow p-2 border rounded"
        />
        <button 
          onClick={sendMessage} 
          className="ml-2 bg-blue-500 text-white p-2 rounded"
        >
          보내기
        </button>
      </div>
    </div>
  );
}