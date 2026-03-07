"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { MessageSquare, Bot, Settings2, Plane } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/ThemeProvider";

const steps = [
  {
    icon: MessageSquare,
    title: "Tell Us Your Dream",
    description:
      "Share your destination, travel dates, budget, and interests. Our guided form makes it easy — just a few taps.",
    color: "#2EC4B6",
    emoji: "💭",
  },
  {
    icon: Bot,
    title: "AI Agents Plan",
    description:
      "6 specialist AI agents work in parallel — flight finder, hotel scout, budget optimizer, local expert, and more.",
    color: "#FFD166",
    emoji: "🤖",
  },
  {
    icon: Settings2,
    title: "Review & Customize",
    description:
      "Chat with our AI to refine every detail. Swap hotels, adjust the budget, add activities — it's your trip.",
    color: "#FF6B35",
    emoji: "⚙️",
  },
  {
    icon: Plane,
    title: "Book & Travel",
    description:
      "Book flights and hotels through our trusted partners. We link you to the best deals — you save, we earn.",
    color: "#0F4C81",
    emoji: "✈️",
  },
];

export default function HowItWorksSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const { theme } = useTheme();
  const light = theme === "light";

  return (
    <section
      id="how-it-works"
      ref={ref}
      className={cn("py-20", light && "bg-[#F8F9FA]")}
      style={!light ? { background: "linear-gradient(180deg, #1A1A2E 0%, #16213E 50%, #1A1A2E 100%)" } : undefined}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className={cn("text-3xl sm:text-4xl font-bold mb-4", light ? "text-[#1A1A2E]" : "text-white")}>
            How{" "}
            <span className="bg-gradient-to-r from-[#0F4C81] to-[#2EC4B6] bg-clip-text text-transparent">
              Travelly
            </span>{" "}
            Works
          </h2>
          <p className={cn("text-lg max-w-xl mx-auto", light ? "text-gray-600" : "text-white/60")}>
            From dream to destination in 4 simple steps
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          <div className={cn(
            "hidden lg:block absolute top-16 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-[#2EC4B6] via-[#FFD166] to-[#0F4C81]",
            light ? "opacity-30" : "opacity-20"
          )} />

          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative text-center group"
            >
              <div className="relative inline-block mb-6">
                <div
                  className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-lg transition-transform group-hover:scale-110"
                  )}
                  style={{
                    background: `linear-gradient(135deg, ${step.color}20, ${step.color}40)`,
                    border: `1px solid ${step.color}30`,
                  }}
                >
                  <step.icon className="w-7 h-7" style={{ color: step.color }} />
                </div>
                <div className={cn(
                  "absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
                  light
                    ? "bg-white shadow-md text-[#0F4C81]"
                    : "bg-white/10 border border-white/20 text-white"
                )}>
                  {i + 1}
                </div>
              </div>

              <h3 className={cn("text-lg font-bold mb-2", light ? "text-[#1A1A2E]" : "text-white")}>{step.title}</h3>
              <p className={cn("text-sm leading-relaxed", light ? "text-gray-500" : "text-white/50")}>{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
