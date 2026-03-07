"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRightLeft, Calendar, Plane, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useTravellyStore } from "@/store/travel-store";
import AirportCombobox from "./AirportCombobox";
import { useTheme } from "@/components/providers/ThemeProvider";

interface FlightSearchFormProps {
  onSearch: (params: {
    origin: string;
    destination: string;
    departDate: string;
    returnDate?: string;
    passengers: number;
    cabinClass: string;
  }) => void;
  loading?: boolean;
}

const popularRoutes = [
  { from: "DEL", to: "GOI", label: "Delhi → Goa" },
  { from: "BOM", to: "BLR", label: "Mumbai → Bangalore" },
  { from: "DEL", to: "DXB", label: "Delhi → Dubai" },
  { from: "BOM", to: "BKK", label: "Mumbai → Bangkok" },
];

export default function FlightSearchForm({ onSearch, loading }: FlightSearchFormProps) {
  const { flightSearch, setFlightSearch } = useTravellyStore();
  const [tripType, setTripType] = useState<"one-way" | "round-trip">(
    flightSearch.tripType || "round-trip"
  );
  const { theme } = useTheme();
  const light = theme === "light";

  const handleSwap = () => {
    const { origin, destination } = flightSearch;
    setFlightSearch({ origin: destination, destination: origin });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flightSearch.origin || !flightSearch.destination || !flightSearch.departDate) return;
    onSearch({
      origin: flightSearch.origin,
      destination: flightSearch.destination,
      departDate: flightSearch.departDate,
      returnDate: tripType === "round-trip" ? flightSearch.returnDate : undefined,
      passengers: flightSearch.passengers || 1,
      cabinClass: flightSearch.cabinClass || "economy",
    });
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      className={cn("backdrop-blur-sm rounded-2xl p-6 sm:p-8 space-y-6", light ? "bg-white border border-gray-200 shadow-sm" : "bg-white/5 border border-white/10")}
    >
      <div className="flex gap-2 mb-2">
        {(["round-trip", "one-way"] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => {
              setTripType(type);
              setFlightSearch({ tripType: type });
            }}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all",
              tripType === type
                ? "bg-[#2EC4B6] text-white shadow-lg shadow-[#2EC4B6]/25"
                : light ? "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-[#1A1A2E]" : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            )}
          >
            {type === "round-trip" ? "Round Trip" : "One Way"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-end">
        <div className="space-y-2">
          <Label className={cn("text-sm flex items-center gap-1.5", light ? "text-gray-600" : "text-white/70")}>
            <Plane className="w-3.5 h-3.5 rotate-[-45deg]" /> From
          </Label>
          <AirportCombobox
            value={flightSearch.origin || ""}
            onValueChange={(val) => setFlightSearch({ origin: val })}
            placeholder="Select origin..."
          />
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleSwap}
          className={cn("rounded-full w-10 h-10 self-end mb-1", light ? "bg-gray-50 border-gray-300 text-[#1A1A2E] hover:bg-gray-100" : "bg-white/10 border-white/10 text-white hover:bg-white/20")}
        >
          <ArrowRightLeft className="w-4 h-4" />
        </Button>

        <div className="space-y-2">
          <Label className={cn("text-sm flex items-center gap-1.5", light ? "text-gray-600" : "text-white/70")}>
            <Plane className="w-3.5 h-3.5 rotate-45" /> To
          </Label>
          <AirportCombobox
            value={flightSearch.destination || ""}
            onValueChange={(val) => setFlightSearch({ destination: val })}
            placeholder="Select destination..."
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {popularRoutes.map((route) => (
          <button
            key={route.label}
            type="button"
            onClick={() => setFlightSearch({ origin: route.from, destination: route.to })}
            className={cn("px-3 py-1.5 rounded-full text-xs transition-all", light ? "bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100 hover:text-[#1A1A2E]" : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white")}
          >
            {route.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className={cn("text-sm flex items-center gap-1.5", light ? "text-gray-600" : "text-white/70")}>
            <Calendar className="w-3.5 h-3.5" /> Departure
          </Label>
          <Input
            type="date"
            value={flightSearch.departDate || ""}
            onChange={(e) => setFlightSearch({ departDate: e.target.value })}
            min={new Date().toISOString().split("T")[0]}
            className={cn("h-12 rounded-xl focus:border-[#2EC4B6]", light ? "bg-white border-gray-300 text-[#1A1A2E]" : "bg-white/10 border-white/10 text-white [color-scheme:dark]")}
          />
        </div>
        {tripType === "round-trip" && (
          <div className="space-y-2">
            <Label className={cn("text-sm flex items-center gap-1.5", light ? "text-gray-600" : "text-white/70")}>
              <Calendar className="w-3.5 h-3.5" /> Return
            </Label>
            <Input
              type="date"
              value={flightSearch.returnDate || ""}
              onChange={(e) => setFlightSearch({ returnDate: e.target.value })}
              min={flightSearch.departDate || new Date().toISOString().split("T")[0]}
              className={cn("h-12 rounded-xl focus:border-[#2EC4B6]", light ? "bg-white border-gray-300 text-[#1A1A2E]" : "bg-white/10 border-white/10 text-white [color-scheme:dark]")}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className={cn("text-sm flex items-center gap-1.5", light ? "text-gray-600" : "text-white/70")}>
            <Users className="w-3.5 h-3.5" /> Passengers
          </Label>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() =>
                setFlightSearch({ passengers: Math.max(1, (flightSearch.passengers || 1) - 1) })
              }
              className={cn("rounded-xl w-10 h-10", light ? "bg-gray-50 border-gray-300 text-[#1A1A2E] hover:bg-gray-100" : "bg-white/10 border-white/10 text-white hover:bg-white/20")}
            >
              -
            </Button>
            <span className={cn("text-xl font-bold w-8 text-center", light ? "text-[#1A1A2E]" : "text-white")}>
              {flightSearch.passengers || 1}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() =>
                setFlightSearch({ passengers: Math.min(9, (flightSearch.passengers || 1) + 1) })
              }
              className={cn("rounded-xl w-10 h-10", light ? "bg-gray-50 border-gray-300 text-[#1A1A2E] hover:bg-gray-100" : "bg-white/10 border-white/10 text-white hover:bg-white/20")}
            >
              +
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label className={cn("text-sm", light ? "text-gray-600" : "text-white/70")}>Class</Label>
          <Select
            value={flightSearch.cabinClass || "economy"}
            onValueChange={(val) =>
              setFlightSearch({ cabinClass: val as "economy" | "premium_economy" | "business" | "first" })
            }
          >
            <SelectTrigger className={cn("h-12 rounded-xl focus:border-[#2EC4B6]", light ? "bg-white border-gray-300 text-[#1A1A2E]" : "bg-white/10 border-white/10 text-white")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className={cn(light ? "bg-white border-gray-200 text-[#1A1A2E]" : "bg-[#1A1A2E] border-white/10 text-white")}>
              <SelectItem value="economy">Economy</SelectItem>
              <SelectItem value="premium_economy">Premium Economy</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="first">First Class</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading || !flightSearch.origin || !flightSearch.destination || !flightSearch.departDate}
        className="w-full h-14 bg-gradient-to-r from-[#FF6B35] to-[#FF8C61] hover:from-[#E05A2B] hover:to-[#FF6B35] text-white rounded-xl text-base font-semibold shadow-xl shadow-orange-500/25 disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Searching Flights...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Plane className="w-5 h-5" />
            Search Flights
          </span>
        )}
      </Button>
    </motion.form>
  );
}
