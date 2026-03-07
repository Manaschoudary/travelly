import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db/mongoose";
import { GroupPackage } from "@/lib/db/models";

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
    const packages = await GroupPackage.find().sort({ order: 1 }).lean();
    return NextResponse.json({ packages });
  } catch (error) {
    console.error("Admin GET packages error:", error);
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
    const { title, emoji, tagline, groupSize, from, color } = body;

    if (!title || !emoji || !tagline || !groupSize || !from || !color) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    await connectDB();
    const pkg = await GroupPackage.create({
      ...body,
      isActive: body.isActive ?? true,
      order: body.order ?? 0,
    });

    return NextResponse.json({ package: pkg }, { status: 201 });
  } catch (error) {
    console.error("Admin POST package error:", error);
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
      return NextResponse.json({ error: "Package ID required" }, { status: 400 });
    }

    const body = await req.json();
    await connectDB();

    const pkg = await GroupPackage.findByIdAndUpdate(id, { $set: body }, { new: true, runValidators: true });
    if (!pkg) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    return NextResponse.json({ package: pkg });
  } catch (error) {
    console.error("Admin PATCH package error:", error);
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
      return NextResponse.json({ error: "Package ID required" }, { status: 400 });
    }

    await connectDB();
    const pkg = await GroupPackage.findByIdAndDelete(id);
    if (!pkg) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin DELETE package error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
