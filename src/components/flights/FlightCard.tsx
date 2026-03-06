"use client";

import { motion } from "framer-motion";
import { Clock, Plane, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface FlightData {
  id: string;
  airline: string;
  airlineCode: string;
  price: number;
  currency: string;
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  departTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  type: string;
  bookingLink: string;
  isSample?: boolean;
}

interface FlightCardProps {
  flight: FlightData;
  index?: number;
}

const formatINR = (val: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);

export default function FlightCard({ flight, index = 0 }: FlightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
      className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 sm:p-5 hover:bg-white/[0.08] hover:border-white/20 transition-all hover:shadow-lg hover:shadow-black/10"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3 sm:w-40">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-sm font-bold text-white/80">
            {flight.airlineCode}
          </div>
          <div>
            <p className="text-white font-medium text-sm">{flight.airline}</p>
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] mt-0.5",
                flight.type === "budget"
                  ? "text-[#2EC4B6] border-[#2EC4B6]/30"
                  : "text-[#FFD166] border-[#FFD166]/30"
              )}
            >
              {flight.type === "budget" ? "Budget" : "Full Service"}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-1">
          <div className="text-center">
            <p className="text-white font-bold text-lg">{flight.departTime}</p>
            <p className="text-white/50 text-xs">{flight.origin}</p>
          </div>

          <div className="flex-1 flex flex-col items-center gap-1">
            <p className="text-white/50 text-xs flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {flight.duration}
            </p>
            <div className="w-full flex items-center gap-1">
              <div className="h-px flex-1 bg-white/20" />
              <Plane className="w-3.5 h-3.5 text-[#2EC4B6] rotate-0" />
              <div className="h-px flex-1 bg-white/20" />
            </div>
            <p className="text-white/40 text-[10px]">
              {flight.stops === 0 ? "Non-stop" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
            </p>
          </div>

          <div className="text-center">
            <p className="text-white font-bold text-lg">{flight.arrivalTime}</p>
            <p className="text-white/50 text-xs">{flight.destination}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:flex-col sm:items-end">
          <div className="text-right">
            <p className="text-white font-bold text-xl">{formatINR(flight.price)}</p>
            {flight.returnDate && (
              <p className="text-white/40 text-[10px]">round trip</p>
            )}
            {flight.isSample && (
              <Badge variant="outline" className="text-[9px] text-white/30 border-white/10 mt-1">
                Sample price
              </Badge>
            )}
          </div>
          <Button
            size="sm"
            className="bg-gradient-to-r from-[#FF6B35] to-[#FF8C61] text-white rounded-full px-5 shadow-lg group-hover:shadow-orange-500/20"
            onClick={() => window.open(flight.bookingLink, "_blank")}
          >
            Book
            <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
