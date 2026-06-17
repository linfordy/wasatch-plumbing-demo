"use client";

import { useScroll, useTransform, motion } from "framer-motion";
import Image from "next/image";
import { company } from "@/data/company";
import { StatsBar } from "./stats-bar";
import { PhoneVideo } from "./phone-video";

export function Hero() {
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 800], [0, 320]);
  const bgOpacity = useTransform(scrollY, [0, 800], [0.85, 0.1]);

  return (
    <section className="relative min-h-screen overflow-hidden bg-brand-black">
      {/* Background photo with parallax */}
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        <Image
          src="/images/hero_family_image.jpg"
          alt="The Wasatch Plumbing Co. family — three generations of master plumbers in South Jordan, UT"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <motion.div
          className="absolute inset-0 bg-black"
          style={{ opacity: useTransform(bgOpacity, (v) => 1 - v) }}
        />
      </motion.div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/5" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 min-h-screen flex flex-col justify-center pt-24 pb-32">
        <div className="flex items-center gap-12 lg:gap-16">
          {/* Left: Text content */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex items-center gap-3 mb-4"
            >
              <div className="w-10 h-0.5 bg-brand-red" />
              <span className="text-brand-red text-xs tracking-[4px] font-semibold">
                FAMILY OWNED &middot; EST. 1970 &middot; ROCKWALL, TX
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.5 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.08] tracking-tight mb-5 max-w-2xl"
            >
              Three Generations.
              <br />
              One <span className="text-brand-red">Promise.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.7 }}
              className="text-gray-400 text-lg lg:text-xl leading-relaxed mb-9 max-w-xl"
            >
              Built on honest work — we&apos;ve been fixing pipes, earning trust,
              and keeping Salt Lake Valley homes running for over 55 years.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.9 }}
              className="flex flex-wrap gap-4"
            >
              <a
                href="/contact"
                className="bg-brand-red text-white px-8 py-3.5 rounded-md text-base font-bold shadow-[0_4px_20px_rgba(196,30,30,0.3)] hover:shadow-[0_8px_30px_rgba(196,30,30,0.5)] hover:-translate-y-0.5 transition-all"
              >
                Schedule Service
              </a>
              <a
                href={`sms:${company.textRaw}`}
                className="border border-white/20 text-white px-8 py-3.5 rounded-md text-base hover:border-white/50 hover:bg-white/5 transition-all"
              >
                💬 Text Us a Question
              </a>
            </motion.div>
          </div>

          {/* Right: Phone video */}
          <div className="hidden lg:block flex-shrink-0">
            <PhoneVideo />
          </div>
        </div>
      </div>

      <StatsBar />
    </section>
  );
}
