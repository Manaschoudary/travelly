"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";

const photos = [
  {
    title: "Golden Hour at Taj Mahal",
    location: "Agra, India",
    category: "Heritage",
    gradient: "from-amber-400 to-orange-600",
    span: "col-span-2 row-span-2",
  },
  {
    title: "Misty Tea Plantations",
    location: "Munnar, Kerala",
    category: "Landscape",
    gradient: "from-green-400 to-emerald-600",
    span: "col-span-1 row-span-1",
  },
  {
    title: "Varanasi at Dawn",
    location: "Varanasi, India",
    category: "Street",
    gradient: "from-orange-300 to-rose-500",
    span: "col-span-1 row-span-1",
  },
  {
    title: "Snow Leopard Trail",
    location: "Hemis, Ladakh",
    category: "Wildlife",
    gradient: "from-slate-400 to-blue-800",
    span: "col-span-1 row-span-2",
  },
  {
    title: "Holi Festival of Colors",
    location: "Mathura, India",
    category: "Culture",
    gradient: "from-pink-400 to-purple-600",
    span: "col-span-1 row-span-1",
  },
  {
    title: "Backwaters at Sunset",
    location: "Alleppey, Kerala",
    category: "Landscape",
    gradient: "from-teal-400 to-cyan-600",
    span: "col-span-2 row-span-1",
  },
  {
    title: "Desert Starscape",
    location: "Jaisalmer, Rajasthan",
    category: "Night",
    gradient: "from-indigo-600 to-violet-900",
    span: "col-span-1 row-span-1",
  },
  {
    title: "Monks of Tawang",
    location: "Tawang, Arunachal Pradesh",
    category: "Portrait",
    gradient: "from-red-400 to-amber-500",
    span: "col-span-1 row-span-1",
  },
  {
    title: "Living Root Bridges",
    location: "Cherrapunji, Meghalaya",
    category: "Nature",
    gradient: "from-lime-400 to-green-700",
    span: "col-span-1 row-span-1",
  },
  {
    title: "Bali Rice Terraces",
    location: "Ubud, Bali",
    category: "Landscape",
    gradient: "from-emerald-300 to-teal-600",
    span: "col-span-1 row-span-1",
  },
];

export default function PhotoGallerySection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const { theme } = useTheme();
  const light = theme === "light";

  return (
    <section
      id="photo-gallery"
      ref={ref}
      className={cn("py-20", light && "bg-[#F8F9FA]")}
      style={!light ? { background: "linear-gradient(180deg, #16213E 0%, #1A1A2E 100%)" } : undefined}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className={cn(
            "text-3xl sm:text-4xl font-bold mb-4",
            light ? "text-[#1A1A2E]" : "text-white"
          )}>
            Through My{" "}
            <span className="bg-gradient-to-r from-[#FFD166] to-[#FF6B35] bg-clip-text text-transparent">
              Lens
            </span>
          </h2>
          <p className={cn(
            "text-lg max-w-xl mx-auto",
            light ? "text-gray-600" : "text-white/60"
          )}>
            Capturing the beauty of travel — one frame at a time
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-[180px] md:auto-rows-[200px] gap-4">
          {photos.map((photo, i) => (
            <motion.div
              key={photo.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className={`${photo.span} group relative overflow-hidden rounded-2xl cursor-pointer`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${photo.gradient}`}
              />

              <Badge className="absolute top-3 right-3 bg-black/30 backdrop-blur-sm text-white border-0 text-[10px] z-10">
                {photo.category}
              </Badge>

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
                <h3 className="text-white font-bold text-sm">{photo.title}</h3>
                <p className="text-white/70 text-xs">{photo.location}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
