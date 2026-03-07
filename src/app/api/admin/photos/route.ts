import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db/mongoose";
import { Photo } from "@/lib/db/models";

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
    const photos = await Photo.find().sort({ order: 1 }).lean();
    return NextResponse.json({ photos });
  } catch (error) {
    console.error("Admin GET photos error:", error);
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
    const { title, location, category, gradient, span, imageUrl, order, isActive } = body;

    if (!title || !location || !category || !gradient) {
      return NextResponse.json(
        { error: "Title, location, category, and gradient are required" },
        { status: 400 }
      );
    }

    await connectDB();
    const photo = await Photo.create({
      title,
      location,
      category,
      gradient,
      span: span || "col-span-1 row-span-1",
      imageUrl,
      order: order ?? 0,
      isActive: isActive ?? true,
    });

    return NextResponse.json({ photo }, { status: 201 });
  } catch (error) {
    console.error("Admin POST photo error:", error);
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
      return NextResponse.json({ error: "Photo ID required" }, { status: 400 });
    }

    const body = await req.json();
    await connectDB();

    const photo = await Photo.findByIdAndUpdate(id, { $set: body }, { new: true, runValidators: true });
    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    return NextResponse.json({ photo });
  } catch (error) {
    console.error("Admin PATCH photo error:", error);
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
      return NextResponse.json({ error: "Photo ID required" }, { status: 400 });
    }

    await connectDB();
    const photo = await Photo.findByIdAndDelete(id);
    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin DELETE photo error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
