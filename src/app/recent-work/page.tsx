// src/app/recent-work/page.tsx
//
// Index for capture-driven "recent work" pages, populated by the
// Linfordy platform's proofpop-capture handler. Each row in
// src/lib/recent-work.ts is one completed-job page.

import Link from "next/link";
import Image from "next/image";
import { recentWork } from "@/lib/recent-work";
import { createMetadata } from "@/lib/metadata";
import { AnimateOnScroll } from "@/components/animate-on-scroll";
import { StaggerChildren, StaggerItem } from "@/components/stagger-children";

export const metadata = createMetadata({
  title: "Recent Work",
  description:
    "See recent plumbing jobs Wasatch Plumbing Co. completed across South Jordan and Salt Lake Valley — real techs, real fixes, real homes.",
  path: "/recent-work",
});

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function humanizeService(s: string): string {
  return s.replace(/[-_]+/g, " ").split(" ").filter(Boolean)
    .map(w => w[0].toUpperCase() + w.slice(1).toLowerCase()).join(" ");
}

export default function RecentWorkIndexPage() {
  const items = [...recentWork].sort((a, b) =>
    new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
  );

  return (
    <>
      <section className="pt-32 pb-16 px-6 lg:px-10 bg-gradient-to-b from-brand-dark to-brand-black">
        <div className="max-w-4xl mx-auto">
          <AnimateOnScroll>
            <h1 className="text-4xl lg:text-5xl font-black mb-6">
              Recent <span className="text-brand-red">Work</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Real jobs completed by our techs. Authentic recaps from the field.
            </p>
            <Link href="/recent-work/map" className="inline-flex items-center gap-2 mt-4 text-sm text-brand-red hover:text-white transition-colors font-semibold tracking-wide">
              View on map →
            </Link>
            <p className="hidden">
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      <section className="py-16 px-6 lg:px-10 max-w-4xl mx-auto">
        {items.length === 0 ? (
          <p className="text-gray-500">No recent work yet — check back soon.</p>
        ) : (
          <StaggerChildren className="space-y-6">
            {items.map(item => (
              <StaggerItem key={item.slug}>
                <Link
                  href={`/recent-work/${item.slug}`}
                  className="group block bg-brand-dark border border-brand-darker rounded-xl p-6 hover:border-brand-red transition-all"
                >
                  <div className="flex items-start gap-6">
                    {item.photo_urls?.[0] && (
                      <div className="hidden sm:block relative w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
                        <Image src={item.photo_urls[0]} alt={item.title} fill className="object-cover" sizes="128px" unoptimized />
                      </div>
                    )}
                    <div>
                      <span className="text-brand-red text-xs tracking-[2px] font-semibold">
                        {humanizeService(item.service_category)}
                      </span>
                      <h2 className="text-lg font-bold mt-1 mb-2 group-hover:text-brand-red transition-colors">
                        {item.title}
                      </h2>
                      {item.voice_summary && (
                        <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">{item.voice_summary}</p>
                      )}
                      <span className="text-gray-600 text-xs mt-3 block">
                        {formatDate(item.completed_at)}
                        {item.city && ` · ${item.city}${item.state ? `, ${item.state}` : ""}`}
                        {item.tech_name && ` · ${item.tech_name}`}
                      </span>
                    </div>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerChildren>
        )}
      </section>
    </>
  );
}
