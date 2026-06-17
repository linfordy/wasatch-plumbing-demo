"use client";

// src/app/recent-work/map/map-loader.tsx
//
// Thin client wrapper so the Server Component page can use the
// Leaflet-based MapView without tripping Next 16's restriction on
// `dynamic({ ssr: false })` from Server Components.

import dynamic from "next/dynamic";

const MapView = dynamic(() => import("./map-view").then((m) => m.MapView), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-brand-dark border border-brand-darker rounded-2xl flex items-center justify-center text-gray-600">
      Loading map…
    </div>
  ),
});

export default MapView;
