"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Plane,
  Hotel,
  DollarSign,
  Lightbulb,
  Share2,
  Save,
  ArrowLeft,
  ExternalLink,
  Loader2,
  Check,
  Link as LinkIcon,
  Star,
  Mail,
  FileDown,
  Users,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useTravellyStore } from "@/store/travel-store";
import { buildFlightLink, buildHotelLink } from "@/lib/affiliate";
import { formatDualCurrency, detectUserCurrency, getSortedCurrencies } from "@/lib/currency";
import { generateTripPDF } from "@/lib/pdf";
import type { HotelEstimateResult } from "@/lib/hotels";
import type { WeatherResult } from "@/lib/weather";
import {
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudDrizzle,
  CloudFog,
  Snowflake,
  Thermometer,
  CloudSun,
  Droplets,
} from "lucide-react";

interface TripPlan {
  itinerary: string;
  flights: string;
  hotels: string;
  budget: string;
  localTips: string;
}

function renderLineInline(text: string) {
  const mdLinkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = mdLinkRe.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const label = match[1];
    const url = match[2];
    const isBooking =
      url.includes("aviasales.com") || url.includes("hotellook.com");
    const type = url.includes("aviasales")
      ? ("flight" as const)
      : ("hotel" as const);

    parts.push(
      <a
        key={`lnk-${match.index}`}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          if (isBooking) {
            fetch("/api/booking-click", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type,
                platform: type === "flight" ? "aviasales" : "hotellook",
                affiliateLink: url,
              }),
            }).catch(() => {});
          }
        }}
        className={
          isBooking
            ? "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-white text-xs font-medium bg-gradient-to-r from-[#FF6B35] to-[#FF8C61] hover:brightness-110 no-underline mx-0.5"
            : "text-[#2EC4B6] underline underline-offset-2 hover:text-[#FFD166]"
        }
      >
        {label}
        {isBooking && <ExternalLink className="w-3 h-3 inline" />}
      </a>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? <>{parts}</> : text;
}

const WEATHER_ICONS: Record<string, typeof Sun> = {
  sun: Sun,
  "cloud-sun": CloudSun,
  cloud: Cloud,
  "cloud-fog": CloudFog,
  "cloud-drizzle": CloudDrizzle,
  "cloud-rain": CloudRain,
  "cloud-lightning": CloudLightning,
  snowflake: Snowflake,
  thermometer: Thermometer,
};

function WeatherIcon({ icon, className }: { icon: string; className?: string }) {
  const Icon = WEATHER_ICONS[icon] || Thermometer;
  return <Icon className={className} />;
}

function ContentRenderer({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="space-y-2 text-white/80 text-sm leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith("**") && line.endsWith("**"))
          return (
            <h4
              key={i}
              className="text-white font-semibold text-base mt-4 mb-2"
            >
              {renderLineInline(line.replace(/\*\*/g, ""))}
            </h4>
          );
        if (line.startsWith("###") || line.startsWith("## "))
          return (
            <h3
              key={i}
              className="text-white font-bold text-lg mt-4 mb-2"
            >
              {renderLineInline(line.replace(/^#+\s/, ""))}
            </h3>
          );
        if (line.startsWith("Day") || line.match(/^Day\s\d/i))
          return (
            <h4
              key={i}
              className="text-[#FFD166] font-semibold text-base mt-4 mb-1"
            >
              {renderLineInline(line)}
            </h4>
          );
        if (line.startsWith("- ") || line.startsWith("• "))
          return (
            <li key={i} className="ml-4 list-disc">
              {renderLineInline(line.slice(2))}
            </li>
          );
        if (line.match(/^\d+\./))
          return (
            <li key={i} className="ml-4 list-decimal">
              {renderLineInline(line.replace(/^\d+\.\s*/, ""))}
            </li>
          );
        if (line.includes("\u20B9"))
          return (
            <p key={i} className="text-[#2EC4B6]">
              {renderLineInline(line)}
            </p>
          );
        if (line.trim() === "") return <br key={i} />;
        return <p key={i}>{renderLineInline(line)}</p>;
      })}
    </div>
  );
}

export default function TripResults() {
  const {
    tripForm,
    setCurrentStep,
    setAvatarState,
    savedTripId,
    setSavedTripId,
    setCurrentPlan,
    setChatSessionId,
    userCurrency,
    setUserCurrency,
  } = useTravellyStore();
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sharing, setSharing] = useState(false);
  const [shared, setShared] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hotelEstimates, setHotelEstimates] = useState<HotelEstimateResult | null>(null);
  const [weather, setWeather] = useState<WeatherResult | null>(null);
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"editor" | "viewer">("editor");
  const [inviteSending, setInviteSending] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [comments, setComments] = useState<{ userId: string; userName: string; section: string; content: string; createdAt: string }[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commentSection, setCommentSection] = useState("general");
  const [commentSending, setCommentSending] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [votes, setVotes] = useState<Record<string, { upCount: number; downCount: number; userVote: string | null }>>({});

  const generatePlan = useCallback(async () => {
    setLoading(true);
    setAvatarState("thinking");
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tripForm),
      });
      if (!res.ok) throw new Error("Failed to generate plan");
      const data = await res.json();
      const { tripId, ...planData } = data;
      setPlan(planData);
      if (tripId) {
        setSavedTripId(tripId);
        setSaved(true);
      }
      setAvatarState("excited");
      setTimeout(() => setAvatarState("idle"), 3000);

      if (tripForm.destination && tripForm.startDate && tripForm.endDate) {
        fetch(
          `/api/hotels?destination=${encodeURIComponent(tripForm.destination)}&checkIn=${tripForm.startDate}&checkOut=${tripForm.endDate}&adults=${tripForm.travelers || 2}`
        )
          .then((r) => r.json())
          .then((d) => setHotelEstimates(d))
          .catch(() => {});

        fetch(
          `/api/weather?destination=${encodeURIComponent(tripForm.destination)}&startDate=${tripForm.startDate}&endDate=${tripForm.endDate}`
        )
          .then((r) => r.json())
          .then((d) => setWeather(d))
          .catch(() => {});
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setAvatarState("idle");
    } finally {
      setLoading(false);
    }
  }, [tripForm, setAvatarState, setSavedTripId]);

  useEffect(() => {
    generatePlan();
  }, [generatePlan]);

  useEffect(() => {
    if (userCurrency === "INR") {
      const detected = detectUserCurrency();
      if (detected !== "INR") {
        setUserCurrency(detected);
      }
    }
  }, [userCurrency, setUserCurrency]);

  const handleShare = async () => {
    if (!savedTripId) return;
    setSharing(true);
    try {
      const res = await fetch(`/api/trips/${savedTripId}/share`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to share");
      const data = await res.json();
      await navigator.clipboard.writeText(data.shareUrl);
      setShared(true);
      setTimeout(() => setShared(false), 3000);
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      setShared(true);
      setTimeout(() => setShared(false), 3000);
    } finally {
      setSharing(false);
    }
  };

  const handleModifyInChat = () => {
    if (plan) {
      setCurrentPlan(plan);
    }
    setChatSessionId(null);
    setCurrentStep("chat");
  };

  const handleSendEmail = async () => {
    if (!savedTripId || !emailTo.trim()) return;
    setEmailSending(true);
    setEmailError("");
    try {
      const res = await fetch(`/api/trips/${savedTripId}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailTo.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send email");
      }
      setEmailSent(true);
      setTimeout(() => {
        setEmailSent(false);
        setEmailOpen(false);
        setEmailTo("");
      }, 2500);
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : "Failed to send email");
    } finally {
      setEmailSending(false);
    }
  };

  const handleInvite = async () => {
    if (!savedTripId || !inviteEmail.trim()) return;
    setInviteSending(true);
    setInviteError("");
    try {
      const res = await fetch(`/api/trips/${savedTripId}/collaborate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to invite");
      }
      setInviteSent(true);
      setTimeout(() => {
        setInviteSent(false);
        setInviteOpen(false);
        setInviteEmail("");
      }, 2500);
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : "Failed to invite");
    } finally {
      setInviteSending(false);
    }
  };

  const loadComments = useCallback(async () => {
    if (!savedTripId) return;
    try {
      const res = await fetch(`/api/trips/${savedTripId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch { }
  }, [savedTripId]);

  useEffect(() => {
    if (savedTripId) {
      loadComments();
    }
  }, [savedTripId, loadComments]);

  const handleAddComment = async () => {
    if (!savedTripId || !newComment.trim()) return;
    setCommentSending(true);
    try {
      const res = await fetch(`/api/trips/${savedTripId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: commentSection, content: newComment.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setComments((prev) => [...prev, data.comment]);
        setNewComment("");
      }
    } catch { } finally {
      setCommentSending(false);
    }
  };

  const handleVote = async (section: string, vote: "up" | "down") => {
    if (!savedTripId) return;
    try {
      const res = await fetch(`/api/trips/${savedTripId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, vote }),
      });
      if (res.ok) {
        const data = await res.json();
        setVotes((prev) => ({ ...prev, [section]: data }));
      }
    } catch { }
  };

  const tabs = [
    { value: "itinerary", label: "Itinerary", icon: Calendar, emoji: "📋" },
    { value: "flights", label: "Flights", icon: Plane, emoji: "✈️" },
    { value: "hotels", label: "Hotels", icon: Hotel, emoji: "🏨" },
    { value: "budget", label: "Budget", icon: DollarSign, emoji: "💰" },
    { value: "localTips", label: "Local Tips", icon: Lightbulb, emoji: "🎯" },
  ];

  if (loading) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <Loader2 className="w-12 h-12 text-[#2EC4B6] animate-spin mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">
            Planning your dream trip...
          </h3>
          <p className="text-white/60 text-center max-w-md">
            Our 6 AI agents are working together to craft the perfect itinerary
            for {tripForm.destination}
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {[
              "🗺️ Trip Planner",
              "✈️ Flight Agent",
              "🏨 Hotel Agent",
              "💰 Budget Agent",
              "🎯 Local Expert",
            ].map((agent, i) => (
              <motion.div
                key={agent}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.3 }}
              >
                <Badge
                  variant="outline"
                  className="text-white/60 border-white/10 bg-white/5"
                >
                  {agent}
                </Badge>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-3xl mx-auto text-center py-20">
        <p className="text-red-400 mb-4">{error}</p>
        <Button onClick={generatePlan} className="bg-[#2EC4B6] text-white">
          Try Again
        </Button>
      </div>
    );
  }

  if (!plan) return null;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white">
              Your {tripForm.destination} Trip Plan
            </h3>
            <p className="text-white/60">
              Generated by 6 specialist AI agents
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/5 border-white/10 text-white/70 hover:bg-white/10 rounded-full"
              onClick={handleShare}
              disabled={sharing || !savedTripId}
            >
              {shared ? (
                <>
                  <Check className="w-4 h-4 mr-1" /> Link Copied!
                </>
              ) : sharing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" /> Sharing...
                </>
              ) : (
                <>
                  {savedTripId ? (
                    <LinkIcon className="w-4 h-4 mr-1" />
                  ) : (
                    <Share2 className="w-4 h-4 mr-1" />
                  )}{" "}
                  Share
                </>
              )}
            </Button>
            <Dialog open={emailOpen} onOpenChange={(open) => { setEmailOpen(open); if (!open) { setEmailError(""); setEmailSent(false); } }}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/5 border-white/10 text-white/70 hover:bg-white/10 rounded-full"
                  disabled={!savedTripId}
                >
                  <Mail className="w-4 h-4 mr-1" /> Email
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#1A1A2E] border-white/10 text-white sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-white">Email Trip Plan</DialogTitle>
                  <DialogDescription className="text-white/60">
                    Send this trip plan to any email address. The recipient will get a beautifully formatted summary.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-2">
                  <Input
                    type="email"
                    placeholder="recipient@example.com"
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleSendEmail(); }}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#2EC4B6]"
                    disabled={emailSending || emailSent}
                  />
                  {emailError && (
                    <p className="text-red-400 text-xs">{emailError}</p>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleSendEmail}
                    disabled={emailSending || emailSent || !emailTo.trim()}
                    className={cn(
                      "rounded-full",
                      emailSent
                        ? "bg-[#2EC4B6] text-white"
                        : "bg-gradient-to-r from-[#FF6B35] to-[#FF8C61] text-white"
                    )}
                  >
                    {emailSent ? (
                      <>
                        <Check className="w-4 h-4 mr-1" /> Sent!
                      </>
                    ) : emailSending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" /> Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-1" /> Send Email
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button
              size="sm"
              className={cn(
                "rounded-full",
                saved
                  ? "bg-[#2EC4B6]/80 text-white"
                  : "bg-[#2EC4B6] text-white"
              )}
              disabled={saved}
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 mr-1" /> Saved
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1" /> Save Trip
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/5 border-white/10 text-white/70 hover:bg-white/10 rounded-full"
              onClick={() => {
                if (plan) {
                  generateTripPDF({
                    destination: tripForm.destination || "Trip",
                    startDate: tripForm.startDate,
                    endDate: tripForm.endDate,
                    budget: tripForm.budget,
                    travelers: tripForm.travelers,
                    originCity: tripForm.originCity,
                    plan,
                  });
                }
              }}
            >
              <FileDown className="w-4 h-4 mr-1" /> PDF
            </Button>
            <Dialog open={inviteOpen} onOpenChange={(open) => { setInviteOpen(open); if (!open) { setInviteError(""); setInviteSent(false); } }}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/5 border-white/10 text-white/70 hover:bg-white/10 rounded-full"
                  disabled={!savedTripId}
                >
                  <Users className="w-4 h-4 mr-1" /> Invite
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#1A1A2E] border-white/10 text-white sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-white">Invite Collaborator</DialogTitle>
                  <DialogDescription className="text-white/60">
                    Invite someone to collaborate on this trip plan. They can view or edit based on the role you assign.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-2">
                  <Input
                    type="email"
                    placeholder="collaborator@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleInvite(); }}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#2EC4B6]"
                    disabled={inviteSending || inviteSent}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={inviteRole === "editor" ? "default" : "outline"}
                      className={cn(
                        "flex-1 rounded-lg text-xs",
                        inviteRole === "editor"
                          ? "bg-[#2EC4B6] text-white hover:bg-[#2EC4B6]/80"
                          : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                      )}
                      onClick={() => setInviteRole("editor")}
                      disabled={inviteSending || inviteSent}
                    >
                      Editor
                    </Button>
                    <Button
                      size="sm"
                      variant={inviteRole === "viewer" ? "default" : "outline"}
                      className={cn(
                        "flex-1 rounded-lg text-xs",
                        inviteRole === "viewer"
                          ? "bg-[#2EC4B6] text-white hover:bg-[#2EC4B6]/80"
                          : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                      )}
                      onClick={() => setInviteRole("viewer")}
                      disabled={inviteSending || inviteSent}
                    >
                      Viewer
                    </Button>
                  </div>
                  {inviteError && (
                    <p className="text-red-400 text-xs">{inviteError}</p>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleInvite}
                    disabled={inviteSending || inviteSent || !inviteEmail.trim()}
                    className={cn(
                      "rounded-full",
                      inviteSent
                        ? "bg-[#2EC4B6] text-white"
                        : "bg-gradient-to-r from-[#FF6B35] to-[#FF8C61] text-white"
                    )}
                  >
                    {inviteSent ? (
                      <>
                        <Check className="w-4 h-4 mr-1" /> Invited!
                      </>
                    ) : inviteSending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" /> Inviting...
                      </>
                    ) : (
                      <>
                        <Users className="w-4 h-4 mr-1" /> Send Invite
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="itinerary" className="w-full">
          <TabsList className="w-full bg-white/5 border border-white/10 rounded-xl p-1 h-auto flex flex-wrap">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={cn(
                  "flex-1 min-w-[80px] rounded-lg py-2 text-xs sm:text-sm data-[state=active]:bg-[#2EC4B6] data-[state=active]:text-white",
                  "text-white/60 hover:text-white"
                )}
              >
                <span className="hidden sm:inline mr-1">{tab.emoji}</span>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-4">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm p-6 rounded-xl">
                <ContentRenderer
                  content={plan[tab.value as keyof TripPlan]}
                />

                {tab.value === "itinerary" && weather && weather.days.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-white/10 space-y-3">
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4 text-[#FFD166]" />
                      <h4 className="text-white font-semibold text-sm">Weather Forecast</h4>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                      {weather.days.slice(0, 10).map((day) => (
                        <div
                          key={day.date}
                          className="flex-shrink-0 bg-white/5 border border-white/10 rounded-lg p-3 min-w-[90px] text-center space-y-1"
                        >
                          <p className="text-white/50 text-[10px]">
                            {new Date(day.date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                          </p>
                          <WeatherIcon icon={day.icon} className="w-5 h-5 mx-auto text-[#FFD166]" />
                          <p className="text-white text-xs font-medium">
                            {day.tempMax}° / {day.tempMin}°
                          </p>
                          <p className="text-white/40 text-[10px]">{day.label}</p>
                          {day.precipitationProb > 20 && (
                            <div className="flex items-center justify-center gap-0.5">
                              <Droplets className="w-2.5 h-2.5 text-blue-400" />
                              <span className="text-blue-400 text-[10px]">{day.precipitationProb}%</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {tab.value === "itinerary" && weather && weather.type === "climate-average" && weather.message && (
                  <div className="mt-6 pt-4 border-t border-white/10">
                    <div className="bg-[#FFD166]/10 rounded-xl p-3 flex items-start gap-2">
                      <Sun className="w-4 h-4 text-[#FFD166] mt-0.5 shrink-0" />
                      <p className="text-[#FFD166] text-xs">{weather.message}</p>
                    </div>
                  </div>
                )}

                {(tab.value === "flights" || tab.value === "hotels") && (
                  <div className="mt-6 pt-4 border-t border-white/10">
                    <Button
                      className="bg-gradient-to-r from-[#FF6B35] to-[#FF8C61] text-white rounded-full shadow-lg"
                      onClick={() => {
                        const isFlights = tab.value === "flights";
                        const url = isFlights
                          ? buildFlightLink({
                              origin: tripForm.originAirport || "DEL",
                              destination: tripForm.destination || "GOI",
                              departDate:
                                tripForm.startDate ||
                                new Date().toISOString().slice(0, 10),
                              returnDate: tripForm.endDate || undefined,
                            })
                          : buildHotelLink({
                              destination: tripForm.destination || "Goa",
                              checkIn:
                                tripForm.startDate ||
                                new Date().toISOString().slice(0, 10),
                              checkOut: tripForm.endDate || undefined,
                            });
                        fetch("/api/booking-click", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            type: isFlights ? "flight" : "hotel",
                            platform: isFlights ? "aviasales" : "hotellook",
                            affiliateLink: url,
                            details: { destination: tripForm.destination },
                          }),
                        }).catch(() => {});
                        window.open(url, "_blank");
                      }}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Book {tab.value === "flights" ? "Flights" : "Hotels"} Now
                    </Button>
                  </div>
                )}

                {tab.value === "hotels" && hotelEstimates && (
                  <div className="mt-6 pt-4 border-t border-white/10 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h4 className="text-white font-semibold text-base">
                        Estimated Hotel Prices
                      </h4>
                      <div className="flex items-center gap-2">
                        <select
                          value={userCurrency}
                          onChange={(e) => setUserCurrency(e.target.value)}
                          className="bg-white/5 border border-white/10 text-white text-xs rounded-lg px-2 py-1.5 outline-none focus:border-[#2EC4B6] appearance-none cursor-pointer"
                        >
                          {getSortedCurrencies().map((c) => (
                            <option key={c.code} value={c.code} className="bg-[#1A1A2E] text-white">
                              {c.code} ({c.symbol})
                            </option>
                          ))}
                        </select>
                        <Badge variant="outline" className="text-white/50 border-white/10 text-[10px]">
                          {hotelEstimates.nights} night{hotelEstimates.nights > 1 ? "s" : ""}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {hotelEstimates.estimates.map((est) => (
                        <div
                          key={est.category}
                          className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-white font-medium text-sm">{est.category}</span>
                            <div className="flex gap-0.5">
                              {Array.from({ length: est.starRating }).map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-[#FFD166] text-[#FFD166]" />
                              ))}
                            </div>
                          </div>
                          <p className="text-white/40 text-xs">{est.description}</p>
                          <div>
                            <p className="text-[#2EC4B6] font-bold text-lg">
                              {formatDualCurrency(est.avgPerNight, userCurrency !== "INR" ? userCurrency : null)}
                              <span className="text-white/40 font-normal text-xs ml-1">/night</span>
                            </p>
                            <p className="text-white/50 text-xs">
                              Total: {formatDualCurrency(est.priceRange.min, userCurrency !== "INR" ? userCurrency : null)} - {formatDualCurrency(est.priceRange.max, userCurrency !== "INR" ? userCurrency : null)}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1 bg-[#003580] hover:bg-[#003580]/80 text-white text-xs rounded-lg h-8"
                              onClick={() => {
                                fetch("/api/booking-click", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    type: "hotel",
                                    platform: "booking.com",
                                    affiliateLink: est.bookingUrl,
                                    details: { destination: tripForm.destination, category: est.category },
                                  }),
                                }).catch(() => {});
                                window.open(est.bookingUrl, "_blank");
                              }}
                            >
                              Booking.com
                              <ExternalLink className="w-3 h-3 ml-1" />
                            </Button>
                            <Button
                              size="sm"
                              className="flex-1 bg-[#E4002B] hover:bg-[#E4002B]/80 text-white text-xs rounded-lg h-8"
                              onClick={() => {
                                fetch("/api/booking-click", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    type: "hotel",
                                    platform: "makemytrip",
                                    affiliateLink: est.makemytripUrl,
                                    details: { destination: tripForm.destination, category: est.category },
                                  }),
                                }).catch(() => {});
                                window.open(est.makemytripUrl, "_blank");
                              }}
                            >
                              MakeMyTrip
                              <ExternalLink className="w-3 h-3 ml-1" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-white/30 text-[10px] text-center">
                      Prices are estimates based on destination and season. Actual prices may vary.
                    </p>
                  </div>
                )}

                {savedTripId && (
                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-3">
                    <span className="text-white/40 text-xs">Rate this section:</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleVote(tab.value, "up")}
                        className={cn(
                          "flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors",
                          votes[tab.value]?.userVote === "up"
                            ? "bg-[#2EC4B6]/20 text-[#2EC4B6]"
                            : "bg-white/5 text-white/40 hover:text-white/70 hover:bg-white/10"
                        )}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        {votes[tab.value]?.upCount || 0}
                      </button>
                      <button
                        onClick={() => handleVote(tab.value, "down")}
                        className={cn(
                          "flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors",
                          votes[tab.value]?.userVote === "down"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-white/5 text-white/40 hover:text-white/70 hover:bg-white/10"
                        )}
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                        {votes[tab.value]?.downCount || 0}
                      </button>
                    </div>
                  </div>
                )}
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {savedTripId && (
          <div className="mt-6">
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Comments {comments.length > 0 && `(${comments.length})`}
              <span className="text-white/30 text-xs">{showComments ? "▲" : "▼"}</span>
            </button>

            {showComments && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 space-y-3"
              >
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm p-4 rounded-xl space-y-4">
                  {comments.length > 0 ? (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {comments.map((c, idx) => (
                        <div key={idx} className="bg-white/5 rounded-lg p-3 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-white text-xs font-medium">{c.userName}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-white/40 border-white/10 text-[10px]">
                                {c.section}
                              </Badge>
                              <span className="text-white/30 text-[10px]">
                                {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                          </div>
                          <p className="text-white/70 text-sm">{c.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-white/30 text-xs text-center py-2">No comments yet. Be the first to share your thoughts!</p>
                  )}

                  <div className="flex gap-2 items-end">
                    <select
                      value={commentSection}
                      onChange={(e) => setCommentSection(e.target.value)}
                      className="bg-white/5 border border-white/10 text-white text-xs rounded-lg px-2 py-2 outline-none focus:border-[#2EC4B6] appearance-none cursor-pointer shrink-0"
                    >
                      <option value="general" className="bg-[#1A1A2E]">General</option>
                      <option value="itinerary" className="bg-[#1A1A2E]">Itinerary</option>
                      <option value="flights" className="bg-[#1A1A2E]">Flights</option>
                      <option value="hotels" className="bg-[#1A1A2E]">Hotels</option>
                      <option value="budget" className="bg-[#1A1A2E]">Budget</option>
                      <option value="localTips" className="bg-[#1A1A2E]">Local Tips</option>
                    </select>
                    <Input
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) handleAddComment(); }}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#2EC4B6] text-sm flex-1"
                      disabled={commentSending}
                    />
                    <Button
                      size="sm"
                      onClick={handleAddComment}
                      disabled={commentSending || !newComment.trim()}
                      className="bg-[#2EC4B6] text-white rounded-lg shrink-0 h-9 px-3"
                    >
                      {commentSending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>
        )}
      </motion.div>

      <div className="flex justify-center gap-4 mt-6">
        <Button
          variant="outline"
          onClick={handleModifyInChat}
          className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-full"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Modify in Chat
        </Button>
        <Button
          onClick={() => {
            setCurrentPlan(null);
            setSavedTripId(null);
            setChatSessionId(null);
            setCurrentStep("form");
          }}
          className="bg-gradient-to-r from-[#0F4C81] to-[#2EC4B6] text-white rounded-full"
        >
          Plan Another Trip
        </Button>
      </div>
    </div>
  );
}
