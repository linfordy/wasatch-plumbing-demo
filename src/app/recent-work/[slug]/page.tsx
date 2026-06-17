// src/app/recent-work/[slug]/page.tsx
//
// Per-job detail page. Reads metadata from the recentWork registry
// (maintained by the Linfordy platform) and dynamic-imports the MDX
// body. Falls back to 404 if no registry entry exists for the slug.
//
// Injects BlogPosting + Breadcrumb JSON-LD so LLMs + Google can
// extract structured facts (date, location, service, photos, author).

import { notFound } from "next/navigation";
import Link from "next/link";
import { recentWork } from "@/lib/recent-work";
import { createMetadata } from "@/lib/metadata";
import { recentWorkSchema, breadcrumbSchema } from "@/lib/schema";
import { slugify } from "@/lib/recent-work-taxonomy";
import { CTASection } from "@/components/cta-section";
import { AnimateOnScroll } from "@/components/animate-on-scroll";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return recentWork.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = recentWork.find((e) => e.slug === slug);
  if (!entry) return {};
  return createMetadata({
    title: entry.title,
    description:
      entry.voice_summary?.slice(0, 160) ||
      `Recent plumbing work in ${entry.city || "Salt Lake Valley"} by Wasatch Plumbing Co..`,
    path: `/recent-work/${slug}`,
  });
}

function humanizeService(s: string): string {
  return s
    .replace(/[-_]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function RecentWorkDetailPage({ params }: Props) {
  const { slug } = await params;
  const entry = recentWork.find((e) => e.slug === slug);
  if (!entry) notFound();

  let Content: React.ComponentType;
  try {
    const mod = await import(`@/content/recent-work/${slug}.mdx`);
    Content = mod.default;
  } catch {
    notFound();
  }

  const where = [entry.neighborhood, entry.city, entry.state].filter(Boolean).join(", ");

  return (
    <>
      <section className="pt-32 pb-8 px-6 lg:px-10 bg-gradient-to-b from-brand-dark to-brand-black">
        <div className="max-w-3xl mx-auto">
          <AnimateOnScroll>
            <Link href="/recent-work" className="text-brand-red text-xs tracking-[2px] font-semibold hover:underline">
              ← Recent Work
            </Link>
            <span className="ml-2 text-brand-red text-xs tracking-[2px] font-semibold">
              · {humanizeService(entry.service_category)}
            </span>
            <h1 className="text-3xl lg:text-4xl font-black mt-2 mb-4">{entry.title}</h1>
            <p className="text-gray-500 text-sm">
              {formatDate(entry.completed_at)}
              {where && ` · ${where}`}
              {entry.tech_name && ` · Completed by ${entry.tech_name}`}
            </p>
            <div className="flex flex-wrap gap-2 mt-4 text-xs">
              <Link
                href={`/recent-work/service/${slugify(entry.service_category)}`}
                className="px-3 py-1.5 rounded-full bg-brand-darker text-gray-300 hover:bg-brand-red hover:text-white transition-colors"
              >
                More {humanizeService(entry.service_category)} jobs →
              </Link>
              {entry.city && (
                <Link
                  href={`/recent-work/area/${slugify(entry.city)}`}
                  className="px-3 py-1.5 rounded-full bg-brand-darker text-gray-300 hover:bg-brand-red hover:text-white transition-colors"
                >
                  More work in {entry.city} →
                </Link>
              )}
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      <article className="py-12 px-6 lg:px-10 max-w-3xl mx-auto prose prose-invert prose-red prose-sm lg:prose-base prose-headings:font-bold prose-a:text-brand-red prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl">
        <Content />
      </article>

      <CTASection />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(recentWorkSchema(entry)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Home", href: "/" },
              { name: "Recent Work", href: "/recent-work" },
              { name: entry.title, href: `/recent-work/${entry.slug}` },
            ])
          ),
        }}
      />
    </>
  );
}
