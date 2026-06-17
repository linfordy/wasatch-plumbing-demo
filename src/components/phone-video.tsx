"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";

export function PhoneVideo() {
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setMuted(!muted);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 60, rotate: 3 }}
      animate={{ opacity: 1, x: 0, rotate: 3 }}
      transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
      className="relative"
    >
      {/* Phone frame outer (handles perspective) */}
      <div
        className="relative w-[260px] h-[520px]"
        style={{ transform: "perspective(800px) rotateY(-5deg)" }}
      >
        {/* Phone frame inner (handles clipping) */}
        <div className="absolute inset-0 rounded-[40px] bg-black border-[6px] border-gray-700 shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-2xl z-20" />

          {/* Video */}
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover rounded-[34px]"
            src="/images/larrys-video.mp4"
          />

          {/* Mute/Unmute button */}
          <button
            onClick={toggleMute}
            className="absolute bottom-4 right-4 z-20 w-10 h-10 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-sm hover:bg-black/80 transition-colors"
            aria-label={muted ? "Unmute video" : "Mute video"}
          >
            {muted ? "🔇" : "🔊"}
          </button>

          {/* Subtle inner border for realism */}
          <div className="absolute inset-0 rounded-[34px] border border-white/5 pointer-events-none z-10" />
        </div>
      </div>

      {/* Glow effect behind phone */}
      <div className="absolute -inset-4 bg-brand-red/10 rounded-[50px] blur-[30px] -z-10" />
    </motion.div>
  );
}
