import { getSession } from "next-auth/react";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const client = await clientPromise;
  const messages = client.db("chat-app").collection("messages");

  // GET: 특정 채팅방의 메시지 조회
  if (req.method === "GET") {
    try {
      const { roomId } = req.query;
      
      if (!roomId) {
        return res.status(400).json({ error: "Room ID is required" });
      }

      const roomMessages = await messages
        .find({ roomId: new ObjectId(roomId) })
        .sort({ createdAt: 1 }) // 오래된 메시지부터 정렬
        .limit(50) // 최근 50개 메시지만 가져오기
        .toArray();

      return res.status(200).json(roomMessages);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch messages" });
    }
  }

  // POST: 새로운 메시지 저장
  if (req.method === "POST") {
    try {
      const { roomId, content } = req.body;

      const message = await messages.insertOne({
        roomId: new ObjectId(roomId),
        content,
        senderId: new ObjectId(session.user.id),
        createdAt: new Date()
      });

      return res.status(201).json({ 
        messageId: message.insertedId, 
        message: "Message sent successfully" 
      });
    } catch (error) {
      return res.status(500).json({ error: "Failed to send message" });
    }
  }

  // 지원하지 않는 HTTP 메소드 처리
  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}