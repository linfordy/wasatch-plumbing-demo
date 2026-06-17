import type { CustomerMix } from "@/lib/kpi-derivations";

interface Props {
  mix: CustomerMix;
}

export function RepeatNewReferralBar({ mix }: Props) {
  const total = mix.repeat + mix.new + mix.referral;

  if (total === 0) {
    return (
      <div className="bg-brand-dark border border-brand-darker rounded-xl p-6 mb-8">
        <div className="text-gray-500 text-xs font-semibold tracking-wide mb-2 uppercase">
          Customer Mix
        </div>
        <div className="text-gray-400 text-sm">No customer data in this period.</div>
      </div>
    );
  }

  const repeatPct = Math.round((mix.repeat / total) * 100);
  const newPct = Math.round((mix.new / total) * 100);
  const referralPct = 100 - repeatPct - newPct; // ensure sums to 100

  return (
    <div className="bg-brand-dark border border-brand-darker rounded-xl p-6 mb-8">
      <div className="flex justify-between items-end mb-3">
        <div>
          <div className="text-gray-500 text-xs font-semibold tracking-wide uppercase mb-1">
            Customer Mix
          </div>
          <div className="text-sm text-gray-300">
            Repeat <span className="font-bold text-white">{repeatPct}%</span> ·
            New <span className="font-bold text-white"> {newPct}%</span> ·
            Referral <span className="font-bold text-white"> {referralPct}%</span>
          </div>
        </div>
        <div className="text-xs text-gray-500">Target: 75% / 20% / 5%</div>
      </div>

      <div className="flex h-4 rounded-full overflow-hidden bg-brand-black">
        <div className="bg-brand-red" style={{ width: `${repeatPct}%` }} title={`Repeat ${repeatPct}%`} />
        <div className="bg-gray-400" style={{ width: `${newPct}%` }} title={`New ${newPct}%`} />
        <div className="bg-brand-gold" style={{ width: `${referralPct}%` }} title={`Referral ${referralPct}%`} />
      </div>

      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>{mix.repeat} repeat</span>
        <span>{mix.new} new</span>
        <span>{mix.referral} referral</span>
      </div>
    </div>
  );
}
