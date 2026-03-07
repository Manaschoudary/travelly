"use client";

import { motion } from "framer-motion";
import {
  MapPin,
  Calendar,
  Users,
  IndianRupee,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface TripHistoryCardProps {
  trip: {
    _id: string;
    title: string;
    destination: string;
    startDate: string;
    endDate: string;
    budget: number;
    totalEstimatedCost: number;
    travelers: number;
    status: "planning" | "booked" | "completed" | "cancelled";
    itinerary?: { day: number }[];
  };
  index: number;
}

const statusConfig = {
  planning: {
    label: "Planning",
    className: "bg-[#2EC4B6]/10 text-[#2EC4B6] border-[#2EC4B6]/20",
  },
  booked: {
    label: "Booked",
    className: "bg-[#0F4C81]/10 text-[#0F4C81] border-[#0F4C81]/20",
  },
  completed: {
    label: "Completed",
    className: "bg-green-100 text-green-700 border-green-200",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-gray-100 text-gray-500 border-gray-200",
  },
};

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return dateStr;
  }
};

const formatINR = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

export default function TripHistoryCard({
  trip,
  index,
}: TripHistoryCardProps) {
  const status = statusConfig[trip.status] || statusConfig.planning;
  const cost = trip.totalEstimatedCost || trip.budget || 0;
  const days = trip.itinerary?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
    >
      <div className="h-1 w-full bg-gradient-to-r from-[#0F4C81] via-[#2EC4B6] to-[#FF6B35]" />

      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 truncate">
              {trip.title}
            </h3>
            <div className="flex items-center gap-1.5 text-gray-500 mt-1">
              <MapPin className="w-3.5 h-3.5 text-[#FF6B35] flex-shrink-0" />
              <span className="text-sm truncate">{trip.destination}</span>
            </div>
          </div>
          <Badge
            variant="outline"
            className={`${status.className} flex-shrink-0 ml-3 font-medium`}
          >
            {status.label}
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-3.5 h-3.5 text-[#0F4C81]" />
            <span>
              {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-3.5 h-3.5 text-[#2EC4B6]" />
            <span>
              {trip.travelers} traveler{trip.travelers !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <IndianRupee className="w-3.5 h-3.5 text-[#FFD166]" />
            <span className="font-medium">{formatINR(cost)}</span>
          </div>
          {days > 0 && (
            <div className="text-sm text-gray-500">
              {days} day{days !== 1 ? "s" : ""} itinerary
            </div>
          )}
        </div>

        <div className="flex items-center justify-end pt-3 border-t border-gray-50">
          <Link href={`/trip/${trip._id}`}>
            <Button
              variant="ghost"
              size="sm"
              className="text-[#0F4C81] hover:text-[#0F4C81] hover:bg-[#0F4C81]/5 gap-1 group-hover:gap-2 transition-all"
            >
              View Details
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
