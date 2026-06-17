# Larry's Plumbing Website Redesign — Design Spec

## Overview

Rebuild larrysplumbingservice.com as a Next.js application deployed on Vercel. The site replaces an existing WordPress site with a dark, premium design that differentiates Larry's Plumbing from every generic plumbing website. The design centers on the family's real photos, a three-generation story, and positions them as the most trusted plumber in Rockwall and North Texas.

## Business Context

- **Company:** Larry's Plumbing Service LLC
- **Established:** 1970 (three generations of plumbers)
- **Key Person:** Justin Zmolik, Texas Responsible Master Plumber License #41106
- **Phone:** (214) 729-3586
- **Text:** (214) 549-1290
- **Address:** 6730 Horizon Rd Suite B, Rockwall, TX 75032
- **Hours:** 24/7
- **Booking:** Housecall Pro integration
- **Social:** Facebook (larrysplumbingservicellc), Instagram, YouTube
- **Google Maps Embed:** `pb=!1m18!1m12!1m3!1d3351.3262960378174!2d-96.4415562242061!3d32.8630851795823...`

## Brand Identity

### Colors (from logo)
- **Primary Red:** #c41e1e (logo ribbon)
- **Black:** #0a0a0a / #111 / #1a1a1a (dark backgrounds, graduated)
- **White:** #ffffff (text, contrast)
- **Accent grays:** #888, #aaa, #ccc (supporting text)
- **Accent gold:** #f59e0b (review stars)

### Logo
- Circle badge logo: red/white/black, "Larry's Plumbing", EST 1970, TX Master Lic #41106
- High-res file: `logo-circle.png` (651x651 RGBA)
- Favicon: `fevicon.png` (300x300)

### Typography Direction
- System font stack: -apple-system, BlinkMacSystemFont, Inter or similar sans-serif
- Heavy weights (800-900) for headings — bold, confident
- Letter-spacing on labels and tags (2-4px uppercase)
- Hero title: ~58px, tight line-height (1.08)

## Design Direction

**Dark & Premium** — dark backgrounds (#0a0a0a), bold red accents, cinematic feel. The family photos are the emotional centerpiece. This stands out from every other plumbing site (which are generic white/blue templates).

## Tech Stack

- **Framework:** Next.js (App Router)
- **Deployment:** Vercel
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Maps:** Google Maps Embed
- **Booking:** Housecall Pro embed/integration
- **CMS (blog):** MDX or local markdown files (migrated from WordPress)
- **Schema/SEO:** next-seo, JSON-LD structured data
- **Analytics:** Google Analytics 4

---

## Pages & Structure

### 1. Homepage

#### Hero Section (Full-Bleed)
- Family photo (`hero_family_image.jpg`) fills entire viewport
- Photo opacity: 0.85 with dark gradient overlay (heavier on left for text readability, light on right to show family)
- Gradient: `linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.05) 100%)`
- **Nav:** Logo (circle badge) + "Larry's Plumbing" text, links (Services, Service Areas, About, Blog, Specials), red CTA button with phone number and pulsing glow
- **Tagline:** "FAMILY OWNED · EST. 1970 · ROCKWALL, TX" (red, letterspaced, with left dash accent)
- **Headline:** "Three Generations. One Promise." (white, "Promise" in red)
- **Subtitle:** "From Larry to Justin — we've been fixing pipes, earning trust, and keeping North Texas homes running for over 55 years."
- **CTAs:** "Schedule Service" (red button) + "Text Us a Question" (outline button)
- **Stats Bar:** Glassmorphism bar at bottom — 55+ Years, 1,200+ Projects, 24/7 Emergency, #41106 TX License. Counter animation on scroll into view.
- **Animations:** Nav fades in (0.1s delay), tagline slides from left (0.3s), title fades up (0.5s), subtitle (0.7s), buttons (0.9s), stats slide up (1.1s). Parallax scroll on background photo.

#### Services Section
- Section tag: "WHAT WE DO"
- Title: "Expert Plumbing Services"
- 3x2 grid of service cards on dark (#111) backgrounds
- Cards: icon, title, description, "Learn more →" arrow that appears on hover
- Hover: red top-border reveals (scaleX animation), card lifts with shadow
- Stagger animation on scroll (0.1s delay between cards)
- **Services:**
  1. Emergency Plumbing (24/7)
  2. Residential Plumbing
  3. Commercial Plumbing
  4. Water Heaters (tank + tankless)
  5. Drain Cleaning (hydro-jetting, flex-shaft, camera)
  6. Backflow Testing (TCEQ-certified)

#### About Teaser
- Split layout: Justin full-body photo left (`SMallerJustinFullbody.png`), story text right
- Photo in dark card with red floating badge: "55+ YEARS OF SERVICE"
- Justin photo slides in from left, text from right on scroll
- Section tag: "OUR STORY"
- Title: "Three Generations of Master Plumbers"
- Body: Family story — Larry started in 1970, grandson Justin carries the standard
- Credentials bar: TX License #41106, Fully Insured, 5-Star Rated

#### Reviews Section
- Section tag: "WHAT CUSTOMERS SAY"
- Title: "Trust Is Earned"
- 3-column grid of review cards
- Each card: large quote mark, 5 stars (gold), review text (italic), author name, source + city
- Stagger animation on scroll
- Pull real reviews from Google Business Profile

#### Service Areas
- Section tag: "WHERE WE SERVE"
- Split layout: Google Maps embed (dark-themed with CSS filter) left, city list right
- Map CSS filter: `grayscale(1) invert(0.92) contrast(0.9)` for dark theme
- City items: red dot, city name, arrow — hover highlights with red border
- **Cities:** Rockwall, Royse City, Rowlett, Garland, Plano, Highland Park, University Park
- Each city links to its own service area page

#### Specials
- Section tag: "CURRENT OFFERS"
- 2-column grid of coupon cards
- Dark gradient background with red glow orb
- Large dollar amount in red, title, description, CTA button
- **Current offers:**
  - $500 off Tankless Water Heater
  - $1,000 off Whole Home Water Treatment (Halo 5)

#### Emergency CTA
- Full-width section with centered text
- Red radial glow background
- Title: "Need a Plumber Right Now?"
- Phone number: (214) 729-3586 — large, red, pulsing animation
- Three buttons: Call Now, Text Us, Book Online

#### Footer
- 4-column grid: Brand/address, Services links, Service Areas links, Company links
- Logo + description + address
- Social icons (Facebook, Instagram, YouTube) — hover turns red
- Bottom bar: copyright, TX license, social links

### 2. Service Pages (6 pages)

Each service gets a dedicated page with:
- Hero banner with service title, dark background
- Detailed service description with structured content
- Common problems / FAQ section (accordion)
- Before/after image slider (when photos available)
- Related services sidebar or section
- CTA section with phone/text/book
- JSON-LD Service schema markup
- Optimized for both Google and LLM citation

**Pages:**
- `/services/emergency-plumbing`
- `/services/residential-plumbing`
- `/services/commercial-plumbing`
- `/services/water-heaters`
- `/services/tankless-water-heaters`
- `/services/drain-cleaning`
- `/services/backflow-testing`

### 3. Service Area Pages (7 pages)

Each city gets a dedicated page for local SEO:
- City-specific headline: "Plumber in [City], TX"
- Description tailored to that city/area
- Google Maps focused on that area
- Services available in that area
- LocalBusiness + Service JSON-LD schema
- City-specific FAQ section
- CTA with phone/text

**Pages:**
- `/service-areas/rockwall`
- `/service-areas/royse-city`
- `/service-areas/rowlett`
- `/service-areas/garland`
- `/service-areas/plano`
- `/service-areas/highland-park`
- `/service-areas/university-park`

### 4. About Us Page

- Full family photo hero
- Company timeline (animated scroll-driven): 1970 → present
- Team section with photos
- Values / mission statement
- Credentials and licenses
- "Why Choose Larry's" section

### 5. Specials Page

- Current offers with coupon cards
- "Grab Offer" CTA leading to Housecall Pro booking or phone
- Email signup for coupons

### 6. Blog / Content Hub

- Migrate 5 existing WordPress posts
- Blog listing page with card layout
- Individual post pages with rich formatting
- **LLM-optimized content structure:**
  - Structured FAQ pages per service (schema-rich)
  - Service guides with clear Q&A format
  - "Best plumber in [city]" content
  - HowTo and FAQPage schema markup
  - Clear, citable paragraphs optimized for AI assistants

### 7. Contact Page

- Contact form
- Phone and text numbers
- Google Maps embed
- Business hours
- Housecall Pro online booking embed

---

## Animations & Interactions (Wow Factor)

### Global
- **Scroll-triggered fade-ins:** Elements animate in as they enter viewport (Intersection Observer)
- **Stagger animations:** Grid items animate in sequence (0.1s delay between children)
- **Smooth page transitions:** Framer Motion page transitions between routes
- **Parallax:** Hero background photo shifts on scroll

### Hero Specific
- Nav: fade down (0.1s delay)
- Tagline: slide from left (0.3s)
- Title: fade up (0.5s)
- Subtitle: fade up (0.7s)
- Buttons: fade up (0.9s)
- Stats bar: slide up from bottom (1.1s)
- Phone CTA: pulsing red glow (infinite, 2.5s cycle)
- Counter animation: numbers count up from 0 when stats enter view

### Service Cards
- Hover: lift (translateY -5px), shadow deepens, red top-border scales in
- "Learn more" arrow: slides in from left on hover

### About Section
- Justin photo: slide in from left
- Content: slide in from right
- Image badge: scale + glow on hover

### Interactive Elements
- **Before/after image sliders:** Drag handle to compare
- **Interactive service area map:** Hover/click cities
- **Scroll-driven company timeline:** On About page
- **Animated stats dashboard:** Numbers count up
- **Service card expand/flip:** Click for more details

---

## SEO & LLM Optimization

### Technical SEO
- Next.js App Router with SSR/SSG for all pages
- Semantic HTML (proper heading hierarchy, landmark elements)
- Image optimization via next/image (WebP, lazy loading, srcset)
- Sitemap.xml (auto-generated)
- robots.txt
- Canonical URLs
- Open Graph + Twitter Card meta tags
- Core Web Vitals optimized (target all green)

### Schema Markup (JSON-LD)
- **LocalBusiness** — on every page (name, address, phone, hours, geo, service area)
- **Service** — on each service page
- **FAQPage** — on service pages and FAQ sections
- **HowTo** — on relevant blog posts
- **Review / AggregateRating** — on homepage and service pages
- **BreadcrumbList** — on all interior pages
- **BlogPosting** — on blog posts
- **Organization** — sitewide

### LLM Optimization
- Clear, structured content that AI assistants can cite
- FAQ sections formatted as direct Q&A pairs
- Service descriptions with definitive statements ("Larry's Plumbing provides...")
- Location + service combinations in natural language
- Authoritative credential mentions (license, years, projects)
- Content hub strategy: build topical authority on plumbing topics in Rockwall/North TX

### Local SEO
- City-specific landing pages with unique content
- NAP consistency (Name, Address, Phone) across all pages
- Google Maps embeds
- Service area pages targeting "[service] in [city] TX" queries
- Blog posts mentioning real local jobs and locations

---

## Media Assets (Downloaded)

All assets pulled from existing WordPress site and stored in `/public/images/`:
- `logo-circle.png` — Main circle badge logo (651x651)
- `fevicon.png` — Favicon (300x300)
- `hero_family_image.jpg` — Family photo (hero)
- `SMallerJustinFullbody.png` — Justin full-body (about section)
- `larrys-plumbing-van.jpg` — Service van
- `larrys-plumbing-men.png` — Team illustration
- `Halo5Pic.png`, `Halo5Installed.png` — Halo 5 water filtration
- `FlexshaftRigid.png` — Drain cleaning equipment
- `PlumbingServiceRockwallTexas.png` — Job photo
- `Halo-1000-off-coupon.png`, `Tankless-500-off-1.png` — Coupon graphics
- Various job/equipment photos for blog and service pages
- Before/after photos: to be provided by owner

---

## Integrations

### Housecall Pro
- Online booking embed or link on Contact page and CTAs
- "Book Online" buttons throughout site link to Housecall Pro scheduling

### Google Maps
- Embed on homepage service areas section
- Embed on contact page
- City-focused embeds on service area pages
- Dark theme via CSS filter

### Google Reviews
- Pull and display real Google reviews
- AggregateRating schema markup

### Financing (Pending)
- Placeholder for financing page — owner to confirm availability
- If confirmed: dedicated page with financing options and application link

---

## Mobile Responsiveness

- Mobile-first responsive design
- Hamburger nav on mobile with slide-out menu
- Hero photo adjusts (center-focused crop on mobile)
- Service cards: 1-column on mobile, 2-column tablet, 3-column desktop
- Stats bar: horizontal scroll or 2x2 grid on mobile
- Touch-friendly CTAs (min 44px tap targets)
- Sticky mobile CTA bar (Call / Text / Book) at bottom of screen

---

## Approved Design Mockup

The validated homepage mockup is saved at:
`.superpowers/brainstorm/21433-1777924362/content/full-design-v3.html`

Key design decisions confirmed by user:
1. Dark & Premium design direction
2. Full-bleed family photo hero (opacity 0.85, light gradient)
3. Full-size circle badge logo in nav
4. Blog + LLM-optimized content hub
5. Wow Factor animations (not full-send)
6. Housecall Pro booking integration
7. Google Maps with dark theme
8. Before/after sliders (photos to be provided)
