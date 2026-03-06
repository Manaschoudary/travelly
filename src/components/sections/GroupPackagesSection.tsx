"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Users, Heart, Briefcase, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const packages = [
  {
    icon: Users,
    emoji: "🎉",
    title: "Friends Trip",
    tagline: "Adventure with your squad",
    groupSize: "4–8 people",
    from: 15000,
    color: "#FF6B35",
    inclusions: [
      "Customized adventure itinerary",
      "Group discounts on activities",
      "Nightlife & party spots mapped",
      "Shared accommodation options",
      "24/7 AI trip support",
    ],
  },
  {
    icon: Heart,
    emoji: "👨‍👩‍👧‍👦",
    title: "Family Vacation",
    tagline: "Memories that last forever",
    groupSize: "3–6 people",
    from: 20000,
    color: "#2EC4B6",
    popular: true,
    inclusions: [
      "Kid-friendly activities & dining",
      "Safe & comfortable stays",
      "Family sightseeing packages",
      "Flexible cancellation options",
      "Special meal preferences handled",
    ],
  },
  {
    icon: Briefcase,
    emoji: "🏢",
    title: "Corporate Retreat",
    tagline: "Team building done right",
    groupSize: "10–50 people",
    from: 25000,
    color: "#0F4C81",
    inclusions: [
      "Team building activities",
      "Conference & meeting rooms",
      "Premium accommodations",
      "Group transport arranged",
      "Dedicated trip coordinator",
    ],
  },
];

const formatINR = (val: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);

export default function GroupPackagesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  const scrollToPlanner = () => {
    document.getElementById("trip-planner")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="group-packages" ref={ref} className="py-20 bg-[#F8F9FA]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A2E] mb-4">
            Group{" "}
            <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFD166] bg-clip-text text-transparent">
              Travel Packages
            </span>
          </h2>
          <p className="text-gray-600 text-lg max-w-xl mx-auto">
            Traveling with friends, family, or colleagues? We&apos;ve got you covered.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg, i) => (
            <motion.div
              key={pkg.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.12 }}
            >
              <Card
                className={`relative h-full p-6 rounded-2xl border transition-all hover:shadow-xl hover:-translate-y-1 ${
                  pkg.popular
                    ? "border-[#2EC4B6] shadow-lg shadow-[#2EC4B6]/10 bg-white"
                    : "border-gray-200 bg-white"
                }`}
              >
                {pkg.popular && (
                  <Badge className="absolute -top-3 right-4 bg-gradient-to-r from-[#2EC4B6] to-[#0F4C81] text-white border-0 px-3">
                    Most Popular
                  </Badge>
                )}

                <div className="text-center mb-6">
                  <span className="text-4xl mb-3 block">{pkg.emoji}</span>
                  <h3 className="text-xl font-bold text-[#1A1A2E]">{pkg.title}</h3>
                  <p className="text-gray-500 text-sm mt-1">{pkg.tagline}</p>
                  <Badge
                    variant="outline"
                    className="mt-2 text-gray-500 border-gray-200 text-xs"
                  >
                    {pkg.groupSize}
                  </Badge>
                </div>

                <div className="space-y-3 mb-6">
                  {pkg.inclusions.map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <Check
                        className="w-4 h-4 mt-0.5 shrink-0"
                        style={{ color: pkg.color }}
                      />
                      <span className="text-gray-600 text-sm">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="text-center pt-4 border-t border-gray-100">
                  <p className="text-gray-400 text-xs mb-1">Starting from</p>
                  <p className="text-2xl font-bold text-[#1A1A2E]">
                    {formatINR(pkg.from)}
                    <span className="text-sm font-normal text-gray-400">/person</span>
                  </p>
                  <Button
                    onClick={scrollToPlanner}
                    className="mt-4 w-full rounded-full shadow-lg group"
                    style={{
                      background: `linear-gradient(to right, ${pkg.color}, ${pkg.color}cc)`,
                    }}
                  >
                    Plan {pkg.title}
                    <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
