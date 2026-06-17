import { notFound } from "next/navigation";
import { promises as fs } from "fs";
import path from "path";
import type { Metadata } from "next";

// Programmatic city × service landing pages. The Linfordy platform agent
// commits MDX files to src/content/locations/{slug}.mdx; this handler reads
// them, parses YAML frontmatter, and renders the body as raw HTML.
//
// Self-contained — no external dependencies beyond Next.js + fs. Frontmatter
// parser is regex-based and supports the specific shape the agent writes:
// flat key:"value" pairs + a faq array of {q,a} objects.

const LOCATIONS_DIR = path.join(process.cwd(), "src/content/locations");

interface FaqItem { q: string; a: string; }
interface LocationData {
  title: string;
  service: string;
  city: string;
  state: string;
  description: string;
  slug: string;
  publishedAt: string;
  faq?: FaqItem[];
}

function parseFrontmatter(raw: string): { data: Partial<LocationData>; content: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { data: {}, content: raw };
  const [, fm, content] = match;
  const data: Record<string, unknown> = {};
  const lines = fm.split(/\r?\n/);
  const faq: FaqItem[] = [];
  let inFaq = false;
  let pendingQ: string | null = null;
  for (const line of lines) {
    if (line.trim() === "faq:") { inFaq = true; continue; }
    if (inFaq) {
      const qm = line.match(/^\s+-\s+q:\s+"(.*)"\s*$/);
      const am = line.match(/^\s+a:\s+"(.*)"\s*$/);
      if (qm) { pendingQ = qm[1].replace(/\\"/g, '"'); }
      else if (am && pendingQ !== null) {
        faq.push({ q: pendingQ, a: am[1].replace(/\\"/g, '"') });
        pendingQ = null;
      }
    } else {
      const kv = line.match(/^(\w+):\s+"(.*)"\s*$/);
      if (kv) data[kv[1]] = kv[2].replace(/\\"/g, '"');
    }
  }
  if (faq.length > 0) data.faq = faq;
  return { data: data as Partial<LocationData>, content: content.trim() };
}

async function readLocation(slug: string) {
  try {
    const raw = await fs.readFile(path.join(LOCATIONS_DIR, `${slug}.mdx`), "utf-8");
    return parseFrontmatter(raw);
  } catch { return null; }
}

export async function generateStaticParams() {
  try {
    const files = await fs.readdir(LOCATIONS_DIR);
    return files.filter(f => f.endsWith(".mdx")).map(f => ({ slug: f.replace(/\.mdx$/, "") }));
  } catch { return []; }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const loc = await readLocation(slug);
  if (!loc) return {};
  return {
    title: loc.data.title,
    description: loc.data.description,
    alternates: { canonical: `/locations/${slug}` },
  };
}

export default async function LocationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const loc = await readLocation(slug);
  if (!loc || !loc.data.title) notFound();

  const faqJsonLd = loc.data.faq && loc.data.faq.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: loc.data.faq.map(f => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }
    : null;

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-3">{loc.data.title}</h1>
        {loc.data.description && <p className="text-zinc-600">{loc.data.description}</p>}
      </header>
      <article
        className="prose prose-zinc max-w-none"
        dangerouslySetInnerHTML={{ __html: loc.content }}
      />
      {loc.data.faq && loc.data.faq.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
          {loc.data.faq.map((item, i) => (
            <details key={i} className="mb-3 border-b border-zinc-200 pb-3">
              <summary className="cursor-pointer font-semibold py-2">{item.q}</summary>
              <p className="mt-2 text-zinc-700">{item.a}</p>
            </details>
          ))}
        </section>
      )}
    </main>
  );
}
