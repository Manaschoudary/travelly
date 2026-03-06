"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Compass, Plane, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardNav from "@/components/dashboard/DashboardNav";
import DashboardStats from "@/components/dashboard/DashboardStats";
import TripHistoryCard from "@/components/dashboard/TripHistoryCard";
import Link from "next/link";

interface DashboardClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

interface Trip {
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
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrips() {
      try {
        const res = await fetch("/api/trips");
        if (res.ok) {
          const data = await res.json();
          setTrips(data.trips || []);
        }
      } catch (err) {
        console.error("Failed to fetch trips:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTrips();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <DashboardNav user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome back, {user.name?.split(" ")[0] || "Traveler"}
          </h1>
          <p className="text-gray-500 mt-1">
            Here&apos;s an overview of your travel plans
          </p>
        </motion.div>

        <div className="mb-8">
          <DashboardStats trips={trips} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Your Trips</h2>
            <Link href="/#trip-planner">
              <Button
                variant="outline"
                className="gap-2 border-[#0F4C81]/20 text-[#0F4C81] hover:bg-[#0F4C81]/5"
              >
                <Plus className="w-4 h-4" />
                New Trip
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse"
                >
                  <div className="h-1 w-full bg-gray-100 rounded mb-5" />
                  <div className="h-5 bg-gray-100 rounded w-2/3 mb-3" />
                  <div className="h-4 bg-gray-50 rounded w-1/3 mb-4" />
                  <div className="grid grid-cols-3 gap-3">
                    <div className="h-4 bg-gray-50 rounded" />
                    <div className="h-4 bg-gray-50 rounded" />
                    <div className="h-4 bg-gray-50 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : trips.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 px-4"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#0F4C81]/10 to-[#2EC4B6]/10 flex items-center justify-center">
                <Compass className="w-10 h-10 text-[#0F4C81]/50" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No trips yet
              </h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                Start planning your next adventure with our AI-powered trip
                planner
              </p>
              <Link href="/#trip-planner">
                <Button className="bg-gradient-to-r from-[#FF6B35] to-[#FF8C61] hover:from-[#E05A2B] hover:to-[#FF6B35] text-white rounded-full px-8 shadow-lg shadow-orange-500/25 gap-2">
                  <Plane className="w-4 h-4" />
                  Plan Your First Trip
                </Button>
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trips.map((trip, index) => (
                <TripHistoryCard
                  key={trip._id}
                  trip={trip}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
