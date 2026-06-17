"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { company } from "@/data/company";

function Counter({
  target,
  suffix = "",
  prefix = "",
}: {
  target: number;
  suffix?: string;
  prefix?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const start = performance.now();
    function update(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

const stats = [
  {
    label: "YEARS IN BUSINESS",
    value: (
      <Counter
        target={new Date().getFullYear() - company.established}
        suffix="+"
      />
    ),
  },
  {
    label: "PROJECTS COMPLETED",
    value: <Counter target={company.projectsCompleted} suffix="+" />,
  },
  { label: "EMERGENCY SERVICE", value: "24/7" },
  { label: "TX MASTER LICENSE", value: `#${company.licenseNumber}` },
];

export function StatsBar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 1.1 }}
      className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-xl border-t border-white/[0.08] z-10"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 flex justify-between items-center">
        {stats.map((stat, i) => (
          <div key={stat.label} className="flex items-center gap-8">
            {i > 0 && (
              <div className="hidden sm:block w-px h-10 bg-white/10" />
            )}
            <div className="text-center">
              <div className="text-brand-red text-2xl lg:text-3xl font-black">
                {stat.value}
              </div>
              <div className="text-gray-600 text-[10px] tracking-[2px] mt-1">
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
