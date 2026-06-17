// src/app/recent-work/service/[slug]/page.tsx
//
// Aggregation page for all recent work matching a single service
// category (e.g. water-heater, drain-cleaning). Each rank target on
// queries like "water heater South Jordan" via authentic real-job content.

import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createMetadata } from "@/lib/metadata";
import {
  getAllServiceSlugs,
  getEntriesByServiceSlug,
  humanize,
  slugify,
} from "@/lib/recent-work-taxonomy";
import { breadcrumbSchema } from "@/lib/schema";
import { AnimateOnScroll } from "@/components/animate-on-scroll";
import { StaggerChildren, StaggerItem } from "@/components/stagger-children";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllServiceSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entries = getEntriesByServiceSlug(slug);
  if (entries.length === 0) return {};
  const name = humanize(slug);
  return createMetadata({
    title: `Recent ${name} Jobs — South Jordan, UT & Salt Lake Valley`,
    description: `Real ${name.toLowerCase()} jobs completed by Wasatch Plumbing Co.. Authentic recaps from our techs across South Jordan and Salt Lake Valley.`,
    path: `/recent-work/service/${slug}`,
  });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default async function ServiceTaxonomyPage({ params }: Props) {
  const { slug } = await params;
  const entries = getEntriesByServiceSlug(slug).sort(
    (a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
  );
  if (entries.length === 0) notFound();

  const name = humanize(slug);

  return (
    <>
      <section className="pt-32 pb-16 px-6 lg:px-10 bg-gradient-to-b from-brand-dark to-brand-black">
        <div className="max-w-4xl mx-auto">
          <AnimateOnScroll>
            <Link href="/recent-work" className="text-brand-red text-xs tracking-[2px] font-semibold hover:underline">
              ← Recent Work
            </Link>
            <h1 className="text-4xl lg:text-5xl font-black mt-2 mb-4">
              {name} <span className="text-brand-red">Jobs</span>
            </h1>
            <p className="text-gray-400 text-lg">
              {entries.length} {name.toLowerCase()} {entries.length === 1 ? "job" : "jobs"} completed by our techs. Real recaps from the field.
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
                    <h2 className="text-lg font-bold mb-2 group-hover:text-brand-red transition-colors">
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
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Home", href: "/" },
              { name: "Recent Work", href: "/recent-work" },
              { name: name, href: `/recent-work/service/${slug}` },
            ])
          ),
        }}
      />
    </>
  );
}
