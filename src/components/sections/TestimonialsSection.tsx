"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    name: "Priya Sharma",
    initials: "PS",
    destination: "Goa",
    rating: 5,
    color: "#2EC4B6",
    review:
      "Travelly planned our entire Goa trip in under 2 minutes! The AI found us beach shacks we never would have discovered. Best friends trip ever.",
  },
  {
    name: "Rahul Verma",
    initials: "RV",
    destination: "Bali",
    rating: 5,
    color: "#FF6B35",
    review:
      "I was skeptical about AI trip planning, but Travelly nailed it. The itinerary was perfectly paced, and the flight deals saved us ₹15,000 per person.",
  },
  {
    name: "Ananya Patel",
    initials: "AP",
    destination: "Rajasthan",
    rating: 5,
    color: "#FFD166",
    review:
      "Our family trip to Rajasthan was magical. The local tips from the AI — hidden restaurants, sunset spots — made it truly special. Highly recommend!",
  },
  {
    name: "Vikram Singh",
    initials: "VS",
    destination: "Dubai",
    rating: 4.5,
    color: "#0F4C81",
    review:
      "Used Travelly for our corporate retreat to Dubai. 20 people, complex requirements — the AI handled it like a pro. Will use again for sure.",
  },
  {
    name: "Meera Nair",
    initials: "MN",
    destination: "Kerala",
    rating: 5,
    color: "#2EC4B6",
    review:
      "The budget optimization was incredible. Travelly found us a houseboat stay in Alleppey for half the price I was seeing online. Love this platform!",
  },
  {
    name: "Arjun Kapoor",
    initials: "AK",
    destination: "Thailand",
    rating: 5,
    color: "#FF6B35",
    review:
      "First international trip and I was nervous. Travelly planned everything — visa tips, local transport, even the best street food spots in Bangkok. 10/10.",
  },
];

export default function TestimonialsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section
      id="testimonials"
      ref={ref}
      className="py-20"
      style={{
        background: "linear-gradient(180deg, #16213E 0%, #1A1A2E 100%)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            What Our{" "}
            <span className="bg-gradient-to-r from-[#FFD166] to-[#FF6B35] bg-clip-text text-transparent">
              Travelers Say
            </span>
          </h2>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            Real stories from real travelers who planned with Travelly
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 25 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/[0.08] transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ background: t.color }}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  <p className="text-white/40 text-xs">Traveled to {t.destination}</p>
                </div>
              </div>

              <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_, j) => (
                  <Star
                    key={j}
                    className={cn(
                      "w-4 h-4",
                      j < Math.floor(t.rating)
                        ? "text-[#FFD166] fill-[#FFD166]"
                        : t.rating % 1 !== 0 && j === Math.floor(t.rating)
                          ? "text-[#FFD166] fill-[#FFD166]/50"
                          : "text-white/20"
                    )}
                  />
                ))}
              </div>

              <p className="text-white/70 text-sm leading-relaxed">
                &ldquo;{t.review}&rdquo;
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
