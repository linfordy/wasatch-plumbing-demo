import type { MembershipResult } from "@/lib/kpi-derivations";

interface Props {
  membership: MembershipResult;
}

function formatDollars(cents: number): string {
  return `$${Math.round(cents / 100).toLocaleString("en-US")}`;
}

export function MembershipCard({ membership }: Props) {
  if (membership.status === "field_missing") {
    return (
      <div className="bg-brand-dark border border-brand-darker rounded-xl p-5 h-full">
        <div className="text-gray-500 text-xs font-semibold tracking-wide mb-2 uppercase">
          Membership / Recurring
        </div>
        <div className="text-yellow-400 text-sm font-semibold mt-2">
          ⚠ Not yet wired
        </div>
        <div className="text-gray-500 text-xs mt-2 leading-relaxed">
          The membership program isn&apos;t detectable in HouseCall Pro tags or notes
          yet. Linfordy is investigating the right field to read from.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-dark border border-brand-darker rounded-xl p-5 h-full">
      <div className="text-gray-500 text-xs font-semibold tracking-wide mb-2 uppercase">
        Membership / Recurring
      </div>
      <div className="text-2xl lg:text-3xl font-black text-white">
        {membership.count?.toLocaleString() ?? "—"}
      </div>
      <div className="text-brand-red font-bold text-sm mt-1">
        {membership.projected_mrr !== null
          ? `${formatDollars(membership.projected_mrr)} / mo projected MRR`
          : "—"}
      </div>
      <div className="text-gray-500 text-xs mt-2">
        Recurring-revenue tilt is the PE acquisition lever.
      </div>
    </div>
  );
}
