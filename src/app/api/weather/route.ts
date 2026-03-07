import { NextResponse } from "next/server";
import { getWeatherForecast } from "@/lib/weather";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const destination = searchParams.get("destination");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!destination || !startDate || !endDate) {
      return NextResponse.json(
        { error: "destination, startDate, and endDate are required" },
        { status: 400 }
      );
    }

    const weather = await getWeatherForecast(destination, startDate, endDate);
    return NextResponse.json(weather);
  } catch (error) {
    console.error("Weather API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch weather" },
      { status: 500 }
    );
  }
}
