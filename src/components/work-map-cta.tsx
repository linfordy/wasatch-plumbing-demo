"use client";

// Homepage entry point to /recent-work/map.
// Stylized map illustration with animated pulsing red pins + a big CTA.
// Doesn't render a real map (heavy on the homepage); the actual job map lives
// at /recent-work/map.

import Link from "next/link";
import { motion } from "framer-motion";
import { recentWork } from "@/lib/recent-work";

// Approximate pin positions (% from top/left) — illustrative, not exact geo.
const PIN_POSITIONS = [
  { top: 28, left: 22, delay: 0 },
  { top: 42, left: 36, delay: 0.15 },
  { top: 22, left: 56, delay: 0.3 },
  { top: 58, left: 48, delay: 0.45 },
  { top: 48, left: 72, delay: 0.6 },
  { top: 68, left: 28, delay: 0.75 },
];

export function WorkMapCTA() {
  const totalJobs = recentWork.length;

  return (
    <section className="relative py-24 lg:py-32 px-6 lg:px-10 bg-gradient-to-b from-brand-black via-[#080d1a] to-brand-black overflow-hidden">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Left: copy + CTA */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-0.5 bg-brand-red" />
            <span className="text-brand-red text-xs tracking-[4px] font-semibold">
              OUR WORK &middot; MAPPED
            </span>
          </div>

          <h2 className="text-4xl lg:text-5xl font-black leading-[1.1] mb-5 tracking-tight">
            Every job.
            <br />
            <span className="text-brand-red">Pinned.</span>
          </h2>

          <p className="text-gray-400 text-lg leading-relaxed mb-8 max-w-md">
            Each red pin marks a real plumbing job we&apos;ve completed across the
            Salt Lake Valley. Click any pin on the map to read the recap and
            see the photos from the field.
          </p>

          <div className="flex items-baseline gap-3 mb-10">
            <span className="text-6xl font-black text-white tabular-nums">
              {totalJobs}
            </span>
            <span className="text-gray-400 text-sm leading-tight">
              jobs mapped
              <br />
              and counting
            </span>
          </div>

          <Link
            href="/recent-work/map"
            className="inline-flex items-center gap-3 bg-brand-red text-white px-8 py-4 rounded-md text-base font-bold shadow-[0_4px_20px_rgba(196,30,30,0.3)] hover:shadow-[0_8px_30px_rgba(196,30,30,0.5)] hover:-translate-y-0.5 transition-all"
          >
            <span>Explore the Map</span>
            <span aria-hidden="true">→</span>
          </Link>
        </motion.div>

        {/* Right: stylized "map" with pulsing pins */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-[#0c1224] to-[#060a14] shadow-2xl"
        >
          {/* Grid pattern (gives it a "map" feel) */}
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
            }}
          />

          {/* Mountain ridge silhouette across the bottom (Wasatch reference) */}
          <svg
            className="absolute bottom-0 left-0 right-0 w-full"
            viewBox="0 0 400 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="mountain-grad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#1f3a5f" stopOpacity="0.5" />
                <stop offset="1" stopColor="#0a0e1a" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0,100 L0,60 L40,30 L90,55 L140,15 L190,45 L240,10 L290,40 L340,18 L400,30 L400,100 Z"
              fill="url(#mountain-grad)"
            />
          </svg>

          {/* Pulsing pins */}
          {PIN_POSITIONS.map((pin, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{ top: `${pin.top}%`, left: `${pin.left}%` }}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.6 + pin.delay, duration: 0.4, ease: "backOut" }}
            >
              <span className="absolute -inset-3 rounded-full bg-brand-red/30 animate-ping" />
              <span className="absolute -inset-1 rounded-full bg-brand-red/20" />
              <span className="relative block w-3 h-3 rounded-full bg-brand-red shadow-[0_0_14px_rgba(196,30,30,0.9)]" />
            </motion.div>
          ))}

          {/* Compass corner */}
          <div className="absolute top-4 right-4 text-white/40 text-xs font-bold tracking-[3px]">
            N ↑
          </div>

          {/* Click-to-explore overlay (entire card is the link) */}
          <Link
            href="/recent-work/map"
            className="absolute inset-0 flex items-end justify-center pb-5 text-[10px] text-white/50 hover:text-white transition-colors uppercase tracking-[3px] group"
            aria-label="Open the full job map"
          >
            <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 group-hover:border-white/30 transition-colors">
              Open Full Map →
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
