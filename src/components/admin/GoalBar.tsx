import type { GoalProgress } from "@/lib/kpi-derivations";

interface Props {
  revenueMtdCents: number;
  goals: { revenue_good: number; revenue_great: number; revenue_great_plus: number };
  progress: GoalProgress;
}

function formatDollars(cents: number): string {
  return `$${Math.round(cents / 100).toLocaleString("en-US")}`;
}

const TIER_LABEL: Record<GoalProgress["tier"], string> = {
  below_good: "Building toward a good month",
  good: "Past good month",
  great: "In great-month range",
  great_plus: "Past great-plus",
};

export function GoalBar({ revenueMtdCents, goals, progress }: Props) {
  // The bar maxes out at 125% of great_plus or current revenue, whichever is higher,
  // so even past great_plus stays readable.
  const max = Math.max(goals.revenue_great_plus * 1.25, revenueMtdCents);
  const pct = Math.min((revenueMtdCents / max) * 100, 100);

  const fillClass =
    progress.tier === "great_plus"
      ? "bg-brand-gold"
      : progress.tier === "great"
      ? "bg-brand-red shadow-[0_0_18px_rgba(196,30,30,0.6)]"
      : progress.tier === "good"
      ? "bg-brand-red"
      : "bg-gray-500";

  const subtitle =
    progress.tier === "great_plus"
      ? `${TIER_LABEL[progress.tier]} — keep going`
      : `${TIER_LABEL[progress.tier]} · ${formatDollars(progress.gap_to_next_cents)} to next tier`;

  return (
    <div className="bg-brand-dark border border-brand-darker rounded-xl p-6 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-1 mb-4">
        <div>
          <div className="text-gray-500 text-xs font-semibold tracking-wide uppercase mb-1">
            Revenue This Month
          </div>
          <div className="text-3xl lg:text-4xl font-black text-white">
            {formatDollars(revenueMtdCents)}
          </div>
        </div>
        <div className="text-sm text-gray-400">{subtitle}</div>
      </div>

      <div className="relative h-6 bg-brand-black rounded-full overflow-hidden">
        <div
          className={`h-full ${fillClass} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
        {/* Tier markers */}
        {[goals.revenue_good, goals.revenue_great, goals.revenue_great_plus].map((tier) => (
          <div
            key={tier}
            className="absolute top-0 bottom-0 w-px bg-white/40"
            style={{ left: `${Math.min((tier / max) * 100, 100)}%` }}
            aria-hidden="true"
          />
        ))}
      </div>

      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>$0</span>
        <span>Good {formatDollars(goals.revenue_good)}</span>
        <span>Great {formatDollars(goals.revenue_great)}</span>
        <span>Great+ {formatDollars(goals.revenue_great_plus)}</span>
      </div>
    </div>
  );
}
