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
