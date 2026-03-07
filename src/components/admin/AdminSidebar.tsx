"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Camera,
  Map,
  MessageSquare,
  Compass,
  Package,
  LogOut,
  Menu,
  X,
  Plane,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/ThemeProvider";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Photos", href: "/admin/photos", icon: Camera },
  { label: "Trips", href: "/admin/trips", icon: Map },
  { label: "Testimonials", href: "/admin/testimonials", icon: MessageSquare },
  { label: "Destinations", href: "/admin/destinations", icon: Compass },
  { label: "Packages", href: "/admin/packages", icon: Package },
];

interface AdminSidebarProps {
  userName: string;
}

export default function AdminSidebar({ userName }: AdminSidebarProps) {
  const pathname = usePathname();
  const { theme } = useTheme();
  const light = theme === "light";
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const sidebarContent = (
    <>
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2EC4B6] to-[#0F4C81] flex items-center justify-center">
            <Plane className="w-5 h-5 text-white" />
          </div>
          <div>
            <span
              className={cn(
                "text-lg font-bold tracking-tight block leading-tight",
                light ? "text-[#0F4C81]" : "text-white"
              )}
            >
              Travelly
            </span>
            <span
              className={cn(
                "text-[10px] font-medium uppercase tracking-widest",
                light ? "text-gray-400" : "text-white/40"
              )}
            >
              Admin Panel
            </span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                active
                  ? "bg-gradient-to-r from-[#FF6B35] to-[#FF8C61] text-white shadow-lg shadow-orange-500/20"
                  : light
                    ? "text-gray-600 hover:text-[#0F4C81] hover:bg-gray-100"
                    : "text-white/60 hover:text-white hover:bg-white/10"
              )}
            >
              <Icon className="w-4.5 h-4.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div
        className={cn(
          "p-4 mx-3 mb-4 rounded-xl",
          light ? "bg-gray-50 border border-gray-100" : "bg-white/5 border border-white/10"
        )}
      >
        <p
          className={cn(
            "text-xs font-medium truncate",
            light ? "text-[#1A1A2E]" : "text-white"
          )}
        >
          {userName}
        </p>
        <p
          className={cn(
            "text-[10px] mt-0.5",
            light ? "text-gray-400" : "text-white/40"
          )}
        >
          Administrator
        </p>
        <Link
          href="/"
          className={cn(
            "flex items-center gap-1.5 text-xs mt-3 transition-colors",
            light
              ? "text-gray-400 hover:text-[#FF6B35]"
              : "text-white/30 hover:text-[#FF6B35]"
          )}
        >
          <LogOut className="w-3.5 h-3.5" />
          Back to Site
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className={cn(
          "fixed top-4 left-4 z-50 p-2 rounded-xl lg:hidden",
          light
            ? "bg-white shadow-md border border-gray-200 text-gray-700"
            : "bg-[#1A1A2E] border border-white/10 text-white"
        )}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - mobile */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 flex flex-col transition-transform duration-300 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          light
            ? "bg-white border-r border-gray-200"
            : "bg-[#1A1A2E] border-r border-white/10"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Sidebar - desktop */}
      <aside
        className={cn(
          "hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0",
          light
            ? "bg-white border-r border-gray-200"
            : "bg-[#1A1A2E] border-r border-white/10"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
