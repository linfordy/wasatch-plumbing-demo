// src/app/recent-work/area/[slug]/page.tsx
//
// Aggregation page for all recent work in a single city. Reinforces
// local-SEO entity signals — "Wasatch Plumbing = plumber in South Jordan" gets
// many ranking touches across taxonomy + detail + service-area pages.

import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createMetadata } from "@/lib/metadata";
import {
  getAllCitySlugs,
  getEntriesByCitySlug,
  humanize,
} from "@/lib/recent-work-taxonomy";
import { breadcrumbSchema } from "@/lib/schema";
import { AnimateOnScroll } from "@/components/animate-on-scroll";
import { StaggerChildren, StaggerItem } from "@/components/stagger-children";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllCitySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entries = getEntriesByCitySlug(slug);
  if (entries.length === 0) return {};
  const name = entries[0]?.city || humanize(slug);
  return createMetadata({
    title: `Recent Plumbing Work in ${name}, TX — Wasatch Plumbing Co.`,
    description: `Real plumbing jobs we've completed in ${name}, TX. Authentic recaps from our techs in the field.`,
    path: `/recent-work/area/${slug}`,
  });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default async function AreaTaxonomyPage({ params }: Props) {
  const { slug } = await params;
  const entries = getEntriesByCitySlug(slug).sort(
    (a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
  );
  if (entries.length === 0) notFound();

  const name = entries[0]?.city || humanize(slug);

  return (
    <>
      <section className="pt-32 pb-16 px-6 lg:px-10 bg-gradient-to-b from-brand-dark to-brand-black">
        <div className="max-w-4xl mx-auto">
          <AnimateOnScroll>
            <Link href="/recent-work" className="text-brand-red text-xs tracking-[2px] font-semibold hover:underline">
              ← Recent Work
            </Link>
            <h1 className="text-4xl lg:text-5xl font-black mt-2 mb-4">
              Recent Work in <span className="text-brand-red">{name}</span>
            </h1>
            <p className="text-gray-400 text-lg">
              {entries.length} job{entries.length === 1 ? "" : "s"} completed in {name} by our techs. Real recaps from the field.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      <section className="py-16 px-6 lg:px-10 max-w-4xl mx-auto">
        <StaggerChildren className="space-y-6">
          {entries.map((item) => (
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
                  <div className="flex-1">
                    <span className="text-brand-red text-xs tracking-[2px] font-semibold">
                      {humanize(item.service_category).toUpperCase()}
                    </span>
                    <h2 className="text-lg font-bold mt-1 mb-2 group-hover:text-brand-red transition-colors">
                      {item.title}
                    </h2>
                    {item.voice_summary && (
                      <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">{item.voice_summary}</p>
                    )}
                    <span className="text-gray-600 text-xs mt-3 block">
                      {formatDate(item.completed_at)}
                      {item.tech_name && ` · ${item.tech_name}`}
                    </span>
                  </div>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Home", href: "/" },
              { name: "Recent Work", href: "/recent-work" },
              { name: name, href: `/recent-work/area/${slug}` },
            ])
          ),
        }}
      />
    </>
  );
}
