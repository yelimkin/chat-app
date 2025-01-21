import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import clientPromise from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { roomId, content } = await request.json();
    const client = await clientPromise;
    const messages = client.db("chat-app").collection("messages");
    
    const message = await messages.insertOne({
      roomId,
      content,
      senderId: session.user.id,
      createdAt: new Date()
    });

    // Here you would also emit a websocket event for real-time updates
    
    return NextResponse.json({ messageId: message.insertedId });
  } catch (error) {
    return NextResponse.json({ error: "Error sending message" }, { status: 500 });
  }
}