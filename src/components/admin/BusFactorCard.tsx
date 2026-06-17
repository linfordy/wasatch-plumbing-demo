import type { TechUtilization } from "@/lib/kpi-derivations";

interface Props {
  techs: TechUtilization[];
}

export function BusFactorCard({ techs }: Props) {
  // Exclude Unassigned from the top-tech determination — it represents an
  // operational gap (missing assignment data), not a real bus-factor risk.
  const assigned = techs.filter((t) => t.tech_name !== "Unassigned");

  if (assigned.length === 0) {
    return (
      <div className="bg-brand-dark border border-brand-darker rounded-xl p-5 h-full">
        <div className="text-gray-500 text-xs font-semibold tracking-wide mb-2 uppercase">
          Bus Factor
        </div>
        <div className="text-gray-400 text-sm">No assigned job data in this period.</div>
      </div>
    );
  }

  const [top, ...rest] = assigned;
  const isRisk = top.pct_of_total > 80;

  return (
    <div
      className="bg-brand-dark border border-brand-darker rounded-xl p-5 h-full"
      title="Acquisition red flag if one tech runs the majority of revenue."
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-gray-500 text-xs font-semibold tracking-wide uppercase">
          Bus Factor
        </div>
        <span
          className={`text-[10px] font-bold px-2 py-1 rounded-full ${
            isRisk
              ? "bg-brand-red/20 text-brand-red"
              : "bg-gray-500/20 text-gray-400"
          }`}
        >
          {isRisk ? "ACQUISITION RISK" : "OK"}
        </span>
      </div>

      <div className="text-2xl lg:text-3xl font-black text-white">{top.tech_name}</div>
      <div className="text-brand-red font-bold text-sm mt-1">
        {top.pct_of_total}% of jobs ({top.jobs})
      </div>

      {rest.length > 0 && (
        <div className="border-t border-brand-darker mt-4 pt-3 space-y-1">
          {rest.slice(0, 2).map((t) => (
            <div key={t.tech_name} className="flex justify-between text-xs text-gray-400">
              <span>{t.tech_name}</span>
              <span>
                {t.pct_of_total}% ({t.jobs})
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
