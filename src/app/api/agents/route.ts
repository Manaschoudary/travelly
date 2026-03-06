import { NextResponse } from "next/server";
import { planTrip } from "@/lib/agents/orchestrator";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db/mongoose";
import { Trip } from "@/lib/db/models";

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
    } = body;

    if (!destination || !startDate || !endDate || !budget) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await planTrip({
      destination,
      startDate,
      endDate,
      budget: Number(budget),
      travelers: Number(travelers) || 1,
      travelStyle: travelStyle || "balanced",
      interests: interests || [],
      specialRequests,
    });

    if (session?.user?.id) {
      await connectDB();
      await Trip.create({
        userId: session.user.id,
        title: `Trip to ${destination}`,
        destination,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        budget: Number(budget),
        travelers: Number(travelers) || 1,
        status: "planning",
        totalEstimatedCost: Number(budget),
      });
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
