"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Calendar,
  Users,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Palmtree,
  Mountain,
  Waves,
  Camera,
  Utensils,
  ShoppingBag,
  TreePine,
  Heart,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useTravellyStore } from "@/store/travel-store";
import { useTheme } from "@/components/providers/ThemeProvider";

const popularDestinations = [
  "Goa", "Manali", "Bali", "Dubai", "Thailand", "Kashmir",
  "Rajasthan", "Kerala", "Maldives", "Singapore", "Vietnam", "Sri Lanka",
];

const travelStyles = [
  { value: "budget", label: "Budget", emoji: "🎒" },
  { value: "comfort", label: "Comfort", emoji: "🏨" },
  { value: "luxury", label: "Luxury", emoji: "💎" },
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
  { value: "wildlife", label: "Wildlife", icon: Palmtree },
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
  const { theme } = useTheme();
  const light = theme === "light";

  const totalSteps = 4;

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
              key="step1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h3 className={cn("text-2xl font-bold mb-2", light ? "text-[#1A1A2E]" : "text-white")}>Where do you want to go?</h3>
                <p className={cn(light ? "text-gray-600" : "text-white/60")}>Pick a destination or type your dream spot</p>
              </div>

              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2EC4B6]" />
                <Input
                  value={tripForm.destination || ""}
                  onChange={(e) => setTripForm({ destination: e.target.value })}
                  placeholder="e.g., Bali, Dubai, Goa..."
                  className={cn("h-14 pl-12 text-lg rounded-xl focus:border-[#2EC4B6] focus:ring-[#2EC4B6]/20", light ? "bg-white border-gray-300 text-[#1A1A2E] placeholder:text-gray-400" : "bg-white/10 border-white/10 text-white placeholder:text-white/40")}
                />
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
                      onClick={() => setTripForm({ destination: dest })}
                    >
                      {dest}
                    </Badge>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
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

          {step === 3 && (
            <motion.div
              key="step3"
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

          {step === 4 && (
            <motion.div
              key="step4"
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
            disabled={step === 1 && !tripForm.destination}
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
                Generate My Trip Plan
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
