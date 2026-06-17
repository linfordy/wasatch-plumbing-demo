"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  GoalProgress,
  TechUtilization,
  CustomerMix,
  MembershipResult,
} from "@/lib/kpi-derivations";
import { GoalBar } from "@/components/admin/GoalBar";
import { KpiTile } from "@/components/admin/KpiTile";
import { BusFactorCard } from "@/components/admin/BusFactorCard";
import { MembershipCard } from "@/components/admin/MembershipCard";
import { RepeatNewReferralBar } from "@/components/admin/RepeatNewReferralBar";
import { CollapsibleSection } from "@/components/admin/CollapsibleSection";

interface DashboardData {
  overview: {
    total_jobs: number;
    total_estimates: number;
    total_leads: number;
    total_revenue: number;
    jobs_completed: number;
    jobs_scheduled: number;
  };
  funnel: { stage: string; count: number }[];
  by_source: { source: string; leads: number; jobs: number; completed: number; revenue: number }[];
  recent_jobs: {
    id: string;
    customer_name: string;
    description: string;
    status: string;
    amount: number;
    date: string;
    lead_source: string;
  }[];
  kpis: {
    revenue_mtd: number;
    revenue_last_30d: number;
    revenue_last_90d: number;
    jobs_completed_period: number;
    aov_period: number | null;
    customer_mix: CustomerMix;
    tech_utilization: TechUtilization[];
    membership: MembershipResult;
    goal_progress: GoalProgress;
    goals: { revenue_good: number; revenue_great: number; revenue_great_plus: number };
  };
  cached_at: string;
}

const ADMIN_PASSWORD = "larrys2026";

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    scheduled: "bg-blue-500/20 text-blue-400",
    "in progress": "bg-yellow-500/20 text-yellow-400",
    "complete rated": "bg-green-500/20 text-green-400",
    "complete unrated": "bg-green-500/20 text-green-400",
    "needs scheduling": "bg-orange-500/20 text-orange-400",
    unscheduled: "bg-gray-500/20 text-gray-400",
  };
  const color = colors[status] || "bg-gray-500/20 text-gray-400";

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${color}`}>
      {status}
    </span>
  );
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState<string>("30");
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = days === "all" ? "" : `?days=${days}`;
      const res = await fetch(`/api/admin/funnel${params}`);
      if (!res.ok) {
        setError(`HouseCall Pro request failed (HTTP ${res.status})`);
        setLoading(false);
        return;
      }
      const json = await res.json();
      if (json.error) {
        setError(json.error);
        setLoading(false);
        return;
      }
      setData(json);
    } catch (err) {
      console.error("Failed to fetch dashboard:", err);
      setError(err instanceof Error ? err.message : "Unknown fetch error");
    }
    setLoading(false);
  }, [days]);

  useEffect(() => {
    const saved = localStorage.getItem("larrys_admin");
    if (saved === ADMIN_PASSWORD) setAuthenticated(true);
  }, []);

  useEffect(() => {
    if (authenticated) fetchData();
  }, [authenticated, days, fetchData]);

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 pt-24">
        <div className="bg-brand-dark border border-brand-darker rounded-xl p-8 w-full max-w-sm">
          <h1 className="text-xl font-bold mb-4 text-center">Admin Dashboard</h1>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (password === ADMIN_PASSWORD) {
                localStorage.setItem("larrys_admin", password);
                setAuthenticated(true);
              }
            }}
          >
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full bg-brand-black border border-brand-darker rounded-lg px-4 py-3 text-sm text-white mb-4 focus:border-brand-red focus:outline-none"
            />
            <button className="w-full bg-brand-red text-white py-3 rounded-lg font-bold text-sm">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="text-gray-400">Loading dashboard data from HouseCall Pro...</div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 pt-24">
        <div className="bg-brand-dark border border-yellow-500/40 rounded-xl p-8 w-full max-w-md text-center">
          <div className="text-yellow-400 font-bold text-lg mb-2">
            Couldn&apos;t reach HouseCall Pro
          </div>
          <div className="text-gray-400 text-sm mb-6">{error}</div>
          <button
            onClick={() => fetchData()}
            className="bg-brand-red text-white font-bold py-3 px-6 rounded-lg hover:bg-brand-red/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const maxFunnel = Math.max(...data.funnel.map((f) => f.count), 1);

  return (
    <div className="min-h-screen pt-28 pb-20 px-6 lg:px-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            HouseCall Pro data · Cached{" "}
            {new Date(data.cached_at).toLocaleTimeString()}
          </p>
        </div>
        <div className="flex gap-2">
          {["7", "30", "90", "all"].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                days === d
                  ? "bg-brand-red text-white"
                  : "bg-brand-dark text-gray-400 hover:text-white"
              }`}
            >
              {d === "all" ? "All Time" : `${d}d`}
            </button>
          ))}
        </div>
      </div>

      {/* HCP failure banner — shows stale cached data with a warning + retry */}
      {error && (
        <div className="bg-yellow-500/10 border border-yellow-500/40 text-yellow-200 rounded-xl p-4 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="font-bold text-sm">Couldn&apos;t refresh from HouseCall Pro</div>
            <div className="text-xs text-yellow-200/80 mt-1">
              {error} · Showing cached data from{" "}
              {new Date(data.cached_at).toLocaleTimeString()}
            </div>
          </div>
          <button
            onClick={() => fetchData()}
            className="bg-yellow-500 text-black text-sm font-bold px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Goal Bar — always MTD */}
      <GoalBar
        revenueMtdCents={data.kpis.revenue_mtd}
        goals={data.kpis.goals}
        progress={data.kpis.goal_progress}
      />

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiTile
          label="Revenue (period)"
          value={formatCents(data.overview.total_revenue)}
        />
        <KpiTile
          label="Jobs Completed"
          value={data.overview.jobs_completed.toLocaleString()}
        />
        <KpiTile
          label="AOV"
          value={data.kpis.aov_period !== null ? formatCents(data.kpis.aov_period) : "—"}
        />
        <KpiTile
          label="Lead → Done"
          value={
            data.overview.total_leads > 0
              ? `${Math.round((data.overview.jobs_completed / data.overview.total_leads) * 100)}%`
              : "—"
          }
        />
      </div>

      {/* Strategic row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <BusFactorCard techs={data.kpis.tech_utilization} />
        <MembershipCard membership={data.kpis.membership} />
      </div>

      {/* Customer Mix */}
      <RepeatNewReferralBar mix={data.kpis.customer_mix} />

      {/* Funnel — collapsible */}
      <CollapsibleSection id="funnel" title="Lead-to-Job Funnel" defaultOpen>
        <div className="space-y-4">
          {data.funnel.map((stage, i) => {
            const prevCount = i > 0 ? data.funnel[i - 1].count : stage.count;
            const dropoff =
              prevCount > 0
                ? (((prevCount - stage.count) / prevCount) * 100).toFixed(0)
                : "0";
            return (
              <div key={stage.stage}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold">{stage.stage}</span>
                  <span className="text-gray-400">
                    {stage.count.toLocaleString()}
                    {i > 0 && prevCount > 0 && (
                      <span className="text-red-400 ml-2 text-xs">-{dropoff}%</span>
                    )}
                  </span>
                </div>
                <div className="h-6 bg-brand-black rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-red rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max((stage.count / maxFunnel) * 100, 2)}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CollapsibleSection>

      {/* Source Attribution — collapsible */}
      <CollapsibleSection id="by-source" title="Revenue by Source" defaultOpen>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs tracking-wide border-b border-brand-darker">
                <th className="text-left py-3 font-semibold">Source</th>
                <th className="text-right py-3 font-semibold">Leads</th>
                <th className="text-right py-3 font-semibold">Jobs</th>
                <th className="text-right py-3 font-semibold">Completed</th>
                <th className="text-right py-3 font-semibold">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {data.by_source.map((row) => (
                <tr key={row.source} className="border-b border-brand-darker/50">
                  <td className="py-3 font-semibold">{row.source}</td>
                  <td className="py-3 text-right text-gray-400">{row.leads}</td>
                  <td className="py-3 text-right text-gray-400">{row.jobs}</td>
                  <td className="py-3 text-right text-gray-400">{row.completed}</td>
                  <td className="py-3 text-right font-bold text-brand-red">
                    {formatCents(row.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CollapsibleSection>

      {/* Recent Jobs — collapsible, closed by default */}
      <CollapsibleSection id="recent-jobs" title="Recent Jobs" defaultOpen={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs tracking-wide border-b border-brand-darker">
                <th className="text-left py-3 font-semibold">Customer</th>
                <th className="text-left py-3 font-semibold">Service</th>
                <th className="text-left py-3 font-semibold">Source</th>
                <th className="text-left py-3 font-semibold">Status</th>
                <th className="text-right py-3 font-semibold">Amount</th>
                <th className="text-right py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.recent_jobs.map((job) => (
                <tr key={job.id} className="border-b border-brand-darker/50">
                  <td className="py-3 font-semibold">{job.customer_name}</td>
                  <td className="py-3 text-gray-400 max-w-[200px] truncate">
                    {job.description}
                  </td>
                  <td className="py-3 text-gray-400">{job.lead_source}</td>
                  <td className="py-3">
                    <StatusBadge status={job.status} />
                  </td>
                  <td className="py-3 text-right font-semibold">
                    {job.amount > 0 ? formatCents(job.amount) : "—"}
                  </td>
                  <td className="py-3 text-right text-gray-500">
                    {job.date
                      ? new Date(job.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CollapsibleSection>
    </div>
  );
}
