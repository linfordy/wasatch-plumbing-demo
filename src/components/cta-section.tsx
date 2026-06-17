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
          Available 24/7 for emergencies across South Jordan and Salt Lake Valley.
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
