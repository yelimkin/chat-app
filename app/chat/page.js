"use client"

import { useState, useEffect } from "react";

export default function ChatRoomList() {
  const [rooms, setRooms] = useState([]);
  
  useEffect(() => {
    // 채팅방 목록 불러오기
    async function fetchRooms() {
      const response = await fetch('/api/chat/rooms');
      const data = await response.json();
      setRooms(data);
    }
    fetchRooms();
  }, []);
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">내 채팅방</h1>
      {rooms.map(room => (
        <Link href={`/chat/${room._id}`} key={room._id}>
          <div className="p-4 border-b hover:bg-gray-100">
            {room.name}
          </div>
        </Link>
      ))}
    </div>
  );
}