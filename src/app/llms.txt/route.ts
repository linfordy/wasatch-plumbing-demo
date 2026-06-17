// src/app/llms.txt/route.ts
//
// Dynamic llms.txt — emitted at https://wasatch-plumbing-demo.vercel.app/llms.txt
// LLMs (Claude, ChatGPT, Perplexity, Google AI) read this file to
// understand the site's structure + key URLs. Rebuilds automatically
// when src/lib/recent-work.ts changes (next deploy).
//
// Format follows the llms.txt spec at https://llmstxt.org

import { company } from "@/data/company";
import { services } from "@/data/services";
import { serviceAreas } from "@/data/service-areas";
import { recentWork } from "@/lib/recent-work";
import { getAllServiceSlugs, getAllCitySlugs, humanize as humanizeSlug } from "@/lib/recent-work-taxonomy";
import { getAllPosts } from "@/lib/mdx";

const BASE = "https://wasatch-plumbing-demo.vercel.app";

function humanize(s: string): string {
  return s
    .replace(/[-_]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export const dynamic = "force-static";
export const revalidate = 3600; // re-emit at most once per hour

export async function GET() {
  const lines: string[] = [];

  // Title + summary
  lines.push(`# ${company.name}`);
  lines.push("");
  lines.push(
    `> Licensed family plumbing contractor in ${company.address.city}, ${company.address.state} since ${company.established}. 24/7 emergency response. ${company.license}. Serving South Jordan County and surrounding Salt Lake Valley.`
  );
  lines.push("");

  // Contact
  lines.push("## Contact");
  lines.push(`- Phone: ${company.phone}`);
  if (company.text) lines.push(`- Text: ${company.text}`);
  lines.push(`- Address: ${company.address.full}`);
  lines.push(`- License: ${company.license}`);
  lines.push(`- Hours: ${company.hours}`);
  lines.push(`- Owner: ${company.owner}, ${company.ownerTitle}`);
  lines.push("");

  // Services
  lines.push("## Services");
  for (const s of services) {
    const desc = s.description.replace(/\s+/g, " ").trim();
    lines.push(`- [${s.shortTitle || s.title}](${BASE}/services/${s.slug}): ${desc}`);
  }
  lines.push("");

  // Service areas
  lines.push("## Service Areas");
  for (const a of serviceAreas) {
    const desc = a.description.split(".")[0].trim() + ".";
    lines.push(`- [${a.name}](${BASE}/service-areas/${a.slug}): ${desc}`);
  }
  lines.push("");

  // Recent Work (auto-grown by the Linfordy platform's proofpop-capture handler)
  if (recentWork.length > 0) {
    lines.push("## Recent Work");
    const sorted = [...recentWork].sort(
      (a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
    );
    for (const e of sorted) {
      const summary = (e.voice_summary || "").replace(/\s+/g, " ").trim().slice(0, 200);
      const where = [e.city, e.state].filter(Boolean).join(", ");
      const meta = [humanize(e.service_category), where, formatDate(e.completed_at)].filter(Boolean).join(" · ");
      lines.push(`- [${e.title}](${BASE}/recent-work/${e.slug}): ${summary || meta}`);
    }
    lines.push("");
  }

  // Recent Work — by service category
  const svcSlugs = getAllServiceSlugs();
  if (svcSlugs.length > 0) {
    lines.push("## Recent Work by Service");
    for (const s of svcSlugs) {
      lines.push(`- [${humanizeSlug(s)} jobs](${BASE}/recent-work/service/${s})`);
    }
    lines.push("");
  }

  // Recent Work — by city
  const citySlugs = getAllCitySlugs();
  if (citySlugs.length > 0) {
    lines.push("## Recent Work by Area");
    for (const c of citySlugs) {
      lines.push(`- [Work in ${humanizeSlug(c)}](${BASE}/recent-work/area/${c})`);
    }
    lines.push("");
  }

  // Blog
  try {
    const posts = getAllPosts();
    if (posts.length > 0) {
      lines.push("## Blog");
      for (const p of posts.slice(0, 20)) {
        lines.push(`- [${p.title}](${BASE}/blog/${p.slug}): ${p.excerpt}`);
      }
      lines.push("");
    }
  } catch {
    // Blog loader optional — skip silently if it errors
  }

  const body = lines.join("\n");
  return new Response(body, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
