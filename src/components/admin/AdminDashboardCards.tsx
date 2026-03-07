"use client";

import Link from "next/link";
import { Camera, Map, MessageSquare, Compass, Package, type LucideProps } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/ThemeProvider";

const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  Camera,
  Map,
  MessageSquare,
  Compass,
  Package,
};

interface DashboardCard {
  label: string;
  href: string;
  color: string;
  iconName: string;
  count: number;
}

interface AdminDashboardCardsProps {
  cards: DashboardCard[];
}

export default function AdminDashboardCards({ cards }: AdminDashboardCardsProps) {
  const { theme } = useTheme();
  const light = theme === "light";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {cards.map((card) => {
        const Icon = iconMap[card.iconName];
        return (
          <Link key={card.href} href={card.href}>
            <Card
              className={cn(
                "p-6 rounded-2xl border transition-all hover:-translate-y-1 hover:shadow-xl cursor-pointer",
                light
                  ? "bg-white border-gray-200 hover:border-gray-300"
                  : "bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/[0.08]"
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: `${card.color}20` }}
                >
                  {Icon && <Icon className="w-6 h-6" style={{ color: card.color }} />}
                </div>
                <span
                  className={cn(
                    "text-3xl font-bold",
                    light ? "text-[#1A1A2E]" : "text-white"
                  )}
                >
                  {card.count}
                </span>
              </div>
              <p
                className={cn(
                  "text-sm font-medium",
                  light ? "text-gray-600" : "text-white/60"
                )}
              >
                {card.label}
              </p>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
