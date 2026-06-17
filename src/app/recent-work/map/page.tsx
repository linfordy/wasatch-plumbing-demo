// src/app/recent-work/map/page.tsx
//
// Server component for the /recent-work/map route. Resolves every
// registry entry to coords; renders the client-side Leaflet map via
// a thin client loader.

import { recentWork } from "@/lib/recent-work";
import { resolveEntryCoords } from "@/lib/recent-work-geo";
import { createMetadata } from "@/lib/metadata";
import Link from "next/link";
import { AnimateOnScroll } from "@/components/animate-on-scroll";
import MapView from "./map-loader";

export const metadata = createMetadata({
  title: "Recent Work — Map",
  description:
    "Map of recent plumbing jobs Wasatch Plumbing Co. has completed across South Jordan and Salt Lake Valley. Click any pin to see the job recap.",
  path: "/recent-work/map",
});

export default function RecentWorkMapPage() {
  const resolved = recentWork.map(resolveEntryCoords).filter((e): e is NonNullable<typeof e> => e !== null);
  const skipped = recentWork.length - resolved.length;

  return (
    <>
      <section className="pt-32 pb-8 px-6 lg:px-10 bg-gradient-to-b from-brand-dark to-brand-black">
        <div className="max-w-6xl mx-auto">
          <AnimateOnScroll>
            <Link href="/recent-work" className="text-brand-red text-xs tracking-[2px] font-semibold hover:underline">
              ← Recent Work
            </Link>
            <h1 className="text-3xl lg:text-4xl font-black mt-2 mb-4">
              Where We've <span className="text-brand-red">Worked</span>
            </h1>
            <p className="text-gray-400 text-base max-w-3xl">
              {resolved.length === 0
                ? "We haven't logged any work to the map yet — check back soon."
                : `${resolved.length} job${resolved.length === 1 ? "" : "s"} across South Jordan and Salt Lake Valley. Click any pin to read the recap.`}
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      <section className="py-8 px-6 lg:px-10 max-w-6xl mx-auto">
        <MapView entries={resolved} />
        {skipped > 0 && (
          <p className="text-xs text-gray-600 mt-3 text-center">
            ({skipped} {skipped === 1 ? "job" : "jobs"} outside our mapped service area)
          </p>
        )}
      </section>
    </>
  );
}
