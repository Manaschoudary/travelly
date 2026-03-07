"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTravellyStore } from "@/store/travel-store";
import { useTheme } from "@/components/providers/ThemeProvider";

const destinations = [
  {
    name: "Goa",
    tag: "Beach",
    emoji: "\u{1F3D6}\u{FE0F}",
    from: 8999,
    rating: 4.8,
    gradient: "from-cyan-500 to-blue-600",
    description: "Sun, sand & nightlife",
  },
  {
    name: "Rajasthan",
    tag: "Culture",
    emoji: "\u{1F3F0}",
    from: 12999,
    rating: 4.7,
    gradient: "from-orange-400 to-amber-600",
    description: "Forts, deserts & royalty",
  },
  {
    name: "Kerala",
    tag: "Nature",
    emoji: "\u{1F334}",
    from: 9999,
    rating: 4.9,
    gradient: "from-green-400 to-emerald-600",
    description: "Backwaters & spice gardens",
  },
  {
    name: "Manali",
    tag: "Mountains",
    emoji: "\u{1F3D4}\u{FE0F}",
    from: 7999,
    rating: 4.6,
    gradient: "from-slate-400 to-blue-800",
    description: "Snow peaks & adventure",
  },
  {
    name: "Bali",
    tag: "Beach",
    emoji: "\u{1F33A}",
    from: 25999,
    rating: 4.9,
    gradient: "from-teal-400 to-emerald-500",
    description: "Temples, rice terraces & surf",
  },
  {
    name: "Dubai",
    tag: "Luxury",
    emoji: "\u{1F306}",
    from: 22999,
    rating: 4.7,
    gradient: "from-yellow-400 to-orange-500",
    description: "Skyline, malls & desert safari",
  },
  {
    name: "Thailand",
    tag: "Adventure",
    emoji: "\u{1F418}",
    from: 18999,
    rating: 4.8,
    gradient: "from-pink-400 to-rose-600",
    description: "Beaches, street food & islands",
  },
  {
    name: "Maldives",
    tag: "Luxury",
    emoji: "\u{1F3DD}\u{FE0F}",
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
  const { theme } = useTheme();
  const light = theme === "light";

  const handleClick = (name: string) => {
    setTripForm({ destination: name });
    document.getElementById("trip-planner")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="destinations"
      ref={ref}
      className={cn("py-20", light && "bg-[#F8F9FA]")}
      style={!light ? { background: "linear-gradient(180deg, #1A1A2E 0%, #16213E 100%)" } : undefined}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className={cn(
            "text-3xl sm:text-4xl font-bold mb-4",
            light ? "text-[#1A1A2E]" : "text-white"
          )}>
            Trending{" "}
            <span className="bg-gradient-to-r from-[#FFD166] to-[#FF6B35] bg-clip-text text-transparent">
              Destinations
            </span>
          </h2>
          <p className={cn(
            "text-lg max-w-xl mx-auto",
            light ? "text-gray-600" : "text-white/60"
          )}>
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
              className={cn(
                "group text-left relative overflow-hidden rounded-2xl transition-all hover:scale-[1.03]",
                light
                  ? "border border-gray-200 hover:border-gray-300 hover:shadow-xl shadow-sm"
                  : "border border-white/10 hover:border-white/20 hover:shadow-xl hover:shadow-black/20"
              )}
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
              <div className={cn(
                "p-4",
                light ? "bg-white" : "bg-white/5 backdrop-blur-sm"
              )}>
                <div className="flex items-center justify-between mb-1">
                  <h3 className={cn(
                    "font-bold text-lg",
                    light ? "text-[#1A1A2E]" : "text-white"
                  )}>{dest.name}</h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-[#FFD166] fill-[#FFD166]" />
                    <span className={cn(
                      "text-xs",
                      light ? "text-gray-500" : "text-white/70"
                    )}>{dest.rating}</span>
                  </div>
                </div>
                <p className={cn(
                  "text-xs mb-2",
                  light ? "text-gray-500" : "text-white/50"
                )}>{dest.description}</p>
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
