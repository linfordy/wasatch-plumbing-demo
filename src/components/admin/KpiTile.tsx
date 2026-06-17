interface Props {
  label: string;
  value: string;
  sublabel?: string;
}

export function KpiTile({ label, value, sublabel }: Props) {
  return (
    <div className="bg-brand-dark border border-brand-darker rounded-xl p-5">
      <div className="text-gray-500 text-xs font-semibold tracking-wide mb-2 uppercase">
        {label}
      </div>
      <div className="text-2xl lg:text-3xl font-black text-white">{value}</div>
      {sublabel && <div className="text-gray-500 text-xs mt-1">{sublabel}</div>}
    </div>
  );
}
