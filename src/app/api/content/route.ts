import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import { Photo, GroupTrip, Testimonial, Destination, GroupPackage } from "@/lib/db/models";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    await connectDB();

    switch (type) {
      case "photos": {
        const photos = await Photo.find({ isActive: true }).sort({ order: 1 }).lean();
        return NextResponse.json({ data: photos });
      }
      case "trips": {
        const tripType = searchParams.get("tripType");
        const filter: Record<string, unknown> = { isActive: true };
        if (tripType) filter.type = tripType;
        const trips = await GroupTrip.find(filter).sort({ order: 1 }).lean();
        return NextResponse.json({ data: trips });
      }
      case "testimonials": {
        const testimonials = await Testimonial.find({ isActive: true }).sort({ order: 1 }).lean();
        return NextResponse.json({ data: testimonials });
      }
      case "destinations": {
        const destinations = await Destination.find({ isActive: true }).sort({ order: 1 }).lean();
        return NextResponse.json({ data: destinations });
      }
      case "packages": {
        const packages = await GroupPackage.find({ isActive: true }).sort({ order: 1 }).lean();
        return NextResponse.json({ data: packages });
      }
      default:
        return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
    }
  } catch (error) {
    console.error("Content API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
