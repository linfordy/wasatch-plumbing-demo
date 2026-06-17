@AGENTS.md

# Larry's Plumbing Service — Project Guide

## Overview

Marketing and lead-generation website for a family-owned plumbing company in Rockwall, TX. Dark premium design, static-rendered, with HouseCall Pro CRM integration and admin dashboard.

- **Live site:** https://larrysplumbingservice.com
- **Repo:** https://github.com/linfordy/larrys-plumbing (private)
- **Vercel project:** scott-6152s-projects/larrys-plumbing
- **Client:** Larry's Plumbing Service LLC — Justin Zmolik, TX Master Plumber License #41106

## Tech Stack

- **Next.js 16** (App Router, static generation via `generateStaticParams`)
- **React 19**, TypeScript 5
- **Tailwind CSS v4** — uses CSS-based `@theme` variables in `globals.css`, NOT the traditional `tailwind.config.ts` (the config file exists but v4 reads from CSS)
- **Framer Motion** — scroll animations, parallax hero, stagger reveals
- **MDX** via `@next/mdx` — blog posts
- **No database** — all content is TypeScript data files and MDX

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root: Nav, Footer, MobileCTABar, AttributionProvider, LocalBusiness schema
│   ├── page.tsx                # Homepage (hero + 7 sections)
│   ├── about/page.tsx          # Timeline, team, credentials
│   ├── contact/page.tsx        # Phone/text/address + ScheduleForm + map
│   ├── specials/page.tsx       # Current offers
│   ├── blog/page.tsx           # Blog listing
│   ├── blog/[slug]/page.tsx    # Individual blog post (MDX)
│   ├── services/[slug]/page.tsx    # 7 service pages (dynamic)
│   ├── service-areas/[slug]/page.tsx  # 7 city pages (dynamic)
│   ├── admin/page.tsx          # CRM dashboard (client-side, password: "larrys2026")
│   ├── api/admin/funnel/route.ts  # Dashboard data API (fetches from HouseCall Pro)
│   ├── actions/submit-form.ts  # Server action: form → log + HouseCall Pro
│   ├── sitemap.ts              # Auto-generated sitemap.xml
│   ├── robots.ts               # robots.txt
│   └── globals.css             # Tailwind @theme with brand colors
├── components/
│   ├── hero.tsx                # Full-bleed parallax hero (client component)
│   ├── nav.tsx                 # Sticky nav with scroll blur, dropdown menus, mobile hamburger
│   ├── footer.tsx              # 4-column footer
│   ├── phone-video.tsx         # Video in iPhone frame (hero, desktop only)
│   ├── schedule-form.tsx       # HouseCall Pro lead form (honeypot + attribution)
│   ├── attribution-provider.tsx # Captures UTM cookies on every page load
│   ├── animate-on-scroll.tsx   # Framer Motion scroll reveal wrapper
│   ├── stagger-children.tsx    # Stagger animation container
│   ├── section-header.tsx      # Reusable tag + title + subtitle
│   ├── service-card.tsx        # Service grid card with hover
│   ├── review-card.tsx         # Google review card
│   ├── special-card.tsx        # Coupon card with red glow
│   ├── area-item.tsx           # Service area list link
│   ├── stats-bar.tsx           # Counter animation (years, projects, 24/7, license)
│   ├── cta-section.tsx         # Emergency CTA with pulsing phone
│   ├── google-map.tsx          # Dark-themed Google Maps embed
│   ├── faq-accordion.tsx       # Expandable FAQ
│   └── mobile-cta-bar.tsx      # Sticky bottom bar (Call/Text/Book, mobile only)
├── data/
│   ├── company.ts              # Business constants (phone, address, geo, social, etc.)
│   ├── services.ts             # 7 service definitions (slug, title, content[], features[], faqs[])
│   ├── service-areas.ts        # 7 city definitions (slug, name, content[], faqs[])
│   ├── navigation.ts           # Nav links with dropdown children
│   ├── reviews.ts              # 3 Google reviews
│   └── specials.ts             # 2 current offers
├── content/blog/               # MDX blog posts (no frontmatter)
│   ├── solving-plumbing-challenges-at-sports-world-athletics.mdx
│   ├── new-water-heater-for-tina-in-rowlett.mdx
│   ├── whole-house-filtration-system-repair-royse-city.mdx
│   ├── valve-and-fixture-replacement-rockwall.mdx
│   └── cast-iron-drain-replacement-dallas.mdx
└── lib/
    ├── mdx.ts                  # Blog metadata registry + getAllPosts(), getPost()
    ├── housecall-pro.ts        # HouseCall Pro API client (create customer + lead)
    ├── attribution.ts          # UTM cookie tracking (first/last touch)
    ├── form-logger.ts          # Console logging for Vercel log capture
    ├── metadata.ts             # createMetadata() helper (OG, Twitter, canonical)
    └── schema.ts               # JSON-LD generators (LocalBusiness, FAQ, Service, Breadcrumb, BlogPosting)
```

## Brand Colors (Tailwind v4)

Defined as CSS variables in `globals.css` under `@theme`:

| Class | Hex | Usage |
|-------|-----|-------|
| `bg-brand-red` / `text-brand-red` | #c41e1e | Primary CTA, accents, logo red |
| `bg-brand-black` | #0a0a0a | Page background |
| `bg-brand-dark` | #111111 | Card backgrounds |
| `bg-brand-darker` | #1a1a1a | Borders, subtle dividers |
| `text-brand-gold` | #f59e0b | Review stars |

Opacity modifiers work: `bg-brand-red/10`, `border-brand-red/50`, etc.

## MDX Blog System

Posts do NOT use frontmatter. Metadata lives in `src/lib/mdx.ts`:

```typescript
// In src/lib/mdx.ts
const postMeta: Record<string, Omit<BlogPost, "slug">> = {
  "my-post-slug": {
    title: "Post Title",
    date: "2025-01-03",
    excerpt: "Short description",
    category: "Residential Plumbing",
    featuredImage: "/images/some-image.png",  // optional
  },
};
```

**To add a new blog post:**
1. Create `src/content/blog/{slug}.mdx` with the MDX content
2. Add a matching entry to `postMeta` in `src/lib/mdx.ts`
3. Deploy — `generateStaticParams` picks it up automatically

The blog post page (`app/blog/[slug]/page.tsx`) dynamically imports the MDX file:
```typescript
const mod = await import(`@/content/blog/${slug}.mdx`);
```

## Dynamic Routes (Services & Areas)

**Service pages** are driven by `src/data/services.ts`. Each service has: `slug`, `title`, `shortTitle`, `icon`, `description`, `heroDescription`, `content[]`, `features[]`, `faqs[]`. Route: `/services/[slug]`.

**Service area pages** are driven by `src/data/service-areas.ts`. Each area has: `slug`, `name`, `description`, `content[]`, `faqs[]`. Route: `/service-areas/[slug]`.

Both use `generateStaticParams()` to pre-render all pages at build time. Adding a new service or area = add to the data array, deploy.

## HouseCall Pro CRM Integration

**API:** `https://api.housecallpro.com` with `Authorization: Token {key}` header.

**Env var:** `HOUSECALL_PRO_API_KEY` (set in Vercel + `.env.local`)

### Form Submission Flow

1. User fills `ScheduleForm` on `/contact`
2. `getAttribution()` reads UTM cookie (`_lp_attr`)
3. Server action `submitForm()` fires:
   - Spam check (honeypot + 3-second minimum timer)
   - `logSubmission()` → console.log (Vercel captures this — zero lead loss)
   - `createHousecallProLead()` → POST /customers, then POST /leads
   - Attribution data embedded in customer notes
   - Lead source: `"LarrysWebsite | {utm_source}"` or just `"LarrysWebsite"`
4. CRM failure does NOT fail the form — lead is always logged locally

### UTM Attribution

`src/lib/attribution.ts` manages a first-party cookie (`_lp_attr`, 30-day TTL):
- **First visit:** captures `first_touch` + `last_touch` (same)
- **Return visit with UTMs:** updates `last_touch`, preserves `first_touch`
- **Return visit without UTMs:** updates referrer/landing only
- `AttributionProvider` in root layout calls `captureAttribution()` on every page load

### Admin Dashboard

**URL:** `/admin` — Password: `larrys2026` (client-side localStorage check)

**API:** GET `/api/admin/funnel?days=7|30|90|all`
- Fetches jobs, leads, estimates from HouseCall Pro in parallel
- Limited to 5 pages of jobs, 3 pages each for leads/estimates (performance)
- 5-minute in-memory cache per filter
- Returns: overview cards, funnel stages, revenue by source, recent jobs

**Job amounts are in CENTS** (8900 = $89.00). Dashboard divides by 100 for display.

## SEO & LLM Optimization

**On every page:** LocalBusiness JSON-LD schema (injected in root layout)

**Service pages:** Service + FAQPage + BreadcrumbList schemas

**Blog posts:** BlogPosting + BreadcrumbList schemas

**Static files:**
- `/sitemap.xml` — auto-generated from services, areas, blog slugs
- `/robots.txt` — allows all, points to sitemap
- `/llms.txt` — concise business profile for AI crawlers
- `/llms-full.txt` — comprehensive profile with full FAQ, services, areas, history

## Linfordy Platform Connection

This site is part of the Linfordy client portfolio. The Linfordy platform (`linfordy-platform` repo) manages SEO dashboards and automated agents across client sites.

**How they connect:**
- The platform has an `seo_config` for each client site with domain, GSC property, and GA4 details
- The platform's agent can publish blog posts to this repo via GitHub API (push MDX files + update `mdx.ts`)
- GSC data for `larrysplumbingservice.com` is tracked on the Linfordy platform dashboard
- The GitHub repo must be accessible to the platform's fine-grained token (added to `linfordy` org)

**To wire up a new Linfordy feature:** ensure the platform's GitHub token has access to `linfordy/larrys-plumbing`, and add the site's `seo_config` entry in the platform.

## Deployment

**Auto-deploy:** Push to `main` on GitHub → Vercel builds and deploys automatically.

**Manual deploy:** `npx vercel --prod` from the project directory.

**Required env var:** `HOUSECALL_PRO_API_KEY` must be set in Vercel (Settings → Environment Variables).

**DNS:** Cloudflare → A record `@` → `76.76.21.21` (DNS only), CNAME `www` → `cname.vercel-dns.com` (DNS only). Do NOT enable Cloudflare proxy (orange cloud) — Vercel handles SSL.

## Gotchas

1. **Next.js 16 params are Promises.** Dynamic route params must be awaited: `const { slug } = await params;` in both `generateMetadata` and the page component. This is different from Next.js 14/15.

2. **Tailwind v4 uses CSS-based config.** Brand colors are defined as `@theme` variables in `globals.css`. The `tailwind.config.ts` file exists but v4 primarily reads from CSS. If you add new colors, add them in `globals.css` under `@theme`.

3. **MDX metadata is NOT in frontmatter.** It's in the `postMeta` object in `src/lib/mdx.ts`. If you create an MDX file without adding metadata there, the post won't appear in listings or generate a static page.

4. **Admin dashboard has no server-side auth.** Password is checked client-side only. The `/api/admin/funnel` endpoint has no auth — it's meant for internal use. Don't put secrets in the dashboard response.

5. **HouseCall Pro API is slow.** Each page of 200 records takes ~5-6 seconds. The dashboard API fetches pages in parallel and caches for 5 minutes, but first load after cache expiry can take 15-30 seconds.

6. **Video file is large (8MB compressed).** The hero video at `/images/larrys-video.mp4` was compressed from 98MB. If replacing, compress first: `ffmpeg -i input.mp4 -c:v libx264 -crf 28 -preset medium -c:a aac -b:a 128k -movflags +faststart -vf "scale=720:-2" output.mp4`

7. **All routes are statically rendered except `/admin`.** No ISR, no dynamic rendering. Content changes require a deploy. The admin page is client-side rendered (CSR) because it fetches live HouseCall Pro data.

8. **Form submissions are logged to Vercel's console.** Check Vercel → Runtime Logs to see form submissions if HouseCall Pro sync fails. Every lead is captured locally regardless of CRM status.

9. **The `company.email` and `company.housecallProUrl` fields are empty strings.** Fill these in when available.

10. **Git author email must match GitHub account.** Vercel blocks deploys if the commit author email doesn't match. The repo uses `scott@linfordy.com` — don't change this.

## GA4 Analytics

**Measurement ID:** `G-PLNSMKB6FM` (hardcoded in `src/app/layout.tsx`)

**Tracked events:**
- `page_view` — automatic (GA4 default)
- `generate_lead` — fires on successful form submission (`src/components/schedule-form.tsx`)
- `phone_click` — fires on phone number tap/click (nav CTA, mobile CTA bar)
- `text_click` — fires on text number tap (mobile CTA bar)

**Event helpers:** `src/lib/gtag.ts` — `trackEvent()`, `trackPhoneClick()`, `trackTextClick()`

Mark `generate_lead`, `phone_click`, `text_click` as conversions in GA4 Admin → Events.

## Email Notifications

Every form submission sends a styled HTML email to `justin@larrysplumbingservice.com` via Resend.

- **Sender:** `leads@mail.linfordy.com` (Resend, verified domain)
- **Code:** `src/lib/email.ts` — `sendLeadNotification()`
- **Env var:** `RESEND_API_KEY` (shared with Kirkland project)
- **Failure handling:** email failure is logged but never blocks form submission

## Navigation (Mega Menu)

The nav (`src/components/nav.tsx`) uses a Kirkland-style mega menu pattern:

- **Services dropdown:** 3-column layout (Residential / Commercial / Emergency & Specialty), featured special sidebar ($500 off tankless card), emergency banner with pulsing red dot
- **Service Areas dropdown:** 2-column grid of 7 cities with red dots
- **Hover behavior:** 200ms timeout on mouse leave prevents flickering, Framer Motion AnimatePresence for enter/exit animations
- **Mobile:** accordion-style with chevron rotation, emergency banner, phone CTA at bottom
- **Service categories are hardcoded in the nav component** (not from navigation.ts) — update there if services change

## Common Tasks

| Task | What to do |
|------|-----------|
| Add blog post | Create MDX in `src/content/blog/`, add to `postMeta` in `src/lib/mdx.ts` |
| Add service | Add to `services` array in `src/data/services.ts` AND update `serviceCategories` in `src/components/nav.tsx` |
| Add service area | Add to `serviceAreas` array in `src/data/service-areas.ts` AND update `areaLinks` in `src/components/nav.tsx` |
| Update specials | Edit `src/data/specials.ts` AND update featured special in `src/components/nav.tsx` sidebar |
| Update company info | Edit `src/data/company.ts` |
| Update reviews | Edit `src/data/reviews.ts` |
| Change admin password | Edit `ADMIN_PASSWORD` in `src/app/admin/page.tsx` |
| Change notification email | Edit `NOTIFY_EMAIL` in `src/lib/email.ts` |
| Add env var | `npx vercel env add VAR_NAME production` + add to `.env.local` |
