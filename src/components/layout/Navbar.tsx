"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Plane, Compass, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useTheme } from "@/components/providers/ThemeProvider";

const navLinks = [
  { label: "Plan a Trip", href: "#trip-planner" },
  { label: "Search Flights", href: "#flights" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Destinations", href: "#destinations" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const light = theme === "light";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    const id = href.replace("#", "");
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? light
            ? "bg-white/90 backdrop-blur-xl shadow-lg border-b border-gray-100"
            : "bg-[#1A1A2E]/90 backdrop-blur-xl shadow-lg border-b border-white/10"
          : "bg-transparent"
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#2EC4B6] to-[#0F4C81] flex items-center justify-center">
              <Compass className="w-5 h-5 text-white" />
              <Plane className="absolute -top-1 -right-1 w-3.5 h-3.5 text-[#FF6B35] rotate-45 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
            <span
              className={cn(
                "text-xl font-bold tracking-tight transition-colors",
                scrolled
                  ? light ? "text-[#0F4C81]" : "text-white"
                  : light ? "text-[#0F4C81]" : "text-white"
              )}
            >
              Travelly
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  scrolled
                    ? light
                      ? "text-gray-700 hover:text-[#0F4C81] hover:bg-[#0F4C81]/5"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                    : light ? "text-[#0F4C81]/80 hover:text-[#0F4C81] hover:bg-[#0F4C81]/5" : "text-white/80 hover:text-white hover:bg-white/10"
                )}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={cn(
                "p-2 rounded-lg transition-all",
                scrolled
                  ? light
                    ? "text-gray-600 hover:text-[#0F4C81] hover:bg-[#0F4C81]/5"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                  : light ? "text-[#0F4C81]/70 hover:text-[#0F4C81] hover:bg-[#0F4C81]/5" : "text-white/70 hover:text-white hover:bg-white/10"
              )}
              aria-label={light ? "Switch to dark mode" : "Switch to light mode"}
            >
              {light ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <Link href="/auth/signin">
              <Button
                variant="ghost"
                className={cn(
                  "font-medium",
                  scrolled
                    ? light
                      ? "text-gray-700 hover:text-[#0F4C81]"
                      : "text-white hover:bg-white/10"
                    : light ? "text-[#0F4C81] hover:bg-[#0F4C81]/5" : "text-white hover:bg-white/10"
                )}
              >
                Sign In
              </Button>
            </Link>
            <Button
              onClick={() => scrollTo("#trip-planner")}
              className="bg-gradient-to-r from-[#FF6B35] to-[#FF8C61] hover:from-[#E05A2B] hover:to-[#FF6B35] text-white rounded-full px-6 shadow-lg shadow-orange-500/25"
            >
              Get Started
            </Button>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className={cn(
                "p-2 rounded-lg transition-all",
                scrolled
                  ? light
                    ? "text-gray-600 hover:bg-gray-100"
                    : "text-white/70 hover:bg-white/10"
                  : light ? "text-[#0F4C81]/70 hover:bg-[#0F4C81]/5" : "text-white/70 hover:bg-white/10"
              )}
              aria-label={light ? "Switch to dark mode" : "Switch to light mode"}
            >
              {light ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={cn(
                "p-2 rounded-lg",
                scrolled
                  ? light ? "text-gray-700" : "text-white"
                  : light ? "text-[#0F4C81]" : "text-white"
              )}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={cn(
              "md:hidden backdrop-blur-xl border-t",
              light
                ? "bg-white/95 border-gray-100"
                : "bg-[#1A1A2E]/95 border-white/10"
            )}
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className={cn(
                    "block w-full text-left px-4 py-3 rounded-lg font-medium",
                    light
                      ? "text-gray-700 hover:text-[#0F4C81] hover:bg-[#0F4C81]/5"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  )}
                >
                  {link.label}
                </button>
              ))}
              <div className={cn(
                "pt-2 border-t flex gap-2",
                light ? "border-gray-100" : "border-white/10"
              )}>
                <Link href="/auth/signin" className="flex-1">
                  <Button variant="outline" className={cn(
                    "w-full",
                    !light && "border-white/20 text-white hover:bg-white/10"
                  )}>
                    Sign In
                  </Button>
                </Link>
                <Button
                  onClick={() => scrollTo("#trip-planner")}
                  className="flex-1 bg-gradient-to-r from-[#FF6B35] to-[#FF8C61] text-white"
                >
                  Get Started
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
