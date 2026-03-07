import { NextResponse } from "next/server";
import { planTrip } from "@/lib/agents/orchestrator";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db/mongoose";
import { Trip } from "@/lib/db/models";

// Allow up to 60 seconds for multi-agent trip planning
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json();

    const {
      destination,
      startDate,
      endDate,
      budget,
      travelers,
      travelStyle,
      interests,
      specialRequests,
      originCity,
      originAirport,
      transportMode,
      suggestTrip,
    } = body;

    // Destination is optional when suggestTrip is true
    if (!startDate || !endDate || !budget) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!destination && !suggestTrip) {
      return NextResponse.json(
        { error: "Destination is required (or enable trip suggestions)" },
        { status: 400 }
      );
    }

    const result = await planTrip({
      destination: destination || "",
      startDate,
      endDate,
      budget: Number(budget),
      travelers: Number(travelers) || 1,
      travelStyle: travelStyle || "balanced",
      interests: interests || [],
      specialRequests,
      originCity: originCity || "",
      originAirport: originAirport || "",
      transportMode: transportMode || "any",
      suggestTrip: Boolean(suggestTrip),
    });

    if (session?.user?.id) {
      await connectDB();
      const trip = await Trip.create({
        userId: session.user.id,
        title: suggestTrip && !destination
          ? "Trip Suggestions"
          : `Trip to ${destination}`,
        destination: destination || "Suggested",
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        budget: Number(budget),
        travelers: Number(travelers) || 1,
        status: "planning",
        totalEstimatedCost: Number(budget),
        originCity: originCity || undefined,
        originAirport: originAirport || undefined,
        transportMode: transportMode || undefined,
        planContent: result,
      });

      return NextResponse.json({ ...result, tripId: trip._id });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Trip planning error:", error);
    return NextResponse.json(
      { error: "Failed to generate trip plan" },
      { status: 500 }
    );
  }
}
