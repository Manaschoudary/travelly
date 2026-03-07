import { NextResponse } from "next/server";
import { Resend } from "resend";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db/mongoose";
import { Trip } from "@/lib/db/models";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

function buildTripEmailHTML(trip: {
  title: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  budget: number;
  travelers: number;
  planContent?: {
    itinerary?: string;
    flights?: string;
    hotels?: string;
    budget?: string;
    localTips?: string;
  };
}, userName: string): string {
  const start = new Date(trip.startDate).toLocaleDateString("en-IN", { dateStyle: "medium" });
  const end = new Date(trip.endDate).toLocaleDateString("en-IN", { dateStyle: "medium" });
  const budgetFormatted = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(trip.budget);

  const formatSection = (text?: string) => {
    if (!text) return "";
    return text
      .split("\n")
      .map((line) => {
        if (line.startsWith("###") || line.startsWith("## "))
          return `<h3 style="color:#0F4C81;font-size:18px;margin:16px 0 8px;">${line.replace(/^#+\s/, "")}</h3>`;
        if (line.startsWith("**") && line.endsWith("**"))
          return `<h4 style="color:#1A1A2E;font-size:15px;font-weight:600;margin:12px 0 4px;">${line.replace(/\*\*/g, "")}</h4>`;
        if (line.startsWith("Day") || line.match(/^Day\s\d/i))
          return `<h4 style="color:#FF6B35;font-size:15px;font-weight:600;margin:16px 0 4px;">${line}</h4>`;
        if (line.startsWith("- ") || line.startsWith("• "))
          return `<li style="color:#525252;margin:2px 0;padding-left:4px;">${line.slice(2)}</li>`;
        if (line.match(/^\d+\./))
          return `<li style="color:#525252;margin:2px 0;">${line.replace(/^\d+\.\s*/, "")}</li>`;
        if (line.includes("\u20B9"))
          return `<p style="color:#2EC4B6;margin:4px 0;">${line}</p>`;
        if (line.trim() === "") return "<br/>";
        return `<p style="color:#525252;margin:4px 0;line-height:1.6;">${line}</p>`;
      })
      .join("");
  };

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f6f9fc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f9fc;padding:24px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

<tr><td style="background:linear-gradient(135deg,#0F4C81,#16213E);padding:32px 24px;text-align:center;">
  <h1 style="color:#ffffff;font-size:26px;margin:0;">${trip.destination} Trip Plan</h1>
  <p style="color:#FFD166;font-size:14px;margin:8px 0 0;">${start} - ${end}</p>
</td></tr>

<tr><td style="padding:24px;">
  <p style="color:#525252;font-size:14px;line-height:1.6;">Hi ${userName},</p>
  <p style="color:#525252;font-size:14px;line-height:1.6;">Here's your personalized trip plan for <strong>${trip.destination}</strong>!</p>

  <table width="100%" style="margin:16px 0;border-collapse:collapse;">
    <tr>
      <td style="padding:8px 12px;background:#f0fdf4;border-radius:8px;text-align:center;width:33%;">
        <p style="color:#2EC4B6;font-size:12px;margin:0;">Budget</p>
        <p style="color:#1A1A2E;font-size:16px;font-weight:600;margin:4px 0 0;">${budgetFormatted}</p>
      </td>
      <td style="width:8px;"></td>
      <td style="padding:8px 12px;background:#fef3c7;border-radius:8px;text-align:center;width:33%;">
        <p style="color:#FF6B35;font-size:12px;margin:0;">Travelers</p>
        <p style="color:#1A1A2E;font-size:16px;font-weight:600;margin:4px 0 0;">${trip.travelers}</p>
      </td>
      <td style="width:8px;"></td>
      <td style="padding:8px 12px;background:#eff6ff;border-radius:8px;text-align:center;width:33%;">
        <p style="color:#0F4C81;font-size:12px;margin:0;">Dates</p>
        <p style="color:#1A1A2E;font-size:13px;font-weight:600;margin:4px 0 0;">${start}</p>
      </td>
    </tr>
  </table>
</td></tr>

${trip.planContent?.itinerary ? `
<tr><td style="padding:0 24px 24px;">
  <h2 style="color:#0F4C81;font-size:20px;border-bottom:2px solid #2EC4B6;padding-bottom:8px;margin-bottom:12px;">Itinerary</h2>
  ${formatSection(trip.planContent.itinerary)}
</td></tr>` : ""}

${trip.planContent?.flights ? `
<tr><td style="padding:0 24px 24px;">
  <h2 style="color:#0F4C81;font-size:20px;border-bottom:2px solid #2EC4B6;padding-bottom:8px;margin-bottom:12px;">Flights</h2>
  ${formatSection(trip.planContent.flights)}
</td></tr>` : ""}

${trip.planContent?.hotels ? `
<tr><td style="padding:0 24px 24px;">
  <h2 style="color:#0F4C81;font-size:20px;border-bottom:2px solid #2EC4B6;padding-bottom:8px;margin-bottom:12px;">Hotels</h2>
  ${formatSection(trip.planContent.hotels)}
</td></tr>` : ""}

${trip.planContent?.budget ? `
<tr><td style="padding:0 24px 24px;">
  <h2 style="color:#0F4C81;font-size:20px;border-bottom:2px solid #2EC4B6;padding-bottom:8px;margin-bottom:12px;">Budget Breakdown</h2>
  ${formatSection(trip.planContent.budget)}
</td></tr>` : ""}

${trip.planContent?.localTips ? `
<tr><td style="padding:0 24px 24px;">
  <h2 style="color:#0F4C81;font-size:20px;border-bottom:2px solid #2EC4B6;padding-bottom:8px;margin-bottom:12px;">Local Tips</h2>
  ${formatSection(trip.planContent.localTips)}
</td></tr>` : ""}

<tr><td style="padding:24px;text-align:center;background:#f9fafb;border-top:1px solid #e5e7eb;">
  <p style="color:#8898aa;font-size:12px;margin:0;">Generated by Travelly - Your AI Travel Companion</p>
</td></tr>

</table>
</td></tr></table>
</body></html>`;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email } = await request.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email address is required" }, { status: 400 });
    }

    const { id } = await params;

    await connectDB();
    const trip = await Trip.findOne({ _id: id, userId: session.user.id }).lean();

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const html = buildTripEmailHTML(
      trip as { title: string; destination: string; startDate: Date; endDate: Date; budget: number; travelers: number; planContent?: { itinerary?: string; flights?: string; hotels?: string; budget?: string; localTips?: string } },
      session.user.name || "Traveler"
    );

    if (!resend) {
      return NextResponse.json(
        { error: "Email service not configured. Add RESEND_API_KEY to environment variables." },
        { status: 503 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: "Travelly <onboarding@resend.dev>",
      to: [email],
      subject: `Your ${trip.destination} Trip Plan - Travelly`,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Email sent successfully", emailId: data?.id });
  } catch (error) {
    console.error("Email route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
