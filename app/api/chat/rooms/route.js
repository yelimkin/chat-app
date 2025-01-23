import { getSession } from "next-auth/react";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const client = await clientPromise;
  const rooms = client.db("chat-app").collection("rooms");

  // GET: 사용자가 참여한 채팅방 조회
  if (req.method === "GET") {
    try {
      const userRooms = await rooms.find({
        participants: session.user.id
      }).toArray();

      return res.status(200).json(userRooms);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch rooms" });
    }
  }

  // POST: 새로운 채팅방 생성
  if (req.method === "POST") {
    try {
      const { name, participants = [] } = req.body;

      // 참여자 목록에 현재 사용자 추가
      const allParticipants = [
        ...new Set([...participants, session.user.id])
      ];

      const room = await rooms.insertOne({
        name: name || "New Chat Room",
        participants: allParticipants.map(id => new ObjectId(id)),
        createdAt: new Date(),
        createdBy: new ObjectId(session.user.id)
      });

      return res.status(201).json({ 
        roomId: room.insertedId, 
        message: "Room created successfully" 
      });
    } catch (error) {
      return res.status(500).json({ error: "Failed to create room" });
    }
  }

  // 지원하지 않는 HTTP 메소드 처리
  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}