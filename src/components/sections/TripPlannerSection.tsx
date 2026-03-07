"use client";

import { useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useTravellyStore } from "@/store/travel-store";
import TripForm from "@/components/chat/TripForm";
import ChatInterface from "@/components/chat/ChatInterface";
import TripResults from "@/components/chat/TripResults";
import TravellyAvatar from "@/components/avatar/TravellyAvatar";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";

export default function TripPlannerSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const { currentStep, avatarState } = useTravellyStore();
  const { theme } = useTheme();
  const light = theme === "light";

  return (
    <section
      id="trip-planner"
      ref={ref}
      className={cn("relative min-h-screen py-20 overflow-hidden", light && "bg-[#F8F9FA]")}
      style={!light ? { background: "linear-gradient(180deg, #1A1A2E 0%, #16213E 50%, #1A1A2E 100%)" } : undefined}
    >
      <div className={cn(
        "absolute top-40 left-0 w-72 h-72 rounded-full blur-3xl",
        light ? "bg-[#2EC4B6]/3" : "bg-[#2EC4B6]/5"
      )} />
      <div className={cn(
        "absolute bottom-20 right-0 w-96 h-96 rounded-full blur-3xl",
        light ? "bg-[#FF6B35]/3" : "bg-[#FF6B35]/5"
      )} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm text-sm mb-4",
            light
              ? "bg-[#0F4C81]/10 border border-[#0F4C81]/20 text-[#0F4C81]"
              : "bg-white/10 border border-white/10 text-white/80"
          )}>
            <Sparkles className="w-4 h-4 text-[#FFD166]" />
            Powered by 6 AI Agents
          </div>
          <h2 className={cn(
            "text-3xl sm:text-4xl lg:text-5xl font-bold mb-4",
            light ? "text-[#1A1A2E]" : "text-white"
          )}>
            Plan Your{" "}
            <span className="bg-gradient-to-r from-[#2EC4B6] to-[#FFD166] bg-clip-text text-transparent">
              Dream Trip
            </span>
          </h2>
          <p className={cn(
            "text-lg max-w-2xl mx-auto",
            light ? "text-gray-600" : "text-white/60"
          )}>
            Our AI agents create personalized itineraries in seconds — flights, hotels, budget, and local tips included.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-start">
          <div className="min-h-[500px]">
            <AnimatePresence mode="wait">
              {currentStep === "form" && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <TripForm />
                </motion.div>
              )}
              {currentStep === "chat" && (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChatInterface />
                </motion.div>
              )}
              {currentStep === "results" && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <TripResults />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="hidden lg:block sticky top-32">
            <TravellyAvatar state={avatarState} size={200} />
          </div>
        </div>
      </div>
    </section>
  );
}
