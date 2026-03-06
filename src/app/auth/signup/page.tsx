"use client";

import { Compass, Plane, ArrowLeft } from "lucide-react";
import Link from "next/link";
import SignUpForm from "@/components/auth/SignUpForm";

export default function SignUpPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{
        background:
          "linear-gradient(135deg, #0F4C81 0%, #16213E 40%, #1A1A2E 70%, #0F4C81 100%)",
      }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#2EC4B6] to-[#0F4C81] flex items-center justify-center">
              <Compass className="w-5 h-5 text-white" />
              <Plane className="absolute -top-1 -right-1 w-3.5 h-3.5 text-[#FF6B35] rotate-45" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Travelly</span>
          </Link>
        </div>

        <SignUpForm />

        <div className="text-center mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
