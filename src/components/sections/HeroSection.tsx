"use client";

import { motion } from "framer-motion";
import { ArrowRight, Search, Sparkles, MapPin, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import TravellyAvatar from "@/components/avatar/TravellyAvatar";
import { useTravellyStore } from "@/store/travel-store";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";

const stats = [
  { icon: Users, value: "10,000+", label: "Trips Planned" },
  { icon: MapPin, value: "500+", label: "Destinations" },
  { icon: Star, value: "4.9", label: "User Rating" },
];

export default function HeroSection() {
  const avatarState = useTravellyStore((s) => s.avatarState);
  const { theme } = useTheme();
  const light = theme === "light";

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{
        background: light
          ? "linear-gradient(135deg, #E8F4FD 0%, #F0F7FF 40%, #F8F9FA 70%, #E8F4FD 100%)"
          : "linear-gradient(135deg, #0F4C81 0%, #16213E 40%, #1A1A2E 70%, #0F4C81 100%)",
      }}
    >
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className={cn(
              "absolute rounded-full",
              light ? "bg-[#0F4C81]/5" : "bg-white/5"
            )}
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

      <div className={cn(
        "absolute top-20 right-10 w-96 h-96 rounded-full blur-3xl",
        light ? "bg-[#2EC4B6]/5" : "bg-[#2EC4B6]/10"
      )} />
      <div className={cn(
        "absolute bottom-20 left-10 w-80 h-80 rounded-full blur-3xl",
        light ? "bg-[#FF6B35]/5" : "bg-[#FF6B35]/10"
      )} />

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
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm text-sm mb-6",
                light
                  ? "bg-[#0F4C81]/10 border border-[#0F4C81]/20 text-[#0F4C81]"
                  : "bg-white/10 border border-white/10 text-white/90"
              )}
            >
              <Sparkles className="w-4 h-4 text-[#FFD166]" />
              AI-Powered Trip Planning
            </motion.div>

            <h1 className={cn(
              "text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6",
              light ? "text-[#1A1A2E]" : "text-white"
            )}>
              Your Next Adventure{" "}
              <span className="bg-gradient-to-r from-[#2EC4B6] to-[#FFD166] bg-clip-text text-transparent">
                Starts with a Conversation
              </span>
            </h1>

            <p className={cn(
              "text-lg mb-8 max-w-lg leading-relaxed",
              light ? "text-gray-600" : "text-white/70"
            )}>
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
                className={cn(
                  "rounded-full px-8 h-14 text-base font-semibold backdrop-blur-sm transition-all",
                  light
                    ? "border-2 border-[#0F4C81]/30 bg-[#0F4C81]/10 text-[#0F4C81] hover:bg-[#0F4C81]/20 hover:border-[#0F4C81]/50"
                    : "border-2 border-white/30 bg-white/10 text-white hover:bg-white/20 hover:border-white/50"
                )}
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
                    <div className={cn(
                      "font-bold text-sm",
                      light ? "text-[#1A1A2E]" : "text-white"
                    )}>{stat.value}</div>
                    <div className={cn(
                      "text-xs",
                      light ? "text-gray-500" : "text-white/50"
                    )}>{stat.label}</div>
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
