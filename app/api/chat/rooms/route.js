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
    const { name, participants } = await request.json();
    const client = await clientPromise;
    const rooms = client.db("chat-app").collection("rooms");
    
    const room = await rooms.insertOne({
      name,
      participants: [...participants, session.user.id],
      createdAt: new Date(),
      createdBy: session.user.id
    });

    return NextResponse.json({ roomId: room.insertedId });
  } catch (error) {
    return NextResponse.json({ error: "Error creating room" }, { status: 500 });
  }
}