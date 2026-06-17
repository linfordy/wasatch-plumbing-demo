// src/lib/recent-work-geo.ts
//
// Resolves a recent-work registry entry to lat/lng coordinates for
// map pinning. Looks at the entry's lat_snapped/lng_snapped first
// (populated when ProofPop's emitter ships geocoding in v1.1).
// Falls back to a city-centroid lookup for cities in Wasatch Plumbing's service
// area. Returns null when no resolution path works — caller skips
// those entries from the map.
//
// Coords are intentionally approximate (~3 decimal places, ~100m
// precision) for privacy. Real jobs are NEVER pinned to the exact
// customer address.

import type { RecentWorkEntry } from "./recent-work";

// City centroids for Wasatch Plumbing's service area. Add new cities here as
// the service area grows. Coords are at ~3-decimal precision so
// every pin in a given city falls on the same spot — reinforces
// "we work in this city" without leaking street addresses.
const CITY_CENTROIDS: Record<string, [number, number]> = {
  "south jordan, ut": [40.562, -111.929],
  "riverton, ut": [40.521, -111.938],
  "sandy, ut": [40.591, -111.884],
  "draper, ut": [40.524, -111.863],
  "bluffdale, ut": [40.489, -111.938],
  "herriman, ut": [40.514, -112.033],
  "west jordan, ut": [40.609, -111.939],
  "murray, ut": [40.666, -111.888],
  "midvale, ut": [40.611, -111.899],
  "cottonwood heights, ut": [40.619, -111.834],
  "holladay, ut": [40.658, -111.828],
  "millcreek, ut": [40.686, -111.877],
};

export type ResolvedEntry = RecentWorkEntry & { lat: number; lng: number; resolution: "snapped" | "city-centroid" };

export function resolveEntryCoords(entry: RecentWorkEntry): ResolvedEntry | null {
  // 1. If the registry entry carries snapped coords (post-v1.1), use them.
  const lat = (entry as any).lat_snapped;
  const lng = (entry as any).lng_snapped;
  if (typeof lat === "number" && typeof lng === "number") {
    return { ...entry, lat, lng, resolution: "snapped" };
  }
  // 2. Fall back to city centroid.
  const key = `${(entry.city || "").trim()}, ${(entry.state || "").trim()}`.toLowerCase();
  const centroid = CITY_CENTROIDS[key];
  if (centroid) {
    return { ...entry, lat: centroid[0], lng: centroid[1], resolution: "city-centroid" };
  }
  // 3. Unresolvable — skip from map.
  return null;
}

// Center used when the map loads. Wasatch HQ (South Jordan).
export const MAP_DEFAULT_CENTER: [number, number] = [40.562, -111.929];
export const MAP_DEFAULT_ZOOM = 10;
