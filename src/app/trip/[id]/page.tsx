"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Calendar,
  Plane,
  Hotel,
  DollarSign,
  Lightbulb,
  MapPin,
  Users,
  ArrowLeft,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface TripData {
  _id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  travelers: number;
  originCity?: string;
  transportMode?: string;
  planContent?: {
    itinerary: string;
    flights: string;
    hotels: string;
    budget: string;
    localTips: string;
  };
}

function ContentRenderer({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="space-y-2 text-white/80 text-sm leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith("**") && line.endsWith("**"))
          return (
            <h4
              key={i}
              className="text-white font-semibold text-base mt-4 mb-2"
            >
              {line.replace(/\*\*/g, "")}
            </h4>
          );
        if (line.startsWith("###") || line.startsWith("## "))
          return (
            <h3 key={i} className="text-white font-bold text-lg mt-4 mb-2">
              {line.replace(/^#+\s/, "")}
            </h3>
          );
        if (line.startsWith("Day") || line.match(/^Day\s\d/i))
          return (
            <h4
              key={i}
              className="text-[#FFD166] font-semibold text-base mt-4 mb-1"
            >
              {line}
            </h4>
          );
        if (line.startsWith("- ") || line.startsWith("\u2022 "))
          return (
            <li key={i} className="ml-4 list-disc">
              {line.slice(2)}
            </li>
          );
        if (line.match(/^\d+\./))
          return (
            <li key={i} className="ml-4 list-decimal">
              {line.replace(/^\d+\.\s*/, "")}
            </li>
          );
        if (line.includes("\u20B9"))
          return (
            <p key={i} className="text-[#2EC4B6]">
              {line}
            </p>
          );
        if (line.trim() === "") return <br key={i} />;
        return <p key={i}>{line}</p>;
      })}
    </div>
  );
}

export default function SharedTripPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [trip, setTrip] = useState<TripData | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchTrip() {
      try {
        const url = `/api/trips/${id}${token ? `?token=${token}` : ""}`;
        const res = await fetch(url);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Trip not found");
        }
        const data = await res.json();
        setTrip(data.trip);
        setIsOwner(data.isOwner);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load trip");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchTrip();
  }, [id, token]);

  const formatINR = (val: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const tabs = [
    { value: "itinerary", label: "Itinerary", icon: Calendar, emoji: "📋" },
    { value: "flights", label: "Flights", icon: Plane, emoji: "✈️" },
    { value: "hotels", label: "Hotels", icon: Hotel, emoji: "🏨" },
    { value: "budget", label: "Budget", icon: DollarSign, emoji: "💰" },
    { value: "localTips", label: "Local Tips", icon: Lightbulb, emoji: "🎯" },
  ];

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background:
            "linear-gradient(180deg, #1A1A2E 0%, #16213E 50%, #1A1A2E 100%)",
        }}
      >
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#2EC4B6] animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading trip plan...</p>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background:
            "linear-gradient(180deg, #1A1A2E 0%, #16213E 50%, #1A1A2E 100%)",
        }}
      >
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">
            {error || "Trip not found"}
          </p>
          <Link href="/">
            <Button className="bg-gradient-to-r from-[#FF6B35] to-[#FF8C61] text-white rounded-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-8 px-4"
      style={{
        background:
          "linear-gradient(180deg, #1A1A2E 0%, #16213E 50%, #1A1A2E 100%)",
      }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href={isOwner ? "/dashboard" : "/"}>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/5 border-white/10 text-white/70 hover:bg-white/10 rounded-full"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              {isOwner ? "Dashboard" : "Home"}
            </Button>
          </Link>
          <Badge className="bg-[#2EC4B6]/20 text-[#2EC4B6] border-[#2EC4B6]/30">
            Shared Trip Plan
          </Badge>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            {trip.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Badge
              variant="outline"
              className="text-white/70 border-white/20 gap-1"
            >
              <MapPin className="w-3.5 h-3.5" />
              {trip.destination}
            </Badge>
            <Badge
              variant="outline"
              className="text-white/70 border-white/20 gap-1"
            >
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
            </Badge>
            <Badge
              variant="outline"
              className="text-white/70 border-white/20 gap-1"
            >
              <DollarSign className="w-3.5 h-3.5" />
              {formatINR(trip.budget)}
            </Badge>
            {trip.travelers > 1 && (
              <Badge
                variant="outline"
                className="text-white/70 border-white/20 gap-1"
              >
                <Users className="w-3.5 h-3.5" />
                {trip.travelers} travelers
              </Badge>
            )}
            {trip.originCity && (
              <Badge
                variant="outline"
                className="text-white/70 border-white/20"
              >
                From {trip.originCity}
              </Badge>
            )}
            {trip.transportMode && trip.transportMode !== "any" && (
              <Badge
                variant="outline"
                className="text-white/70 border-white/20"
              >
                {trip.transportMode === "flight"
                  ? "✈️"
                  : trip.transportMode === "train"
                    ? "🚆"
                    : trip.transportMode === "drive"
                      ? "🚗"
                      : "🚌"}{" "}
                {trip.transportMode}
              </Badge>
            )}
          </div>
        </motion.div>

        {trip.planContent ? (
          <Tabs defaultValue="itinerary" className="w-full">
            <TabsList className="w-full bg-white/5 border border-white/10 rounded-xl p-1 h-auto flex flex-wrap">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className={cn(
                    "flex-1 min-w-[80px] rounded-lg py-2 text-xs sm:text-sm data-[state=active]:bg-[#2EC4B6] data-[state=active]:text-white",
                    "text-white/60 hover:text-white"
                  )}
                >
                  <span className="hidden sm:inline mr-1">{tab.emoji}</span>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {tabs.map((tab) => (
              <TabsContent key={tab.value} value={tab.value} className="mt-4">
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm p-6 rounded-xl">
                  <ContentRenderer
                    content={
                      trip.planContent![
                        tab.value as keyof typeof trip.planContent
                      ] || "No data available for this section."
                    }
                  />
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm p-8 rounded-xl text-center">
            <p className="text-white/60">
              This trip plan doesn&apos;t have detailed content yet.
            </p>
          </Card>
        )}

        <div className="flex justify-center gap-4 mt-8">
          <Link href="/#trip-planner">
            <Button className="bg-gradient-to-r from-[#FF6B35] to-[#FF8C61] text-white rounded-full shadow-lg gap-2">
              <ExternalLink className="w-4 h-4" />
              Plan Your Own Trip
            </Button>
          </Link>
        </div>

        <div className="text-center mt-12 pb-4">
          <p className="text-white/30 text-sm">
            Powered by{" "}
            <Link href="/" className="text-[#2EC4B6]/50 hover:text-[#2EC4B6]">
              Travelly
            </Link>{" "}
            AI Trip Planner
          </p>
        </div>
      </div>
    </div>
  );
}
