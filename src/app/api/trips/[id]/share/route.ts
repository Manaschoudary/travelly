import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db/mongoose";
import { Trip } from "@/lib/db/models";
import crypto from "crypto";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const trip = await Trip.findOne({ _id: id, userId: session.user.id });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    if (!trip.shareToken) {
      trip.shareToken = crypto.randomBytes(16).toString("hex");
      await trip.save();
    }

    const baseUrl = process.env.NEXTAUTH_URL || "https://travelly-pi.vercel.app";
    const shareUrl = `${baseUrl}/trip/${trip._id}?token=${trip.shareToken}`;

    return NextResponse.json({ shareUrl, shareToken: trip.shareToken });
  } catch (error) {
    console.error("Share trip error:", error);
    return NextResponse.json(
      { error: "Failed to generate share link" },
      { status: 500 }
    );
  }
}
