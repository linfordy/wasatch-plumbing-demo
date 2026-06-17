import type { HcpJob } from "./hcp-types";

export const GOAL_GOOD_CENTS = 8_000_000;       // $80K
export const GOAL_GREAT_CENTS = 10_000_000;     // $100K
export const GOAL_GREAT_PLUS_CENTS = 12_000_000; // $120K

export type GoalTier = "below_good" | "good" | "great" | "great_plus";

export interface GoalProgress {
  tier: GoalTier;
  gap_to_next_cents: number;
}

export function computeGoalProgress(revenueMtdCents: number): GoalProgress {
  if (revenueMtdCents >= GOAL_GREAT_PLUS_CENTS) {
    return { tier: "great_plus", gap_to_next_cents: 0 };
  }
  if (revenueMtdCents >= GOAL_GREAT_CENTS) {
    return { tier: "great", gap_to_next_cents: GOAL_GREAT_PLUS_CENTS - revenueMtdCents };
  }
  if (revenueMtdCents >= GOAL_GOOD_CENTS) {
    return { tier: "good", gap_to_next_cents: GOAL_GREAT_CENTS - revenueMtdCents };
  }
  return { tier: "below_good", gap_to_next_cents: GOAL_GOOD_CENTS - revenueMtdCents };
}

export function computeAov(jobs: HcpJob[]): number | null {
  const completed = jobs.filter((j) => (j.work_status ?? "").includes("complete"));
  if (completed.length === 0) return null;
  const total = completed.reduce((sum, j) => sum + (j.total_amount ?? 0), 0);
  return Math.round(total / completed.length);
}

export interface TechUtilization {
  tech_name: string;
  jobs: number;
  pct_of_total: number;
}

export function computeTechUtilization(jobs: HcpJob[]): TechUtilization[] {
  if (jobs.length === 0) return [];

  const buckets = new Map<string, number>();
  for (const job of jobs) {
    const emp = job.assigned_employees?.[0];
    let name: string;
    if (!emp) {
      name = "Unassigned";
    } else if (!emp.first_name && !emp.last_name) {
      name = "Unknown";
    } else {
      name = `${emp.first_name ?? ""} ${emp.last_name ?? ""}`.trim();
    }
    buckets.set(name, (buckets.get(name) ?? 0) + 1);
  }

  const total = jobs.length;
  return Array.from(buckets.entries())
    .map(([tech_name, count]) => ({
      tech_name,
      jobs: count,
      pct_of_total: Math.round((count / total) * 10000) / 100, // 2 decimals
    }))
    .sort((a, b) => b.jobs - a.jobs);
}

// "referrel" is Justin's spelling in HCP (Customer Referrel) — verified in live data 2026-06-11
const REFERRAL_PATTERNS = ["referral", "referred", "referrel", "word of mouth", "wom"];

export function isReferralSource(source: string | undefined): boolean {
  if (!source) return false;
  const s = source.toLowerCase();
  return REFERRAL_PATTERNS.some((p) => s.includes(p));
}

export interface CustomerMix {
  repeat: number;
  new: number;
  referral: number;
}

export function computeCustomerMix(jobs: HcpJob[]): CustomerMix {
  // Track per-customer: repeat flag, referral flag, and how many times we've
  // seen this customer in the period (the fallback signal when jobs_count is
  // missing from the HCP payload).
  const seen = new Map<string, { repeat: boolean; referral: boolean; jobCountInPeriod: number }>();

  for (const job of jobs) {
    const id = job.customer?.id;
    if (!id) continue;

    const isRepeat = (job.customer?.jobs_count ?? 0) > 1;
    const referralSource = job.customer?.lead_source ?? job.lead_source;
    const isReferral = isReferralSource(referralSource);

    const existing = seen.get(id);
    if (existing) {
      existing.repeat = existing.repeat || isRepeat;
      existing.referral = existing.referral || isReferral;
      existing.jobCountInPeriod++;
    } else {
      seen.set(id, { repeat: isRepeat, referral: isReferral, jobCountInPeriod: 1 });
    }
  }

  const mix: CustomerMix = { repeat: 0, new: 0, referral: 0 };
  for (const flags of seen.values()) {
    // Fallback: if jobs_count was missing but we've seen this customer
    // in 2+ jobs within the fetched window, treat as repeat.
    const isRepeatEffective = flags.repeat || flags.jobCountInPeriod > 1;
    if (flags.referral) mix.referral++;
    else if (isRepeatEffective) mix.repeat++;
    else mix.new++;
  }
  return mix;
}

// Placeholder MRR rate (cents). Replace with real membership price after
// Justin confirms. Used for the v1 "projected MRR" display.
const MEMBERSHIP_PRICE_CENTS = 999;

// Real HCP signal discovered 2026-06-09: "Potential Member" is a job-level tag
// applied by Justin's team to flag prospects for the membership programme.
// This is a prospect count (interest signal), not confirmed active members.
// When Justin activates a formal membership product, update this tag list.
export const MEMBERSHIP_JOB_TAGS = ["potential member"];

export interface MembershipResult {
  count: number | null;
  projected_mrr: number | null;
  status: "available" | "field_missing";
}

/**
 * Detect membership prospects from job tags.
 *
 * HouseCall Pro signal: jobs tagged "Potential Member" (case-insensitive).
 * Counts unique customers across matching jobs so one customer with two
 * tagged jobs is counted once.
 */
export function detectMembership(jobs: HcpJob[]): MembershipResult {
  const memberCustomerIds = new Set<string>();
  for (const job of jobs) {
    const jobTags = (job.tags ?? []).map((t) => t.toLowerCase());
    const isMatch = jobTags.some((t) => MEMBERSHIP_JOB_TAGS.includes(t));
    if (isMatch) {
      // Use job ID as fallback key when customer ID is missing
      const key = job.customer?.id ?? job.id ?? "unknown";
      memberCustomerIds.add(key);
    }
  }
  const count = memberCustomerIds.size;
  if (count === 0) {
    return { count: null, projected_mrr: null, status: "field_missing" };
  }
  return {
    count,
    projected_mrr: count * MEMBERSHIP_PRICE_CENTS,
    status: "available",
  };
}
