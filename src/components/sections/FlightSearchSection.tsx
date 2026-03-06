"use client";

import { useState, useRef, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import { Plane, Search } from "lucide-react";
import FlightSearchForm from "@/components/flights/FlightSearchForm";
import FlightResults from "@/components/flights/FlightResults";
import type { FlightData } from "@/components/flights/FlightCard";

interface FlightSearchResponse {
  flights: FlightData[];
  affiliateLink: string;
  source: string;
}

export default function FlightSearchSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const [flights, setFlights] = useState<FlightData[]>([]);
  const [affiliateLink, setAffiliateLink] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = useCallback(
    async (params: {
      origin: string;
      destination: string;
      departDate: string;
      returnDate?: string;
      passengers: number;
      cabinClass: string;
    }) => {
      setLoading(true);
      setError("");
      setSearched(true);
      try {
        const res = await fetch("/api/flights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        });
        if (!res.ok) throw new Error("Search failed");
        const data: FlightSearchResponse = await res.json();
        setFlights(data.flights);
        setAffiliateLink(data.affiliateLink);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        setFlights([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return (
    <section
      id="flights"
      ref={ref}
      className="relative py-20 overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #1A1A2E 0%, #0F4C81 50%, #1A1A2E 100%)",
      }}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#2EC4B6]/5 blur-3xl" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-sm text-white/80 mb-4">
            <Plane className="w-4 h-4 text-[#2EC4B6]" />
            Smart Flight Search
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Search{" "}
            <span className="bg-gradient-to-r from-[#2EC4B6] to-[#FFD166] bg-clip-text text-transparent">
              Flights
            </span>
          </h2>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            Compare prices across Indian and international airlines. Book through our partners for the best deals.
          </p>
        </motion.div>

        <FlightSearchForm onSearch={handleSearch} loading={loading} />

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-400 text-center mt-6"
          >
            {error}
          </motion.p>
        )}

        {searched && (
          <FlightResults flights={flights} loading={loading} affiliateLink={affiliateLink} />
        )}

        {!searched && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.5 }}
            className="text-center mt-10 py-8"
          >
            <Search className="w-10 h-10 text-white/10 mx-auto mb-3" />
            <p className="text-white/30 text-sm">Search for flights to see results</p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
