"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface TravellyAvatarProps {
  state?: "idle" | "thinking" | "talking" | "excited" | "suggesting";
  size?: number;
  className?: string;
}

export default function TravellyAvatar({
  state = "idle",
  size = 280,
  className = "",
}: TravellyAvatarProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x: x * 6, y: y * 6 });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const bodyVariants = {
    idle: {
      y: [0, -8, 0],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" as const },
    },
    thinking: {
      rotate: [0, -5, 5, -5, 0],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" as const },
    },
    talking: {
      y: [0, -4, 0],
      scale: [1, 1.02, 1],
      transition: { duration: 0.6, repeat: Infinity, ease: "easeInOut" as const },
    },
    excited: {
      y: [0, -20, 0],
      scale: [1, 1.1, 1],
      transition: { duration: 0.5, repeat: Infinity, ease: "easeOut" as const },
    },
    suggesting: {
      rotate: [0, 3, 0],
      x: [0, 5, 0],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" as const },
    },
  };

  const eyeVariants = {
    idle: {},
    thinking: { y: -3 },
    talking: {},
    excited: { scale: 1.3 },
    suggesting: { x: 4 },
  };

  const mouthVariants: Record<string, { d: string }> = {
    idle: { d: "M 35,52 Q 42,58 50,52" },
    thinking: { d: "M 35,54 Q 42,54 50,54" },
    talking: { d: "M 35,50 Q 42,58 50,50" },
    excited: { d: "M 32,50 Q 42,62 52,50" },
    suggesting: { d: "M 35,51 Q 42,57 50,51" },
  };

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(46,196,182,0.3) 0%, transparent 70%)",
        }}
        animate={{
          scale: state === "excited" ? [1, 1.3, 1] : [1, 1.1, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" as const }}
      />

      <motion.svg
        viewBox="0 0 84 84"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10"
        variants={bodyVariants}
        animate={state}
      >
        {/* Backpack */}
        <motion.rect
          x="54"
          y="28"
          width="12"
          height="18"
          rx="4"
          fill="#FF6B35"
          stroke="#E05A2B"
          strokeWidth="1"
        />
        <rect x="56" y="32" width="8" height="3" rx="1" fill="#FFD166" />
        <rect x="58" y="26" width="4" height="4" rx="2" fill="#E05A2B" />

        {/* Body - Globe shape */}
        <motion.circle
          cx="42"
          cy="42"
          r="24"
          fill="url(#bodyGradient)"
          stroke="#1A9B8F"
          strokeWidth="1.5"
        />

        {/* Globe lines */}
        <ellipse
          cx="42"
          cy="42"
          rx="24"
          ry="10"
          fill="none"
          stroke="#1A9B8F"
          strokeWidth="0.5"
          opacity="0.3"
        />
        <ellipse
          cx="42"
          cy="42"
          rx="10"
          ry="24"
          fill="none"
          stroke="#1A9B8F"
          strokeWidth="0.5"
          opacity="0.3"
        />
        <line
          x1="18"
          y1="42"
          x2="66"
          y2="42"
          stroke="#1A9B8F"
          strokeWidth="0.5"
          opacity="0.2"
        />

        {/* Face background */}
        <circle cx="42" cy="40" r="16" fill="rgba(255,255,255,0.15)" />

        {/* Eyes */}
        <motion.g variants={eyeVariants} animate={state}>
          {/* Left eye */}
          <motion.g
            animate={{ x: mousePos.x * 0.5, y: mousePos.y * 0.5 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <circle cx="35" cy="38" r="5" fill="white" />
            <motion.circle
              cx="35"
              cy="38"
              r="2.5"
              fill="#1A1A2E"
              animate={{ x: mousePos.x, y: mousePos.y }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
            <circle cx="36.5" cy="36.5" r="1" fill="white" />
          </motion.g>

          {/* Right eye */}
          <motion.g
            animate={{ x: mousePos.x * 0.5, y: mousePos.y * 0.5 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <circle cx="50" cy="38" r="5" fill="white" />
            <motion.circle
              cx="50"
              cy="38"
              r="2.5"
              fill="#1A1A2E"
              animate={{ x: mousePos.x, y: mousePos.y }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
            <circle cx="51.5" cy="36.5" r="1" fill="white" />
          </motion.g>
        </motion.g>

        {/* Eyebrows */}
        {state === "thinking" && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <line x1="31" y1="31" x2="38" y2="32" stroke="#1A9B8F" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="47" y1="32" x2="54" y2="31" stroke="#1A9B8F" strokeWidth="1.5" strokeLinecap="round" />
          </motion.g>
        )}

        {/* Mouth */}
        <motion.path
          d={mouthVariants[state]?.d || mouthVariants.idle.d}
          stroke="#1A1A2E"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill={state === "excited" || state === "talking" ? "#FF6B35" : "none"}
          transition={{ duration: 0.3 }}
        />

        {/* Blush */}
        <circle cx="28" cy="44" r="3" fill="#FF6B35" opacity="0.2" />
        <circle cx="56" cy="44" r="3" fill="#FF6B35" opacity="0.2" />

        {/* Compass needle on top */}
        <motion.g
          animate={
            state === "thinking"
              ? { rotate: [0, 360], transition: { duration: 2, repeat: Infinity, ease: "linear" } }
              : { rotate: 0 }
          }
          style={{ transformOrigin: "42px 16px" }}
        >
          <polygon points="42,8 39,16 45,16" fill="#FF6B35" />
          <polygon points="42,24 39,16 45,16" fill="#FFD166" />
        </motion.g>
        <circle cx="42" cy="16" r="2" fill="#FFD166" stroke="#FF6B35" strokeWidth="0.5" />

        {/* Little feet */}
        <ellipse cx="35" cy="66" rx="5" ry="2.5" fill="#1A9B8F" />
        <ellipse cx="50" cy="66" rx="5" ry="2.5" fill="#1A9B8F" />

        {/* Gradient definitions */}
        <defs>
          <radialGradient id="bodyGradient" cx="0.4" cy="0.35" r="0.6">
            <stop offset="0%" stopColor="#3DD8CC" />
            <stop offset="100%" stopColor="#2EC4B6" />
          </radialGradient>
        </defs>
      </motion.svg>

      {/* Thinking dots */}
      {state === "thinking" && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-[#FFD166]"
              animate={{ y: [0, -8, 0], opacity: [0.4, 1, 0.4] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}

      {/* Sparkles for excited state */}
      {state === "excited" && (
        <>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-[#FFD166]"
              style={{
                top: `${20 + Math.random() * 60}%`,
                left: `${10 + Math.random() * 80}%`,
              }}
              animate={{
                scale: [0, 1.5, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </>
      )}

      {/* Suggesting pointer */}
      {state === "suggesting" && (
        <motion.div
          className="absolute right-0 top-1/2 -translate-y-1/2"
          animate={{ x: [0, 8, 0] }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#FFD166">
            <path d="M5 12h14M12 5l7 7-7 7" stroke="#FFD166" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      )}
    </div>
  );
}
