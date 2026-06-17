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
  const url = `https://wasatch-plumbing-demo.vercel.app${path}`;

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
