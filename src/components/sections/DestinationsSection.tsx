"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTravellyStore } from "@/store/travel-store";

const destinations = [
  {
    name: "Goa",
    tag: "Beach",
    emoji: "🏖️",
    from: 8999,
    rating: 4.8,
    gradient: "from-cyan-500 to-blue-600",
    description: "Sun, sand & nightlife",
  },
  {
    name: "Rajasthan",
    tag: "Culture",
    emoji: "🏰",
    from: 12999,
    rating: 4.7,
    gradient: "from-orange-400 to-amber-600",
    description: "Forts, deserts & royalty",
  },
  {
    name: "Kerala",
    tag: "Nature",
    emoji: "🌴",
    from: 9999,
    rating: 4.9,
    gradient: "from-green-400 to-emerald-600",
    description: "Backwaters & spice gardens",
  },
  {
    name: "Manali",
    tag: "Mountains",
    emoji: "🏔️",
    from: 7999,
    rating: 4.6,
    gradient: "from-slate-400 to-blue-800",
    description: "Snow peaks & adventure",
  },
  {
    name: "Bali",
    tag: "Beach",
    emoji: "🌺",
    from: 25999,
    rating: 4.9,
    gradient: "from-teal-400 to-emerald-500",
    description: "Temples, rice terraces & surf",
  },
  {
    name: "Dubai",
    tag: "Luxury",
    emoji: "🌆",
    from: 22999,
    rating: 4.7,
    gradient: "from-yellow-400 to-orange-500",
    description: "Skyline, malls & desert safari",
  },
  {
    name: "Thailand",
    tag: "Adventure",
    emoji: "🐘",
    from: 18999,
    rating: 4.8,
    gradient: "from-pink-400 to-rose-600",
    description: "Beaches, street food & islands",
  },
  {
    name: "Maldives",
    tag: "Luxury",
    emoji: "🏝️",
    from: 35999,
    rating: 5.0,
    gradient: "from-sky-300 to-blue-500",
    description: "Overwater villas & coral reefs",
  },
];

const formatINR = (val: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);

export default function DestinationsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const setTripForm = useTravellyStore((s) => s.setTripForm);

  const handleClick = (name: string) => {
    setTripForm({ destination: name });
    document.getElementById("trip-planner")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="destinations"
      ref={ref}
      className="py-20"
      style={{
        background: "linear-gradient(180deg, #1A1A2E 0%, #16213E 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Trending{" "}
            <span className="bg-gradient-to-r from-[#FFD166] to-[#FF6B35] bg-clip-text text-transparent">
              Destinations
            </span>
          </h2>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            Explore the most popular getaways for Indian travelers
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {destinations.map((dest, i) => (
            <motion.button
              key={dest.name}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              onClick={() => handleClick(dest.name)}
              className="group text-left relative overflow-hidden rounded-2xl border border-white/10 hover:border-white/20 transition-all hover:scale-[1.03] hover:shadow-xl hover:shadow-black/20"
            >
              <div
                className={cn(
                  "h-44 bg-gradient-to-br flex items-center justify-center relative",
                  dest.gradient
                )}
              >
                <span className="text-6xl group-hover:scale-110 transition-transform">
                  {dest.emoji}
                </span>
                <Badge className="absolute top-3 right-3 bg-black/30 backdrop-blur-sm text-white border-0 text-[10px]">
                  {dest.tag}
                </Badge>
              </div>
              <div className="bg-white/5 backdrop-blur-sm p-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-white font-bold text-lg">{dest.name}</h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-[#FFD166] fill-[#FFD166]" />
                    <span className="text-white/70 text-xs">{dest.rating}</span>
                  </div>
                </div>
                <p className="text-white/50 text-xs mb-2">{dest.description}</p>
                <p className="text-[#2EC4B6] font-semibold text-sm">
                  from {formatINR(dest.from)}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
