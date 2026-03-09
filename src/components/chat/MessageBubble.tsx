"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Bot, User, Plane, Hotel, MapPin, DollarSign, Sparkles, ExternalLink } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  agentType?: string;
  timestamp?: Date;
}

const agentIcons: Record<string, { icon: typeof Bot; label: string; color: string }> = {
  "trip-planner": { icon: MapPin, label: "Trip Planner", color: "#2EC4B6" },
  "flight-agent": { icon: Plane, label: "Flight Agent", color: "#FF6B35" },
  "hotel-agent": { icon: Hotel, label: "Hotel Agent", color: "#FFD166" },
  "budget-agent": { icon: DollarSign, label: "Budget Agent", color: "#0F4C81" },
  "local-expert": { icon: Sparkles, label: "Local Expert", color: "#FF6B35" },
  orchestrator: { icon: Bot, label: "Travelly AI", color: "#2EC4B6" },
};

const BOOKING_DOMAINS = ["makemytrip.com", "booking.com"];

function isBookingLink(url: string): boolean {
  return BOOKING_DOMAINS.some((d) => url.includes(d));
}

function trackClick(url: string, type: "flight" | "hotel") {
  const platform = "makemytrip";
  fetch("/api/booking-click", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, platform, affiliateLink: url }),
  }).catch(() => {});
}

function renderInlineContent(text: string, light: boolean) {
  const mdLinkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = mdLinkRe.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(renderBoldItalic(text.slice(lastIndex, match.index), lastIndex, light));
    }

    const label = match[1];
    const url = match[2];
    const booking = isBookingLink(url);
    const type = url.includes("flight") ? "flight" as const : "hotel" as const;

    if (booking) {
      parts.push(
        <a
          key={`link-${match.index}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackClick(url, type)}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-xs font-medium bg-gradient-to-r from-[#FF6B35] to-[#FF8C61] hover:from-[#FF8C61] hover:to-[#FF6B35] shadow-sm transition-all hover:shadow-md no-underline mx-0.5"
        >
          {type === "flight" ? <Plane className="w-3 h-3" /> : <Hotel className="w-3 h-3" />}
          {label}
          <ExternalLink className="w-3 h-3" />
        </a>
      );
    } else {
      parts.push(
        <a
          key={`link-${match.index}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "underline underline-offset-2",
            light ? "text-[#0F4C81] hover:text-[#2EC4B6]" : "text-[#2EC4B6] hover:text-[#FFD166]"
          )}
        >
          {label}
        </a>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(renderBoldItalic(text.slice(lastIndex), lastIndex, light));
  }

  return parts.length > 0 ? parts : renderBoldItalic(text, 0, light);
}

function renderBoldItalic(text: string, keyOffset: number, _light: boolean) {
  const boldRe = /\*\*([^*]+)\*\*/g;
  const parts: React.ReactNode[] = [];
  let lastIdx = 0;
  let m: RegExpExecArray | null;

  while ((m = boldRe.exec(text)) !== null) {
    if (m.index > lastIdx) {
      parts.push(<span key={`t-${keyOffset}-${lastIdx}`}>{text.slice(lastIdx, m.index)}</span>);
    }
    parts.push(<strong key={`b-${keyOffset}-${m.index}`} className="font-semibold">{m[1]}</strong>);
    lastIdx = m.index + m[0].length;
  }

  if (lastIdx < text.length) {
    parts.push(<span key={`t-${keyOffset}-${lastIdx}`}>{text.slice(lastIdx)}</span>);
  }

  return parts.length > 0 ? <>{parts}</> : text;
}

function renderContent(content: string, light: boolean) {
  const lines = content.split("\n");
  return lines.map((line, i) => {
    if (line.startsWith("- ") || line.startsWith("• ")) {
      return (
        <li key={i} className="ml-4 list-disc">
          {renderInlineContent(line.slice(2), light)}
        </li>
      );
    }
    if (line.match(/^\d+\./)) {
      return (
        <li key={i} className="ml-4 list-decimal">
          {renderInlineContent(line.replace(/^\d+\.\s*/, ""), light)}
        </li>
      );
    }
    if (line.trim() === "") return <br key={i} />;
    return <p key={i}>{renderInlineContent(line, light)}</p>;
  });
}

export default function MessageBubble({ role, content, agentType }: MessageBubbleProps) {
  const agent = agentType ? agentIcons[agentType] : undefined;
  const AgentIcon = agent?.icon || Bot;
  const { theme } = useTheme();
  const light = theme === "light";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn("flex gap-3 max-w-[85%]", role === "user" ? "ml-auto flex-row-reverse" : "")}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
          role === "user"
            ? "bg-gradient-to-br from-[#0F4C81] to-[#2EC4B6]"
            : light ? "bg-gray-100 border border-gray-200" : "bg-white/10 border border-white/10"
        )}
      >
        {role === "user" ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <AgentIcon className="w-4 h-4" style={{ color: agent?.color || "#2EC4B6" }} />
        )}
      </div>

      <div
        className={cn(
          "rounded-2xl px-4 py-3 text-sm leading-relaxed",
          role === "user"
            ? "bg-gradient-to-r from-[#0F4C81] to-[#2EC4B6] text-white rounded-tr-sm"
            : light ? "bg-white border border-gray-200 shadow-sm text-[#1A1A2E] rounded-tl-sm" : "bg-white/10 backdrop-blur-sm border border-white/10 text-white/90 rounded-tl-sm"
        )}
      >
        {role === "assistant" && agent && (
          <Badge
            variant="outline"
            className={cn("mb-2 text-xs", light ? "border-gray-200 bg-gray-50" : "border-white/10 bg-white/5")}
            style={{ color: agent.color }}
          >
            {agent.label}
          </Badge>
        )}
        <div className="space-y-0.5">{renderContent(content, light)}</div>
      </div>
    </motion.div>
  );
}
