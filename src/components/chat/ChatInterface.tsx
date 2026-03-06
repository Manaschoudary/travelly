"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useTravellyStore } from "@/store/travel-store";
import MessageBubble from "./MessageBubble";
import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport } from "ai";

export default function ChatInterface() {
  const { tripForm, setAvatarState, setCurrentStep } = useTravellyStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState("");

  const initialSystemMessage = `I want to plan a trip to ${tripForm.destination || "somewhere amazing"}${tripForm.startDate ? ` from ${tripForm.startDate} to ${tripForm.endDate}` : ""}${tripForm.budget ? `. Budget: ₹${tripForm.budget}` : ""}${tripForm.travelers ? `. ${tripForm.travelers} travelers` : ""}${tripForm.travelStyle ? `. Style: ${tripForm.travelStyle}` : ""}${tripForm.interests?.length ? `. Interests: ${tripForm.interests.join(", ")}` : ""}. Please create a detailed trip plan.`;

  const transport = useMemo(
    () =>
      new TextStreamChatTransport({
        api: "/api/chat",
        body: { context: tripForm },
      }),
    [tripForm]
  );

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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isLoading) setAvatarState("thinking");
  }, [isLoading, setAvatarState]);

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
        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 mb-4"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-[#2EC4B6]/20 text-[#2EC4B6] border-[#2EC4B6]/30">
            📍 {tripForm.destination || "Exploring"}
          </Badge>
          {tripForm.startDate && (
            <Badge variant="outline" className="text-white/60 border-white/10">
              📅 {tripForm.startDate} → {tripForm.endDate}
            </Badge>
          )}
          {tripForm.budget && (
            <Badge variant="outline" className="text-white/60 border-white/10">
              💰 {formatINR(tripForm.budget)}
            </Badge>
          )}
          {tripForm.travelers && (
            <Badge variant="outline" className="text-white/60 border-white/10">
              👥 {tripForm.travelers} travelers
            </Badge>
          )}
        </div>
      </motion.div>

      <ScrollArea className="flex-1 pr-2" ref={scrollRef}>
        <div className="space-y-4 pb-4">
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              role={msg.role as "user" | "assistant"}
              content={getMessageContent(msg)}
              agentType={(msg.role as string) === "assistant" ? "trip-planner" : undefined}
            />
          ))}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-[#2EC4B6] animate-spin" />
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-[#2EC4B6]"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      <div className="mt-4 flex gap-2">
        <Button
          variant="outline"
          onClick={() => setCurrentStep("form")}
          className="bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white rounded-xl"
        >
          ← Modify
        </Button>
        <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask anything about your trip..."
            className={cn(
              "flex-1 h-12 bg-white/10 border-white/10 text-white placeholder:text-white/40 rounded-xl",
              "focus:border-[#2EC4B6] focus:ring-[#2EC4B6]/20"
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
