"use client";

import { motion } from "framer-motion";
import { ArrowRight, Search, Sparkles, MapPin, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import TravellyAvatar from "@/components/avatar/TravellyAvatar";
import { useTravellyStore } from "@/store/travel-store";

const stats = [
  { icon: Users, value: "10,000+", label: "Trips Planned" },
  { icon: MapPin, value: "500+", label: "Destinations" },
  { icon: Star, value: "4.9", label: "User Rating" },
];

export default function HeroSection() {
  const avatarState = useTravellyStore((s) => s.avatarState);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0F4C81 0%, #16213E 40%, #1A1A2E 70%, #0F4C81 100%)",
      }}
    >
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/5"
            style={{
              width: 2 + Math.random() * 4,
              height: 2 + Math.random() * 4,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="absolute top-20 right-10 w-96 h-96 rounded-full bg-[#2EC4B6]/10 blur-3xl" />
      <div className="absolute bottom-20 left-10 w-80 h-80 rounded-full bg-[#FF6B35]/10 blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="order-2 lg:order-1"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-sm text-white/90 mb-6"
            >
              <Sparkles className="w-4 h-4 text-[#FFD166]" />
              AI-Powered Trip Planning
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Your Next Adventure{" "}
              <span className="bg-gradient-to-r from-[#2EC4B6] to-[#FFD166] bg-clip-text text-transparent">
                Starts with a Conversation
              </span>
            </h1>

            <p className="text-lg text-white/70 mb-8 max-w-lg leading-relaxed">
              Travelly&apos;s AI agents plan perfect trips, find cheap flights, and
              discover hidden gems — all tailored for Indian travelers.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button
                onClick={() => scrollTo("trip-planner")}
                size="lg"
                className="bg-gradient-to-r from-[#FF6B35] to-[#FF8C61] hover:from-[#E05A2B] hover:to-[#FF6B35] text-white rounded-full px-8 h-14 text-base font-semibold shadow-xl shadow-orange-500/25 group"
              >
                Plan My Trip
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                onClick={() => scrollTo("flights")}
                size="lg"
                className="border-2 border-white/30 bg-white/10 text-white hover:bg-white/20 hover:border-white/50 rounded-full px-8 h-14 text-base font-semibold backdrop-blur-sm transition-all"
              >
                <Search className="w-5 h-5 mr-2" />
                Search Flights
              </Button>
            </div>

            <div className="flex items-center gap-6 sm:gap-8">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="flex items-center gap-2"
                >
                  <stat.icon className="w-4 h-4 text-[#2EC4B6]" />
                  <div>
                    <div className="text-white font-bold text-sm">{stat.value}</div>
                    <div className="text-white/50 text-xs">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="order-1 lg:order-2 flex justify-center"
          >
            <TravellyAvatar state={avatarState} size={320} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
