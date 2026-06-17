"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { reviews as fallbackReviews } from "@/data/reviews";
import { company } from "@/data/company";
import type { PublicReview, ReviewsResponse } from "@/app/api/reviews/route";

const ROTATE_INTERVAL_MS = 7000;

function Stars({ count }: { count: number }) {
  return (
    <div className="text-brand-gold tracking-widest text-sm" aria-label={`${count} out of 5 stars`}>
      {"★".repeat(Math.round(count))}
      {"☆".repeat(5 - Math.round(count))}
    </div>
  );
}

function Avatar({ src, name }: { src: string | null; name: string }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- Google profile photos lack a fixed domain set; <img> avoids next.config.ts coupling for a 48px decorative avatar.
      <img
        src={src}
        alt={name}
        className="w-12 h-12 rounded-full object-cover bg-brand-darker"
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div className="w-12 h-12 rounded-full bg-brand-red/20 text-brand-red font-bold flex items-center justify-center text-sm">
      {initials}
    </div>
  );
}

interface NormalizedReview {
  text: string;
  rating: number;
  author: string;
  authorPhoto: string | null;
  relativeTime: string;
  googleMapsUri: string | null;
}

function normalizeFallback(): NormalizedReview[] {
  return fallbackReviews.map((r) => ({
    text: r.text,
    rating: r.rating,
    author: r.author,
    authorPhoto: null,
    relativeTime: `${r.source} review`,
    googleMapsUri: null,
  }));
}

function fromApi(r: PublicReview): NormalizedReview {
  return {
    text: r.text,
    rating: r.rating,
    author: r.author,
    authorPhoto: r.authorPhoto,
    relativeTime: r.relativeTime,
    googleMapsUri: r.googleMapsUri,
  };
}

export function ReviewsCarousel() {
  const [reviews, setReviews] = useState<NormalizedReview[]>(normalizeFallback);
  const [rating, setRating] = useState<number | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/reviews");
        if (!res.ok) return;
        const data: ReviewsResponse = await res.json();
        if (cancelled) return;
        if (data.reviews.length > 0) {
          setReviews(data.reviews.map(fromApi));
        }
        if (data.rating !== null) setRating(data.rating);
        if (data.total !== null) setTotal(data.total);
      } catch {
        // keep fallback reviews
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % reviews.length);
  }, [reviews.length]);

  useEffect(() => {
    if (paused || reviews.length <= 1) return;
    intervalRef.current = setInterval(next, ROTATE_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paused, next, reviews.length]);

  // Clamp index at render to handle reviews shrinking (e.g. fallback → API with fewer items)
  const safeIndex = index >= reviews.length ? 0 : index;
  const current = reviews[safeIndex];
  if (!current) return null;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Aggregate badge */}
      <div className="flex items-center justify-center gap-3 mb-8 text-sm">
        {rating !== null ? (
          <>
            <Stars count={rating} />
            <span className="text-white font-bold">{rating.toFixed(1)}</span>
            <span className="text-gray-500">·</span>
            <a
              href={company.googleMapsReviewsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-brand-red transition-colors"
            >
              {total !== null ? `${total.toLocaleString()} Google reviews` : "View on Google"} →
            </a>
          </>
        ) : (
          <span className="text-gray-500 text-xs uppercase tracking-widest">Google Reviews</span>
        )}
      </div>

      {/* Carousel */}
      <div
        className="relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
        <div className="relative min-h-[280px] sm:min-h-[240px]">
          <AnimatePresence mode="wait">
            <motion.article
              key={safeIndex}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className="bg-brand-dark border border-brand-darker rounded-2xl p-8 sm:p-10 relative"
            >
              <span
                aria-hidden="true"
                className="absolute top-6 right-8 text-6xl text-brand-darker font-serif leading-none select-none"
              >
                &ldquo;
              </span>

              <Stars count={current.rating} />

              <p className="text-gray-200 text-base sm:text-lg leading-relaxed mt-4 mb-6 italic">
                {current.text}
              </p>

              <div className="flex items-center gap-4">
                <Avatar src={current.authorPhoto} name={current.author} />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white truncate">{current.author}</div>
                  <div className="text-gray-500 text-xs">
                    {current.relativeTime}
                    {current.googleMapsUri && (
                      <>
                        {" · "}
                        <a
                          href={current.googleMapsUri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-brand-red transition-colors"
                        >
                          View on Google
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.article>
          </AnimatePresence>
        </div>

        {/* Pagination dots */}
        {reviews.length > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {reviews.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Show review ${i + 1} of ${reviews.length}`}
                className={`h-2 rounded-full transition-all ${
                  i === safeIndex
                    ? "w-8 bg-brand-red"
                    : "w-2 bg-brand-darker hover:bg-gray-600"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
