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

    const { section, vote } = await request.json();

    const validSections = ["itinerary", "flights", "hotels", "budget", "localTips"];
    if (!validSections.includes(section)) {
      return NextResponse.json({ error: "Invalid section" }, { status: 400 });
    }
    if (!["up", "down"].includes(vote)) {
      return NextResponse.json({ error: "Invalid vote" }, { status: 400 });
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

    trip.votes = trip.votes || [];

    const existingIdx = trip.votes.findIndex(
      (v: { userId: string; section: string }) =>
        v.userId === session.user!.id && v.section === section
    );

    if (existingIdx >= 0) {
      if (trip.votes[existingIdx].vote === vote) {
        trip.votes.splice(existingIdx, 1);
      } else {
        trip.votes[existingIdx].vote = vote;
      }
    } else {
      trip.votes.push({
        userId: session.user.id,
        section,
        vote,
      });
    }

    await trip.save();

    const sectionVotes = trip.votes.filter(
      (v: { section: string }) => v.section === section
    );
    const upCount = sectionVotes.filter((v: { vote: string }) => v.vote === "up").length;
    const downCount = sectionVotes.filter((v: { vote: string }) => v.vote === "down").length;

    return NextResponse.json({
      section,
      upCount,
      downCount,
      userVote: trip.votes.find(
        (v: { userId: string; section: string }) =>
          v.userId === session.user!.id && v.section === section
      )?.vote || null,
    });
  } catch (error) {
    console.error("Vote route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
