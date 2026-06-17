import Link from "next/link";

interface AreaItemProps {
  name: string;
  href: string;
}

export function AreaItem({ name, href }: AreaItemProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3.5 bg-brand-dark border border-brand-darker rounded-lg hover:border-brand-red hover:bg-[#151515] transition-all group"
    >
      <div className="w-2 h-2 bg-brand-red rounded-full" />
      <span className="text-sm font-semibold">{name}</span>
      <span className="ml-auto text-gray-600 text-xs group-hover:text-brand-red transition-colors">
        &rarr;
      </span>
    </Link>
  );
}
