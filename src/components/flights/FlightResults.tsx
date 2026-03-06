"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpDown, ExternalLink, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import FlightCard, { type FlightData } from "./FlightCard";
import { cn } from "@/lib/utils";

interface FlightResultsProps {
  flights: FlightData[];
  loading: boolean;
  affiliateLink?: string;
}

type SortKey = "price" | "duration" | "departure";

export default function FlightResults({ flights, loading, affiliateLink }: FlightResultsProps) {
  const [sortBy, setSortBy] = useState<SortKey>("price");

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
            className="bg-white/5 border border-white/10 rounded-xl p-5 animate-pulse"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/10" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/10 rounded w-1/3" />
                <div className="h-3 bg-white/10 rounded w-1/4" />
              </div>
              <div className="space-y-2 text-right">
                <div className="h-5 bg-white/10 rounded w-20 ml-auto" />
                <div className="h-8 bg-white/10 rounded w-16 ml-auto" />
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
        <Plane className="w-12 h-12 text-white/20 mx-auto mb-4" />
        <p className="text-white/60 text-lg">No flights found</p>
        <p className="text-white/40 text-sm mt-1">Try different dates or airports</p>
      </motion.div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-white/60 text-sm">
          {flights.length} flight{flights.length !== 1 ? "s" : ""} found
        </p>
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-white/40" />
          {(["price", "departure", "duration"] as const).map((key) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                sortBy === key
                  ? "bg-[#2EC4B6] text-white"
                  : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
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
            className="bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white rounded-full px-6"
            onClick={() => window.open(affiliateLink, "_blank")}
          >
            View All on Aviasales
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}
