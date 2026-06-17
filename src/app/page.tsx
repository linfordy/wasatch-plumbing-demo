import { Hero } from "@/components/hero";
import { SectionHeader } from "@/components/section-header";
import { ServiceCard } from "@/components/service-card";
import { ReviewsCarousel } from "@/components/reviews-carousel";
import { SpecialCard } from "@/components/special-card";
import { AreaItem } from "@/components/area-item";
import { CTASection } from "@/components/cta-section";
import { GoogleMap } from "@/components/google-map";
import { AnimateOnScroll } from "@/components/animate-on-scroll";
import { StaggerChildren, StaggerItem } from "@/components/stagger-children";
import { services } from "@/data/services";
import { specials } from "@/data/specials";
import { serviceAreas } from "@/data/service-areas";
import { company } from "@/data/company";
import Image from "next/image";
import Link from "next/link";
import { recentWork } from "@/lib/recent-work";

export default function HomePage() {
  return (
    <>
      <Hero />

      {/* Services Section */}
      <section className="py-24 px-6 lg:px-10 max-w-7xl mx-auto">
        <SectionHeader
          tag="WHAT WE DO"
          title="Expert Plumbing Services"
          subtitle="From emergency repairs to whole-home installations — licensed, insured, and trusted across Salt Lake Valley."
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
        {/* Header */}
        <div className="text-center mb-16">
          <AnimateOnScroll>
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-8 h-0.5 bg-brand-red" />
              <span className="text-brand-red text-xs font-semibold" style={{ letterSpacing: '4px' }}>
                OUR STORY
              </span>
              <div className="w-8 h-0.5 bg-brand-red" />
            </div>
            <h2 className="text-3xl lg:text-5xl font-black mb-4 tracking-tight">
              Three Generations of<br />
              <span className="text-brand-red">Master Plumbers</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Built on honest work — licensed professionals you can trust with your home.
            </p>
          </AnimateOnScroll>
        </div>

        {/* Legacy Cards */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-0 mb-16">
          {/* Brand Card */}
          <AnimateOnScroll direction="left" className="w-full lg:w-auto">
            <div className="group relative w-full lg:w-80 h-[480px] bg-brand-dark border border-brand-darker rounded-2xl overflow-hidden hover:border-brand-red/50 hover:-translate-y-1 transition-all duration-500">
              <Image
                src="/images/larry-founder.jpg"
                alt="Wasatch Plumbing Co. — Trusted plumbers in South Jordan, Est. 2018"
                fill
                className="object-cover"
                sizes="320px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
                <div className="text-brand-red text-3xl font-black">EST. 2018</div>
                <div className="text-white text-sm font-semibold mt-1">The Founder</div>
                
              </div>
            </div>
          </AnimateOnScroll>

          {/* Timeline Connector */}
          <div className="hidden lg:flex flex-col items-center mx-8">
            <div className="w-3 h-3 rounded-full bg-brand-red shadow-[0_0_10px_rgba(196,30,30,0.5)]" />
            <div className="w-0.5 h-96 bg-gradient-to-b from-brand-red via-brand-red to-brand-red/30" />
            <div className="w-3 h-3 rounded-full bg-brand-red shadow-[0_0_10px_rgba(196,30,30,0.5)]" />
          </div>
          {/* Mobile timeline (horizontal) */}
          <div className="flex lg:hidden items-center gap-2 my-2">
            <div className="w-2 h-2 rounded-full bg-brand-red" />
            <div className="w-24 h-0.5 bg-brand-red" />
            <div className="w-2 h-2 rounded-full bg-brand-red" />
          </div>

          {/* Justin Card */}
          <AnimateOnScroll direction="right" className="w-full lg:w-auto">
            <div className="group relative w-full lg:w-80 h-[480px] bg-brand-dark border border-brand-darker rounded-2xl overflow-hidden hover:border-brand-red/50 hover:-translate-y-1 transition-all duration-500">
              <Image
                src="/images/SMallerJustinFullbody.png"
                alt="Wasatch Plumbing Co. technicians — Utah Licensed, South Jordan"
                fill
                className="object-contain"
                sizes="320px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
                <div className="text-brand-red text-3xl font-black">TODAY</div>
                <div className="text-white text-sm font-semibold mt-1">Master Plumber #WP-2018-1042</div>
                <div className="text-gray-500 text-xs mt-1">Our Team</div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>

        {/* Story Text */}
        <AnimateOnScroll className="max-w-2xl mx-auto text-center">
          <p className="text-gray-400 text-base leading-relaxed mb-4">
            Wasatch Plumbing was built on a simple belief: treat every home like your own. Our licensed team carries that standard into every job — backed by a UT Plumber License and over {company.projectsCompleted.toLocaleString()} completed projects.
          </p>
          <p className="text-gray-400 text-base leading-relaxed mb-8">
            We&apos;re not a franchise. We&apos;re your neighbors. When you call Wasatch Plumbing, you get a team that takes pride in every pipe, every fitting, every fix.
          </p>
          <div className="flex flex-wrap justify-center gap-8 pt-6 border-t border-brand-darker">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-red/10 rounded-lg flex items-center justify-center text-brand-red">📋</div>
              <div className="text-xs">
                <strong className="block text-white">TX License #{company.licenseNumber}</strong>
                <span className="text-gray-600">Master Plumber</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-red/10 rounded-lg flex items-center justify-center text-brand-red">🛡️</div>
              <div className="text-xs">
                <strong className="block text-white">Fully Insured</strong>
                <span className="text-gray-600">Licensed &amp; Bonded</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-red/10 rounded-lg flex items-center justify-center text-brand-red">⭐</div>
              <div className="text-xs">
                <strong className="block text-white">5-Star Rated</strong>
                <span className="text-gray-600">Google Reviews</span>
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      </section>

      {/* Reviews */}
      <section className="py-24 px-6 lg:px-10 max-w-7xl mx-auto">
        <SectionHeader
          tag="WHAT CUSTOMERS SAY"
          title="Trust Is Earned"
          subtitle="Live Google reviews from real neighbors across South Jordan and Salt Lake Valley."
        />
        <AnimateOnScroll className="mt-12">
          <ReviewsCarousel />
        </AnimateOnScroll>
      </section>

      {/* Recent Work — auto-populated by the Linfordy platform's */}
      {/* proofpop-capture handler. Hidden when registry empty. */}
      {recentWork.length > 0 && (
        <section className="py-24 px-6 lg:px-10 max-w-7xl mx-auto">
          <SectionHeader
            tag="RECENT WORK"
            title="Jobs From The Field"
            subtitle="Real recaps from our techs after recent jobs across Salt Lake Valley."
          />
          <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
            {[...recentWork]
              .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
              .slice(0, 3)
              .map((item) => (
                <StaggerItem key={item.slug}>
                  <Link
                    href={`/recent-work/${item.slug}`}
                    className="group block bg-brand-dark border border-brand-darker rounded-2xl overflow-hidden hover:border-brand-red/50 hover:-translate-y-1 transition-all duration-500"
                  >
                    {item.photo_urls?.[0] && (
                      <div className="relative w-full h-48 bg-brand-darker overflow-hidden">
                        <Image
                          src={item.photo_urls[0]}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, 33vw"
                          unoptimized
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <span className="text-brand-red text-xs tracking-[2px] font-semibold">
                        {item.service_category
                          .replace(/[-_]+/g, " ")
                          .split(" ")
                          .filter(Boolean)
                          .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
                          .join(" ")
                          .toUpperCase()}
                      </span>
                      <h3 className="text-lg font-bold mt-2 mb-3 text-white group-hover:text-brand-red transition-colors">
                        {item.title}
                      </h3>
                      {item.voice_summary && (
                        <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-4">
                          {item.voice_summary}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-600 pt-3 border-t border-brand-darker">
                        <span>
                          {item.city || "Salt Lake Valley"}
                          {item.tech_name && ` · ${item.tech_name}`}
                        </span>
                        <span>
                          {new Date(item.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                    </div>
                  </Link>
                </StaggerItem>
              ))}
          </StaggerChildren>
          <AnimateOnScroll className="text-center mt-10">
            <Link
              href="/recent-work"
              className="inline-flex items-center gap-2 text-sm text-brand-red hover:text-white transition-colors font-semibold tracking-wide"
            >
              See all recent work
              <span aria-hidden>→</span>
            </Link>
          </AnimateOnScroll>
        </section>
      )}

      {/* Service Areas */}
      <section className="py-24 px-6 lg:px-10 max-w-7xl mx-auto">
        <SectionHeader
          tag="WHERE WE SERVE"
          title="Serving Salt Lake Valley"
          subtitle="Proudly serving South Jordan and surrounding communities since 2018."
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
