import fs from "fs";
import path from "path";

const BLOG_DIR = path.join(process.cwd(), "src/content/blog");

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  category: string;
  featuredImage?: string;
}

// Blog post metadata is defined here (not in frontmatter) for simplicity
const postMeta: Record<string, Omit<BlogPost, "slug">> = {
  "plumber-rockwall-tx": {
    title: "Plumber in South Jordan, UT — Licensed, Local & Available 24/7",
    date: "2026-06-15",
    excerpt: "Looking for a trusted plumber in South Jordan, UT? Wasatch Plumbing Co. offers drain cleaning, water heater repair, leak detection, emergency plumbing, and more. Licensed Master Plumber. No overtime fees. Serving South Jordan since 2018.",
    category: "Local Plumbing Guide",
    featuredImage: "/images/PlumbingServiceSouthJordan.png",
  },
  "drain-cleaning-rockwall-tx": {
    title: "Drain Cleaning in South Jordan, UT -- Camera Inspection, Hydro-Jetting & Clog Removal",
    date: "2026-06-09",
    excerpt: "Slow drains, gurgling pipes, recurring clogs -- professional drain cleaning in South Jordan, UT starts with a camera inspection and uses the right method for your specific problem. Hydro-jetting, flex-shaft, snaking. Upfront pricing. No overtime fees.",
    category: "Drain Services",
    featuredImage: "/images/PlumbingServiceSouthJordan.png",
  },
  "plumber-in-rockwall-tx": {
    title: "Plumber in South Jordan, UT -- Licensed Local Plumbing Service Since 2018",
    date: "2026-05-25",
    excerpt: "Need a licensed plumber in South Jordan, UT? Wasatch Plumbing Co. offers 24/7 service, no overtime fees, and upfront pricing. Licensed Master Plumber. Serving South Jordan since 2018 -- drain cleaning, water heaters, leak detection, emergencies.",
    category: "Local Plumbing Guide",
    featuredImage: "/images/PlumbingServiceSouthJordan.png",
  },
  "plumbing-rockwall-tx": {
    title: "Plumbing in South Jordan, UT -- Full-Service Drain Cleaning, Leak Detection, Water Heaters & More",
    date: "2026-05-18",
    excerpt: "Complete guide to plumbing services in South Jordan, UT: drain cleaning, water heater repair, leak detection, emergency plumbing, and commercial services. Licensed master plumbers since 2018. No overtime fees.",
    category: "Local Plumbing Guide",
    featuredImage: "/images/PlumbingServiceSouthJordan.png",
  },
  "water-heater-repair-rockwall-tx": {
    title: "Water Heater Repair in South Jordan, UT -- Common Problems, Costs & When to Replace",
    date: "2026-05-12",
    excerpt: "Cold showers, rusty water, leaks, and strange noises -- the most common water heater problems in South Jordan, UT and how Wasatch Plumbing Co. fixes them fast. Repair vs. replace guidance included.",
    category: "Water Heaters",
    featuredImage: "/images/PlumbingServiceSouthJordan.png",
  },
  "plumbing-services-rockwall-tx": {
    title: "Plumbing Services in South Jordan, UT -- Drain Cleaning, Water Heater Repair & More",
    date: "2026-05-11",
    excerpt: "Complete plumbing services in South Jordan, UT: drain cleaning, water heater repair, leak detection, emergency plumbing, and commercial services. Licensed master plumbers since 2018.",
    category: "Local Plumbing Guide",
    featuredImage: "/images/PlumbingServiceSouthJordan.png",
  },
  "bathroom-plumbing-rockwall-tx": {
    title: "Bathroom Plumbing in South Jordan, UT: Common Problems, Repairs & When to Call a Plumber",
    date: "2026-05-11",
    excerpt: "Dripping faucets, running toilets, slow drains, failing shower valves -- the most common bathroom plumbing problems in South Jordan, UT homes and how to fix them.",
    category: "Residential Plumbing",
    featuredImage: "/images/PlumbingServiceSouthJordan.png",
  },
  "24-hour-plumber-garland-tx": {
    title: "24-Hour Plumber in Garland, TX -- Emergency Plumbing Service Day or Night",
    date: "2026-05-11",
    excerpt: "Need a 24-hour plumber in Garland, TX? Wasatch Plumbing Co. dispatches licensed technicians around the clock -- no overtime charges, no answering services, real emergency response.",
    category: "Emergency Plumbing",
    featuredImage: "/images/PlumbingServiceSouthJordan.png",
  },
  "best-rockwall-plumbers-guide": {
    title: "Best South Jordan Plumbers: How to Choose, What to Expect, and Who to Call",
    date: "2026-05-05",
    excerpt: "A complete guide to hiring South Jordan plumbers -- licensing requirements, common services, fair pricing, and red flags to avoid. Plus why local always wins.",
    category: "Local Plumbing Guide",
    featuredImage: "/images/PlumbingServiceSouthJordan.png",
  },
  "solving-plumbing-challenges-at-sports-world-athletics": {
    title: "Solving Plumbing Challenges at Sports World Athletics in South Jordan, UT",
    date: "2025-01-03",
    excerpt: "How technician Evan fixed commercial urinal stoppages and replaced P-traps at a South Jordan athletic facility.",
    category: "Commercial Plumbing",
    featuredImage: "/images/PlumbingServiceSouthJordan.png",
  },
  "new-water-heater-for-tina-in-rowlett": {
    title: "A Day in the Life: New Water Heater for Tina in Rowlett, TX",
    date: "2024-11-26",
    excerpt: "Replacing a 20-year-old water heater with a modern 40-gallon tank -- complete with safety upgrades.",
    category: "Water Heaters",
  },
  "whole-house-filtration-system-repair-royse-city": {
    title: "Whole House Filtration System Repair in Royse City, TX",
    date: "2024-11-13",
    excerpt: "Correcting an improperly installed filtration system affecting water pressure and distribution.",
    category: "Water Filtration",
  },
  "valve-and-fixture-replacement-rockwall": {
    title: "Valve and Fixture Replacement in South Jordan, UT",
    date: "2024-11-05",
    excerpt: "Repairing two bathrooms with leaking valves and rust-colored water issues.",
    category: "Residential Plumbing",
  },
  "cast-iron-drain-replacement-dallas": {
    title: "Cast Iron Drain Replacement in Salt Lake Valley",
    date: "2024-10-18",
    excerpt: "Upgrading a cast iron drain system and installing a new shower valve for a Dallas homeowner.",
    category: "Drain Services",
  },
};

export function getAllPosts(): BlogPost[] {
  return Object.entries(postMeta)
    .map(([slug, meta]) => ({ slug, ...meta }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPost(slug: string): BlogPost | undefined {
  const meta = postMeta[slug];
  if (!meta) return undefined;
  return { slug, ...meta };
}

export function getAllSlugs(): string[] {
  return Object.keys(postMeta);
}
