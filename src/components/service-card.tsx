import Link from "next/link";

interface ServiceCardProps {
  icon: string;
  title: string;
  description: string;
  href: string;
}

export function ServiceCard({
  icon,
  title,
  description,
  href,
}: ServiceCardProps) {
  return (
    <Link
      href={href}
      className="group relative block bg-brand-dark border border-brand-darker rounded-xl p-7 transition-all duration-400 hover:border-brand-red hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-brand-red scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left" />
      <div className="w-12 h-12 bg-brand-red/10 rounded-xl flex items-center justify-center text-2xl mb-5">
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
      <span className="inline-block mt-4 text-brand-red text-sm opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
        Learn more &rarr;
      </span>
    </Link>
  );
}
