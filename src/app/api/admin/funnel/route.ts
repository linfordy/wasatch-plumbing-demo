import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  computeGoalProgress,
  computeAov,
  computeTechUtilization,
  computeCustomerMix,
  detectMembership,
  GOAL_GOOD_CENTS,
  GOAL_GREAT_CENTS,
  GOAL_GREAT_PLUS_CENTS,
} from "@/lib/kpi-derivations";
import type { GoalProgress, TechUtilization, CustomerMix, MembershipResult } from "@/lib/kpi-derivations";
import type { HcpJob } from "@/lib/hcp-types";

const API_BASE = "https://api.housecallpro.com";
const API_KEY = process.env.HOUSECALL_PRO_API_KEY;

interface CacheEntry {
  data: unknown;
  cached_at: number;
}

const cache: Record<string, CacheEntry> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached(key: string): unknown | null {
  const entry = cache[key];
  if (!entry) return null;
  if (Date.now() - entry.cached_at > CACHE_TTL) {
    delete cache[key];
    return null;
  }
  return entry.data;
}

function setCache(key: string, data: unknown): void {
  cache[key] = { data, cached_at: Date.now() };
}

function sumRevenueWithinDays(jobs: Record<string, unknown>[], days: number): number {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  let total = 0;
  for (const job of jobs) {
    const status = (job.work_status as string) ?? "";
    if (!status.includes("complete")) continue;
    const schedule = job.schedule as Record<string, string> | undefined;
    const dateStr = schedule?.scheduled_start || (job.created_at as string);
    if (!dateStr) continue;
    if (new Date(dateStr) >= cutoff) {
      total += (job.total_amount as number) ?? 0;
    }
  }
  return total;
}

function sumRevenueThisMonth(jobs: Record<string, unknown>[]): number {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  let total = 0;
  for (const job of jobs) {
    const status = (job.work_status as string) ?? "";
    if (!status.includes("complete")) continue;
    const schedule = job.schedule as Record<string, string> | undefined;
    const dateStr = schedule?.scheduled_start || (job.created_at as string);
    if (!dateStr) continue;
    if (new Date(dateStr) >= startOfMonth) {
      total += (job.total_amount as number) ?? 0;
    }
  }
  return total;
}

async function fetchPageFromHCP(endpoint: string, page: number, pageSize: number = 200): Promise<{ items: unknown[]; totalPages: number; totalItems: number }> {
  const res = await fetch(`${API_BASE}/${endpoint}?page=${page}&page_size=${pageSize}`, {
    headers: { Authorization: `Token ${API_KEY}` },
  });

  if (!res.ok) {
    console.error(`HCP fetch failed: ${endpoint} page ${page}`, res.status);
    return { items: [], totalPages: 0, totalItems: 0 };
  }

  const data = await res.json();
  const items = data[endpoint] || data.customers || data.jobs || data.estimates || data.leads || [];
  return { items, totalPages: data.total_pages || 1, totalItems: data.total_items || 0 };
}

async function fetchRecentFromHCP(endpoint: string, maxPages: number = 5): Promise<{ items: unknown[]; totalItems: number }> {
  const cacheKey = `hcp_${endpoint}_${maxPages}`;
  const cached = getCached(cacheKey);
  if (cached) return cached as { items: unknown[]; totalItems: number };

  // Fetch page 1 first to get total pages
  const first = await fetchPageFromHCP(endpoint, 1);
  if (first.items.length === 0) return { items: [], totalItems: 0 };

  const pagesToFetch = Math.min(first.totalPages, maxPages);

  // Fetch remaining pages in parallel
  if (pagesToFetch > 1) {
    const promises = [];
    for (let p = 2; p <= pagesToFetch; p++) {
      promises.push(fetchPageFromHCP(endpoint, p));
    }
    const results = await Promise.all(promises);
    const allItems = [...first.items, ...results.flatMap(r => r.items)];
    const result = { items: allItems, totalItems: first.totalItems };
    setCache(cacheKey, result);
    return result;
  }

  const result = { items: first.items, totalItems: first.totalItems };
  setCache(cacheKey, result);
  return result;
}

interface DashboardData {
  overview: {
    total_customers: number;
    total_jobs: number;
    total_estimates: number;
    total_leads: number;
    total_revenue: number;
    jobs_completed: number;
    jobs_scheduled: number;
  };
  funnel: {
    stage: string;
    count: number;
  }[];
  by_source: {
    source: string;
    leads: number;
    jobs: number;
    completed: number;
    revenue: number;
  }[];
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
    goals: {
      revenue_good: number;
      revenue_great: number;
      revenue_great_plus: number;
    };
  };
  cached_at: string;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!API_KEY) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  const searchParams = request.nextUrl.searchParams;
  const days = searchParams.get("days");
  const cacheKey = `dashboard_${days || "all"}`;

  const cached = getCached(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    // Fetch limited pages to stay within Vercel's function timeout
    // Jobs: 5 pages = ~1000 most recent jobs (plenty for dashboard)
    // Leads & estimates: 3 pages each (usually fewer total)
    const [jobsResult, leadsResult, estimatesResult] = await Promise.all([
      fetchRecentFromHCP("jobs", 5),
      fetchRecentFromHCP("leads", 3),
      fetchRecentFromHCP("estimates", 3),
    ]);

    const jobs = jobsResult.items as Record<string, unknown>[];
    const leads = leadsResult.items as Record<string, unknown>[];
    const estimates = estimatesResult.items as Record<string, unknown>[];

    // Apply time filter
    const cutoff = days ? new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000) : null;

    const filteredJobs = cutoff
      ? jobs.filter((j) => {
          const schedule = j.schedule as Record<string, string> | undefined;
          const date = schedule?.scheduled_start || (j.created_at as string);
          return date && new Date(date) >= cutoff;
        })
      : jobs;

    const filteredLeads = cutoff
      ? leads.filter((l) => new Date(l.created_at as string) >= cutoff)
      : leads;

    // Job status counts
    const statusCounts: Record<string, number> = {};
    let totalRevenue = 0;
    let completedCount = 0;
    let scheduledCount = 0;

    for (const job of filteredJobs) {
      const status = (job.work_status as string) || "unknown";
      statusCounts[status] = (statusCounts[status] || 0) + 1;
      const amount = (job.total_amount as number) || 0;
      totalRevenue += amount;

      if (status.includes("complete")) completedCount++;
      if (status === "scheduled") scheduledCount++;
    }

    // Funnel stages
    const funnel = [
      { stage: "Leads", count: filteredLeads.length },
      { stage: "Estimates", count: estimates.length },
      { stage: "Scheduled", count: scheduledCount },
      { stage: "Completed", count: completedCount },
    ];

    // Revenue by source
    const sourceMap: Record<string, { leads: number; jobs: number; completed: number; revenue: number }> = {};

    for (const lead of filteredLeads) {
      const source = (lead.lead_source as string) || "Unknown";
      if (!sourceMap[source]) sourceMap[source] = { leads: 0, jobs: 0, completed: 0, revenue: 0 };
      sourceMap[source].leads++;
    }

    for (const job of filteredJobs) {
      const customer = job.customer as Record<string, unknown> | undefined;
      const source = (customer?.lead_source as string) || (job.lead_source as string) || "Unknown";
      if (!sourceMap[source]) sourceMap[source] = { leads: 0, jobs: 0, completed: 0, revenue: 0 };
      sourceMap[source].jobs++;
      const amount = (job.total_amount as number) || 0;
      if ((job.work_status as string)?.includes("complete")) {
        sourceMap[source].completed++;
        sourceMap[source].revenue += amount;
      }
    }

    const bySource = Object.entries(sourceMap)
      .map(([source, data]) => ({ source, ...data }))
      .sort((a, b) => b.revenue - a.revenue);

    // Recent jobs
    const recentJobs = filteredJobs
      .sort((a, b) => {
        const dateA = (a.created_at as string) || "";
        const dateB = (b.created_at as string) || "";
        return dateB.localeCompare(dateA);
      })
      .slice(0, 25)
      .map((job) => {
        const customer = job.customer as Record<string, string> | undefined;
        const schedule = job.schedule as Record<string, string> | undefined;
        return {
          id: job.id as string,
          customer_name: customer ? `${customer.first_name || ""} ${customer.last_name || ""}`.trim() : "Unknown",
          description: (job.description as string) || "",
          status: (job.work_status as string) || "unknown",
          amount: (job.total_amount as number) || 0,
          date: schedule?.scheduled_start || (job.created_at as string) || "",
          lead_source: (customer?.lead_source as string) || "Unknown",
        };
      });

    const filteredHcpJobs = filteredJobs as unknown as HcpJob[];

    const revenueMtd = sumRevenueThisMonth(jobs);
    const revenueLast30 = sumRevenueWithinDays(jobs, 30);
    const revenueLast90 = sumRevenueWithinDays(jobs, 90);

    const kpis = {
      revenue_mtd: revenueMtd,
      revenue_last_30d: revenueLast30,
      revenue_last_90d: revenueLast90,
      jobs_completed_period: completedCount,
      aov_period: computeAov(filteredHcpJobs),
      customer_mix: computeCustomerMix(filteredHcpJobs),
      tech_utilization: computeTechUtilization(filteredHcpJobs),
      membership: detectMembership(filteredHcpJobs),
      goal_progress: computeGoalProgress(revenueMtd),
      goals: {
        revenue_good: GOAL_GOOD_CENTS,
        revenue_great: GOAL_GREAT_CENTS,
        revenue_great_plus: GOAL_GREAT_PLUS_CENTS,
      },
    };

    const dashboard: DashboardData = {
      overview: {
        total_customers: 0, // We don't fetch all customers to save API calls
        total_jobs: filteredJobs.length,
        total_estimates: estimates.length,
        total_leads: filteredLeads.length,
        total_revenue: totalRevenue,
        jobs_completed: completedCount,
        jobs_scheduled: scheduledCount,
      },
      funnel,
      by_source: bySource,
      recent_jobs: recentJobs,
      kpis,
      cached_at: new Date().toISOString(),
    };

    setCache(cacheKey, dashboard);
    return NextResponse.json(dashboard);
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
