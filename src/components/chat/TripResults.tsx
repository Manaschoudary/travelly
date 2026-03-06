"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Plane,
  Hotel,
  DollarSign,
  Lightbulb,
  Share2,
  Save,
  ArrowLeft,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useTravellyStore } from "@/store/travel-store";

interface TripPlan {
  itinerary: string;
  flights: string;
  hotels: string;
  budget: string;
  localTips: string;
}

function ContentRenderer({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="space-y-2 text-white/80 text-sm leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith("**") && line.endsWith("**"))
          return (
            <h4 key={i} className="text-white font-semibold text-base mt-4 mb-2">
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
            <h4 key={i} className="text-[#FFD166] font-semibold text-base mt-4 mb-1">
              {line}
            </h4>
          );
        if (line.startsWith("- ") || line.startsWith("• "))
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
        if (line.includes("₹"))
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

export default function TripResults() {
  const { tripForm, setCurrentStep, setAvatarState } = useTravellyStore();
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const generatePlan = useCallback(async () => {
    setLoading(true);
    setAvatarState("thinking");
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tripForm),
      });
      if (!res.ok) throw new Error("Failed to generate plan");
      const data = await res.json();
      setPlan(data);
      setAvatarState("excited");
      setTimeout(() => setAvatarState("idle"), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setAvatarState("idle");
    } finally {
      setLoading(false);
    }
  }, [tripForm, setAvatarState]);

  useEffect(() => {
    generatePlan();
  }, [generatePlan]);

  const tabs = [
    { value: "itinerary", label: "Itinerary", icon: Calendar, emoji: "📋" },
    { value: "flights", label: "Flights", icon: Plane, emoji: "✈️" },
    { value: "hotels", label: "Hotels", icon: Hotel, emoji: "🏨" },
    { value: "budget", label: "Budget", icon: DollarSign, emoji: "💰" },
    { value: "localTips", label: "Local Tips", icon: Lightbulb, emoji: "🎯" },
  ];

  if (loading) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <Loader2 className="w-12 h-12 text-[#2EC4B6] animate-spin mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Planning your dream trip...</h3>
          <p className="text-white/60 text-center max-w-md">
            Our 6 AI agents are working together to craft the perfect itinerary for{" "}
            {tripForm.destination}
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {["🗺️ Trip Planner", "✈️ Flight Agent", "🏨 Hotel Agent", "💰 Budget Agent", "🎯 Local Expert"].map(
              (agent, i) => (
                <motion.div
                  key={agent}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.3 }}
                >
                  <Badge variant="outline" className="text-white/60 border-white/10 bg-white/5">
                    {agent}
                  </Badge>
                </motion.div>
              )
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-3xl mx-auto text-center py-20">
        <p className="text-red-400 mb-4">{error}</p>
        <Button onClick={generatePlan} className="bg-[#2EC4B6] text-white">
          Try Again
        </Button>
      </div>
    );
  }

  if (!plan) return null;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white">
              Your {tripForm.destination} Trip Plan
            </h3>
            <p className="text-white/60">Generated by 6 specialist AI agents</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/5 border-white/10 text-white/70 hover:bg-white/10 rounded-full"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
              }}
            >
              <Share2 className="w-4 h-4 mr-1" /> Share
            </Button>
            <Button
              size="sm"
              className="bg-[#2EC4B6] text-white rounded-full"
            >
              <Save className="w-4 h-4 mr-1" /> Save Trip
            </Button>
          </div>
        </div>

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
                <ContentRenderer content={plan[tab.value as keyof TripPlan]} />

                {(tab.value === "flights" || tab.value === "hotels") && (
                  <div className="mt-6 pt-4 border-t border-white/10">
                    <Button
                      className="bg-gradient-to-r from-[#FF6B35] to-[#FF8C61] text-white rounded-full shadow-lg"
                      onClick={() =>
                        window.open(
                          tab.value === "flights"
                            ? "https://www.aviasales.com"
                            : "https://www.booking.com",
                          "_blank"
                        )
                      }
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Book {tab.value === "flights" ? "Flights" : "Hotels"} Now
                    </Button>
                  </div>
                )}
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </motion.div>

      <div className="flex justify-center gap-4 mt-6">
        <Button
          variant="outline"
          onClick={() => setCurrentStep("chat")}
          className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-full"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Modify in Chat
        </Button>
        <Button
          onClick={() => setCurrentStep("form")}
          className="bg-gradient-to-r from-[#0F4C81] to-[#2EC4B6] text-white rounded-full"
        >
          Plan Another Trip
        </Button>
      </div>
    </div>
  );
}
