// src/lib/recent-work-taxonomy.ts
//
// Helpers for the /recent-work/service/[slug] and /recent-work/area/[slug]
// taxonomy routes. Normalizes service_category + city values from the
// registry into URL-safe slugs and provides reverse-lookup + filter
// utilities the routes consume.

import { recentWork, type RecentWorkEntry } from "./recent-work";

// URL-safe slugifier. Handles:
//   "water_heater"   -> "water-heater"
//   "Water Heater"   -> "water-heater"
//   "Highland Park"  -> "highland-park"
//   "Royse City, TX" -> "royse-city-tx"
export function slugify(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Title-case a slug for display. "water-heater" -> "Water Heater"
export function humanize(slug: string | null | undefined): string {
  if (!slug) return "";
  return slug
    .replace(/[-_]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

// All distinct service-category slugs that have at least one entry.
export function getAllServiceSlugs(): string[] {
  const set = new Set<string>();
  for (const e of recentWork) {
    const s = slugify(e.service_category);
    if (s) set.add(s);
  }
  return [...set].sort();
}

// All distinct city slugs that have at least one entry.
export function getAllCitySlugs(): string[] {
  const set = new Set<string>();
  for (const e of recentWork) {
    const s = slugify(e.city);
    if (s) set.add(s);
  }
  return [...set].sort();
}

export function getEntriesByServiceSlug(slug: string): RecentWorkEntry[] {
  return recentWork.filter((e) => slugify(e.service_category) === slug);
}

export function getEntriesByCitySlug(slug: string): RecentWorkEntry[] {
  return recentWork.filter((e) => slugify(e.city) === slug);
}
