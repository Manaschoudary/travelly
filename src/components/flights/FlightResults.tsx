"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpDown, ExternalLink, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import FlightCard, { type FlightData } from "./FlightCard";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/ThemeProvider";

interface FlightResultsProps {
  flights: FlightData[];
  loading: boolean;
  affiliateLink?: string;
}

type SortKey = "price" | "duration" | "departure";

export default function FlightResults({ flights, loading, affiliateLink }: FlightResultsProps) {
  const [sortBy, setSortBy] = useState<SortKey>("price");
  const { theme } = useTheme();
  const light = theme === "light";

  const sorted = [...flights].sort((a, b) => {
    if (sortBy === "price") return a.price - b.price;
    if (sortBy === "departure") return a.departTime.localeCompare(b.departTime);
    return a.duration.localeCompare(b.duration);
  });

  if (loading) {
    return (
      <div className="space-y-4 mt-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={cn("rounded-xl p-5 animate-pulse", light ? "bg-gray-50 border border-gray-200" : "bg-white/5 border border-white/10")}
          >
            <div className="flex items-center gap-4">
              <div className={cn("w-10 h-10 rounded-lg", light ? "bg-gray-200" : "bg-white/10")} />
              <div className="flex-1 space-y-2">
                <div className={cn("h-4 rounded w-1/3", light ? "bg-gray-200" : "bg-white/10")} />
                <div className={cn("h-3 rounded w-1/4", light ? "bg-gray-200" : "bg-white/10")} />
              </div>
              <div className="space-y-2 text-right">
                <div className={cn("h-5 rounded w-20 ml-auto", light ? "bg-gray-200" : "bg-white/10")} />
                <div className={cn("h-8 rounded w-16 ml-auto", light ? "bg-gray-200" : "bg-white/10")} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (flights.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12 mt-6"
      >
        <Plane className={cn("w-12 h-12 mx-auto mb-4", light ? "text-gray-300" : "text-white/20")} />
        <p className={cn("text-lg", light ? "text-gray-600" : "text-white/60")}>No flights found</p>
        <p className={cn("text-sm mt-1", light ? "text-gray-400" : "text-white/40")}>Try different dates or airports</p>
      </motion.div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <p className={cn("text-sm", light ? "text-gray-600" : "text-white/60")}>
          {flights.length} flight{flights.length !== 1 ? "s" : ""} found
        </p>
        <div className="flex items-center gap-2">
          <ArrowUpDown className={cn("w-3.5 h-3.5", light ? "text-gray-400" : "text-white/40")} />
          {(["price", "departure", "duration"] as const).map((key) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                sortBy === key
                  ? "bg-[#2EC4B6] text-white"
                  : light ? "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-[#1A1A2E]" : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
              )}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {sorted.map((flight, i) => (
          <FlightCard key={flight.id} flight={flight} index={i} />
        ))}
      </div>

      {affiliateLink && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center pt-4"
        >
          <Button
            variant="outline"
            className={cn("rounded-full px-6", light ? "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-[#1A1A2E]" : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white")}
            onClick={() => {
              fetch("/api/booking-click", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  type: "flight",
                  platform: "makemytrip",
                  affiliateLink: affiliateLink,
                }),
              }).catch(() => {});
              window.open(affiliateLink, "_blank");
            }}
          >
            View All on MakeMyTrip
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}
