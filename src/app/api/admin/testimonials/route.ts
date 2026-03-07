import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db/mongoose";
import { Testimonial } from "@/lib/db/models";

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
    const testimonials = await Testimonial.find().sort({ order: 1 }).lean();
    return NextResponse.json({ testimonials });
  } catch (error) {
    console.error("Admin GET testimonials error:", error);
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
    const { name, initials, destination, rating, color, review } = body;

    if (!name || !initials || !destination || !rating || !color || !review) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    await connectDB();
    const testimonial = await Testimonial.create({
      ...body,
      isActive: body.isActive ?? true,
      order: body.order ?? 0,
    });

    return NextResponse.json({ testimonial }, { status: 201 });
  } catch (error) {
    console.error("Admin POST testimonial error:", error);
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
      return NextResponse.json({ error: "Testimonial ID required" }, { status: 400 });
    }

    const body = await req.json();
    await connectDB();

    const testimonial = await Testimonial.findByIdAndUpdate(id, { $set: body }, { new: true, runValidators: true });
    if (!testimonial) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
    }

    return NextResponse.json({ testimonial });
  } catch (error) {
    console.error("Admin PATCH testimonial error:", error);
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
      return NextResponse.json({ error: "Testimonial ID required" }, { status: 400 });
    }

    await connectDB();
    const testimonial = await Testimonial.findByIdAndDelete(id);
    if (!testimonial) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin DELETE testimonial error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
