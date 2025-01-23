import { getSession } from "next-auth/react";
import clientPromise from "@/lib/db";

export default async function handler(req, res) {
  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const client = await clientPromise;
  const users = client.db("chat-app").collection("users");

  // GET: 모든 사용자 조회 (채팅방 초대 등에 사용)
  if (req.method === "GET") {
    try {
      const allUsers = await users.find({
        _id: { $ne: session.user.id } // 현재 사용자 제외
      }, {
        projection: { password: 0 } // 비밀번호 제외
      }).toArray();

      return res.status(200).json(allUsers);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch users" });
    }
  }

  res.setHeader("Allow", ["GET"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}