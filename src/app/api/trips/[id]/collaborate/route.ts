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

    const { email, role = "editor" } = await request.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!["editor", "viewer"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const { id } = await params;
    await connectDB();

    const trip = await Trip.findOne({ _id: id, userId: session.user.id });
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const existing = trip.collaborators?.find(
      (c: { email: string }) => c.email.toLowerCase() === email.toLowerCase()
    );
    if (existing) {
      return NextResponse.json({ error: "Already invited" }, { status: 409 });
    }

    trip.collaborators = trip.collaborators || [];
    trip.collaborators.push({
      email: email.toLowerCase(),
      role,
      status: "pending",
      invitedAt: new Date(),
    });
    await trip.save();

    return NextResponse.json({
      message: "Invitation sent",
      collaborator: trip.collaborators[trip.collaborators.length - 1],
    });
  } catch (error) {
    console.error("Collaborate route error:", error);
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
        { "collaborators.email": session.user.email, "collaborators.status": "accepted" },
      ],
    }).lean();

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    return NextResponse.json({ collaborators: trip.collaborators || [] });
  } catch (error) {
    console.error("Collaborate GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action } = await request.json();
    if (!["accepted", "declined"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const { id } = await params;
    await connectDB();

    const trip = await Trip.findOne({
      _id: id,
      "collaborators.email": session.user.email.toLowerCase(),
    });

    if (!trip) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    const collab = trip.collaborators.find(
      (c: { email: string }) => c.email.toLowerCase() === session.user!.email!.toLowerCase()
    );
    if (collab) {
      collab.status = action;
      collab.respondedAt = new Date();
      collab.userId = session.user.id;
      collab.name = session.user.name || undefined;
    }

    await trip.save();

    return NextResponse.json({ message: `Invitation ${action}` });
  } catch (error) {
    console.error("Collaborate PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
