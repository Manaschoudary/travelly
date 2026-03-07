"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Star,
  Users,
  Check,
  X,
  Calendar,
  MapPin,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/ThemeProvider";

interface PastTrip {
  title: string;
  destination: string;
  date: string;
  duration: string;
  groupSize: number;
  rating: number;
  highlights: string[];
  gradient: string;
  testimonial: string;
  attendeeName: string;
}

interface ItineraryDay {
  day: number;
  title: string;
  description: string;
}

interface UpcomingTrip {
  title: string;
  destination: string;
  startDate: string;
  duration: string;
  price: number;
  originalPrice: number;
  spotsTotal: number;
  spotsLeft: number;
  groupSize: string;
  gradient: string;
  itinerary: ItineraryDay[];
  inclusions: string[];
  exclusions: string[];
}

const pastTrips: PastTrip[] = [
  {
    title: "Ladakh Expedition 2025",
    destination: "Leh, Ladakh",
    date: "Jun 2025",
    duration: "7 Days",
    groupSize: 12,
    rating: 4.9,
    highlights: [
      "Pangong Lake camping under the stars",
      "Khardung La Pass motorcycle ride",
      "Nubra Valley sand dunes",
      "Local monastery visits",
    ],
    gradient: "from-sky-400 to-blue-700",
    testimonial:
      "The Ladakh trip was life-changing. The group vibes were incredible and the photography spots were unreal.",
    attendeeName: "Rohit M.",
  },
  {
    title: "Spiti Valley Circuit",
    destination: "Spiti, Himachal Pradesh",
    date: "Sep 2025",
    duration: "9 Days",
    groupSize: 10,
    rating: 4.8,
    highlights: [
      "Key Monastery sunrise shoot",
      "Chandratal Lake trek",
      "Chicham Bridge crossing",
      "Homestay in Langza village",
    ],
    gradient: "from-slate-500 to-indigo-700",
    testimonial:
      "Spiti is raw and beautiful. The itinerary was perfectly paced \u2014 enough adventure with time to soak it all in.",
    attendeeName: "Ananya K.",
  },
  {
    title: "Meghalaya Exploration",
    destination: "Shillong, Meghalaya",
    date: "Nov 2025",
    duration: "6 Days",
    groupSize: 14,
    rating: 5.0,
    highlights: [
      "Double-decker living root bridge trek",
      "Dawki River crystal-clear kayaking",
      "Mawlynnong cleanest village visit",
      "Laitlum Canyon sunrise",
    ],
    gradient: "from-emerald-400 to-green-700",
    testimonial:
      "Meghalaya blew my mind. The root bridges, the waterfalls, the food \u2014 everything was magical.",
    attendeeName: "Priya S.",
  },
  {
    title: "Hampi Heritage Trail",
    destination: "Hampi, Karnataka",
    date: "Dec 2025",
    duration: "5 Days",
    groupSize: 8,
    rating: 4.7,
    highlights: [
      "Virupaksha Temple golden hour shoot",
      "Coracle ride on Tungabhadra River",
      "Matanga Hill sunrise hike",
      "Boulder climbing & cave exploration",
    ],
    gradient: "from-amber-400 to-orange-600",
    testimonial:
      "Hampi is an underrated gem. The photography opportunities were endless and the group was amazing.",
    attendeeName: "Vikram D.",
  },
];

const upcomingTrips: UpcomingTrip[] = [
  {
    title: "Kashmir Valley Explorer",
    destination: "Srinagar, Kashmir",
    startDate: "15 Apr 2026",
    duration: "6 Days / 5 Nights",
    price: 32999,
    originalPrice: 42999,
    spotsTotal: 15,
    spotsLeft: 4,
    groupSize: "8-15 people",
    gradient: "from-teal-400 to-emerald-600",
    itinerary: [
      { day: 1, title: "Arrival in Srinagar", description: "Airport pickup, check into luxury houseboat on Dal Lake. Evening shikara ride with golden hour photography session." },
      { day: 2, title: "Mughal Gardens & Old City", description: "Visit Nishat Bagh, Shalimar Bagh, and Chashme Shahi gardens. Afternoon walk through the old city bazaars and spice markets." },
      { day: 3, title: "Gulmarg Day Trip", description: "Drive to Gulmarg, ride the Gondola to Kongdoori. Snow photography, meadow walks, and local Kashmiri wazwan lunch." },
      { day: 4, title: "Pahalgam & Betaab Valley", description: "Full day in Pahalgam. Visit Betaab Valley, Aru Valley, and Chandanwari. River-side picnic lunch and landscape shoots." },
      { day: 5, title: "Sonmarg & Thajiwas Glacier", description: "Drive to Sonmarg, short trek to Thajiwas Glacier. Alpine meadow photography and optional pony ride to the glacier base." },
      { day: 6, title: "Departure Day", description: "Sunrise photography at Dal Lake, farewell breakfast on the houseboat. Airport transfers arranged." },
    ],
    inclusions: [
      "Luxury houseboat & hotel stays",
      "All meals (breakfast, lunch, dinner)",
      "Airport transfers & local transport",
      "Professional photography guidance",
      "Shikara ride & Gondola tickets",
      "Group photography sessions",
    ],
    exclusions: [
      "Flights to/from Srinagar",
      "Personal expenses & shopping",
      "Travel insurance",
      "Optional pony rides",
    ],
  },
  {
    title: "Northeast India Discovery",
    destination: "Meghalaya & Assam",
    startDate: "10 May 2026",
    duration: "8 Days / 7 Nights",
    price: 38999,
    originalPrice: 49999,
    spotsTotal: 12,
    spotsLeft: 7,
    groupSize: "8-12 people",
    gradient: "from-lime-400 to-green-700",
    itinerary: [
      { day: 1, title: "Arrival in Guwahati", description: "Airport pickup, drive to Shillong. Evening walk at Police Bazaar and local Khasi cuisine dinner." },
      { day: 2, title: "Cherrapunji Waterfalls", description: "Visit Nohkalikai Falls, Seven Sisters Falls, and Mawsmai Cave. Overnight at eco-resort in Cherrapunji." },
      { day: 3, title: "Living Root Bridges", description: "Trek to the double-decker living root bridge in Nongriat. Natural pool swimming and jungle photography." },
      { day: 4, title: "Dawki & Mawlynnong", description: "Crystal-clear Dawki River boating, visit to Asia\u2019s cleanest village Mawlynnong. Sky walk experience." },
      { day: 5, title: "Laitlum Canyon & Shillong", description: "Sunrise at Laitlum Canyon for dramatic landscape shots. Afternoon exploring Shillong\u2019s cafes and music scene." },
      { day: 6, title: "Kaziranga National Park", description: "Drive to Kaziranga. Afternoon jeep safari in the Central Range. Spot one-horned rhinos and wild elephants." },
      { day: 7, title: "Kaziranga Elephant Safari", description: "Early morning elephant safari through tall grasslands. Second jeep safari in Eastern Range. Farewell bonfire dinner." },
      { day: 8, title: "Departure from Guwahati", description: "Morning drive to Guwahati. Visit Kamakhya Temple if time permits. Airport transfers." },
    ],
    inclusions: [
      "All accommodation (eco-resorts & lodges)",
      "All meals included",
      "Jeep & elephant safari fees",
      "All internal transfers",
      "Professional guide throughout",
      "Root bridge trek guide",
    ],
    exclusions: [
      "Flights to/from Guwahati",
      "Personal expenses",
      "Travel insurance",
      "Camera fees at national park",
    ],
  },
  {
    title: "Rajasthan Heritage Circuit",
    destination: "Jaipur - Jodhpur - Jaisalmer",
    startDate: "1 Oct 2026",
    duration: "7 Days / 6 Nights",
    price: 29999,
    originalPrice: 39999,
    spotsTotal: 16,
    spotsLeft: 11,
    groupSize: "10-16 people",
    gradient: "from-yellow-400 to-orange-600",
    itinerary: [
      { day: 1, title: "Arrival in Jaipur", description: "Airport pickup, check into haveli. Evening visit to Nahargarh Fort for sunset views over the Pink City." },
      { day: 2, title: "Jaipur Forts & Palaces", description: "Amber Fort, Hawa Mahal, City Palace, and Jantar Mantar. Street photography in the old city markets." },
      { day: 3, title: "Jaipur to Jodhpur", description: "Drive to Jodhpur via Ajmer. Visit the Blue City lanes, clock tower market. Evening at Mehrangarh Fort." },
      { day: 4, title: "Jodhpur Exploration", description: "Mehrangarh Fort interior tour, Jaswant Thada, blue city walking tour. Rajasthani thali dinner with folk music." },
      { day: 5, title: "Jodhpur to Jaisalmer", description: "Drive through the Thar Desert to Jaisalmer. Evening walk through the golden fort. Rooftop dinner with fort views." },
      { day: 6, title: "Jaisalmer & Desert Camp", description: "Patwon Ki Haveli, Gadisar Lake. Afternoon camel safari into the dunes. Overnight at luxury desert camp with stargazing." },
      { day: 7, title: "Desert Sunrise & Departure", description: "Sunrise over the Thar Desert dunes. Breakfast at camp. Transfer to Jaisalmer airport/station for departure." },
    ],
    inclusions: [
      "Heritage haveli stays & desert camp",
      "Daily breakfast & 4 dinners",
      "All fort & monument entry fees",
      "Camel safari experience",
      "AC vehicle for all transfers",
      "Local expert guides",
    ],
    exclusions: [
      "Flights/trains to Jaipur & from Jaisalmer",
      "Lunches (flexible for exploration)",
      "Travel insurance",
      "Personal shopping",
    ],
  },
];

const formatINR = (val: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);

function DiscountBadge({ price, originalPrice }: { price: number; originalPrice: number }) {
  const discount = Math.round(((originalPrice - price) / originalPrice) * 100);
  return (
    <Badge className="bg-[#FF6B35] text-white border-0 text-xs">
      {discount}% OFF
    </Badge>
  );
}

function StarRating({ rating, light }: { rating: number; light: boolean }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, j) => (
        <Star
          key={j}
          className={cn(
            "w-4 h-4",
            j < Math.floor(rating)
              ? "text-[#FFD166] fill-[#FFD166]"
              : rating % 1 !== 0 && j === Math.floor(rating)
                ? "text-[#FFD166] fill-[#FFD166]/50"
                : light ? "text-gray-300" : "text-white/20"
          )}
        />
      ))}
    </div>
  );
}

function PastTripCard({ trip, index, isInView, light }: { trip: PastTrip; index: number; isInView: boolean; light: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={cn(
        "rounded-2xl overflow-hidden transition-all",
        light
          ? "bg-white shadow-sm border border-gray-200 hover:shadow-md"
          : "bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/[0.08]"
      )}
    >
      <div className={`h-40 bg-gradient-to-br ${trip.gradient} relative`}>
        <Badge className="absolute top-3 right-3 bg-black/30 backdrop-blur-sm text-white border-0 text-[10px]">
          {trip.date}
        </Badge>
        <Badge className="absolute top-3 left-3 bg-black/30 backdrop-blur-sm text-white border-0 text-[10px]">
          {trip.duration}
        </Badge>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className={cn(
              "font-bold text-lg",
              light ? "text-[#1A1A2E]" : "text-white"
            )}>{trip.title}</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <MapPin className={cn("w-3.5 h-3.5", light ? "text-gray-400" : "text-white/40")} />
              <span className={cn("text-xs", light ? "text-gray-500" : "text-white/50")}>{trip.destination}</span>
            </div>
          </div>
          <div className="text-right">
            <StarRating rating={trip.rating} light={light} />
            <span className={cn("text-xs", light ? "text-gray-500" : "text-white/50")}>{trip.rating}</span>
          </div>
        </div>

        <div className={cn("flex items-center gap-1.5 mb-4", light ? "text-gray-400" : "text-white/40")}>
          <Users className="w-3.5 h-3.5" />
          <span className="text-xs">{trip.groupSize} travelers joined</span>
        </div>

        <div className="space-y-2 mb-4">
          {trip.highlights.map((highlight) => (
            <div key={highlight} className="flex items-start gap-2">
              <Check className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#2EC4B6]" />
              <span className={cn("text-xs", light ? "text-gray-600" : "text-white/60")}>{highlight}</span>
            </div>
          ))}
        </div>

        <div className={cn("border-t pt-4", light ? "border-gray-100" : "border-white/10")}>
          <p className={cn("text-xs italic leading-relaxed", light ? "text-gray-500" : "text-white/50")}>
            &ldquo;{trip.testimonial}&rdquo;
          </p>
          <p className={cn("text-xs mt-2", light ? "text-gray-400" : "text-white/30")}>&mdash; {trip.attendeeName}</p>
        </div>
      </div>
    </motion.div>
  );
}

function UpcomingTripCard({
  trip,
  index,
  isInView,
  expandedTrip,
  onToggle,
  light,
}: {
  trip: UpcomingTrip;
  index: number;
  isInView: boolean;
  expandedTrip: string | null;
  onToggle: (title: string) => void;
  light: boolean;
}) {
  const isExpanded = expandedTrip === trip.title;

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={cn(
        "rounded-2xl overflow-hidden transition-all",
        light
          ? "bg-white shadow-sm border border-gray-200 hover:shadow-md"
          : "bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/[0.08]"
      )}
    >
      <div className={`h-52 bg-gradient-to-br ${trip.gradient} relative`}>
        <Badge
          className={cn(
            "absolute top-3 left-3 backdrop-blur-sm text-white border-0 text-[10px]",
            trip.spotsLeft <= 5 ? "bg-[#FF6B35]/80" : "bg-black/30"
          )}
        >
          {trip.spotsLeft} spots left
        </Badge>
        <Badge className="absolute top-3 right-3 bg-black/30 backdrop-blur-sm text-white border-0 text-[10px]">
          {trip.duration}
        </Badge>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-5 pt-10">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-white font-bold text-2xl">
                {formatINR(trip.price)}
              </p>
              <p className="text-white/50 text-xs">
                <span className="line-through">{formatINR(trip.originalPrice)}</span>
                <span className="text-xs ml-1">/person</span>
              </p>
            </div>
            <DiscountBadge price={trip.price} originalPrice={trip.originalPrice} />
          </div>
        </div>
      </div>

      <div className="p-5">
        <h3 className={cn(
          "font-bold text-xl mb-1",
          light ? "text-[#1A1A2E]" : "text-white"
        )}>{trip.title}</h3>
        <div className={cn(
          "flex flex-wrap items-center gap-3 mb-4 text-xs",
          light ? "text-gray-500" : "text-white/50"
        )}>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            <span>{trip.destination}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{trip.startDate}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            <span>{trip.groupSize}</span>
          </div>
        </div>

        <button
          onClick={() => onToggle(trip.title)}
          className="flex items-center gap-2 text-[#2EC4B6] text-sm font-medium hover:text-[#2EC4B6]/80 transition-colors mb-4 w-full"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Hide Itinerary
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              View Full Itinerary
            </>
          )}
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mb-6">
                <h4 className={cn(
                  "font-semibold text-sm mb-4",
                  light ? "text-[#1A1A2E]" : "text-white"
                )}>
                  Day-by-Day Itinerary
                </h4>
                <div className="space-y-4 relative">
                  <div className={cn(
                    "absolute left-[11px] top-2 bottom-2 w-px",
                    light ? "bg-gray-200" : "bg-white/10"
                  )} />
                  {trip.itinerary.map((day) => (
                    <div key={day.day} className="flex gap-4 relative">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#2EC4B6] to-[#0F4C81] flex items-center justify-center shrink-0 z-10">
                        <span className="text-white text-[10px] font-bold">
                          {day.day}
                        </span>
                      </div>
                      <div className="pb-1">
                        <p className={cn(
                          "font-semibold text-sm",
                          light ? "text-[#1A1A2E]" : "text-white"
                        )}>
                          {day.title}
                        </p>
                        <p className={cn(
                          "text-xs leading-relaxed mt-0.5",
                          light ? "text-gray-500" : "text-white/50"
                        )}>
                          {day.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className={cn(
                    "font-semibold text-sm mb-3",
                    light ? "text-[#1A1A2E]" : "text-white"
                  )}>
                    Inclusions
                  </h4>
                  <div className="space-y-2">
                    {trip.inclusions.map((item) => (
                      <div key={item} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#2EC4B6]" />
                        <span className={cn("text-xs", light ? "text-gray-600" : "text-white/60")}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className={cn(
                    "font-semibold text-sm mb-3",
                    light ? "text-[#1A1A2E]" : "text-white"
                  )}>
                    Exclusions
                  </h4>
                  <div className="space-y-2">
                    {trip.exclusions.map((item) => (
                      <div key={item} className="flex items-start gap-2">
                        <X className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#FF6B35]/70" />
                        <span className={cn("text-xs", light ? "text-gray-600" : "text-white/60")}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={cn("border-t pt-4", light ? "border-gray-100" : "border-white/10")}>
          <Button className="w-full rounded-full shadow-lg group bg-gradient-to-r from-[#FF6B35] to-[#FF8C61] hover:from-[#FF6B35] hover:to-[#FF6B35] text-white">
            Book Your Spot
            <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
          </Button>
          {trip.spotsLeft <= 5 && (
            <p className="text-center text-[#FF6B35] text-xs mt-2 font-medium">
              Only {trip.spotsLeft} spots remaining!
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function GroupTripsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const [activeTab, setActiveTab] = useState<"past" | "upcoming">("upcoming");
  const [expandedTrip, setExpandedTrip] = useState<string | null>(null);
  const { theme } = useTheme();
  const light = theme === "light";

  const handleToggleItinerary = (title: string) => {
    setExpandedTrip((prev) => (prev === title ? null : title));
  };

  return (
    <section
      id="group-trips"
      ref={ref}
      className={cn("py-20", light && "bg-[#F8F9FA]")}
      style={!light ? { background: "linear-gradient(180deg, #1A1A2E 0%, #16213E 100%)" } : undefined}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className={cn(
            "text-3xl sm:text-4xl font-bold mb-4",
            light ? "text-[#1A1A2E]" : "text-white"
          )}>
            Our Group{" "}
            <span className="bg-gradient-to-r from-[#2EC4B6] to-[#0F4C81] bg-clip-text text-transparent">
              Adventures
            </span>
          </h2>
          <p className={cn(
            "text-lg max-w-xl mx-auto",
            light ? "text-gray-600" : "text-white/60"
          )}>
            Join fellow travelers on curated group experiences across India and
            beyond
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center mb-10"
        >
          <div className={cn(
            "backdrop-blur-sm rounded-full p-1 flex gap-1",
            light
              ? "bg-gray-100 border border-gray-200"
              : "bg-white/5 border border-white/10"
          )}>
            <button
              onClick={() => setActiveTab("upcoming")}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-medium transition-all",
                activeTab === "upcoming"
                  ? "bg-gradient-to-r from-[#FF6B35] to-[#FF8C61] text-white shadow-lg"
                  : light
                    ? "text-gray-500 hover:text-[#1A1A2E]"
                    : "text-white/60 hover:text-white"
              )}
            >
              Upcoming Trips
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-medium transition-all",
                activeTab === "past"
                  ? "bg-gradient-to-r from-[#FF6B35] to-[#FF8C61] text-white shadow-lg"
                  : light
                    ? "text-gray-500 hover:text-[#1A1A2E]"
                    : "text-white/60 hover:text-white"
              )}
            >
              Past Trips
            </button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === "upcoming" ? (
            <motion.div
              key="upcoming"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {upcomingTrips.map((trip, i) => (
                <UpcomingTripCard
                  key={trip.title}
                  trip={trip}
                  index={i}
                  isInView={isInView}
                  expandedTrip={expandedTrip}
                  onToggle={handleToggleItinerary}
                  light={light}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="past"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {pastTrips.map((trip, i) => (
                <PastTripCard
                  key={trip.title}
                  trip={trip}
                  index={i}
                  isInView={isInView}
                  light={light}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
