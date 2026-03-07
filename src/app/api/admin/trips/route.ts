import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db/mongoose";
import { GroupTrip } from "@/lib/db/models";

async function checkAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") return null;
  return session.user;
}

export async function GET(req: NextRequest) {
  try {
    const admin = await checkAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    await connectDB();
    const filter = type ? { type } : {};
    const trips = await GroupTrip.find(filter).sort({ order: 1 }).lean();
    return NextResponse.json({ trips });
  } catch (error) {
    console.error("Admin GET trips error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await checkAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type, title, destination, date, duration, groupSize, gradient } = body;

    if (!type || !title || !destination || !date || !duration || !gradient) {
      return NextResponse.json(
        { error: "Type, title, destination, date, duration, and gradient are required" },
        { status: 400 }
      );
    }

    await connectDB();
    const trip = await GroupTrip.create({ ...body, isActive: body.isActive ?? true, order: body.order ?? 0 });
    return NextResponse.json({ trip }, { status: 201 });
  } catch (error) {
    console.error("Admin POST trip error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await checkAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Trip ID required" }, { status: 400 });
    }

    const body = await req.json();
    await connectDB();

    const trip = await GroupTrip.findByIdAndUpdate(id, { $set: body }, { new: true, runValidators: true });
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    return NextResponse.json({ trip });
  } catch (error) {
    console.error("Admin PATCH trip error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await checkAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Trip ID required" }, { status: 400 });
    }

    await connectDB();
    const trip = await GroupTrip.findByIdAndDelete(id);
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin DELETE trip error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
