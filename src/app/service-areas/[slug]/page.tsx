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
