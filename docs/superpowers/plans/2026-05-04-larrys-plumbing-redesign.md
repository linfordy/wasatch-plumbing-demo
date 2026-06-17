# Larry's Plumbing Website Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dark, premium Next.js plumbing website with full-bleed family photo hero, Framer Motion animations, LLM-optimized content, and Housecall Pro booking — deployed on Vercel.

**Architecture:** Next.js App Router with static generation for all pages. Content lives as TypeScript data files (services, areas, reviews) and MDX for blog posts. Shared layout with dark theme, reusable section components, and Framer Motion scroll animations. JSON-LD schema injected per-page.

**Tech Stack:** Next.js 15, React 19, Tailwind CSS v4, Framer Motion, next-sitemap, MDX

---

## File Structure

```
larrys-plumbing/
├── public/
│   └── images/              # Already downloaded media assets
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout: dark theme, fonts, nav, footer, schema
│   │   ├── page.tsx             # Homepage
│   │   ├── about/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── specials/page.tsx
│   │   ├── blog/
│   │   │   ├── page.tsx         # Blog listing
│   │   │   └── [slug]/page.tsx  # Individual post
│   │   ├── services/
│   │   │   └── [slug]/page.tsx  # Dynamic service pages
│   │   └── service-areas/
│   │       └── [slug]/page.tsx  # Dynamic area pages
│   ├── components/
│   │   ├── nav.tsx              # Navigation with mobile hamburger
│   │   ├── footer.tsx
│   │   ├── mobile-cta-bar.tsx   # Sticky mobile Call/Text/Book bar
│   │   ├── hero.tsx             # Full-bleed hero with parallax
│   │   ├── section-header.tsx   # Reusable section tag + title + subtitle
│   │   ├── service-card.tsx     # Service grid card with hover effects
│   │   ├── review-card.tsx      # Review card with quote mark + stars
│   │   ├── special-card.tsx     # Coupon/special card with glow
│   │   ├── area-item.tsx        # Service area list item
│   │   ├── stats-bar.tsx        # Counter animation stats
│   │   ├── cta-section.tsx      # Emergency CTA with pulsing phone
│   │   ├── google-map.tsx       # Dark-themed Google Maps embed
│   │   ├── faq-accordion.tsx    # Accordion for FAQ sections
│   │   ├── animate-on-scroll.tsx # Framer Motion scroll reveal wrapper
│   │   ├── stagger-children.tsx  # Stagger animation container
│   │   └── before-after-slider.tsx # Image comparison slider
│   ├── data/
│   │   ├── services.ts          # Service definitions (slug, title, content, faqs)
│   │   ├── service-areas.ts     # City definitions (slug, name, description, coords)
│   │   ├── reviews.ts           # Customer reviews
│   │   ├── specials.ts          # Current offers
│   │   ├── company.ts           # Business info (phone, address, hours, social)
│   │   └── navigation.ts        # Nav links structure
│   ├── content/
│   │   └── blog/                # MDX blog posts
│   │       ├── solving-plumbing-challenges-at-sports-world-athletics.mdx
│   │       ├── new-water-heater-for-tina-in-rowlett.mdx
│   │       ├── whole-house-filtration-system-repair-royse-city.mdx
│   │       ├── valve-and-fixture-replacement-rockwall.mdx
│   │       └── cast-iron-drain-replacement-dallas.mdx
│   └── lib/
│       ├── schema.ts            # JSON-LD schema generators
│       ├── mdx.ts               # MDX loading utilities
│       └── metadata.ts          # Shared metadata helpers
├── tailwind.config.ts
├── next.config.ts
├── next-sitemap.config.js
└── package.json
```

---

## Task 1: Project Scaffold & Configuration

**Files:**
- Create: `package.json`, `next.config.ts`, `tailwind.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`

- [ ] **Step 1: Create Next.js project**

```bash
cd /Users/scottlinford/larrys-plumbing
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack
```

Select defaults when prompted. This will scaffold into the existing directory (the `public/images/` folder with our assets will be preserved).

- [ ] **Step 2: Install dependencies**

```bash
npm install framer-motion next-sitemap @next/mdx @mdx-js/loader @mdx-js/react
npm install -D @types/mdx
```

- [ ] **Step 3: Configure Tailwind with brand colors**

Replace the contents of `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          red: "#c41e1e",
          black: "#0a0a0a",
          dark: "#111111",
          darker: "#1a1a1a",
          gold: "#f59e0b",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 4: Configure Next.js for MDX**

Replace `next.config.ts`:

```typescript
import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  images: {
    formats: ["image/webp"],
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
```

- [ ] **Step 5: Create `mdx-components.tsx` in project root**

```typescript
import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { ...components };
}
```

- [ ] **Step 6: Run dev server to verify scaffold works**

```bash
npm run dev
```

Expected: App starts on http://localhost:3000 with default Next.js page.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "scaffold: Next.js project with Tailwind, Framer Motion, MDX"
```

---

## Task 2: Company Data & Schema Utilities

**Files:**
- Create: `src/data/company.ts`, `src/data/navigation.ts`, `src/data/services.ts`, `src/data/service-areas.ts`, `src/data/reviews.ts`, `src/data/specials.ts`, `src/lib/schema.ts`, `src/lib/metadata.ts`

- [ ] **Step 1: Create company data**

Create `src/data/company.ts`:

```typescript
export const company = {
  name: "Larry's Plumbing Service",
  legalName: "Larry's Plumbing Service LLC",
  tagline: "Family Owned. Neighborhood Trusted.",
  phone: "(214) 729-3586",
  phoneRaw: "+12147293586",
  text: "(214) 549-1290",
  textRaw: "+12145491290",
  email: "", // TBD from owner
  address: {
    street: "6730 Horizon Rd Suite B",
    city: "Rockwall",
    state: "TX",
    zip: "75032",
    full: "6730 Horizon Rd Suite B, Rockwall, TX 75032",
  },
  geo: { lat: 32.8630851, lng: -96.4415562 },
  established: 1970,
  license: "TX Master License #41106",
  licenseNumber: "41106",
  owner: "Justin Zmolik",
  ownerTitle: "Texas Responsible Master Plumber",
  projectsCompleted: 1200,
  hours: "24/7",
  social: {
    facebook: "https://www.facebook.com/larrysplumbingservicellc",
    instagram: "",
    youtube: "",
  },
  googleMapsEmbed:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3351.3262960378174!2d-96.4415562242061!3d32.8630851795823!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x864eab5d6d4e4e93%3A0xf17845205f8ba779!2sLarry%27s%20Plumbing%20Service!5e0!3m2!1sen!2sus!4v1777923809207!5m2!1sen!2sus",
  housecallProUrl: "", // TBD — Housecall Pro booking URL
} as const;
```

- [ ] **Step 2: Create navigation data**

Create `src/data/navigation.ts`:

```typescript
export const navLinks = [
  {
    label: "Services",
    href: "/services",
    children: [
      { label: "Emergency Plumbing", href: "/services/emergency-plumbing" },
      { label: "Residential Plumbing", href: "/services/residential-plumbing" },
      { label: "Commercial Plumbing", href: "/services/commercial-plumbing" },
      { label: "Water Heaters", href: "/services/water-heaters" },
      { label: "Tankless Water Heaters", href: "/services/tankless-water-heaters" },
      { label: "Drain Cleaning", href: "/services/drain-cleaning" },
      { label: "Backflow Testing", href: "/services/backflow-testing" },
    ],
  },
  {
    label: "Service Areas",
    href: "/service-areas",
    children: [
      { label: "Rockwall", href: "/service-areas/rockwall" },
      { label: "Royse City", href: "/service-areas/royse-city" },
      { label: "Rowlett", href: "/service-areas/rowlett" },
      { label: "Garland", href: "/service-areas/garland" },
      { label: "Plano", href: "/service-areas/plano" },
      { label: "Highland Park", href: "/service-areas/highland-park" },
      { label: "University Park", href: "/service-areas/university-park" },
    ],
  },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Specials", href: "/specials" },
] as const;
```

- [ ] **Step 3: Create services data**

Create `src/data/services.ts`:

```typescript
export interface ServiceFAQ {
  question: string;
  answer: string;
}

export interface Service {
  slug: string;
  title: string;
  shortTitle: string;
  icon: string;
  description: string;
  heroDescription: string;
  content: string[];
  features: string[];
  faqs: ServiceFAQ[];
}

export const services: Service[] = [
  {
    slug: "emergency-plumbing",
    title: "Emergency Plumbing in Rockwall, TX",
    shortTitle: "Emergency Plumbing",
    icon: "🚨",
    description:
      "Burst pipe at 2am? We're on our way. 24/7 emergency response across all service areas.",
    heroDescription:
      "Larry's Plumbing provides 24/7 emergency plumbing services across Rockwall and North Texas. When a plumbing emergency strikes, our licensed master plumber and team respond fast — day or night.",
    content: [
      "When a pipe bursts, a water heater fails, or a sewer line backs up at 2am, you need a plumber who answers the phone. Larry's Plumbing has provided emergency plumbing services to Rockwall and North Texas since 1970 — three generations of master plumbers who understand that plumbing emergencies don't wait for business hours.",
      "Our emergency response team is equipped with modern diagnostic tools including camera inspection systems, electronic leak detection, and hydro-jetting equipment. We arrive prepared to diagnose and fix the problem in a single visit whenever possible.",
      "As a family-owned business with Texas Master Plumber License #41106, we treat every emergency call with the urgency and care we'd give our own home. No surprise fees, no upselling — just honest, fast service when you need it most.",
    ],
    features: [
      "24/7 availability — nights, weekends, and holidays",
      "Fast response times across all service areas",
      "Burst pipe repair and water shutoff",
      "Sewer line backups and overflows",
      "Water heater failures",
      "Gas leak detection and repair",
      "Slab leak emergency response",
      "No overtime charges for after-hours calls",
    ],
    faqs: [
      {
        question: "How fast can you respond to a plumbing emergency in Rockwall?",
        answer:
          "We typically respond to emergency calls in the Rockwall area within 30-60 minutes, depending on current demand. Our team is available 24/7, including nights, weekends, and holidays.",
      },
      {
        question: "Do you charge extra for after-hours emergency plumbing?",
        answer:
          "We provide transparent pricing for all emergency services. Call us at (214) 729-3586 and we'll give you upfront pricing before we begin any work.",
      },
      {
        question: "What should I do while waiting for an emergency plumber?",
        answer:
          "If you have a water leak, locate and turn off your main water shutoff valve. For a gas leak, leave the house immediately and call us from outside. For sewer backups, avoid using any drains or toilets until we arrive.",
      },
    ],
  },
  {
    slug: "residential-plumbing",
    title: "Residential Plumbing Repair in Rockwall, TX",
    shortTitle: "Residential Plumbing",
    icon: "🏠",
    description:
      "Complete home plumbing — repairs, replacements, remodels, and new installations.",
    heroDescription:
      "Larry's Plumbing provides expert residential plumbing services in Rockwall and North Texas. From routine repairs to complete remodels, our licensed team handles every aspect of home plumbing.",
    content: [
      "Your home's plumbing is the backbone of daily life — from morning showers to kitchen cleanup to laundry. Larry's Plumbing has been keeping North Texas homes running smoothly since 1970, and today Justin Zmolik carries that same standard as a Texas Responsible Master Plumber (License #41106).",
      "We handle everything from leaky faucets and running toilets to complete bathroom remodels and whole-house repiping. Our technicians are trained on modern fixtures and techniques while respecting the older plumbing systems common in established Rockwall neighborhoods.",
      "Every job includes a thorough inspection, clear explanation of the problem, and upfront pricing before work begins. We clean up after ourselves and stand behind every repair.",
    ],
    features: [
      "Leak detection and repair",
      "Faucet and fixture installation",
      "Toilet repair and replacement",
      "Bathroom and kitchen remodels",
      "Water line repair and replacement",
      "Slab leak detection and repair",
      "Garbage disposal installation",
      "Whole-house repiping",
    ],
    faqs: [
      {
        question: "How do I know if I have a slab leak?",
        answer:
          "Signs of a slab leak include unexplained increases in your water bill, warm spots on the floor, the sound of running water when all fixtures are off, or cracks in your foundation. Larry's Plumbing uses electronic leak detection equipment to pinpoint slab leaks without unnecessary demolition.",
      },
      {
        question: "Do you offer free estimates for residential plumbing work?",
        answer:
          "We offer free estimates for most residential plumbing projects. Call us at (214) 729-3586 or text (214) 549-1290 to schedule. We'll assess the situation and provide transparent pricing before starting any work.",
      },
      {
        question: "What areas do you serve for residential plumbing?",
        answer:
          "We serve Rockwall, Royse City, Rowlett, Garland, Plano, Highland Park, University Park, and surrounding North Texas communities.",
      },
    ],
  },
  {
    slug: "commercial-plumbing",
    title: "Commercial Plumber in Rockwall, TX",
    shortTitle: "Commercial Plumbing",
    icon: "🏢",
    description:
      "Offices, restaurants, retail — we handle commercial-grade systems and code compliance.",
    heroDescription:
      "Larry's Plumbing provides commercial plumbing services in Rockwall and North Texas. From restaurants to office buildings, our licensed team handles commercial-grade systems, code compliance, and emergency repairs.",
    content: [
      "Commercial plumbing requires a different level of expertise than residential work. Larger pipe systems, grease traps, backflow prevention devices, and strict building codes demand a plumber who understands commercial requirements. Larry's Plumbing has served Rockwall-area businesses since 1970.",
      "Our commercial services cover everything from routine maintenance to emergency repairs. We understand that plumbing problems cost your business money every minute, which is why we prioritize fast response times and efficient repairs for our commercial clients.",
      "We work with offices, restaurants, retail spaces, industrial facilities, and multi-unit properties. All work is performed by licensed technicians and meets local building codes and TCEQ regulations.",
    ],
    features: [
      "Commercial pipe installation and repair",
      "Grease trap maintenance and installation",
      "Backflow prevention and testing",
      "Commercial water heater systems",
      "Fixture installation and upgrades",
      "Sewer line inspection and repair",
      "Code compliance inspections",
      "Emergency commercial plumbing 24/7",
    ],
    faqs: [
      {
        question: "What types of commercial properties do you service?",
        answer:
          "We service offices, restaurants, retail spaces, industrial facilities, multi-unit residential buildings, churches, schools, and athletic facilities throughout Rockwall and North Texas.",
      },
      {
        question: "Can you handle large-scale commercial plumbing installations?",
        answer:
          "Yes. Our team has completed over 1,200 projects including large-scale commercial installations. We carry the proper licensing and insurance for commercial work of all sizes.",
      },
      {
        question: "Do you offer commercial plumbing maintenance contracts?",
        answer:
          "Yes, we offer maintenance agreements for commercial properties that include regular inspections, preventive maintenance, and priority emergency response. Call (214) 729-3586 for details.",
      },
    ],
  },
  {
    slug: "water-heaters",
    title: "Water Heater Service in Rockwall, TX",
    shortTitle: "Water Heaters",
    icon: "🔥",
    description:
      "Tank and tankless installation, repair, and replacement. Same-day service available.",
    heroDescription:
      "Larry's Plumbing provides expert water heater repair, installation, and replacement in Rockwall and North Texas. Tank and tankless systems — same-day service available.",
    content: [
      "A broken water heater disrupts your entire household. No hot showers, no clean dishes, no laundry — and a leaking water heater can cause serious floor and foundation damage. Larry's Plumbing provides same-day water heater service across Rockwall and North Texas.",
      "We service and install all types of water heaters: traditional tank, tankless, gas, and electric. Our technicians diagnose the problem quickly and provide honest advice on whether repair or replacement is the better investment for your situation.",
      "Every water heater installation includes proper venting, code-compliant connections, a new drain pan, and a thorough safety check. We stand behind our work with manufacturer warranties and our own workmanship guarantee.",
    ],
    features: [
      "Same-day water heater repair",
      "Tank and tankless installation",
      "Gas and electric water heaters",
      "Emergency water heater replacement",
      "Anode rod replacement",
      "Sediment flush service",
      "Expansion tank installation",
      "Code-compliant installations",
    ],
    faqs: [
      {
        question: "How do I know if my water heater needs to be replaced?",
        answer:
          "Common signs include: no hot water, rust-colored water, strange noises (popping or banging), leaking around the base, or age over 10-12 years. Larry's Plumbing will inspect your water heater and give you honest advice on repair vs. replacement.",
      },
      {
        question: "How long does a water heater installation take?",
        answer:
          "A standard tank water heater replacement typically takes 2-3 hours. Tankless installations may take longer due to additional venting and gas line requirements. We'll give you a time estimate before starting.",
      },
      {
        question: "What size water heater do I need?",
        answer:
          "For most homes: 40-gallon for 1-2 people, 50-gallon for 3-4 people, and 75+ gallon or tankless for larger families. We'll help you choose the right size based on your household's hot water needs.",
      },
    ],
  },
  {
    slug: "tankless-water-heaters",
    title: "Tankless Water Heater in Rockwall, TX",
    shortTitle: "Tankless Water Heaters",
    icon: "♨️",
    description:
      "Endless hot water, energy savings, and a longer lifespan. Expert installation and repair.",
    heroDescription:
      "Larry's Plumbing provides expert tankless water heater installation, repair, and maintenance in Rockwall and North Texas. Endless hot water with energy savings — $500 off installation this month.",
    content: [
      "Tankless water heaters heat water on demand, eliminating the need for a storage tank and providing an endless supply of hot water. Larry's Plumbing specializes in tankless water heater installation and repair across Rockwall and North Texas.",
      "Tankless systems are more space-efficient, require minimal maintenance (descaling typically once annually), and last twice as long as traditional tanks with proper care. They're also more energy-efficient, reducing your annual utility bills.",
      "Proper installation is critical for tankless water heaters. Gas line sizing, venting requirements, and flow rate calculations must be done correctly. As a Texas Master Plumber, Justin Zmolik ensures every tankless installation meets manufacturer specs and local code requirements.",
    ],
    features: [
      "Tankless water heater installation",
      "Tankless repair and maintenance",
      "Annual descaling service",
      "Gas line sizing and installation",
      "Proper venting installation",
      "Flow rate assessment",
      "Energy efficiency consultation",
      "$500 off installation — current special",
    ],
    faqs: [
      {
        question: "How much does a tankless water heater cost to install?",
        answer:
          "Tankless water heater installation typically costs more upfront than a traditional tank, but saves money over time through lower energy bills and a longer lifespan (20+ years vs. 10-12 years). We currently offer $500 off tankless installation. Call (214) 729-3586 for a free estimate.",
      },
      {
        question: "Can a tankless water heater supply enough hot water for my whole house?",
        answer:
          "Yes, when properly sized. We calculate your home's peak hot water demand and recommend the right unit. A properly sized tankless heater delivers endless hot water to multiple fixtures simultaneously.",
      },
      {
        question: "How often does a tankless water heater need maintenance?",
        answer:
          "We recommend annual descaling to remove mineral buildup, especially in areas with hard water like North Texas. Regular maintenance extends the lifespan and maintains efficiency. Larry's Plumbing offers annual maintenance service.",
      },
    ],
  },
  {
    slug: "drain-cleaning",
    title: "Drain Cleaning Services in Rockwall, TX",
    shortTitle: "Drain Cleaning",
    icon: "🔧",
    description:
      "Hydro-jetting, flex-shaft, camera inspections — we clear the toughest clogs.",
    heroDescription:
      "Larry's Plumbing provides professional drain cleaning in Rockwall and North Texas. Hydro-jetting, flex-shaft clearing, and camera inspection — we clear the toughest clogs.",
    content: [
      "Clogged drains are more than an inconvenience — they can lead to sewage backups, water damage, and health hazards. Larry's Plumbing uses modern drain cleaning technology to clear even the toughest blockages in Rockwall and North Texas homes and businesses.",
      "We use hydro-jetting (high-pressure water to scour pipe walls), flex-shaft machines (for cutting through roots and hardened buildup), and camera inspection systems to see exactly what's causing the problem. No guesswork — we show you the camera footage so you understand the issue.",
      "Whether it's a slow kitchen drain, a backed-up sewer line, or tree roots invading your pipes, our team has the equipment and expertise to fix it right the first time.",
    ],
    features: [
      "Hydro-jetting drain cleaning",
      "Flex-shaft root cutting",
      "Camera inspection and diagnosis",
      "Kitchen and bathroom drain clearing",
      "Main sewer line cleaning",
      "Floor drain maintenance",
      "Preventive drain maintenance",
      "Trenchless sewer repair",
    ],
    faqs: [
      {
        question: "What causes drain clogs?",
        answer:
          "Common causes include grease buildup (kitchen), hair and soap (bathroom), tree root intrusion (main sewer lines), and foreign objects. Larry's Plumbing uses camera inspection to identify the exact cause and choose the best clearing method.",
      },
      {
        question: "What is hydro-jetting?",
        answer:
          "Hydro-jetting uses high-pressure water (up to 4,000 PSI) to scour the inside of pipes, removing grease, scale, roots, and other buildup. It's the most thorough drain cleaning method available and leaves pipes nearly like new.",
      },
      {
        question: "How do I prevent drain clogs?",
        answer:
          "Avoid putting grease down drains, use drain screens to catch hair and debris, and schedule preventive drain cleaning annually. For older homes with tree root issues, we recommend camera inspections every 1-2 years.",
      },
    ],
  },
  {
    slug: "backflow-testing",
    title: "Backflow Testing in Rockwall, TX",
    shortTitle: "Backflow Testing",
    icon: "💧",
    description:
      "TCEQ-certified testing and certification. Same-week appointments available.",
    heroDescription:
      "Larry's Plumbing provides TCEQ-certified backflow testing and prevention services in Rockwall and North Texas. Same-week appointments — avoid violations and fines.",
    content: [
      "Backflow prevention protects your drinking water from contamination. Texas law (TCEQ regulations) requires annual backflow testing for properties with irrigation systems, fire sprinklers, and certain commercial connections. Larry's Plumbing provides fast, reliable backflow testing with same-week appointments.",
      "Our certified technicians test double check valves, reduced pressure zone (RPZ) assemblies, and pressure vacuum breakers. We handle the paperwork and submit test results directly to your water provider, so you stay compliant without the hassle.",
      "If your city has sent you a backflow testing notice, don't wait — violations can result in water service disconnection. Call (214) 729-3586 for a same-week appointment.",
    ],
    features: [
      "TCEQ-certified backflow testing",
      "Same-week appointments available",
      "Double check valve testing",
      "RPZ assembly testing",
      "Pressure vacuum breaker testing",
      "Test report filing with water provider",
      "Backflow device repair and replacement",
      "Irrigation system backflow compliance",
    ],
    faqs: [
      {
        question: "What is backflow and why does it need testing?",
        answer:
          "Backflow occurs when water flows backward in your plumbing system, potentially contaminating your drinking water with fertilizers, chemicals, or sewage. TCEQ requires annual testing of backflow prevention devices to ensure they're working properly.",
      },
      {
        question: "I received a backflow testing notice from my city. What do I do?",
        answer:
          "Call Larry's Plumbing at (214) 729-3586 for a same-week backflow testing appointment. We'll test your device, handle the paperwork, and submit results to your water provider before the deadline. Failure to test can result in water service disconnection.",
      },
      {
        question: "How long does backflow testing take?",
        answer:
          "A standard backflow test takes 15-30 minutes. We test the device, record results, and provide you with documentation. If repairs are needed, we can often complete them during the same visit.",
      },
    ],
  },
];
```

- [ ] **Step 4: Create service areas data**

Create `src/data/service-areas.ts`:

```typescript
export interface ServiceArea {
  slug: string;
  name: string;
  description: string;
  content: string[];
  faqs: { question: string; answer: string }[];
}

export const serviceAreas: ServiceArea[] = [
  {
    slug: "rockwall",
    name: "Rockwall",
    description:
      "Larry's Plumbing is headquartered in Rockwall, TX — serving the community since 1970 with 24/7 emergency plumbing, water heaters, drain cleaning, and more.",
    content: [
      "Rockwall is home to Larry's Plumbing. Our headquarters at 6730 Horizon Rd Suite B is centrally located to serve the entire Rockwall community with fast response times. As the city's longest-running family plumbing service, we know Rockwall's plumbing infrastructure — from the older homes near downtown to the newer developments along I-30.",
      "Whether you need emergency service at 2am, a water heater replacement, or backflow testing for your irrigation system, Larry's Plumbing is your trusted local plumber. Three generations of master plumbers, over 1,200 completed projects, and counting.",
    ],
    faqs: [
      {
        question: "Who is the best plumber in Rockwall, TX?",
        answer:
          "Larry's Plumbing Service has been Rockwall's trusted family plumber since 1970. Licensed Master Plumber Justin Zmolik (TX #41106) leads a team with over 55 years of combined experience and 1,200+ completed projects. Available 24/7 at (214) 729-3586.",
      },
      {
        question: "Is there a 24/7 emergency plumber in Rockwall?",
        answer:
          "Yes. Larry's Plumbing provides 24/7 emergency plumbing service in Rockwall, TX. Call (214) 729-3586 anytime — nights, weekends, and holidays. We typically respond within 30-60 minutes.",
      },
    ],
  },
  {
    slug: "royse-city",
    name: "Royse City",
    description:
      "Larry's Plumbing serves Royse City, TX with residential and commercial plumbing, water heaters, drain cleaning, and 24/7 emergency service.",
    content: [
      "Royse City is one of the fastest-growing communities in North Texas, and Larry's Plumbing has been serving its residents since the beginning. From new construction plumbing to repairs on established homes, we handle it all.",
      "Our Rockwall headquarters is just minutes from Royse City, ensuring fast response times for emergency calls and scheduled appointments alike. We're familiar with the plumbing needs of Royse City homes and businesses.",
    ],
    faqs: [
      {
        question: "Does Larry's Plumbing serve Royse City?",
        answer:
          "Yes. Larry's Plumbing provides full plumbing services in Royse City, TX including emergency plumbing, water heaters, drain cleaning, and backflow testing. Our Rockwall headquarters is just minutes away. Call (214) 729-3586.",
      },
    ],
  },
  {
    slug: "rowlett",
    name: "Rowlett",
    description:
      "Larry's Plumbing provides plumbing services in Rowlett, TX — water heaters, drain cleaning, residential and commercial plumbing, and 24/7 emergency response.",
    content: [
      "Rowlett homeowners and businesses trust Larry's Plumbing for reliable, honest plumbing service. We've been serving the Rowlett community with the same family values since 1970 — treating every customer's home like our own.",
      "From Lake Ray Hubbard waterfront properties to established neighborhoods, we understand Rowlett's unique plumbing challenges and respond quickly when you need us most.",
    ],
    faqs: [
      {
        question: "What plumbing services does Larry's Plumbing offer in Rowlett?",
        answer:
          "We offer complete plumbing services in Rowlett including emergency plumbing (24/7), water heater installation and repair, drain cleaning, slab leak detection, backflow testing, and bathroom/kitchen remodels. Call (214) 729-3586.",
      },
    ],
  },
  {
    slug: "garland",
    name: "Garland",
    description:
      "Larry's Plumbing serves Garland, TX with licensed master plumber services — residential, commercial, water heaters, drain cleaning, and emergency response.",
    content: [
      "Garland is one of the largest cities in our service area, and Larry's Plumbing is proud to serve its diverse community. From older homes in South Garland to newer developments in North Garland, we handle plumbing systems of every age and complexity.",
      "Our licensed master plumber and team provide fast, reliable service throughout Garland — including 24/7 emergency response, water heater installation, drain cleaning, and complete residential and commercial plumbing.",
    ],
    faqs: [
      {
        question: "How quickly can Larry's Plumbing respond to emergencies in Garland?",
        answer:
          "We provide emergency plumbing response to Garland, TX within 45-90 minutes depending on traffic and current demand. Call (214) 729-3586 for immediate assistance — available 24/7.",
      },
    ],
  },
  {
    slug: "plano",
    name: "Plano",
    description:
      "Larry's Plumbing serves Plano, TX with expert plumbing services — residential, commercial, water heaters, drain cleaning, and 24/7 emergency calls.",
    content: [
      "Plano residents deserve a plumber they can trust. Larry's Plumbing brings over 55 years of family values and master plumber expertise to every Plano home and business we serve.",
      "Whether you're in West Plano, Legacy, or East Plano, we provide fast response times, transparent pricing, and work performed by licensed professionals. No surprises, no upselling — just honest plumbing.",
    ],
    faqs: [
      {
        question: "Does Larry's Plumbing service Plano, TX?",
        answer:
          "Yes. Larry's Plumbing provides full plumbing services across Plano, TX. We offer residential and commercial plumbing, water heater service, drain cleaning, backflow testing, and 24/7 emergency response. Call (214) 729-3586.",
      },
    ],
  },
  {
    slug: "highland-park",
    name: "Highland Park",
    description:
      "Larry's Plumbing provides premium plumbing services in Highland Park, TX — trusted by homeowners for expert repairs, installations, and emergency service.",
    content: [
      "Highland Park homes deserve exceptional plumbing service. Larry's Plumbing understands the high standards Highland Park homeowners expect — meticulous workmanship, respect for your property, and attention to the details that matter in fine homes.",
      "From fixture upgrades in historic properties to complete plumbing system overhauls, our licensed master plumber ensures every job meets the quality that Highland Park demands.",
    ],
    faqs: [
      {
        question: "Do you work on older homes in Highland Park?",
        answer:
          "Yes. Many Highland Park homes have older plumbing systems that require specialized knowledge. Our team has extensive experience with galvanized pipe replacement, cast iron drain repair, and modernizing plumbing in established homes while preserving their character. Call (214) 729-3586.",
      },
    ],
  },
  {
    slug: "university-park",
    name: "University Park",
    description:
      "Larry's Plumbing serves University Park, TX with licensed master plumber services — residential plumbing, water heaters, drain cleaning, and emergency calls.",
    content: [
      "University Park homeowners count on Larry's Plumbing for the same reliable, family-driven service we've provided across North Texas since 1970. We treat every University Park home with the care and respect it deserves.",
      "Our team handles everything from routine repairs to complex repiping projects. With Texas Master Plumber License #41106 and over 1,200 completed projects, you can trust Larry's Plumbing with your home.",
    ],
    faqs: [
      {
        question: "What makes Larry's Plumbing different from other plumbers in University Park?",
        answer:
          "Larry's Plumbing is a three-generation family business — not a franchise. Founded in 1970, we bring over 55 years of experience, a Texas Master Plumber License (#41106), and 1,200+ completed projects. We treat every home like our own. Call (214) 729-3586.",
      },
    ],
  },
];
```

- [ ] **Step 5: Create reviews data**

Create `src/data/reviews.ts`:

```typescript
export interface Review {
  text: string;
  author: string;
  city: string;
  rating: number;
  source: string;
}

export const reviews: Review[] = [
  {
    text: "Called at 10pm with a burst pipe. They were here in 30 minutes and had it fixed before midnight. Can't recommend enough.",
    author: "Mike R.",
    city: "Rockwall",
    rating: 5,
    source: "Google",
  },
  {
    text: "Justin and his team replaced our 20-year-old water heater in under 3 hours. Professional, clean, and fair pricing.",
    author: "Tina S.",
    city: "Rowlett",
    rating: 5,
    source: "Google",
  },
  {
    text: "Third generation family business that treats you like family. They've been our plumber for 15 years and counting.",
    author: "David L.",
    city: "Royse City",
    rating: 5,
    source: "Google",
  },
];
```

- [ ] **Step 6: Create specials data**

Create `src/data/specials.ts`:

```typescript
export interface Special {
  amount: string;
  title: string;
  description: string;
  ctaText: string;
}

export const specials: Special[] = [
  {
    amount: "$500",
    title: "Tankless Water Heater",
    description:
      "Endless hot water, lower energy bills. Professional installation by licensed master plumber.",
    ctaText: "Grab This Offer",
  },
  {
    amount: "$1,000",
    title: "Whole Home Water Treatment",
    description:
      "Halo 5 system — cleaner water from every tap. Say goodbye to hard water and contaminants.",
    ctaText: "Grab This Offer",
  },
];
```

- [ ] **Step 7: Create JSON-LD schema generators**

Create `src/lib/schema.ts`:

```typescript
import { company } from "@/data/company";

export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Plumber",
    name: company.name,
    image: "/images/logo-circle.png",
    telephone: company.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: company.address.street,
      addressLocality: company.address.city,
      addressRegion: company.address.state,
      postalCode: company.address.zip,
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: company.geo.lat,
      longitude: company.geo.lng,
    },
    url: "https://larrysplumbingservice.com",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "00:00",
      closes: "23:59",
    },
    priceRange: "$$",
    foundingDate: "1970",
    areaServed: [
      "Rockwall, TX",
      "Royse City, TX",
      "Rowlett, TX",
      "Garland, TX",
      "Plano, TX",
      "Highland Park, TX",
      "University Park, TX",
    ],
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function serviceSchema(name: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    provider: {
      "@type": "Plumber",
      name: company.name,
      telephone: company.phone,
    },
    areaServed: {
      "@type": "State",
      name: "Texas",
    },
  };
}

export function breadcrumbSchema(
  items: { name: string; href: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `https://larrysplumbingservice.com${item.href}`,
    })),
  };
}

export function blogPostSchema(post: {
  title: string;
  slug: string;
  date: string;
  excerpt: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: post.date,
    description: post.excerpt,
    author: {
      "@type": "Organization",
      name: company.name,
    },
    publisher: {
      "@type": "Organization",
      name: company.name,
      logo: {
        "@type": "ImageObject",
        url: "https://larrysplumbingservice.com/images/logo-circle.png",
      },
    },
    url: `https://larrysplumbingservice.com/blog/${post.slug}`,
  };
}
```

- [ ] **Step 8: Create metadata helpers**

Create `src/lib/metadata.ts`:

```typescript
import { company } from "@/data/company";
import type { Metadata } from "next";

export function createMetadata({
  title,
  description,
  path = "",
}: {
  title: string;
  description: string;
  path?: string;
}): Metadata {
  const fullTitle = `${title} | ${company.name}`;
  const url = `https://larrysplumbingservice.com${path}`;

  return {
    title: fullTitle,
    description,
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: company.name,
      locale: "en_US",
      type: "website",
      images: [
        {
          url: "/images/hero_family_image.jpg",
          width: 1200,
          height: 630,
          alt: `${company.name} — Family Owned Since 1970`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
    alternates: {
      canonical: url,
    },
  };
}
```

- [ ] **Step 9: Verify all data files import without errors**

```bash
npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 10: Commit**

```bash
git add src/data src/lib
git commit -m "feat: add company data, service content, schema generators, and metadata helpers"
```

---

## Task 3: Root Layout, Nav, Footer, and Global Styles

**Files:**
- Create: `src/components/nav.tsx`, `src/components/footer.tsx`, `src/components/mobile-cta-bar.tsx`
- Modify: `src/app/layout.tsx`, `src/app/globals.css`

- [ ] **Step 1: Set up global CSS**

Replace `src/app/globals.css`:

```css
@import "tailwindcss";

@theme {
  --color-brand-red: #c41e1e;
  --color-brand-black: #0a0a0a;
  --color-brand-dark: #111111;
  --color-brand-darker: #1a1a1a;
  --color-brand-gold: #f59e0b;

  --font-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

html {
  scroll-behavior: smooth;
}

body {
  background-color: var(--color-brand-black);
  color: #ffffff;
}
```

- [ ] **Step 2: Create Nav component**

Create `src/components/nav.tsx`:

```tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { navLinks } from "@/data/navigation";
import { company } from "@/data/company";

export function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 px-6 lg:px-10 py-5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/logo-circle.png"
            alt="Larry's Plumbing"
            width={45}
            height={45}
            className="rounded-full"
          />
          <span className="font-extrabold text-lg text-white tracking-wide">
            Larry&apos;s Plumbing
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <div
              key={link.label}
              className="relative"
              onMouseEnter={() =>
                "children" in link ? setOpenDropdown(link.label) : undefined
              }
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <Link
                href={link.href}
                className="text-sm text-gray-400 hover:text-white transition-colors tracking-wide"
              >
                {link.label}
              </Link>
              {"children" in link && openDropdown === link.label && (
                <div className="absolute top-full left-0 pt-2 w-56">
                  <div className="bg-brand-dark border border-brand-darker rounded-lg py-2 shadow-xl">
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-brand-darker transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          <a
            href={`tel:${company.phoneRaw}`}
            className="bg-brand-red text-white px-5 py-2.5 rounded-md text-sm font-bold tracking-wide shadow-[0_4px_20px_rgba(196,30,30,0.4)] hover:shadow-[0_8px_30px_rgba(196,30,30,0.6)] transition-all hover:-translate-y-0.5"
          >
            {company.phone}
          </a>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden flex flex-col gap-1.5 p-2"
          aria-label="Toggle menu"
        >
          <span
            className={`block w-6 h-0.5 bg-white transition-transform ${mobileOpen ? "rotate-45 translate-y-2" : ""}`}
          />
          <span
            className={`block w-6 h-0.5 bg-white transition-opacity ${mobileOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`block w-6 h-0.5 bg-white transition-transform ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden mt-4 bg-brand-dark border border-brand-darker rounded-xl p-6">
          {navLinks.map((link) => (
            <div key={link.label} className="mb-4">
              <Link
                href={link.href}
                className="text-white font-semibold text-base"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
              {"children" in link && (
                <div className="mt-2 ml-4 space-y-2">
                  {link.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="block text-sm text-gray-400 hover:text-white"
                      onClick={() => setMobileOpen(false)}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <a
            href={`tel:${company.phoneRaw}`}
            className="block mt-4 bg-brand-red text-white text-center py-3 rounded-lg font-bold"
          >
            Call {company.phone}
          </a>
        </div>
      )}
    </nav>
  );
}
```

- [ ] **Step 3: Create Footer component**

Create `src/components/footer.tsx`:

```tsx
import Image from "next/image";
import Link from "next/link";
import { company } from "@/data/company";

const serviceLinks = [
  { label: "Emergency Plumbing", href: "/services/emergency-plumbing" },
  { label: "Residential", href: "/services/residential-plumbing" },
  { label: "Commercial", href: "/services/commercial-plumbing" },
  { label: "Water Heaters", href: "/services/water-heaters" },
  { label: "Drain Cleaning", href: "/services/drain-cleaning" },
  { label: "Backflow Testing", href: "/services/backflow-testing" },
];

const areaLinks = [
  { label: "Rockwall", href: "/service-areas/rockwall" },
  { label: "Royse City", href: "/service-areas/royse-city" },
  { label: "Rowlett", href: "/service-areas/rowlett" },
  { label: "Garland", href: "/service-areas/garland" },
  { label: "Plano", href: "/service-areas/plano" },
  { label: "Highland Park", href: "/service-areas/highland-park" },
];

const companyLinks = [
  { label: "About Us", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Specials", href: "/specials" },
  { label: "Contact", href: "/contact" },
];

export function Footer() {
  return (
    <footer className="border-t border-brand-darker">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/images/logo-circle.png"
                alt="Larry's Plumbing"
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="font-extrabold text-base">
                Larry&apos;s Plumbing
              </span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Family-owned plumbing service in Rockwall, TX. Three generations
              of master plumbers serving North Texas since 1970.
            </p>
            <p className="text-gray-600 text-sm mt-3 leading-relaxed">
              {company.address.street}
              <br />
              {company.address.city}, {company.address.state}{" "}
              {company.address.zip}
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-xs tracking-[2px] text-gray-500 mb-4 font-semibold">
              SERVICES
            </h4>
            <ul className="space-y-2.5">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-brand-red transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Service Areas */}
          <div>
            <h4 className="text-xs tracking-[2px] text-gray-500 mb-4 font-semibold">
              SERVICE AREAS
            </h4>
            <ul className="space-y-2.5">
              {areaLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-brand-red transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs tracking-[2px] text-gray-500 mb-4 font-semibold">
              COMPANY
            </h4>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-brand-red transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-brand-darker gap-4">
          <p className="text-gray-600 text-xs">
            &copy; {new Date().getFullYear()} {company.legalName}. All rights
            reserved. {company.license}
          </p>
          <div className="flex gap-3">
            {company.social.facebook && (
              <a
                href={company.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-brand-darker rounded-lg flex items-center justify-center text-gray-500 hover:bg-brand-red hover:text-white transition-all text-sm"
                aria-label="Facebook"
              >
                f
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: Create mobile CTA bar**

Create `src/components/mobile-cta-bar.tsx`:

```tsx
import { company } from "@/data/company";

export function MobileCTABar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-brand-dark/95 backdrop-blur-lg border-t border-brand-darker">
      <div className="flex">
        <a
          href={`tel:${company.phoneRaw}`}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 text-white font-semibold text-sm bg-brand-red"
        >
          <span>📞</span> Call
        </a>
        <a
          href={`sms:${company.textRaw}`}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 text-white font-semibold text-sm border-l border-brand-darker"
        >
          <span>💬</span> Text
        </a>
        <a
          href="/contact"
          className="flex-1 flex items-center justify-center gap-2 py-3.5 text-white font-semibold text-sm border-l border-brand-darker"
        >
          <span>📅</span> Book
        </a>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Update root layout**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { MobileCTABar } from "@/components/mobile-cta-bar";
import { company } from "@/data/company";
import { localBusinessSchema } from "@/lib/schema";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${company.name} | Rockwall, TX Plumber Since 1970`,
    template: `%s | ${company.name}`,
  },
  description:
    "Family-owned plumbing service in Rockwall, TX. Three generations of master plumbers providing 24/7 emergency service, water heaters, drain cleaning, and more across North Texas. TX License #41106.",
  metadataBase: new URL("https://larrysplumbingservice.com"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased pb-14 lg:pb-0">
        <Nav />
        <main>{children}</main>
        <Footer />
        <MobileCTABar />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessSchema()),
          }}
        />
      </body>
    </html>
  );
}
```

- [ ] **Step 6: Run dev server and verify layout renders**

```bash
npm run dev
```

Expected: Dark background, nav with logo and links visible, footer renders. No errors in console.

- [ ] **Step 7: Commit**

```bash
git add src/components/nav.tsx src/components/footer.tsx src/components/mobile-cta-bar.tsx src/app/layout.tsx src/app/globals.css
git commit -m "feat: add root layout with nav, footer, mobile CTA bar, and dark theme"
```

---

## Task 4: Shared UI Components (Animation Wrappers, Section Headers, Cards)

**Files:**
- Create: `src/components/animate-on-scroll.tsx`, `src/components/stagger-children.tsx`, `src/components/section-header.tsx`, `src/components/service-card.tsx`, `src/components/review-card.tsx`, `src/components/special-card.tsx`, `src/components/area-item.tsx`, `src/components/stats-bar.tsx`, `src/components/cta-section.tsx`, `src/components/google-map.tsx`, `src/components/faq-accordion.tsx`

- [ ] **Step 1: Create scroll animation wrapper**

Create `src/components/animate-on-scroll.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface AnimateOnScrollProps {
  children: ReactNode;
  className?: string;
  direction?: "up" | "left" | "right";
  delay?: number;
}

const directionMap = {
  up: { y: 40, x: 0 },
  left: { x: -40, y: 0 },
  right: { x: 40, y: 0 },
};

export function AnimateOnScroll({
  children,
  className,
  direction = "up",
  delay = 0,
}: AnimateOnScrollProps) {
  const offset = directionMap[direction];

  return (
    <motion.div
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 2: Create stagger children wrapper**

Create `src/components/stagger-children.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface StaggerChildrenProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggerChildren({
  children,
  className,
  staggerDelay = 0.1,
}: StaggerChildrenProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        visible: {
          transition: { staggerChildren: staggerDelay },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 3: Create section header**

Create `src/components/section-header.tsx`:

```tsx
import { AnimateOnScroll } from "./animate-on-scroll";

interface SectionHeaderProps {
  tag: string;
  title: string;
  subtitle?: string;
}

export function SectionHeader({ tag, title, subtitle }: SectionHeaderProps) {
  return (
    <div>
      <AnimateOnScroll>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-0.5 bg-brand-red" />
          <span className="text-brand-red text-xs tracking-[4px] font-semibold">
            {tag}
          </span>
        </div>
      </AnimateOnScroll>
      <AnimateOnScroll delay={0.1}>
        <h2 className="text-4xl lg:text-5xl font-black mb-4 tracking-tight">
          {title}
        </h2>
      </AnimateOnScroll>
      {subtitle && (
        <AnimateOnScroll delay={0.2}>
          <p className="text-gray-500 text-lg max-w-lg">{subtitle}</p>
        </AnimateOnScroll>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Create service card**

Create `src/components/service-card.tsx`:

```tsx
import Link from "next/link";

interface ServiceCardProps {
  icon: string;
  title: string;
  description: string;
  href: string;
}

export function ServiceCard({
  icon,
  title,
  description,
  href,
}: ServiceCardProps) {
  return (
    <Link
      href={href}
      className="group relative block bg-brand-dark border border-brand-darker rounded-xl p-7 transition-all duration-400 hover:border-brand-red hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-brand-red scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left" />
      <div className="w-12 h-12 bg-brand-red/10 rounded-xl flex items-center justify-center text-2xl mb-5">
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
      <span className="inline-block mt-4 text-brand-red text-sm opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
        Learn more &rarr;
      </span>
    </Link>
  );
}
```

- [ ] **Step 5: Create review card**

Create `src/components/review-card.tsx`:

```tsx
import type { Review } from "@/data/reviews";

export function ReviewCard({ text, author, city, source }: Review) {
  return (
    <div className="bg-brand-dark border border-brand-darker rounded-xl p-7 relative">
      <span className="absolute top-5 right-6 text-5xl text-brand-darker font-serif leading-none">
        &ldquo;
      </span>
      <div className="text-brand-gold text-sm mb-4 tracking-widest">
        ★★★★★
      </div>
      <p className="text-gray-300 text-sm leading-relaxed italic mb-5">
        {text}
      </p>
      <div className="text-sm font-semibold">{author}</div>
      <div className="text-gray-600 text-xs">
        {source} Review &middot; {city}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create special card**

Create `src/components/special-card.tsx`:

```tsx
import { company } from "@/data/company";
import type { Special } from "@/data/specials";

export function SpecialCard({ amount, title, description, ctaText }: Special) {
  return (
    <div className="relative bg-gradient-to-br from-[#1a0505] to-brand-dark border border-[#2a1010] rounded-xl p-8 overflow-hidden">
      <div className="absolute -top-1/2 -right-1/2 w-52 h-52 bg-brand-red/8 rounded-full blur-[40px]" />
      <div className="relative">
        <div>
          <span className="text-5xl font-black text-brand-red">{amount}</span>
          <span className="text-lg text-brand-red font-semibold ml-2">OFF</span>
        </div>
        <h3 className="text-xl font-bold mt-3 mb-2">{title}</h3>
        <p className="text-gray-500 text-sm mb-5">{description}</p>
        <a
          href={`tel:${company.phoneRaw}`}
          className="inline-block bg-brand-red text-white px-6 py-2.5 rounded-md text-sm font-semibold hover:shadow-[0_8px_30px_rgba(196,30,30,0.5)] transition-shadow"
        >
          {ctaText} &rarr;
        </a>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Create area item**

Create `src/components/area-item.tsx`:

```tsx
import Link from "next/link";

interface AreaItemProps {
  name: string;
  href: string;
}

export function AreaItem({ name, href }: AreaItemProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3.5 bg-brand-dark border border-brand-darker rounded-lg hover:border-brand-red hover:bg-[#151515] transition-all group"
    >
      <div className="w-2 h-2 bg-brand-red rounded-full" />
      <span className="text-sm font-semibold">{name}</span>
      <span className="ml-auto text-gray-600 text-xs group-hover:text-brand-red transition-colors">
        &rarr;
      </span>
    </Link>
  );
}
```

- [ ] **Step 8: Create stats bar with counter animation**

Create `src/components/stats-bar.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { company } from "@/data/company";

function Counter({
  target,
  suffix = "",
  prefix = "",
}: {
  target: number;
  suffix?: string;
  prefix?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const start = performance.now();
    function update(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

const stats = [
  {
    label: "YEARS IN BUSINESS",
    value: (
      <Counter
        target={new Date().getFullYear() - company.established}
        suffix="+"
      />
    ),
  },
  {
    label: "PROJECTS COMPLETED",
    value: <Counter target={company.projectsCompleted} suffix="+" />,
  },
  { label: "EMERGENCY SERVICE", value: "24/7" },
  { label: "TX MASTER LICENSE", value: `#${company.licenseNumber}` },
];

export function StatsBar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 1.1 }}
      className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-xl border-t border-white/[0.08] z-10"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 flex justify-between items-center">
        {stats.map((stat, i) => (
          <div key={stat.label} className="flex items-center gap-8">
            {i > 0 && (
              <div className="hidden sm:block w-px h-10 bg-white/10" />
            )}
            <div className="text-center">
              <div className="text-brand-red text-2xl lg:text-3xl font-black">
                {stat.value}
              </div>
              <div className="text-gray-600 text-[10px] tracking-[2px] mt-1">
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 9: Create CTA section**

Create `src/components/cta-section.tsx`:

```tsx
import { company } from "@/data/company";
import { AnimateOnScroll } from "./animate-on-scroll";

export function CTASection() {
  return (
    <section className="relative py-24 px-6 lg:px-10 text-center overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-red/[0.06] rounded-full blur-[80px]" />
      <AnimateOnScroll>
        <h2 className="text-4xl lg:text-5xl font-black mb-4 relative">
          Need a Plumber{" "}
          <span className="text-brand-red">Right Now?</span>
        </h2>
        <a
          href={`tel:${company.phoneRaw}`}
          className="block text-2xl lg:text-3xl font-black text-brand-red mb-8 relative animate-pulse"
        >
          {company.phone}
        </a>
        <p className="text-gray-500 text-base mb-8 relative">
          Available 24/7 for emergencies across Rockwall and North Texas.
        </p>
        <div className="flex flex-wrap gap-4 justify-center relative">
          <a
            href={`tel:${company.phoneRaw}`}
            className="bg-brand-red text-white px-8 py-3.5 rounded-md font-bold shadow-[0_4px_20px_rgba(196,30,30,0.3)] hover:shadow-[0_8px_30px_rgba(196,30,30,0.5)] hover:-translate-y-0.5 transition-all"
          >
            📞 Call Now
          </a>
          <a
            href={`sms:${company.textRaw}`}
            className="border border-white/20 text-white px-8 py-3.5 rounded-md hover:border-white/50 hover:bg-white/5 transition-all"
          >
            💬 Text Us: {company.text}
          </a>
          <a
            href="/contact"
            className="border border-white/20 text-white px-8 py-3.5 rounded-md hover:border-white/50 hover:bg-white/5 transition-all"
          >
            📅 Book Online
          </a>
        </div>
      </AnimateOnScroll>
    </section>
  );
}
```

- [ ] **Step 10: Create Google Map component**

Create `src/components/google-map.tsx`:

```tsx
interface GoogleMapProps {
  src: string;
  className?: string;
}

export function GoogleMap({ src, className = "" }: GoogleMapProps) {
  return (
    <div
      className={`bg-brand-dark border border-brand-darker rounded-xl overflow-hidden ${className}`}
    >
      <iframe
        src={src}
        className="w-full h-[350px] border-0 grayscale invert-[0.92] contrast-[0.9]"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Larry's Plumbing Service location"
      />
    </div>
  );
}
```

- [ ] **Step 11: Create FAQ accordion**

Create `src/components/faq-accordion.tsx`:

```tsx
"use client";

import { useState } from "react";

interface FAQ {
  question: string;
  answer: string;
}

export function FAQAccordion({ faqs }: { faqs: FAQ[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <div
          key={i}
          className="bg-brand-dark border border-brand-darker rounded-xl overflow-hidden"
        >
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full text-left px-6 py-4 flex items-center justify-between gap-4"
          >
            <span className="font-semibold text-sm">{faq.question}</span>
            <span
              className={`text-brand-red text-lg transition-transform ${openIndex === i ? "rotate-45" : ""}`}
            >
              +
            </span>
          </button>
          {openIndex === i && (
            <div className="px-6 pb-4">
              <p className="text-gray-400 text-sm leading-relaxed">
                {faq.answer}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 12: Verify all components compile**

```bash
npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 13: Commit**

```bash
git add src/components
git commit -m "feat: add shared UI components — animations, cards, stats, CTA, map, FAQ"
```

---

## Task 5: Homepage

**Files:**
- Create: `src/components/hero.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create Hero component**

Create `src/components/hero.tsx`:

```tsx
"use client";

import { useScroll, useTransform, motion } from "framer-motion";
import Image from "next/image";
import { company } from "@/data/company";
import { StatsBar } from "./stats-bar";

export function Hero() {
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 800], [0, 320]);
  const bgOpacity = useTransform(scrollY, [0, 800], [0.85, 0.1]);

  return (
    <section className="relative min-h-screen overflow-hidden bg-brand-black">
      {/* Background photo with parallax */}
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        <Image
          src="/images/hero_family_image.jpg"
          alt="The Larry's Plumbing family — three generations of master plumbers in Rockwall, TX"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <motion.div
          className="absolute inset-0 bg-black"
          style={{ opacity: useTransform(bgOpacity, (v) => 1 - v) }}
        />
      </motion.div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/5" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 min-h-screen flex flex-col justify-center pt-24 pb-32">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex items-center gap-3 mb-4"
        >
          <div className="w-10 h-0.5 bg-brand-red" />
          <span className="text-brand-red text-xs tracking-[4px] font-semibold">
            FAMILY OWNED &middot; EST. 1970 &middot; ROCKWALL, TX
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.08] tracking-tight mb-5 max-w-2xl"
        >
          Three Generations.
          <br />
          One <span className="text-brand-red">Promise.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.7 }}
          className="text-gray-400 text-lg lg:text-xl leading-relaxed mb-9 max-w-xl"
        >
          From Larry to Justin — we&apos;ve been fixing pipes, earning trust,
          and keeping North Texas homes running for over 55 years.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.9 }}
          className="flex flex-wrap gap-4"
        >
          <a
            href="/contact"
            className="bg-brand-red text-white px-8 py-3.5 rounded-md text-base font-bold shadow-[0_4px_20px_rgba(196,30,30,0.3)] hover:shadow-[0_8px_30px_rgba(196,30,30,0.5)] hover:-translate-y-0.5 transition-all"
          >
            Schedule Service
          </a>
          <a
            href={`sms:${company.textRaw}`}
            className="border border-white/20 text-white px-8 py-3.5 rounded-md text-base hover:border-white/50 hover:bg-white/5 transition-all"
          >
            💬 Text Us a Question
          </a>
        </motion.div>
      </div>

      <StatsBar />
    </section>
  );
}
```

- [ ] **Step 2: Build the homepage**

Replace `src/app/page.tsx`:

```tsx
import { Hero } from "@/components/hero";
import { SectionHeader } from "@/components/section-header";
import { ServiceCard } from "@/components/service-card";
import { ReviewCard } from "@/components/review-card";
import { SpecialCard } from "@/components/special-card";
import { AreaItem } from "@/components/area-item";
import { CTASection } from "@/components/cta-section";
import { GoogleMap } from "@/components/google-map";
import { AnimateOnScroll } from "@/components/animate-on-scroll";
import { StaggerChildren, StaggerItem } from "@/components/stagger-children";
import { services } from "@/data/services";
import { reviews } from "@/data/reviews";
import { specials } from "@/data/specials";
import { serviceAreas } from "@/data/service-areas";
import { company } from "@/data/company";
import Image from "next/image";

export default function HomePage() {
  return (
    <>
      <Hero />

      {/* Services Section */}
      <section className="py-24 px-6 lg:px-10 max-w-7xl mx-auto">
        <SectionHeader
          tag="WHAT WE DO"
          title="Expert Plumbing Services"
          subtitle="From emergency repairs to whole-home installations — licensed, insured, and trusted across North Texas."
        />
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
          {services.map((service) => (
            <StaggerItem key={service.slug}>
              <ServiceCard
                icon={service.icon}
                title={service.shortTitle}
                description={service.description}
                href={`/services/${service.slug}`}
              />
            </StaggerItem>
          ))}
        </StaggerChildren>
      </section>

      {/* About Teaser */}
      <section className="py-24 px-6 lg:px-10 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <AnimateOnScroll direction="left" className="relative flex-shrink-0">
            <div className="w-80 lg:w-96 h-[500px] bg-brand-darker rounded-xl overflow-hidden border border-brand-darker relative">
              <Image
                src="/images/SMallerJustinFullbody.png"
                alt="Justin Zmolik — Texas Responsible Master Plumber, Larry's Plumbing"
                fill
                className="object-contain"
                sizes="400px"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 bg-brand-red text-white px-5 py-4 rounded-xl text-center shadow-[0_8px_30px_rgba(196,30,30,0.4)]">
              <div className="text-4xl font-black leading-none">
                {new Date().getFullYear() - company.established}+
              </div>
              <div className="text-[10px] tracking-[2px] mt-1">
                YEARS OF SERVICE
              </div>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll direction="right" className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-0.5 bg-brand-red" />
              <span className="text-brand-red text-xs tracking-[4px] font-semibold">
                OUR STORY
              </span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-black mb-5 leading-tight">
              Three Generations of
              <br />
              <span className="text-brand-red">Master Plumbers</span>
            </h2>
            <p className="text-gray-400 text-base leading-relaxed mb-4">
              Larry started this company in 1970 with a simple belief: treat
              every home like your own. Today, his grandson Justin carries that
              same standard — backed by a Texas Master Plumber License and over{" "}
              {company.projectsCompleted.toLocaleString()} completed projects.
            </p>
            <p className="text-gray-400 text-base leading-relaxed mb-6">
              We&apos;re not a franchise. We&apos;re your neighbors. When you
              call Larry&apos;s, you get a family that takes pride in every
              pipe, every fitting, every fix.
            </p>
            <div className="flex flex-wrap gap-6 pt-6 border-t border-brand-darker">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-red/10 rounded-lg flex items-center justify-center text-brand-red">
                  📋
                </div>
                <div className="text-xs">
                  <strong className="block text-white">
                    TX License #{company.licenseNumber}
                  </strong>
                  <span className="text-gray-600">Master Plumber</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-red/10 rounded-lg flex items-center justify-center text-brand-red">
                  🛡️
                </div>
                <div className="text-xs">
                  <strong className="block text-white">Fully Insured</strong>
                  <span className="text-gray-600">Licensed &amp; Bonded</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-red/10 rounded-lg flex items-center justify-center text-brand-red">
                  ⭐
                </div>
                <div className="text-xs">
                  <strong className="block text-white">5-Star Rated</strong>
                  <span className="text-gray-600">Google Reviews</span>
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-24 px-6 lg:px-10 max-w-7xl mx-auto">
        <SectionHeader
          tag="WHAT CUSTOMERS SAY"
          title="Trust Is Earned"
          subtitle="Real reviews from real neighbors across Rockwall and North Texas."
        />
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-12">
          {reviews.map((review) => (
            <StaggerItem key={review.author}>
              <ReviewCard {...review} />
            </StaggerItem>
          ))}
        </StaggerChildren>
      </section>

      {/* Service Areas */}
      <section className="py-24 px-6 lg:px-10 max-w-7xl mx-auto">
        <SectionHeader
          tag="WHERE WE SERVE"
          title="Serving North Texas"
          subtitle="Proudly serving Rockwall and surrounding communities since 1970."
        />
        <AnimateOnScroll className="mt-12">
          <div className="flex flex-col lg:flex-row gap-8">
            <GoogleMap
              src={company.googleMapsEmbed}
              className="flex-1"
            />
            <div className="lg:w-72 space-y-2">
              {serviceAreas.map((area) => (
                <AreaItem
                  key={area.slug}
                  name={area.name}
                  href={`/service-areas/${area.slug}`}
                />
              ))}
            </div>
          </div>
        </AnimateOnScroll>
      </section>

      {/* Specials */}
      <section className="py-24 px-6 lg:px-10 max-w-7xl mx-auto">
        <SectionHeader
          tag="CURRENT OFFERS"
          title="Monthly Specials"
          subtitle="Limited-time savings on our most popular services."
        />
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-12">
          {specials.map((special) => (
            <StaggerItem key={special.title}>
              <SpecialCard {...special} />
            </StaggerItem>
          ))}
        </StaggerChildren>
      </section>

      {/* Emergency CTA */}
      <CTASection />
    </>
  );
}
```

- [ ] **Step 3: Run dev server and visually verify homepage**

```bash
npm run dev
```

Open http://localhost:3000. Verify: hero with family photo and parallax, services grid, about teaser with Justin photo, reviews, map with area list, specials, CTA section. Check mobile responsiveness.

- [ ] **Step 4: Commit**

```bash
git add src/components/hero.tsx src/app/page.tsx
git commit -m "feat: build homepage with hero, services, about, reviews, areas, specials, CTA"
```

---

## Task 6: Service Pages (Dynamic Route)

**Files:**
- Create: `src/app/services/[slug]/page.tsx`

- [ ] **Step 1: Create dynamic service page**

Create `src/app/services/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { services } from "@/data/services";
import { createMetadata } from "@/lib/metadata";
import { faqSchema, serviceSchema, breadcrumbSchema } from "@/lib/schema";
import { SectionHeader } from "@/components/section-header";
import { FAQAccordion } from "@/components/faq-accordion";
import { CTASection } from "@/components/cta-section";
import { AnimateOnScroll } from "@/components/animate-on-scroll";
import { ServiceCard } from "@/components/service-card";
import { StaggerChildren, StaggerItem } from "@/components/stagger-children";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) return {};
  return createMetadata({
    title: service.title,
    description: service.heroDescription,
    path: `/services/${slug}`,
  });
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) notFound();

  const relatedServices = services.filter((s) => s.slug !== slug).slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 px-6 lg:px-10 bg-gradient-to-b from-brand-dark to-brand-black">
        <div className="max-w-4xl mx-auto">
          <AnimateOnScroll>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-0.5 bg-brand-red" />
              <span className="text-brand-red text-xs tracking-[4px] font-semibold">
                OUR SERVICES
              </span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black mb-6 tracking-tight">
              {service.title}
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed max-w-2xl">
              {service.heroDescription}
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-6 lg:px-10 max-w-4xl mx-auto">
        <AnimateOnScroll>
          <div className="space-y-5">
            {service.content.map((paragraph, i) => (
              <p
                key={i}
                className="text-gray-300 text-base leading-relaxed"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </AnimateOnScroll>

        {/* Features list */}
        <AnimateOnScroll className="mt-12">
          <h2 className="text-2xl font-bold mb-6">What We Offer</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {service.features.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-3 text-gray-300 text-sm"
              >
                <span className="text-brand-red mt-0.5">✓</span>
                {feature}
              </li>
            ))}
          </ul>
        </AnimateOnScroll>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 lg:px-10 max-w-4xl mx-auto">
        <SectionHeader
          tag="FAQ"
          title="Common Questions"
          subtitle={`Frequently asked questions about ${service.shortTitle.toLowerCase()}.`}
        />
        <div className="mt-8">
          <FAQAccordion faqs={service.faqs} />
        </div>
      </section>

      {/* Related Services */}
      <section className="py-16 px-6 lg:px-10 max-w-7xl mx-auto">
        <SectionHeader tag="MORE SERVICES" title="Related Services" />
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
          {relatedServices.map((s) => (
            <StaggerItem key={s.slug}>
              <ServiceCard
                icon={s.icon}
                title={s.shortTitle}
                description={s.description}
                href={`/services/${s.slug}`}
              />
            </StaggerItem>
          ))}
        </StaggerChildren>
      </section>

      <CTASection />

      {/* Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceSchema(service.title, service.heroDescription)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema(service.faqs)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Home", href: "/" },
              { name: "Services", href: "/services" },
              { name: service.shortTitle, href: `/services/${slug}` },
            ])
          ),
        }}
      />
    </>
  );
}
```

- [ ] **Step 2: Verify service pages render**

```bash
npm run dev
```

Navigate to http://localhost:3000/services/emergency-plumbing, http://localhost:3000/services/water-heaters, etc. Verify content, FAQ accordion, related services, and schema in page source.

- [ ] **Step 3: Commit**

```bash
git add src/app/services
git commit -m "feat: add dynamic service pages with FAQ, schema, and related services"
```

---

## Task 7: Service Area Pages (Dynamic Route)

**Files:**
- Create: `src/app/service-areas/[slug]/page.tsx`

- [ ] **Step 1: Create dynamic service area page**

Create `src/app/service-areas/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { serviceAreas } from "@/data/service-areas";
import { services } from "@/data/services";
import { company } from "@/data/company";
import { createMetadata } from "@/lib/metadata";
import { faqSchema, breadcrumbSchema } from "@/lib/schema";
import { SectionHeader } from "@/components/section-header";
import { ServiceCard } from "@/components/service-card";
import { FAQAccordion } from "@/components/faq-accordion";
import { CTASection } from "@/components/cta-section";
import { GoogleMap } from "@/components/google-map";
import { AnimateOnScroll } from "@/components/animate-on-scroll";
import { StaggerChildren, StaggerItem } from "@/components/stagger-children";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return serviceAreas.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const area = serviceAreas.find((a) => a.slug === slug);
  if (!area) return {};
  return createMetadata({
    title: `Plumber in ${area.name}, TX`,
    description: area.description,
    path: `/service-areas/${slug}`,
  });
}

export default async function ServiceAreaPage({ params }: Props) {
  const { slug } = await params;
  const area = serviceAreas.find((a) => a.slug === slug);
  if (!area) notFound();

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 px-6 lg:px-10 bg-gradient-to-b from-brand-dark to-brand-black">
        <div className="max-w-4xl mx-auto">
          <AnimateOnScroll>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-0.5 bg-brand-red" />
              <span className="text-brand-red text-xs tracking-[4px] font-semibold">
                SERVICE AREA
              </span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black mb-6 tracking-tight">
              Plumber in {area.name}, TX
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed max-w-2xl">
              {area.description}
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-6 lg:px-10 max-w-4xl mx-auto">
        <AnimateOnScroll>
          <div className="space-y-5">
            {area.content.map((paragraph, i) => (
              <p key={i} className="text-gray-300 text-base leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </AnimateOnScroll>

        {/* Map */}
        <AnimateOnScroll className="mt-12">
          <GoogleMap src={company.googleMapsEmbed} />
        </AnimateOnScroll>
      </section>

      {/* Services available */}
      <section className="py-16 px-6 lg:px-10 max-w-7xl mx-auto">
        <SectionHeader
          tag="AVAILABLE SERVICES"
          title={`Plumbing Services in ${area.name}`}
          subtitle={`Full-service plumbing for ${area.name} homes and businesses.`}
        />
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
          {services.map((s) => (
            <StaggerItem key={s.slug}>
              <ServiceCard
                icon={s.icon}
                title={s.shortTitle}
                description={s.description}
                href={`/services/${s.slug}`}
              />
            </StaggerItem>
          ))}
        </StaggerChildren>
      </section>

      {/* FAQ */}
      {area.faqs.length > 0 && (
        <section className="py-16 px-6 lg:px-10 max-w-4xl mx-auto">
          <SectionHeader
            tag="FAQ"
            title={`${area.name} Plumbing Questions`}
          />
          <div className="mt-8">
            <FAQAccordion faqs={area.faqs} />
          </div>
        </section>
      )}

      <CTASection />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema(area.faqs)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Home", href: "/" },
              { name: "Service Areas", href: "/service-areas" },
              { name: area.name, href: `/service-areas/${slug}` },
            ])
          ),
        }}
      />
    </>
  );
}
```

- [ ] **Step 2: Verify area pages render**

```bash
npm run dev
```

Navigate to http://localhost:3000/service-areas/rockwall, http://localhost:3000/service-areas/plano, etc.

- [ ] **Step 3: Commit**

```bash
git add src/app/service-areas
git commit -m "feat: add dynamic service area pages with local SEO content and schema"
```

---

## Task 8: About, Specials, and Contact Pages

**Files:**
- Create: `src/app/about/page.tsx`, `src/app/specials/page.tsx`, `src/app/contact/page.tsx`

- [ ] **Step 1: Create About page**

Create `src/app/about/page.tsx`:

```tsx
import Image from "next/image";
import { company } from "@/data/company";
import { createMetadata } from "@/lib/metadata";
import { AnimateOnScroll } from "@/components/animate-on-scroll";
import { CTASection } from "@/components/cta-section";

export const metadata = createMetadata({
  title: "About Us",
  description: `Larry's Plumbing is a three-generation family plumbing business in Rockwall, TX. Founded in 1970, we've completed over ${company.projectsCompleted.toLocaleString()} projects with Texas Master Plumber License #${company.licenseNumber}.`,
  path: "/about",
});

const timeline = [
  { year: "1970", title: "Larry Starts the Business", description: "Larry founded the company with a truck, his tools, and a commitment to honest work." },
  { year: "1990s", title: "Second Generation Joins", description: "Larry's children joined the business, expanding service to more North Texas communities." },
  { year: "2020s", title: "Justin Takes the Lead", description: "Justin Zmolik earns his Texas Master Plumber License (#41106) and leads the company into its third generation." },
  { year: "Today", title: "1,200+ Projects & Growing", description: "Three generations, one standard. Still family-owned, still treating every home like our own." },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero with family photo */}
      <section className="relative pt-32 pb-24 px-6 lg:px-10 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/hero_family_image.jpg"
            alt="The Larry's Plumbing family"
            fill
            className="object-cover opacity-30"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-black/80 to-brand-black" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <AnimateOnScroll>
            <h1 className="text-4xl lg:text-5xl font-black mb-6">
              Our <span className="text-brand-red">Story</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
              Plumbing is what we do. But family is who we are. Three generations
              of master plumbers, one promise: treat every home like our own.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 px-6 lg:px-10 max-w-4xl mx-auto">
        <div className="space-y-12">
          {timeline.map((item, i) => (
            <AnimateOnScroll
              key={item.year}
              delay={i * 0.15}
              className="flex gap-8 items-start"
            >
              <div className="flex-shrink-0 w-20 text-right">
                <span className="text-brand-red font-black text-xl">
                  {item.year}
                </span>
              </div>
              <div className="relative pl-8 border-l border-brand-darker pb-8">
                <div className="absolute -left-1.5 top-1.5 w-3 h-3 bg-brand-red rounded-full" />
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="py-24 px-6 lg:px-10 max-w-7xl mx-auto">
        <AnimateOnScroll className="text-center mb-12">
          <h2 className="text-3xl font-black mb-4">
            Meet <span className="text-brand-red">Justin</span>
          </h2>
          <p className="text-gray-400 max-w-lg mx-auto">
            Texas Responsible Master Plumber, License #{company.licenseNumber}.
            Third-generation plumber carrying on the family tradition.
          </p>
        </AnimateOnScroll>
        <AnimateOnScroll className="flex justify-center">
          <div className="relative w-72 h-96 bg-brand-darker rounded-xl overflow-hidden border border-brand-darker">
            <Image
              src="/images/SMallerJustinFullbody.png"
              alt="Justin Zmolik — Master Plumber"
              fill
              className="object-contain"
              sizes="300px"
            />
          </div>
        </AnimateOnScroll>
      </section>

      <CTASection />
    </>
  );
}
```

- [ ] **Step 2: Create Specials page**

Create `src/app/specials/page.tsx`:

```tsx
import { specials } from "@/data/specials";
import { createMetadata } from "@/lib/metadata";
import { SpecialCard } from "@/components/special-card";
import { CTASection } from "@/components/cta-section";
import { AnimateOnScroll } from "@/components/animate-on-scroll";
import { StaggerChildren, StaggerItem } from "@/components/stagger-children";

export const metadata = createMetadata({
  title: "Specials & Coupons",
  description:
    "Current plumbing specials from Larry's Plumbing in Rockwall, TX. Save on tankless water heaters, whole home water treatment, and more.",
  path: "/specials",
});

export default function SpecialsPage() {
  return (
    <>
      <section className="pt-32 pb-16 px-6 lg:px-10 bg-gradient-to-b from-brand-dark to-brand-black">
        <div className="max-w-4xl mx-auto">
          <AnimateOnScroll>
            <h1 className="text-4xl lg:text-5xl font-black mb-6">
              Current <span className="text-brand-red">Specials</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Limited-time savings on our most popular services.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      <section className="py-16 px-6 lg:px-10 max-w-4xl mx-auto">
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {specials.map((special) => (
            <StaggerItem key={special.title}>
              <SpecialCard {...special} />
            </StaggerItem>
          ))}
        </StaggerChildren>
      </section>

      <CTASection />
    </>
  );
}
```

- [ ] **Step 3: Create Contact page**

Create `src/app/contact/page.tsx`:

```tsx
import { company } from "@/data/company";
import { createMetadata } from "@/lib/metadata";
import { GoogleMap } from "@/components/google-map";
import { AnimateOnScroll } from "@/components/animate-on-scroll";

export const metadata = createMetadata({
  title: "Contact Us",
  description: `Contact Larry's Plumbing in Rockwall, TX. Call ${company.phone}, text ${company.text}, or visit us at ${company.address.full}. Available 24/7.`,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <section className="pt-32 pb-16 px-6 lg:px-10 bg-gradient-to-b from-brand-dark to-brand-black">
        <div className="max-w-4xl mx-auto">
          <AnimateOnScroll>
            <h1 className="text-4xl lg:text-5xl font-black mb-6">
              Contact <span className="text-brand-red">Us</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Available 24/7 for emergencies. Schedule service or ask us
              anything.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      <section className="py-16 px-6 lg:px-10 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <AnimateOnScroll direction="left">
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-bold mb-3">Call or Text</h2>
                <a
                  href={`tel:${company.phoneRaw}`}
                  className="block text-2xl font-black text-brand-red mb-2"
                >
                  {company.phone}
                </a>
                <a
                  href={`sms:${company.textRaw}`}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Text us: {company.text}
                </a>
              </div>
              <div>
                <h2 className="text-xl font-bold mb-3">Visit Us</h2>
                <p className="text-gray-400">
                  {company.address.street}
                  <br />
                  {company.address.city}, {company.address.state}{" "}
                  {company.address.zip}
                </p>
              </div>
              <div>
                <h2 className="text-xl font-bold mb-3">Hours</h2>
                <p className="text-gray-400">
                  Open 24/7 — including nights, weekends, and holidays
                </p>
              </div>
              <div>
                <h2 className="text-xl font-bold mb-3">Book Online</h2>
                <a
                  href={`tel:${company.phoneRaw}`}
                  className="inline-block bg-brand-red text-white px-6 py-3 rounded-md font-bold hover:shadow-[0_8px_30px_rgba(196,30,30,0.5)] transition-shadow"
                >
                  Schedule Service
                </a>
              </div>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll direction="right">
            <GoogleMap src={company.googleMapsEmbed} />
          </AnimateOnScroll>
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 4: Verify all three pages render**

```bash
npm run dev
```

Check http://localhost:3000/about, http://localhost:3000/specials, http://localhost:3000/contact.

- [ ] **Step 5: Commit**

```bash
git add src/app/about src/app/specials src/app/contact
git commit -m "feat: add about, specials, and contact pages"
```

---

## Task 9: Blog with MDX

**Files:**
- Create: `src/content/blog/*.mdx` (5 posts), `src/lib/mdx.ts`, `src/app/blog/page.tsx`, `src/app/blog/[slug]/page.tsx`

- [ ] **Step 1: Create MDX utility**

Create `src/lib/mdx.ts`:

```typescript
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
  "solving-plumbing-challenges-at-sports-world-athletics": {
    title: "Solving Plumbing Challenges at Sports World Athletics in Rockwall, TX",
    date: "2025-01-03",
    excerpt: "How technician Evan fixed commercial urinal stoppages and replaced P-traps at a Rockwall athletic facility.",
    category: "Commercial Plumbing",
    featuredImage: "/images/PlumbingServiceRockwallTexas.png",
  },
  "new-water-heater-for-tina-in-rowlett": {
    title: "A Day in the Life: New Water Heater for Tina in Rowlett, TX",
    date: "2024-11-26",
    excerpt: "Replacing a 20-year-old water heater with a modern 40-gallon tank — complete with safety upgrades.",
    category: "Water Heaters",
  },
  "whole-house-filtration-system-repair-royse-city": {
    title: "Whole House Filtration System Repair in Royse City, TX",
    date: "2024-11-13",
    excerpt: "Correcting an improperly installed filtration system affecting water pressure and distribution.",
    category: "Water Filtration",
  },
  "valve-and-fixture-replacement-rockwall": {
    title: "Valve and Fixture Replacement in Rockwall, Texas",
    date: "2024-11-05",
    excerpt: "Repairing two bathrooms with leaking valves and rust-colored water issues.",
    category: "Residential Plumbing",
  },
  "cast-iron-drain-replacement-dallas": {
    title: "Cast Iron Drain Replacement in Dallas, Texas",
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
```

- [ ] **Step 2: Create blog post MDX files**

Create `src/content/blog/solving-plumbing-challenges-at-sports-world-athletics.mdx`:

```mdx
At Larry's Plumbing, we pride ourselves on providing fast, reliable, and expert service for all our clients, whether residential or commercial.

## The Challenge

Sports World Athletics in Rockwall, TX called us about recurring urinal stoppages in their men's restroom. The facility sees heavy daily traffic, and the plumbing needed to keep up.

## Our Solution

Technician Evan diagnosed the issue quickly — the existing P-traps were corroded and undersized for the facility's usage volume. He replaced all P-traps with commercial-grade components designed for high-traffic environments.

## The Result

The restroom is back to full operation with no more stoppages. The new commercial-grade P-traps are built to handle the facility's daily traffic without issue.

**Need commercial plumbing help?** Call Larry's Plumbing at [(214) 729-3586](tel:+12147293586) — we serve Rockwall and all of North Texas.
```

Create `src/content/blog/new-water-heater-for-tina-in-rowlett.mdx`:

```mdx
When Tina in Rowlett, TX noticed her 20-year-old water heater was barely producing hot water and showing signs of corrosion, she called Larry's Plumbing.

## The Job

Technician Evan arrived and confirmed the water heater was beyond repair — after 20 years of service, replacement was the clear choice. Tina chose a new 40-gallon tank with a 6-year warranty.

## The Installation

Evan completed the full installation in 2 hours and 32 minutes, including:

- Removing and disposing of the old unit
- Installing a new drain pan and drain line
- Connecting the new water heater with code-compliant fittings
- Safety testing all connections

## Modern Safety Features

The new installation includes a proper drain pan and drain line — features that weren't standard when Tina's original heater was installed. These protect against water damage if the unit ever develops a leak.

**Need a water heater replacement?** Larry's Plumbing offers same-day service. Call [(214) 729-3586](tel:+12147293586).
```

Create `src/content/blog/whole-house-filtration-system-repair-royse-city.mdx`:

```mdx
Customer Gage in Royse City, TX called Larry's Plumbing about low water pressure throughout his home. The culprit? An improperly installed whole-house water filtration system.

## What We Found

The previous installer had used undersized piping and failed to install a proper pressure reducing valve (PRV). This created a bottleneck that restricted water flow to the entire house.

## The Fix

Our team installed:

- A new 1-inch PRV for proper pressure regulation
- PEX piping sized correctly for the home's demand
- A new main shutoff valve for easier maintenance access

## The Result

Water pressure was restored throughout the home, and Gage now has properly regulated pressure that protects his plumbing fixtures and appliances.

**Having water pressure issues?** Call Larry's Plumbing at [(214) 729-3586](tel:+12147293586) for expert diagnosis and repair.
```

Create `src/content/blog/valve-and-fixture-replacement-rockwall.mdx`:

```mdx
A Rockwall homeowner contacted Larry's Plumbing about two bathrooms experiencing different plumbing issues — one with a leaking shower valve and another with rust-colored water.

## Master Bath: Corroded Shower Valve

The master bath shower valve had corroded internally, causing a steady drip. We replaced the entire valve assembly with a new posi-temp cartridge for reliable temperature control and drip-free operation.

## Office Bath: Rust-Colored Water

The office bathroom fixture was producing rust-colored water — a sign of internal corrosion in the valve body. We replaced the fixture completely, eliminating the discoloration and restoring clean water flow.

## Two Problems, One Visit

Both repairs were completed in a single visit, minimizing disruption to the homeowner. That's the Larry's Plumbing approach — we come prepared to handle whatever we find.

**Dealing with leaks or discolored water?** Call [(214) 729-3586](tel:+12147293586) — we'll diagnose and fix it right the first time.
```

Create `src/content/blog/cast-iron-drain-replacement-dallas.mdx`:

```mdx
Homeowner Greg in Dallas, TX had an aging cast iron drain system that was causing slow drains and occasional backups throughout his home.

## The Problem

Cast iron drain pipes were standard in homes built before the 1970s. Over decades, they corrode from the inside out, developing rough surfaces that catch debris and restrict flow. Greg's system had reached the end of its useful life.

## The Solution

Our team performed a complete cast iron-to-PVC conversion:

- Excavated the concrete floor to access the drain lines
- Removed corroded cast iron sections
- Installed new PVC drain lines with proper slope
- Poured new concrete and restored the floor

We also installed a new shower valve and rebuilt a toilet during the same visit.

## Why PVC?

PVC drain pipes have a smooth interior surface that resists buildup, don't corrode, and can last 50+ years. For homes with aging cast iron, conversion to PVC is a long-term investment in reliable drainage.

**Have cast iron drains?** Larry's Plumbing specializes in drain system upgrades. Call [(214) 729-3586](tel:+12147293586).
```

- [ ] **Step 3: Create blog listing page**

Create `src/app/blog/page.tsx`:

```tsx
import Link from "next/link";
import Image from "next/image";
import { getAllPosts } from "@/lib/mdx";
import { createMetadata } from "@/lib/metadata";
import { AnimateOnScroll } from "@/components/animate-on-scroll";
import { StaggerChildren, StaggerItem } from "@/components/stagger-children";

export const metadata = createMetadata({
  title: "Blog",
  description:
    "Plumbing tips, project stories, and expert advice from Larry's Plumbing in Rockwall, TX. Real jobs, real solutions.",
  path: "/blog",
});

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <>
      <section className="pt-32 pb-16 px-6 lg:px-10 bg-gradient-to-b from-brand-dark to-brand-black">
        <div className="max-w-4xl mx-auto">
          <AnimateOnScroll>
            <h1 className="text-4xl lg:text-5xl font-black mb-6">
              Our <span className="text-brand-red">Blog</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Real jobs, real solutions. Stories from the field across Rockwall
              and North Texas.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      <section className="py-16 px-6 lg:px-10 max-w-4xl mx-auto">
        <StaggerChildren className="space-y-6">
          {posts.map((post) => (
            <StaggerItem key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="group block bg-brand-dark border border-brand-darker rounded-xl p-6 hover:border-brand-red transition-all"
              >
                <div className="flex items-start gap-6">
                  {post.featuredImage && (
                    <div className="hidden sm:block relative w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={post.featuredImage}
                        alt={post.title}
                        fill
                        className="object-cover"
                        sizes="128px"
                      />
                    </div>
                  )}
                  <div>
                    <span className="text-brand-red text-xs tracking-[2px] font-semibold">
                      {post.category}
                    </span>
                    <h2 className="text-lg font-bold mt-1 mb-2 group-hover:text-brand-red transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {post.excerpt}
                    </p>
                    <span className="text-gray-600 text-xs mt-3 block">
                      {new Date(post.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </section>
    </>
  );
}
```

- [ ] **Step 4: Create individual blog post page**

Create `src/app/blog/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { getAllSlugs, getPost } from "@/lib/mdx";
import { createMetadata } from "@/lib/metadata";
import { blogPostSchema, breadcrumbSchema } from "@/lib/schema";
import { CTASection } from "@/components/cta-section";
import { AnimateOnScroll } from "@/components/animate-on-scroll";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return createMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${slug}`,
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  let Content: React.ComponentType;
  try {
    const mod = await import(`@/content/blog/${slug}.mdx`);
    Content = mod.default;
  } catch {
    notFound();
  }

  return (
    <>
      <section className="pt-32 pb-8 px-6 lg:px-10 bg-gradient-to-b from-brand-dark to-brand-black">
        <div className="max-w-3xl mx-auto">
          <AnimateOnScroll>
            <span className="text-brand-red text-xs tracking-[2px] font-semibold">
              {post.category}
            </span>
            <h1 className="text-3xl lg:text-4xl font-black mt-2 mb-4">
              {post.title}
            </h1>
            <p className="text-gray-600 text-sm">
              {new Date(post.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      <article className="py-12 px-6 lg:px-10 max-w-3xl mx-auto prose prose-invert prose-red prose-sm lg:prose-base prose-headings:font-bold prose-a:text-brand-red prose-a:no-underline hover:prose-a:underline">
        <Content />
      </article>

      <CTASection />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogPostSchema(post)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Home", href: "/" },
              { name: "Blog", href: "/blog" },
              { name: post.title, href: `/blog/${slug}` },
            ])
          ),
        }}
      />
    </>
  );
}
```

- [ ] **Step 5: Verify blog pages render**

```bash
npm run dev
```

Check http://localhost:3000/blog and click into individual posts. Verify MDX content renders with proper typography.

- [ ] **Step 6: Commit**

```bash
git add src/content src/lib/mdx.ts src/app/blog
git commit -m "feat: add blog with MDX posts, listing page, and post schema"
```

---

## Task 10: Sitemap, Robots, and Final SEO

**Files:**
- Create: `next-sitemap.config.js`, `src/app/robots.ts`, `src/app/sitemap.ts`

- [ ] **Step 1: Create sitemap generator**

Create `src/app/sitemap.ts`:

```typescript
import type { MetadataRoute } from "next";
import { services } from "@/data/services";
import { serviceAreas } from "@/data/service-areas";
import { getAllSlugs } from "@/lib/mdx";

const BASE_URL = "https://larrysplumbingservice.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 1 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${BASE_URL}/specials`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 },
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

  return [...staticPages, ...servicePages, ...areaPages, ...blogPages];
}
```

- [ ] **Step 2: Create robots.txt**

Create `src/app/robots.ts`:

```typescript
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://larrysplumbingservice.com/sitemap.xml",
  };
}
```

- [ ] **Step 3: Build and verify**

```bash
npm run build
```

Expected: All pages generate successfully with no errors. Check that sitemap.xml and robots.txt are generated.

- [ ] **Step 4: Commit**

```bash
git add src/app/sitemap.ts src/app/robots.ts
git commit -m "feat: add sitemap and robots.txt for SEO"
```

---

## Task 11: Vercel Deployment

**Files:**
- No new files — deployment via CLI

- [ ] **Step 1: Ensure build succeeds**

```bash
npm run build
```

Expected: All pages statically generated, no errors.

- [ ] **Step 2: Deploy to Vercel**

```bash
npx vercel --yes
```

This creates a preview deployment. Verify the preview URL works.

- [ ] **Step 3: Test the preview deployment**

Open the preview URL. Check:
- Homepage renders with hero, all sections
- Navigation works on desktop and mobile
- Service pages load correctly
- Service area pages load correctly
- Blog listing and individual posts work
- About, Specials, Contact pages work
- Schema markup is present (check page source)
- Images load properly
- Animations fire on scroll
- Mobile CTA bar shows on mobile viewport

- [ ] **Step 4: Deploy to production**

```bash
npx vercel --prod
```

- [ ] **Step 5: Commit any deployment config changes**

```bash
git add -A
git commit -m "chore: vercel deployment configuration"
```

---

## Summary

| Task | What It Builds | Estimated Steps |
|------|---------------|-----------------|
| 1 | Project scaffold, Tailwind, MDX config | 7 |
| 2 | All data files, schema generators, metadata helpers | 10 |
| 3 | Root layout, nav, footer, mobile CTA, global styles | 7 |
| 4 | 11 shared UI components (animations, cards, FAQ, map) | 13 |
| 5 | Full homepage with all 8 sections | 4 |
| 6 | 7 dynamic service pages | 3 |
| 7 | 7 dynamic service area pages | 3 |
| 8 | About, Specials, Contact pages | 5 |
| 9 | Blog with 5 MDX posts | 6 |
| 10 | Sitemap + robots.txt | 4 |
| 11 | Vercel deployment | 5 |
| **Total** | **Full website** | **67 steps** |
