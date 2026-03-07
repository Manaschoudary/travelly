"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Bot, User, Plane, Hotel, MapPin, DollarSign, Sparkles } from "lucide-react";
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

function renderContent(content: string) {
  const lines = content.split("\n");
  return lines.map((line, i) => {
    if (line.startsWith("**") && line.endsWith("**")) {
      return (
        <strong key={i} className="block font-semibold mt-2 mb-1">
          {line.replace(/\*\*/g, "")}
        </strong>
      );
    }
    if (line.startsWith("- ") || line.startsWith("• ")) {
      return (
        <li key={i} className="ml-4 list-disc">
          {line.slice(2)}
        </li>
      );
    }
    if (line.match(/^\d+\./)) {
      return (
        <li key={i} className="ml-4 list-decimal">
          {line.replace(/^\d+\.\s*/, "")}
        </li>
      );
    }
    if (line.trim() === "") return <br key={i} />;
    return <p key={i}>{line}</p>;
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
        <div className="space-y-0.5">{renderContent(content)}</div>
      </div>
    </motion.div>
  );
}
