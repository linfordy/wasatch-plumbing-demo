"use client";

// src/app/recent-work/map/map-view.tsx
//
// Client-side Leaflet map. Pure JS Leaflet (not the bare component
// react-leaflet wrappers) so we can attach custom SVG markers + popups
// without fighting webpack over marker asset URLs.
//
// Uses OpenStreetMap tiles — free, no API key, decent density for
// Salt Lake Valley.

import { useEffect, useRef } from "react";
import Link from "next/link";
import "leaflet/dist/leaflet.css";
import type { ResolvedEntry } from "@/lib/recent-work-geo";
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from "@/lib/recent-work-geo";

interface Props {
  entries: ResolvedEntry[];
}

export function MapView({ entries }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current) return;

      const map = L.map(containerRef.current, {
        center: MAP_DEFAULT_CENTER,
        zoom: MAP_DEFAULT_ZOOM,
        scrollWheelZoom: true,
      });
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Custom pin (brand red, matches site styling) — SVG-as-divIcon
      // sidesteps the well-known Next.js → Leaflet marker asset issue.
      const pinSvg = `
        <div style="
          position: relative;
          width: 28px;
          height: 36px;
          transform: translate(-50%, -100%);
        ">
          <svg width="28" height="36" viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.27 21.73 0 14 0z" fill="#C41E1E"/>
            <circle cx="14" cy="14" r="6" fill="white"/>
          </svg>
        </div>
      `;

      const icon = L.divIcon({
        html: pinSvg,
        className: "",
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      // Cluster pins at the same coord so a busy city doesn't show a
      // single overlapping marker. We offset duplicates by a tiny jitter.
      const seenCoords = new Map<string, number>();
      for (const entry of entries) {
        const key = `${entry.lat.toFixed(4)},${entry.lng.toFixed(4)}`;
        const dupIndex = seenCoords.get(key) || 0;
        seenCoords.set(key, dupIndex + 1);
        const jitter = dupIndex * 0.003; // ~330m per offset
        const lat = entry.lat + jitter;
        const lng = entry.lng + jitter;

        const completedStr = new Date(entry.completed_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
        const photoHtml = entry.photo_urls?.[0]
          ? `<img src="${entry.photo_urls[0]}" alt="" style="width:100%;height:120px;object-fit:cover;border-radius:6px;margin-bottom:8px;" />`
          : "";
        const popupHtml = `
          <div style="min-width:220px;max-width:260px;font-family:inherit;">
            ${photoHtml}
            <div style="font-size:11px;color:#c41e1e;letter-spacing:1.5px;font-weight:600;text-transform:uppercase;">
              ${entry.service_category.replace(/[-_]+/g, " ")}
            </div>
            <div style="font-weight:700;font-size:14px;margin:4px 0 6px;color:#222;">
              ${entry.title}
            </div>
            <div style="font-size:11px;color:#777;margin-bottom:8px;">
              ${entry.city || "Salt Lake Valley"}${entry.tech_name ? " \u00b7 " + entry.tech_name : ""} \u00b7 ${completedStr}
            </div>
            <a href="/recent-work/${entry.slug}" style="font-size:12px;color:#c41e1e;font-weight:600;text-decoration:none;">
              Read the recap \u2192
            </a>
          </div>
        `;

        L.marker([lat, lng], { icon }).addTo(map).bindPopup(popupHtml);
      }

      // If we have entries, fit the view to them; else stay on default center.
      if (entries.length > 0) {
        const bounds = L.latLngBounds(entries.map((e) => [e.lat, e.lng] as [number, number]));
        map.fitBounds(bounds.pad(0.2), { maxZoom: 12 });
      }
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [entries]);

  return (
    <div
      ref={containerRef}
      className="w-full h-[600px] rounded-2xl overflow-hidden border border-brand-darker"
      style={{ background: "#1a1a1a" }}
    />
  );
}
