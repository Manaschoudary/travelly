"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Calendar,
  Users,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Mountain,
  Waves,
  Camera,
  Utensils,
  ShoppingBag,
  TreePine,
  Heart,
  Sun,
  LocateFixed,
  Loader2,
  Plane,
  Train,
  Car,
  Bus,
  Shuffle,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useTravellyStore, type TransportMode } from "@/store/travel-store";
import { useTheme } from "@/components/providers/ThemeProvider";
import useGeolocation, { INDIAN_CITIES } from "@/hooks/use-geolocation";
import { searchDestinations, getTypeEmoji, type Destination } from "@/lib/destinations";

const popularDestinations = [
  "Goa", "Manali", "Bali", "Dubai", "Thailand", "Kashmir",
  "Rajasthan", "Kerala", "Maldives", "Singapore", "Vietnam", "Sri Lanka",
];

const travelStyles = [
  { value: "budget", label: "Budget", emoji: "\uD83C\uDF92" },
  { value: "comfort", label: "Comfort", emoji: "\uD83C\uDFE8" },
  { value: "luxury", label: "Luxury", emoji: "\uD83D\uDC8E" },
];

const interestOptions = [
  { value: "adventure", label: "Adventure", icon: Mountain },
  { value: "culture", label: "Culture", icon: Sun },
  { value: "food", label: "Food", icon: Utensils },
  { value: "nightlife", label: "Nightlife", icon: Sparkles },
  { value: "photography", label: "Photography", icon: Camera },
  { value: "shopping", label: "Shopping", icon: ShoppingBag },
  { value: "nature", label: "Nature", icon: TreePine },
  { value: "relaxation", label: "Relaxation", icon: Heart },
  { value: "beaches", label: "Beaches", icon: Waves },
  { value: "mountains", label: "Mountains", icon: Mountain },
];

const transportOptions: { value: TransportMode; label: string; icon: typeof Plane; description: string }[] = [
  { value: "flight", label: "Flight", icon: Plane, description: "Fastest option" },
  { value: "train", label: "Train", icon: Train, description: "Scenic & budget-friendly" },
  { value: "drive", label: "Self Drive", icon: Car, description: "Road trip freedom" },
  { value: "bus", label: "Bus", icon: Bus, description: "Most economical" },
  { value: "any", label: "Suggest Best", icon: Shuffle, description: "AI picks the best" },
];

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -300 : 300, opacity: 0 }),
};

export default function TripForm() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const { tripForm, setTripForm, setCurrentStep, setAvatarState } = useTravellyStore();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [destResults, setDestResults] = useState<Destination[]>([]);
  const destDropdownRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const light = theme === "light";
  const geo = useGeolocation();

  const suggestMode = tripForm.suggestTrip || false;
  const totalSteps = 5;

  useEffect(() => {
    if (geo.detectedCity && !tripForm.originCity) {
      setTripForm({
        originCity: geo.detectedCity.city,
        originAirport: geo.detectedCity.iata,
      });
    }
  }, [geo.detectedCity, tripForm.originCity, setTripForm]);

  const handleDestSearch = useCallback((value: string) => {
    setTripForm({ destination: value });
    if (value.length >= 1) {
      setDestResults(searchDestinations(value, 8));
      setShowDestDropdown(true);
    } else {
      setDestResults([]);
      setShowDestDropdown(false);
    }
  }, [setTripForm]);

  const selectDestination = useCallback((dest: Destination) => {
    setTripForm({ destination: dest.name });
    setDestResults([]);
    setShowDestDropdown(false);
  }, [setTripForm]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (destDropdownRef.current && !destDropdownRef.current.contains(e.target as Node)) {
        setShowDestDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCities = INDIAN_CITIES.filter((c) =>
    c.city.toLowerCase().includes(citySearch.toLowerCase()) ||
    c.iata.toLowerCase().includes(citySearch.toLowerCase())
  ).slice(0, 8);

  const goNext = () => {
    if (step < totalSteps) {
      setDirection(1);
      setStep(step + 1);
    }
  };

  const goBack = () => {
    if (step > 1) {
      setDirection(-1);
      setStep(step - 1);
    }
  };

  const toggleInterest = (value: string) => {
    setSelectedInterests((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setAvatarState("thinking");
    setTripForm({ interests: selectedInterests });
    setCurrentStep("chat");
    setIsSubmitting(false);
  };

  const canProceedStep1 = !!tripForm.originCity;
  const canProceedStep2 = suggestMode || !!tripForm.destination;

  const formatINR = (val: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-8">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} className="flex-1 flex items-center gap-2">
            <div
              className={cn(
                "h-2 flex-1 rounded-full transition-all duration-500",
                i < step ? "bg-gradient-to-r from-[#FF6B35] to-[#FFD166]" : light ? "bg-gray-200" : "bg-white/10"
              )}
            />
          </div>
        ))}
        <span className={cn("text-sm ml-2", light ? "text-gray-500" : "text-white/50")}>
          {step}/{totalSteps}
        </span>
      </div>

      <div className="relative overflow-hidden min-h-[400px]">
        <AnimatePresence mode="wait" custom={direction}>
          {step === 1 && (
            <motion.div
              key="step1-origin"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h3 className={cn("text-2xl font-bold mb-2", light ? "text-[#1A1A2E]" : "text-white")}>
                  Where are you traveling from?
                </h3>
                <p className={cn(light ? "text-gray-600" : "text-white/60")}>
                  We&apos;ll estimate travel costs and suggest the best routes
                </p>
              </div>

              <div className="relative">
                <LocateFixed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2EC4B6]" />
                <Input
                  value={tripForm.originCity || ""}
                  onChange={(e) => {
                    setCitySearch(e.target.value);
                    setTripForm({ originCity: e.target.value, originAirport: "" });
                    setShowCityDropdown(true);
                  }}
                  onFocus={() => setShowCityDropdown(true)}
                  placeholder="e.g., Mumbai, Delhi, Bangalore..."
                  className={cn("h-14 pl-12 pr-32 text-lg rounded-xl focus:border-[#2EC4B6] focus:ring-[#2EC4B6]/20", light ? "bg-white border-gray-300 text-[#1A1A2E] placeholder:text-gray-400" : "bg-white/10 border-white/10 text-white placeholder:text-white/40")}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => geo.detect()}
                  disabled={geo.loading}
                  className={cn("absolute right-2 top-1/2 -translate-y-1/2 rounded-full text-xs gap-1.5", light ? "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100" : "bg-white/10 border-white/10 text-white/70 hover:bg-white/20")}
                >
                  {geo.loading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <LocateFixed className="w-3.5 h-3.5" />
                  )}
                  Detect
                </Button>

                {showCityDropdown && (tripForm.originCity || "").length > 0 && !tripForm.originAirport && (
                  <div className={cn("absolute top-full left-0 right-0 mt-1 rounded-xl border shadow-xl z-50 max-h-60 overflow-y-auto", light ? "bg-white border-gray-200" : "bg-[#1A1A2E] border-white/10")}>
                    {filteredCities.map((city) => (
                      <button
                        key={city.iata}
                        onClick={() => {
                          setTripForm({ originCity: city.city, originAirport: city.iata });
                          setCitySearch("");
                          setShowCityDropdown(false);
                        }}
                        className={cn("w-full text-left px-4 py-3 flex items-center justify-between transition-colors", light ? "hover:bg-gray-50 text-[#1A1A2E]" : "hover:bg-white/5 text-white")}
                      >
                        <div>
                          <span className="font-medium">{city.city}</span>
                          <span className={cn("text-xs ml-2", light ? "text-gray-400" : "text-white/40")}>{city.airport}</span>
                        </div>
                        <Badge variant="outline" className={cn("text-[10px] font-mono", light ? "border-gray-200 text-gray-500" : "border-white/10 text-white/50")}>{city.iata}</Badge>
                      </button>
                    ))}
                    {filteredCities.length === 0 && (
                      <p className={cn("px-4 py-3 text-sm", light ? "text-gray-400" : "text-white/40")}>No cities found</p>
                    )}
                  </div>
                )}
              </div>

              {geo.error && (
                <p className="text-xs text-orange-400">{geo.error}</p>
              )}

              {tripForm.originAirport && (
                <p className="text-sm text-[#2EC4B6]">
                  Nearest airport: {tripForm.originAirport} ({tripForm.originCity})
                </p>
              )}

              <div className="space-y-3">
                <Label className={cn(light ? "text-gray-600" : "text-white/70")}>Preferred Transport</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {transportOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setTripForm({ transportMode: opt.value })}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                        tripForm.transportMode === opt.value
                          ? "bg-[#2EC4B6]/20 border-[#2EC4B6] shadow-lg shadow-[#2EC4B6]/10"
                          : light ? "bg-gray-50 border-gray-200 hover:bg-gray-100" : "bg-white/5 border-white/10 hover:bg-white/10"
                      )}
                    >
                      <opt.icon
                        className={cn(
                          "w-5 h-5 shrink-0",
                          tripForm.transportMode === opt.value ? "text-[#2EC4B6]" : light ? "text-gray-400" : "text-white/50"
                        )}
                      />
                      <div>
                        <div className={cn("text-sm font-medium", light ? "text-[#1A1A2E]" : "text-white")}>{opt.label}</div>
                        <div className={cn("text-[10px]", light ? "text-gray-400" : "text-white/40")}>{opt.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setTripForm({ suggestTrip: !suggestMode })}
                className={cn(
                  "w-full flex items-center gap-3 p-4 rounded-xl border transition-all",
                  suggestMode
                    ? "bg-gradient-to-r from-[#FFD166]/20 to-[#FF6B35]/20 border-[#FFD166] shadow-lg"
                    : light ? "bg-gray-50 border-gray-200 hover:bg-gray-100" : "bg-white/5 border-white/10 hover:bg-white/10"
                )}
              >
                <Lightbulb className={cn("w-5 h-5 shrink-0", suggestMode ? "text-[#FFD166]" : light ? "text-gray-400" : "text-white/50")} />
                <div className="text-left">
                  <div className={cn("text-sm font-medium", light ? "text-[#1A1A2E]" : "text-white")}>
                    Suggest me a trip!
                  </div>
                  <div className={cn("text-xs", light ? "text-gray-400" : "text-white/40")}>
                    Don&apos;t have a destination? Let AI suggest the perfect trip for you.
                  </div>
                </div>
                <div className={cn("ml-auto w-10 h-6 rounded-full p-0.5 transition-colors", suggestMode ? "bg-[#FFD166]" : light ? "bg-gray-200" : "bg-white/10")}>
                  <div className={cn("w-5 h-5 rounded-full transition-transform", suggestMode ? "translate-x-4 bg-white" : "translate-x-0", light ? "bg-white" : "bg-white/50")} />
                </div>
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2-dest"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h3 className={cn("text-2xl font-bold mb-2", light ? "text-[#1A1A2E]" : "text-white")}>
                  {suggestMode ? "Any preferences?" : "Where do you want to go?"}
                </h3>
                <p className={cn(light ? "text-gray-600" : "text-white/60")}>
                  {suggestMode
                    ? "Optional — leave blank and we'll surprise you based on your budget & interests"
                    : "Pick a destination or type your dream spot"
                  }
                </p>
              </div>

              <div className="relative" ref={destDropdownRef}>
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2EC4B6]" />
                <Input
                  value={tripForm.destination || ""}
                  onChange={(e) => handleDestSearch(e.target.value)}
                  onFocus={() => {
                    if ((tripForm.destination || "").length >= 1) {
                      setDestResults(searchDestinations(tripForm.destination || "", 8));
                      setShowDestDropdown(true);
                    }
                  }}
                  placeholder={suggestMode ? "Optional — e.g., somewhere by the beach..." : "e.g., Bali, Dubai, Goa..."}
                  className={cn("h-14 pl-12 text-lg rounded-xl focus:border-[#2EC4B6] focus:ring-[#2EC4B6]/20", light ? "bg-white border-gray-300 text-[#1A1A2E] placeholder:text-gray-400" : "bg-white/10 border-white/10 text-white placeholder:text-white/40")}
                  autoComplete="off"
                />

                {showDestDropdown && destResults.length > 0 && (
                  <div className={cn("absolute top-full left-0 right-0 mt-1 rounded-xl border shadow-xl z-50 max-h-60 overflow-y-auto", light ? "bg-white border-gray-200" : "bg-[#1A1A2E] border-white/10")}>
                    {destResults.map((dest) => (
                      <button
                        key={`${dest.name}-${dest.country}`}
                        onClick={() => selectDestination(dest)}
                        className={cn("w-full text-left px-4 py-3 flex items-center justify-between transition-colors", light ? "hover:bg-gray-50 text-[#1A1A2E]" : "hover:bg-white/5 text-white")}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-base">{getTypeEmoji(dest.type)}</span>
                          <div>
                            <span className="font-medium">{dest.name}</span>
                            <span className={cn("text-xs ml-2", light ? "text-gray-400" : "text-white/40")}>{dest.country}</span>
                          </div>
                        </div>
                        <Badge variant="outline" className={cn("text-[10px] capitalize", light ? "border-gray-200 text-gray-500" : "border-white/10 text-white/50")}>{dest.type}</Badge>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label className={cn("text-sm mb-3 block", light ? "text-gray-600" : "text-white/70")}>Popular picks</Label>
                <div className="flex flex-wrap gap-2">
                  {popularDestinations.map((dest) => (
                    <Badge
                      key={dest}
                      variant={tripForm.destination === dest ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer px-4 py-2 rounded-full text-sm transition-all",
                        tripForm.destination === dest
                          ? "bg-[#2EC4B6] text-white border-[#2EC4B6] shadow-lg shadow-[#2EC4B6]/25"
                          : light ? "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-[#1A1A2E]" : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
                      )}
                      onClick={() => {
                        setTripForm({ destination: dest });
                        setShowDestDropdown(false);
                      }}
                    >
                      {dest}
                    </Badge>
                  ))}
                </div>
              </div>

              {suggestMode && (
                <div className={cn("rounded-xl p-4 text-sm flex items-start gap-3", light ? "bg-[#FFD166]/10 text-[#1A1A2E]" : "bg-[#FFD166]/10 text-[#FFD166]")}>
                  <Lightbulb className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>
                    Suggest mode is on. Our AI will recommend destinations based on your budget,
                    travel dates, interests, and transport preference from <strong>{tripForm.originCity || "your city"}</strong>.
                  </span>
                </div>
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3-dates"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h3 className={cn("text-2xl font-bold mb-2", light ? "text-[#1A1A2E]" : "text-white")}>When are you traveling?</h3>
                <p className={cn(light ? "text-gray-600" : "text-white/60")}>Select your travel dates</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className={cn("flex items-center gap-2", light ? "text-gray-600" : "text-white/70")}>
                    <Calendar className="w-4 h-4" /> Start Date
                  </Label>
                  <Input
                    type="date"
                    value={tripForm.startDate || ""}
                    onChange={(e) => setTripForm({ startDate: e.target.value })}
                    min={new Date().toISOString().split("T")[0]}
                    className={cn("h-12 rounded-xl focus:border-[#2EC4B6]", light ? "bg-white border-gray-300 text-[#1A1A2E]" : "bg-white/10 border-white/10 text-white [color-scheme:dark]")}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={cn("flex items-center gap-2", light ? "text-gray-600" : "text-white/70")}>
                    <Calendar className="w-4 h-4" /> End Date
                  </Label>
                  <Input
                    type="date"
                    value={tripForm.endDate || ""}
                    onChange={(e) => setTripForm({ endDate: e.target.value })}
                    min={tripForm.startDate || new Date().toISOString().split("T")[0]}
                    className={cn("h-12 rounded-xl focus:border-[#2EC4B6]", light ? "bg-white border-gray-300 text-[#1A1A2E]" : "bg-white/10 border-white/10 text-white [color-scheme:dark]")}
                  />
                </div>
              </div>

              <div>
                <Label className={cn("text-sm mb-3 block", light ? "text-gray-600" : "text-white/70")}>Quick select</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "This Weekend", days: 2 },
                    { label: "Next Week", days: 7 },
                    { label: "Next Month", days: 5 },
                  ].map((option) => {
                    const start = new Date();
                    if (option.label === "Next Week") start.setDate(start.getDate() + 7);
                    if (option.label === "Next Month") start.setMonth(start.getMonth() + 1);
                    if (option.label === "This Weekend") {
                      const day = start.getDay();
                      start.setDate(start.getDate() + (6 - day));
                    }
                    const end = new Date(start);
                    end.setDate(end.getDate() + option.days);

                    return (
                      <Badge
                        key={option.label}
                        variant="outline"
                        className={cn("cursor-pointer px-4 py-2 rounded-full", light ? "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-[#1A1A2E]" : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white")}
                        onClick={() =>
                          setTripForm({
                            startDate: start.toISOString().split("T")[0],
                            endDate: end.toISOString().split("T")[0],
                          })
                        }
                      >
                        {option.label}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4-budget"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h3 className={cn("text-2xl font-bold mb-2", light ? "text-[#1A1A2E]" : "text-white")}>Budget & Group</h3>
                <p className={cn(light ? "text-gray-600" : "text-white/60")}>Help us optimize your trip</p>
              </div>

              <div className="space-y-2">
                <Label className={cn(light ? "text-gray-600" : "text-white/70")}>Total Budget (INR)</Label>
                <Input
                  type="number"
                  value={tripForm.budget || ""}
                  onChange={(e) => setTripForm({ budget: Number(e.target.value) })}
                  placeholder="e.g., 50000"
                  min={5000}
                  step={5000}
                  className={cn("h-12 rounded-xl focus:border-[#2EC4B6]", light ? "bg-white border-gray-300 text-[#1A1A2E]" : "bg-white/10 border-white/10 text-white")}
                />
                {tripForm.budget && (
                  <p className="text-[#2EC4B6] text-sm">{formatINR(tripForm.budget)}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className={cn("flex items-center gap-2", light ? "text-gray-600" : "text-white/70")}>
                  <Users className="w-4 h-4" /> Number of Travelers
                </Label>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setTripForm({ travelers: Math.max(1, (tripForm.travelers || 1) - 1) })
                    }
                    className={cn("rounded-xl", light ? "bg-gray-50 border-gray-300 text-[#1A1A2E] hover:bg-gray-100" : "bg-white/10 border-white/10 text-white hover:bg-white/20")}
                  >
                    -
                  </Button>
                  <span className={cn("text-2xl font-bold w-12 text-center", light ? "text-[#1A1A2E]" : "text-white")}>
                    {tripForm.travelers || 1}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setTripForm({ travelers: Math.min(20, (tripForm.travelers || 1) + 1) })
                    }
                    className={cn("rounded-xl", light ? "bg-gray-50 border-gray-300 text-[#1A1A2E] hover:bg-gray-100" : "bg-white/10 border-white/10 text-white hover:bg-white/20")}
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Label className={cn(light ? "text-gray-600" : "text-white/70")}>Travel Style</Label>
                <div className="grid grid-cols-3 gap-3">
                  {travelStyles.map((style) => (
                    <button
                      key={style.value}
                      onClick={() => setTripForm({ travelStyle: style.value })}
                      className={cn(
                        "p-4 rounded-xl border text-center transition-all",
                        tripForm.travelStyle === style.value
                          ? "bg-[#2EC4B6]/20 border-[#2EC4B6] shadow-lg shadow-[#2EC4B6]/10"
                          : light ? "bg-gray-50 border-gray-200 hover:bg-gray-100" : "bg-white/5 border-white/10 hover:bg-white/10"
                      )}
                    >
                      <div className="text-2xl mb-1">{style.emoji}</div>
                      <div className={cn("text-sm font-medium", light ? "text-[#1A1A2E]" : "text-white")}>{style.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="step5-interests"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h3 className={cn("text-2xl font-bold mb-2", light ? "text-[#1A1A2E]" : "text-white")}>What interests you?</h3>
                <p className={cn(light ? "text-gray-600" : "text-white/60")}>Select all that apply</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {interestOptions.map((interest) => (
                  <button
                    key={interest.value}
                    onClick={() => toggleInterest(interest.value)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                      selectedInterests.includes(interest.value)
                        ? "bg-[#2EC4B6]/20 border-[#2EC4B6] shadow-lg"
                        : light ? "bg-gray-50 border-gray-200 hover:bg-gray-100" : "bg-white/5 border-white/10 hover:bg-white/10"
                    )}
                  >
                    <interest.icon
                      className={cn(
                        "w-5 h-5",
                        selectedInterests.includes(interest.value)
                          ? "text-[#2EC4B6]"
                          : light ? "text-gray-400" : "text-white/50"
                      )}
                    />
                    <span className={cn("text-sm font-medium", light ? "text-[#1A1A2E]" : "text-white")}>{interest.label}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <Label className={cn(light ? "text-gray-600" : "text-white/70")}>Special requests (optional)</Label>
                <Textarea
                  value={tripForm.specialRequests || ""}
                  onChange={(e) => setTripForm({ specialRequests: e.target.value })}
                  placeholder="e.g., vegetarian food only, wheelchair accessible, early morning flights..."
                  className={cn("rounded-xl resize-none min-h-[80px] focus:border-[#2EC4B6]", light ? "bg-white border-gray-300 text-[#1A1A2E] placeholder:text-gray-400" : "bg-white/10 border-white/10 text-white placeholder:text-white/40")}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-between mt-8 gap-4">
        {step > 1 ? (
          <Button
            onClick={goBack}
            variant="outline"
            className={cn("rounded-full px-6", light ? "bg-gray-50 border-gray-300 text-[#1A1A2E] hover:bg-gray-100" : "bg-white/5 border-white/10 text-white hover:bg-white/10")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        ) : (
          <div />
        )}

        {step < totalSteps ? (
          <Button
            onClick={goNext}
            disabled={(step === 1 && !canProceedStep1) || (step === 2 && !canProceedStep2)}
            className="bg-gradient-to-r from-[#2EC4B6] to-[#0F4C81] text-white rounded-full px-6 shadow-lg disabled:opacity-50"
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-[#FF6B35] to-[#FF8C61] text-white rounded-full px-8 shadow-xl shadow-orange-500/25 group"
          >
            {isSubmitting ? (
              "Generating..."
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                {suggestMode ? "Suggest My Trip" : "Generate My Trip Plan"}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
