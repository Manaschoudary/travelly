"use client";

import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTravellyStore } from "@/store/travel-store";
import MessageBubble from "./MessageBubble";
import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport } from "ai";
import { useTheme } from "@/components/providers/ThemeProvider";

export default function ChatInterface() {
  const { data: session } = useSession();
  const {
    tripForm,
    setAvatarState,
    setCurrentStep,
    chatSessionId,
    setChatSessionId,
    currentPlan,
  } = useTravellyStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState("");
  const { theme } = useTheme();
  const light = theme === "light";
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedCountRef = useRef(0);

  const refinementPrefix = currentPlan
    ? `I already have a trip plan. Here's a summary of my existing plan:\n\nItinerary: ${currentPlan.itinerary.slice(0, 300)}...\nFlights: ${currentPlan.flights.slice(0, 200)}...\nHotels: ${currentPlan.hotels.slice(0, 200)}...\nBudget: ${currentPlan.budget.slice(0, 200)}...\n\nI'd like to modify this plan. `
    : "";

  const initialSystemMessage =
    tripForm.suggestTrip && !tripForm.destination
      ? `${refinementPrefix}I'm looking for trip suggestions! I'm based in ${tripForm.originCity || "India"}${tripForm.originAirport ? ` (${tripForm.originAirport})` : ""}. ${tripForm.transportMode && tripForm.transportMode !== "any" ? `I prefer traveling by ${tripForm.transportMode}.` : "I'm open to any transport mode."}${tripForm.startDate ? ` Travel dates: ${tripForm.startDate} to ${tripForm.endDate}.` : ""}${tripForm.budget ? ` Budget: \u20B9${tripForm.budget}.` : ""}${tripForm.travelers ? ` ${tripForm.travelers} travelers.` : ""}${tripForm.travelStyle ? ` Style: ${tripForm.travelStyle}.` : ""}${tripForm.interests?.length ? ` Interests: ${tripForm.interests.join(", ")}.` : ""} Please suggest some great destinations for me!`
      : `${refinementPrefix}I want to plan a trip${tripForm.originCity ? ` from ${tripForm.originCity}${tripForm.originAirport ? ` (${tripForm.originAirport})` : ""}` : ""} to ${tripForm.destination || "somewhere amazing"}${tripForm.transportMode && tripForm.transportMode !== "any" ? ` traveling by ${tripForm.transportMode}` : ""}${tripForm.startDate ? ` from ${tripForm.startDate} to ${tripForm.endDate}` : ""}${tripForm.budget ? `. Budget: \u20B9${tripForm.budget}` : ""}${tripForm.travelers ? `. ${tripForm.travelers} travelers` : ""}${tripForm.travelStyle ? `. Style: ${tripForm.travelStyle}` : ""}${tripForm.interests?.length ? `. Interests: ${tripForm.interests.join(", ")}` : ""}. ${currentPlan ? "Please help me modify and improve this plan." : "Please create a detailed trip plan."}`;

  const transport = useMemo(
    () =>
      new TextStreamChatTransport({
        api: "/api/chat",
        body: { context: tripForm },
      }),
    [tripForm]
  );

  const hasSentInitial = useRef(false);

  const { messages, sendMessage, status } = useChat({
    transport,
    messages: [
      {
        id: "init",
        role: "user",
        parts: [{ type: "text", text: initialSystemMessage }],
      },
    ],
    onFinish: () => {
      setAvatarState("suggesting");
      setTimeout(() => setAvatarState("idle"), 3000);
    },
  });

  const isLoading = status === "submitted" || status === "streaming";

  const saveChatSession = useCallback(
    async (msgs: typeof messages) => {
      if (!session?.user) return;
      if (msgs.length <= 1) return;

      const serialized = msgs.map((m) => ({
        role: m.role as "user" | "assistant",
        content:
          m.parts
            ?.filter(
              (p): p is { type: "text"; text: string } => p.type === "text"
            )
            .map((p) => p.text)
            .join("") ||
          ("content" in m && typeof m.content === "string" ? m.content : ""),
        timestamp: new Date(),
      }));

      const body: Record<string, unknown> = {
        title: tripForm.suggestTrip
          ? "Trip Suggestions"
          : `Trip to ${tripForm.destination || "Somewhere"}`,
        messages: serialized,
        context: {
          destination: tripForm.destination,
          dates: { start: tripForm.startDate, end: tripForm.endDate },
          budget: tripForm.budget,
          travelers: tripForm.travelers,
          preferences: tripForm.interests,
          originCity: tripForm.originCity,
          originAirport: tripForm.originAirport,
          transportMode: tripForm.transportMode,
        },
      };

      if (chatSessionId) {
        body.sessionId = chatSessionId;
      }

      try {
        const res = await fetch("/api/chat-sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          const data = await res.json();
          if (!chatSessionId && data.session?._id) {
            setChatSessionId(data.session._id);
          }
        }
      } catch {
        /* best-effort */
      }
    },
    [session?.user, chatSessionId, setChatSessionId, tripForm]
  );

  useEffect(() => {
    if (!hasSentInitial.current) {
      hasSentInitial.current = true;
      sendMessage();
    }
  }, [sendMessage]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isLoading) setAvatarState("thinking");
  }, [isLoading, setAvatarState]);

  useEffect(() => {
    if (
      !session?.user ||
      messages.length <= 1 ||
      messages.length === lastSavedCountRef.current
    )
      return;
    if (isLoading) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      lastSavedCountRef.current = messages.length;
      saveChatSession(messages);
    }, 2000);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [messages, isLoading, session?.user, saveChatSession]);

  const formatINR = (val: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;
    sendMessage({ text: trimmed });
    setInputValue("");
  };

  const getMessageContent = (msg: (typeof messages)[number]): string => {
    if ("content" in msg && typeof msg.content === "string") {
      return msg.content;
    }
    return (
      msg.parts
        ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
        .map((p) => p.text)
        .join("") || ""
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col h-[600px] sm:h-[700px]">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "backdrop-blur-sm rounded-xl p-4 mb-4",
          light
            ? "bg-white border border-gray-200 shadow-sm"
            : "bg-white/5 border border-white/10"
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          {tripForm.originCity && (
            <Badge
              variant="outline"
              className={cn(
                light
                  ? "text-gray-600 border-gray-200"
                  : "text-white/60 border-white/10"
              )}
            >
              {tripForm.originCity}
            </Badge>
          )}
          <Badge className="bg-[#2EC4B6]/20 text-[#2EC4B6] border-[#2EC4B6]/30">
            {tripForm.suggestTrip && !tripForm.destination
              ? "Suggest a Trip"
              : tripForm.destination || "Exploring"}
          </Badge>
          {currentPlan && (
            <Badge className="bg-[#FFD166]/20 text-[#FFD166] border-[#FFD166]/30">
              Refining Plan
            </Badge>
          )}
          {tripForm.transportMode && tripForm.transportMode !== "any" && (
            <Badge
              variant="outline"
              className={cn(
                light
                  ? "text-gray-600 border-gray-200"
                  : "text-white/60 border-white/10"
              )}
            >
              {tripForm.transportMode === "flight"
                ? "✈️"
                : tripForm.transportMode === "train"
                  ? "🚆"
                  : tripForm.transportMode === "drive"
                    ? "🚗"
                    : "🚌"}{" "}
              {tripForm.transportMode}
            </Badge>
          )}
          {tripForm.startDate && (
            <Badge
              variant="outline"
              className={cn(
                light
                  ? "text-gray-600 border-gray-200"
                  : "text-white/60 border-white/10"
              )}
            >
              {tripForm.startDate} → {tripForm.endDate}
            </Badge>
          )}
          {tripForm.budget && (
            <Badge
              variant="outline"
              className={cn(
                light
                  ? "text-gray-600 border-gray-200"
                  : "text-white/60 border-white/10"
              )}
            >
              {formatINR(tripForm.budget)}
            </Badge>
          )}
          {tripForm.travelers && (
            <Badge
              variant="outline"
              className={cn(
                light
                  ? "text-gray-600 border-gray-200"
                  : "text-white/60 border-white/10"
              )}
            >
              {tripForm.travelers} travelers
            </Badge>
          )}
        </div>
      </motion.div>

      <div
        className="flex-1 overflow-y-auto pr-2 scrollbar-thin"
        ref={scrollRef}
      >
        <div className="space-y-4 pb-4">
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              role={msg.role as "user" | "assistant"}
              content={getMessageContent(msg)}
              agentType={
                (msg.role as string) === "assistant"
                  ? "trip-planner"
                  : undefined
              }
            />
          ))}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3"
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  light
                    ? "bg-gray-100 border border-gray-200"
                    : "bg-white/10 border border-white/10"
                )}
              >
                <Loader2 className="w-4 h-4 text-[#2EC4B6] animate-spin" />
              </div>
              <div
                className={cn(
                  "backdrop-blur-sm rounded-2xl rounded-tl-sm px-4 py-3",
                  light
                    ? "bg-gray-100 border border-gray-200"
                    : "bg-white/10 border border-white/10"
                )}
              >
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-[#2EC4B6]"
                      animate={{ y: [0, -6, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.15,
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Button
          variant="outline"
          onClick={() => setCurrentStep("form")}
          className={cn(
            "rounded-xl",
            light
              ? "bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-[#1A1A2E]"
              : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
          )}
        >
          ← Modify
        </Button>
        <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask anything about your trip..."
            className={cn(
              "flex-1 h-12 rounded-xl",
              "focus:border-[#2EC4B6] focus:ring-[#2EC4B6]/20",
              light
                ? "bg-white border-gray-300 text-[#1A1A2E] placeholder:text-gray-400"
                : "bg-white/10 border-white/10 text-white placeholder:text-white/40"
            )}
          />
          <Button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="h-12 w-12 bg-gradient-to-r from-[#FF6B35] to-[#FF8C61] rounded-xl shadow-lg disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
