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
