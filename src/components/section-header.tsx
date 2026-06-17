import { AnimateOnScroll } from "./animate-on-scroll";

interface SectionHeaderProps {
  tag: string;
  title: string;
  subtitle?: string;
}

export function SectionHeader({ tag, title, subtitle }: SectionHeaderProps) {
  return (
    <div>
      <AnimateOnScroll>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-0.5 bg-brand-red" />
          <span className="text-brand-red text-xs tracking-[4px] font-semibold">
            {tag}
          </span>
        </div>
      </AnimateOnScroll>
      <AnimateOnScroll delay={0.1}>
        <h2 className="text-4xl lg:text-5xl font-black mb-4 tracking-tight">
          {title}
        </h2>
      </AnimateOnScroll>
      {subtitle && (
        <AnimateOnScroll delay={0.2}>
          <p className="text-gray-500 text-lg max-w-lg">{subtitle}</p>
        </AnimateOnScroll>
      )}
    </div>
  );
}
