"use client";

import { motion } from "framer-motion";
import { MapPin, Plane, Wallet, Globe } from "lucide-react";

interface Trip {
  status: string;
  totalEstimatedCost: number;
  destination: string;
  budget: number;
}

interface DashboardStatsProps {
  trips: Trip[];
}

const formatINR = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

export default function DashboardStats({ trips }: DashboardStatsProps) {
  const totalTrips = trips.length;
  const activePlans = trips.filter(
    (t) => t.status === "planning" || t.status === "booked"
  ).length;
  const totalBudget = trips.reduce(
    (sum, t) => sum + (t.totalEstimatedCost || t.budget || 0),
    0
  );
  const uniqueDestinations = new Set(
    trips.map((t) => t.destination?.toLowerCase().trim())
  ).size;

  const stats = [
    {
      label: "Total Trips",
      value: totalTrips.toString(),
      icon: Plane,
      gradient: "from-[#0F4C81] to-[#2EC4B6]",
      shadowColor: "shadow-[#0F4C81]/20",
    },
    {
      label: "Active Plans",
      value: activePlans.toString(),
      icon: MapPin,
      gradient: "from-[#2EC4B6] to-[#34D4C6]",
      shadowColor: "shadow-[#2EC4B6]/20",
    },
    {
      label: "Total Budget",
      value: formatINR(totalBudget),
      icon: Wallet,
      gradient: "from-[#FFD166] to-[#FF6B35]",
      shadowColor: "shadow-[#FFD166]/20",
    },
    {
      label: "Destinations",
      value: uniqueDestinations.toString(),
      icon: Globe,
      gradient: "from-[#FF6B35] to-[#FF8C61]",
      shadowColor: "shadow-[#FF6B35]/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className={`relative overflow-hidden rounded-2xl bg-white border border-gray-100 p-5 shadow-lg ${stat.shadowColor} hover:shadow-xl transition-shadow`}
          >
            <div
              className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.gradient} opacity-[0.07] rounded-full -translate-y-8 translate-x-8`}
            />

            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </p>
              </div>
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center flex-shrink-0`}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
