"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Search, Shield, Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const trustBadges = [
  { icon: Shield, label: "Free to Use" },
  { icon: Bot, label: "6 AI Agents" },
  { icon: Sparkles, label: "10,000+ Trips Planned" },
];

export default function CTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      ref={ref}
      className="relative py-24 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0F4C81 0%, #16213E 40%, #1A1A2E 70%, #0F4C81 100%)",
      }}
    >
      <div className="absolute top-0 left-1/4 w-80 h-80 rounded-full bg-[#2EC4B6]/10 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-[#FF6B35]/10 blur-3xl" />

      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white/5"
          style={{
            width: 2 + Math.random() * 3,
            height: 2 + Math.random() * 3,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{ y: [0, -20, 0], opacity: [0.1, 0.4, 0.1] }}
          transition={{
            duration: 3 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Ready to Plan Your Next{" "}
            <span className="bg-gradient-to-r from-[#2EC4B6] to-[#FFD166] bg-clip-text text-transparent">
              Adventure?
            </span>
          </h2>
          <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">
            Join thousands of Indian travelers who plan smarter with AI. It&apos;s free, fast, and personalized.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Button
              onClick={() => scrollTo("trip-planner")}
              size="lg"
              className="bg-gradient-to-r from-[#FF6B35] to-[#FF8C61] hover:from-[#E05A2B] hover:to-[#FF6B35] text-white rounded-full px-10 h-14 text-base font-semibold shadow-xl shadow-orange-500/25 group"
            >
              Plan My Trip
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              onClick={() => scrollTo("flights")}
              size="lg"
              className="border-2 border-white/30 bg-white/10 text-white hover:bg-white/20 hover:border-white/50 rounded-full px-10 h-14 text-base font-semibold backdrop-blur-sm transition-all"
            >
              <Search className="w-5 h-5 mr-2" />
              Search Flights
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            {trustBadges.map((badge) => (
              <div
                key={badge.label}
                className="flex items-center gap-2 text-white/50 text-sm"
              >
                <badge.icon className="w-4 h-4 text-[#2EC4B6]" />
                {badge.label}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
