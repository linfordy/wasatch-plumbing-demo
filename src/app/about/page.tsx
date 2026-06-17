import Image from "next/image";
import { company } from "@/data/company";
import { createMetadata } from "@/lib/metadata";
import { AnimateOnScroll } from "@/components/animate-on-scroll";
import { CTASection } from "@/components/cta-section";

export const metadata = createMetadata({
  title: "About Us",
  description: `Wasatch Plumbing Co. is a three-generation family plumbing business in South Jordan, UT. Founded in 2018, we've completed over ${company.projectsCompleted.toLocaleString()} projects with Utah Plumber License #${company.licenseNumber}.`,
  path: "/about",
});

const timeline = [
  { year: "2018", title: "Wasatch Plumbing Founded", description: "The company was founded with a truck, his tools, and a commitment to honest work." },
  { year: "1990s", title: "Second Generation Joins", description: "The team expanded, expanding service to more Salt Lake Valley communities." },
  { year: "2020s", title: "Justin Takes the Lead", description: "Our Team earns his Utah Plumber License (#WP-2018-1042) and leads the company into its third generation." },
  { year: "Today", title: "1,200+ Projects & Growing", description: "Licensed and insured, one standard. Still family-owned, still treating every home like our own." },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero with family photo */}
      <section className="relative pt-32 pb-24 px-6 lg:px-10 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/hero_family_image.jpg"
            alt="The Wasatch Plumbing Co. family"
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
              Plumbing is what we do. But family is who we are. Licensed and insured
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
            Utah Licensed Master Plumber, License #{company.licenseNumber}.
            Third-generation plumber carrying on the family tradition.
          </p>
        </AnimateOnScroll>
        <AnimateOnScroll className="flex justify-center">
          <div className="relative w-72 h-96 bg-brand-darker rounded-xl overflow-hidden border border-brand-darker">
            <Image
              src="/images/SMallerJustinFullbody.png"
              alt="Our Team — Master Plumber"
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
