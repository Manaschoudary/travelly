"use client";

import { Compass, Plane, Instagram, Twitter, Youtube } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";

const footerLinks = {
  quickLinks: [
    { label: "Plan a Trip", href: "#trip-planner" },
    { label: "Search Flights", href: "#flights" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Destinations", href: "#destinations" },
  ],
  company: [
    { label: "About Us", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Blog", href: "#" },
  ],
  legal: [
    { label: "Terms of Service", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Refund Policy", href: "#" },
  ],
};

const socialLinks = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Youtube, href: "#", label: "YouTube" },
];

export default function Footer() {
  const { theme } = useTheme();
  const light = theme === "light";

  const scrollTo = (href: string) => {
    if (href.startsWith("#")) {
      const id = href.replace("#", "");
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className={cn(
      "border-t",
      light
        ? "bg-gray-50 border-gray-200"
        : "bg-[#1A1A2E] border-white/5"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2EC4B6] to-[#0F4C81] flex items-center justify-center">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <span className={cn(
                "text-xl font-bold tracking-tight",
                light ? "text-[#1A1A2E]" : "text-white"
              )}>Travelly</span>
            </Link>
            <p className={cn(
              "text-sm leading-relaxed mb-5",
              light ? "text-gray-500" : "text-white/40"
            )}>
              Your AI Travel Companion. Plan perfect trips with 6 AI agents — tailored for Indian travelers.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center transition-all",
                    light
                      ? "bg-gray-100 border border-gray-200 text-gray-400 hover:text-[#0F4C81] hover:bg-gray-200"
                      : "bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10"
                  )}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className={cn(
              "font-semibold text-sm mb-4",
              light ? "text-[#1A1A2E]" : "text-white"
            )}>Quick Links</h4>
            <ul className="space-y-3">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => scrollTo(link.href)}
                    className={cn(
                      "text-sm transition-colors",
                      light ? "text-gray-500 hover:text-[#0F4C81]" : "text-white/40 hover:text-white"
                    )}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className={cn(
              "font-semibold text-sm mb-4",
              light ? "text-[#1A1A2E]" : "text-white"
            )}>Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className={cn(
                      "text-sm transition-colors",
                      light ? "text-gray-500 hover:text-[#0F4C81]" : "text-white/40 hover:text-white"
                    )}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className={cn(
              "font-semibold text-sm mb-4",
              light ? "text-[#1A1A2E]" : "text-white"
            )}>Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className={cn(
                      "text-sm transition-colors",
                      light ? "text-gray-500 hover:text-[#0F4C81]" : "text-white/40 hover:text-white"
                    )}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className={cn("my-8", light ? "bg-gray-200" : "bg-white/5")} />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className={cn(
            "text-xs text-center sm:text-left",
            light ? "text-gray-400" : "text-white/30"
          )}>
            &copy; 2025 Travelly.in | Made with &hearts; in India
          </p>
          <div className="flex items-center gap-2">
            <Plane className="w-3.5 h-3.5 text-[#2EC4B6]" />
            <span className={cn(
              "text-xs",
              light ? "text-gray-400" : "text-white/30"
            )}>Powered by AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
