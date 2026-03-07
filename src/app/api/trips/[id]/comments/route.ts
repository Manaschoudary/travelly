import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db/mongoose";
import { Trip } from "@/lib/db/models";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { section = "general", content } = await request.json();
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "Comment content is required" }, { status: 400 });
    }

    const validSections = ["itinerary", "flights", "hotels", "budget", "localTips", "general"];
    if (!validSections.includes(section)) {
      return NextResponse.json({ error: "Invalid section" }, { status: 400 });
    }

    const { id } = await params;
    await connectDB();

    const trip = await Trip.findOne({
      _id: id,
      $or: [
        { userId: session.user.id },
        { "collaborators.userId": session.user.id, "collaborators.status": "accepted" },
      ],
    });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found or no access" }, { status: 404 });
    }

    trip.comments = trip.comments || [];
    trip.comments.push({
      userId: session.user.id,
      userName: session.user.name || "Anonymous",
      section,
      content: content.trim(),
      createdAt: new Date(),
    });
    await trip.save();

    const newComment = trip.comments[trip.comments.length - 1];
    return NextResponse.json({ comment: newComment }, { status: 201 });
  } catch (error) {
    console.error("Comments POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const trip = await Trip.findOne({
      _id: id,
      $or: [
        { userId: session.user.id },
        { "collaborators.userId": session.user.id, "collaborators.status": "accepted" },
        { shareToken: { $exists: true } },
      ],
    }).lean();

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    return NextResponse.json({ comments: trip.comments || [] });
  } catch (error) {
    console.error("Comments GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
