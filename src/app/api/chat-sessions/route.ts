import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db/mongoose";
import { ChatSession } from "@/lib/db/models";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const sessions = await ChatSession.find({ userId: session.user.id })
      .sort({ updatedAt: -1 })
      .select("title context updatedAt messages")
      .lean();

    const list = sessions.map((s) => ({
      _id: s._id,
      title: s.title,
      destination: s.context?.destination || "General",
      lastMessage:
        s.messages?.length > 0
          ? s.messages[s.messages.length - 1].content.slice(0, 80)
          : "",
      messageCount: s.messages?.length || 0,
      updatedAt: s.updatedAt,
    }));

    return NextResponse.json({ sessions: list });
  } catch (error) {
    console.error("Chat sessions list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat sessions" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, messages, context, tripId } = body;

    await connectDB();

    if (body.sessionId) {
      const existing = await ChatSession.findOne({
        _id: body.sessionId,
        userId: session.user.id,
      });

      if (!existing) {
        return NextResponse.json(
          { error: "Session not found" },
          { status: 404 }
        );
      }

      if (messages && Array.isArray(messages)) {
        existing.messages = messages;
      }
      if (title) existing.title = title;
      if (context) existing.context = context;
      await existing.save();

      return NextResponse.json({ session: existing });
    }

    const chatSession = await ChatSession.create({
      userId: session.user.id,
      tripId,
      title: title || `Trip to ${context?.destination || "Somewhere"}`,
      messages: messages || [],
      context: context || {},
    });

    return NextResponse.json({ session: chatSession }, { status: 201 });
  } catch (error) {
    console.error("Chat session save error:", error);
    return NextResponse.json(
      { error: "Failed to save chat session" },
      { status: 500 }
    );
  }
}
