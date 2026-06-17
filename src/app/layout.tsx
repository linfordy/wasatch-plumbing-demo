import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { MobileCTABar } from "@/components/mobile-cta-bar";
import { AttributionProvider } from "@/components/attribution-provider";
import { company } from "@/data/company";
import { localBusinessSchema } from "@/lib/schema";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `Plumbers in South Jordan, UT — Licensed & Available 24/7 | ${company.name}`,
    template: `%s | ${company.name}`,
  },
  description:
    "Wasatch Plumbing Co. — South Jordan's trusted plumbers since 2018. Licensed master plumber. Same-day service, no overtime charges. Drain cleaning, water heaters, leak detection & emergency plumbing. Call (801) 555-3366.",
  metadataBase: new URL("https://wasatch-plumbing-demo.vercel.app"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Kaushan+Script&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased pb-14 lg:pb-0">
        <AttributionProvider />
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
