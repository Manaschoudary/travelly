import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db/mongoose";
import { BookingClick } from "@/lib/db/models";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type, platform, affiliateLink, tripId, details } = body;

    if (!type || !platform || !affiliateLink) {
      return NextResponse.json(
        { error: "type, platform, and affiliateLink are required" },
        { status: 400 }
      );
    }

    if (!["flight", "hotel", "activity"].includes(type)) {
      return NextResponse.json(
        { error: "type must be flight, hotel, or activity" },
        { status: 400 }
      );
    }

    await connectDB();

    const click = await BookingClick.create({
      userId: session.user.id,
      tripId: tripId || undefined,
      type,
      platform,
      affiliateLink,
      details: details || {},
    });

    return NextResponse.json({ success: true, clickId: click._id });
  } catch (error) {
    console.error("Booking click tracking error:", error);
    return NextResponse.json(
      { error: "Failed to track booking click" },
      { status: 500 }
    );
  }
}
