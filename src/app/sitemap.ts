import type { MetadataRoute } from "next";
import { services } from "@/data/services";
import { serviceAreas } from "@/data/service-areas";
import { getAllSlugs } from "@/lib/mdx";
import { recentWork } from "@/lib/recent-work";
import { getAllServiceSlugs, getAllCitySlugs } from "@/lib/recent-work-taxonomy";

const BASE_URL = "https://wasatch-plumbing-demo.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 1 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${BASE_URL}/specials`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${BASE_URL}/recent-work`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
  ];

  const servicePages = services.map((s) => ({
    url: `${BASE_URL}/services/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  const areaPages = serviceAreas.map((a) => ({
    url: `${BASE_URL}/service-areas/${a.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  const blogPages = getAllSlugs().map((slug) => ({
    url: `${BASE_URL}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // Per-job recent-work pages — auto-grown by the Linfordy platform's
  // proofpop-capture handler. Each entry in src/lib/recent-work.ts is
  // a real-job page. lastModified comes from completed_at so Google
  // sees genuine freshness signals rather than always-now.
  const recentWorkPages = recentWork.map((e) => ({
    url: `${BASE_URL}/recent-work/${e.slug}`,
    lastModified: new Date(e.completed_at),
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));

  const recentWorkServiceTaxonomyPages = getAllServiceSlugs().map((slug) => ({
    url: `${BASE_URL}/recent-work/service/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const recentWorkAreaTaxonomyPages = getAllCitySlugs().map((slug) => ({
    url: `${BASE_URL}/recent-work/area/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...servicePages, ...areaPages, ...blogPages, ...recentWorkPages, ...recentWorkServiceTaxonomyPages, ...recentWorkAreaTaxonomyPages];
}
