"use client";

import { motion } from "framer-motion";
import { MessageSquare, MapPin, Clock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ChatHistoryCardProps {
  session: {
    _id: string;
    title: string;
    destination: string;
    lastMessage: string;
    messageCount: number;
    updatedAt: string;
  };
  index: number;
}

const formatRelativeTime = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  } catch {
    return dateStr;
  }
};

export default function ChatHistoryCard({
  session,
  index,
}: ChatHistoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className="group relative bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
    >
      <div className="h-0.5 w-full bg-gradient-to-r from-[#2EC4B6] to-[#0F4C81]" />

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-lg bg-[#2EC4B6]/10 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-4 h-4 text-[#2EC4B6]" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold text-gray-900 truncate">
                {session.title}
              </h4>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <MapPin className="w-3 h-3 text-[#FF6B35]" />
                <span>{session.destination}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0 ml-2">
            <Clock className="w-3 h-3" />
            {formatRelativeTime(session.updatedAt)}
          </div>
        </div>

        {session.lastMessage && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3 pl-10">
            {session.lastMessage}...
          </p>
        )}

        <div className="flex items-center justify-between pl-10">
          <Badge
            variant="outline"
            className="text-xs text-gray-500 border-gray-200"
          >
            {session.messageCount} messages
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className="text-[#2EC4B6] hover:text-[#2EC4B6] hover:bg-[#2EC4B6]/5 gap-1 text-xs h-7"
          >
            Resume
            <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
