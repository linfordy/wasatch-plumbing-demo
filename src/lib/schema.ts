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
    url: "https://wasatch-plumbing-demo.vercel.app",
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
    foundingDate: "2018",
    areaServed: [
      "South Jordan, UT",
      "Riverton, UT",
      "Sandy, UT",
      "Draper, UT",
      "Bluffdale, UT",
      ,
      ,
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
      name: "Utah",
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
      item: `https://wasatch-plumbing-demo.vercel.app${item.href}`,
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
        url: "https://wasatch-plumbing-demo.vercel.app/images/logo-circle.png",
      },
    },
    url: `https://wasatch-plumbing-demo.vercel.app/blog/${post.slug}`,
  };
}

// Per-job "recent work" page schema. Combines BlogPosting (so the
// page is eligible for article rich results) with nested Service +
// Place entities so LLMs can extract structured facts cleanly.
export function recentWorkSchema(entry: {
  slug: string;
  title: string;
  service_category: string;
  neighborhood: string;
  city: string;
  state: string;
  completed_at: string;
  tech_name: string;
  photo_urls: string[];
  voice_summary: string;
}) {
  const humanizedService = entry.service_category
    .replace(/[-_]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

  const where = [entry.neighborhood, entry.city, entry.state]
    .filter(Boolean)
    .join(", ");

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: entry.title,
    datePublished: entry.completed_at,
    dateModified: entry.completed_at,
    description: entry.voice_summary || `Recent ${humanizedService.toLowerCase()} job completed by ${company.name}${where ? ` in ${where}` : ""}.`,
    image: entry.photo_urls.length > 0 ? entry.photo_urls : undefined,
    author: {
      "@type": "Organization",
      name: company.name,
      url: "https://wasatch-plumbing-demo.vercel.app",
    },
    publisher: {
      "@type": "Organization",
      name: company.name,
      logo: {
        "@type": "ImageObject",
        url: "https://wasatch-plumbing-demo.vercel.app/images/logo-circle.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://wasatch-plumbing-demo.vercel.app/recent-work/${entry.slug}`,
    },
    about: {
      "@type": "Service",
      name: humanizedService,
      provider: {
        "@type": "Plumber",
        name: company.name,
        telephone: company.phone,
      },
    },
    locationCreated: where
      ? {
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            ...(entry.neighborhood && { addressNeighborhood: entry.neighborhood }),
            addressLocality: entry.city || undefined,
            addressRegion: entry.state || undefined,
            addressCountry: "US",
          },
        }
      : undefined,
    contributor: entry.tech_name
      ? { "@type": "Person", name: entry.tech_name, jobTitle: "Plumber" }
      : undefined,
    url: `https://wasatch-plumbing-demo.vercel.app/recent-work/${entry.slug}`,
  };
}
