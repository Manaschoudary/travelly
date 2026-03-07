import { NextResponse } from "next/server";
import { getHotelEstimates } from "@/lib/hotels";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const destination = searchParams.get("destination");
    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");
    const adults = Number(searchParams.get("adults") || "2");

    if (!destination || !checkIn || !checkOut) {
      return NextResponse.json(
        { error: "destination, checkIn, and checkOut are required" },
        { status: 400 }
      );
    }

    const estimates = getHotelEstimates(destination, checkIn, checkOut, adults);
    return NextResponse.json(estimates);
  } catch (error) {
    console.error("Hotel estimates error:", error);
    return NextResponse.json(
      { error: "Failed to generate hotel estimates" },
      { status: 500 }
    );
  }
}
