import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db/mongoose";
import { Destination } from "@/lib/db/models";

async function checkAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") return null;
  return session.user;
}

export async function GET() {
  try {
    const admin = await checkAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const destinations = await Destination.find().sort({ order: 1 }).lean();
    return NextResponse.json({ destinations });
  } catch (error) {
    console.error("Admin GET destinations error:", error);
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
    const { name, tag, emoji, from, rating, gradient, description } = body;

    if (!name || !tag || !emoji || !from || !rating || !gradient || !description) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    await connectDB();
    const destination = await Destination.create({
      ...body,
      isActive: body.isActive ?? true,
      order: body.order ?? 0,
    });

    return NextResponse.json({ destination }, { status: 201 });
  } catch (error) {
    console.error("Admin POST destination error:", error);
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
      return NextResponse.json({ error: "Destination ID required" }, { status: 400 });
    }

    const body = await req.json();
    await connectDB();

    const destination = await Destination.findByIdAndUpdate(id, { $set: body }, { new: true, runValidators: true });
    if (!destination) {
      return NextResponse.json({ error: "Destination not found" }, { status: 404 });
    }

    return NextResponse.json({ destination });
  } catch (error) {
    console.error("Admin PATCH destination error:", error);
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
      return NextResponse.json({ error: "Destination ID required" }, { status: 400 });
    }

    await connectDB();
    const destination = await Destination.findByIdAndDelete(id);
    if (!destination) {
      return NextResponse.json({ error: "Destination not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin DELETE destination error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
