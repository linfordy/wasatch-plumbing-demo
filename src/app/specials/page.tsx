import { specials } from "@/data/specials";
import { createMetadata } from "@/lib/metadata";
import { SpecialCard } from "@/components/special-card";
import { CTASection } from "@/components/cta-section";
import { AnimateOnScroll } from "@/components/animate-on-scroll";
import { StaggerChildren, StaggerItem } from "@/components/stagger-children";

export const metadata = createMetadata({
  title: "Specials & Coupons",
  description:
    "Current plumbing specials from Wasatch Plumbing Co. in South Jordan, UT. Save on tankless water heaters, whole home water treatment, and more.",
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
