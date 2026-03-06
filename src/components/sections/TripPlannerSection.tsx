"use client";

import { useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useTravellyStore } from "@/store/travel-store";
import TripForm from "@/components/chat/TripForm";
import ChatInterface from "@/components/chat/ChatInterface";
import TripResults from "@/components/chat/TripResults";
import TravellyAvatar from "@/components/avatar/TravellyAvatar";

export default function TripPlannerSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const { currentStep, avatarState } = useTravellyStore();

  return (
    <section
      id="trip-planner"
      ref={ref}
      className="relative min-h-screen py-20 overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #1A1A2E 0%, #16213E 50%, #1A1A2E 100%)",
      }}
    >
      <div className="absolute top-40 left-0 w-72 h-72 rounded-full bg-[#2EC4B6]/5 blur-3xl" />
      <div className="absolute bottom-20 right-0 w-96 h-96 rounded-full bg-[#FF6B35]/5 blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-sm text-white/80 mb-4">
            <Sparkles className="w-4 h-4 text-[#FFD166]" />
            Powered by 6 AI Agents
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Plan Your{" "}
            <span className="bg-gradient-to-r from-[#2EC4B6] to-[#FFD166] bg-clip-text text-transparent">
              Dream Trip
            </span>
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
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
