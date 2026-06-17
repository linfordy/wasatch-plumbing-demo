import { describe, it, expect } from "vitest";
import { computeGoalProgress, computeAov, computeTechUtilization, computeCustomerMix, isReferralSource, detectMembership, MEMBERSHIP_JOB_TAGS } from "./kpi-derivations";
import type { HcpJob } from "./hcp-types";

describe("computeGoalProgress", () => {
  it("classifies $0 as below_good", () => {
    const r = computeGoalProgress(0);
    expect(r.tier).toBe("below_good");
    expect(r.gap_to_next_cents).toBe(8_000_000);
  });

  it("classifies $50k as below_good with $30k gap", () => {
    const r = computeGoalProgress(5_000_000);
    expect(r.tier).toBe("below_good");
    expect(r.gap_to_next_cents).toBe(3_000_000);
  });

  it("classifies $80k exactly as good", () => {
    const r = computeGoalProgress(8_000_000);
    expect(r.tier).toBe("good");
    expect(r.gap_to_next_cents).toBe(2_000_000);
  });

  it("classifies $100k exactly as great", () => {
    const r = computeGoalProgress(10_000_000);
    expect(r.tier).toBe("great");
    expect(r.gap_to_next_cents).toBe(2_000_000);
  });

  it("classifies $120k exactly as great_plus", () => {
    const r = computeGoalProgress(12_000_000);
    expect(r.tier).toBe("great_plus");
    expect(r.gap_to_next_cents).toBe(0);
  });

  it("classifies $200k as great_plus with zero gap", () => {
    const r = computeGoalProgress(20_000_000);
    expect(r.tier).toBe("great_plus");
    expect(r.gap_to_next_cents).toBe(0);
  });
});

describe("computeAov", () => {
  it("returns null when no jobs", () => {
    expect(computeAov([])).toBeNull();
  });

  it("returns null when no completed jobs", () => {
    const jobs: HcpJob[] = [
      { work_status: "scheduled", total_amount: 50000 },
      { work_status: "in progress", total_amount: 80000 },
    ];
    expect(computeAov(jobs)).toBeNull();
  });

  it("averages only completed jobs", () => {
    const jobs: HcpJob[] = [
      { work_status: "complete rated", total_amount: 50000 },
      { work_status: "complete unrated", total_amount: 100000 },
      { work_status: "scheduled", total_amount: 999999 },
    ];
    expect(computeAov(jobs)).toBe(75000); // (50000 + 100000) / 2
  });

  it("treats missing total_amount as zero", () => {
    const jobs: HcpJob[] = [
      { work_status: "complete rated", total_amount: 100000 },
      { work_status: "complete rated" }, // missing amount
    ];
    expect(computeAov(jobs)).toBe(50000); // (100000 + 0) / 2
  });

  it("matches 'complete' anywhere in the status string", () => {
    const jobs: HcpJob[] = [
      { work_status: "complete rated", total_amount: 60000 },
      { work_status: "complete unrated", total_amount: 80000 },
    ];
    expect(computeAov(jobs)).toBe(70000);
  });
});

describe("computeTechUtilization", () => {
  it("returns empty array for no jobs", () => {
    expect(computeTechUtilization([])).toEqual([]);
  });

  it("groups jobs by first assigned employee", () => {
    const jobs: HcpJob[] = [
      { assigned_employees: [{ id: "e1", first_name: "Evan", last_name: "Smith" }] },
      { assigned_employees: [{ id: "e1", first_name: "Evan", last_name: "Smith" }] },
      { assigned_employees: [{ id: "e2", first_name: "Sam", last_name: "Stone" }] },
    ];
    const result = computeTechUtilization(jobs);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ tech_name: "Evan Smith", jobs: 2, pct_of_total: 66.67 });
    expect(result[1]).toEqual({ tech_name: "Sam Stone", jobs: 1, pct_of_total: 33.33 });
  });

  it("buckets jobs without assigned employee as Unassigned", () => {
    const jobs: HcpJob[] = [
      { assigned_employees: [{ id: "e1", first_name: "Evan", last_name: "Smith" }] },
      {},
      { assigned_employees: [] },
    ];
    const result = computeTechUtilization(jobs);
    expect(result).toHaveLength(2);
    const unassigned = result.find((r) => r.tech_name === "Unassigned");
    expect(unassigned).toEqual({ tech_name: "Unassigned", jobs: 2, pct_of_total: 66.67 });
  });

  it("uses only first assigned employee when multiple", () => {
    const jobs: HcpJob[] = [
      {
        assigned_employees: [
          { id: "e1", first_name: "Evan", last_name: "Smith" },
          { id: "e2", first_name: "Sam", last_name: "Stone" },
        ],
      },
    ];
    const result = computeTechUtilization(jobs);
    expect(result).toHaveLength(1);
    expect(result[0].tech_name).toBe("Evan Smith");
  });

  it("handles missing names gracefully", () => {
    const jobs: HcpJob[] = [
      { assigned_employees: [{ id: "e1" }] },
    ];
    const result = computeTechUtilization(jobs);
    expect(result[0].tech_name).toBe("Unknown");
  });
});

describe("isReferralSource", () => {
  it("matches referral terms case-insensitively", () => {
    expect(isReferralSource("Referral")).toBe(true);
    expect(isReferralSource("REFERRED by friend")).toBe(true);
    expect(isReferralSource("Word of mouth")).toBe(true);
    expect(isReferralSource("WOM")).toBe(true);
    expect(isReferralSource("Customer Referrel")).toBe(true);
  });
  it("returns false for unrelated sources", () => {
    expect(isReferralSource("Google")).toBe(false);
    expect(isReferralSource("LarrysWebsite")).toBe(false);
    expect(isReferralSource(undefined)).toBe(false);
    expect(isReferralSource("")).toBe(false);
  });
});

describe("computeCustomerMix", () => {
  it("returns zeros for no jobs", () => {
    expect(computeCustomerMix([])).toEqual({ repeat: 0, new: 0, referral: 0 });
  });

  it("classifies repeat / new / referral correctly", () => {
    const jobs: HcpJob[] = [
      { customer: { id: "c1", jobs_count: 3 } },
      { customer: { id: "c2", jobs_count: 1 } },
      { customer: { id: "c3", lead_source: "Referral", jobs_count: 1 } },
    ];
    expect(computeCustomerMix(jobs)).toEqual({ repeat: 1, new: 1, referral: 1 });
  });

  it("counts each customer once even with multiple jobs", () => {
    const jobs: HcpJob[] = [
      { customer: { id: "c1", jobs_count: 5 } },
      { customer: { id: "c1", jobs_count: 5 } },
      { customer: { id: "c1", jobs_count: 5 } },
    ];
    expect(computeCustomerMix(jobs)).toEqual({ repeat: 1, new: 0, referral: 0 });
  });

  it("referral classification beats repeat classification", () => {
    const jobs: HcpJob[] = [
      { customer: { id: "c1", jobs_count: 10, lead_source: "Referred" } },
    ];
    expect(computeCustomerMix(jobs)).toEqual({ repeat: 0, new: 0, referral: 1 });
  });

  it("uses job.lead_source as fallback when customer.lead_source missing", () => {
    const jobs: HcpJob[] = [
      { lead_source: "Word of mouth", customer: { id: "c1", jobs_count: 1 } },
    ];
    expect(computeCustomerMix(jobs)).toEqual({ repeat: 0, new: 0, referral: 1 });
  });

  it("missing jobs_count + only one job in period means new", () => {
    const jobs: HcpJob[] = [
      { customer: { id: "c1" } },
    ];
    expect(computeCustomerMix(jobs)).toEqual({ repeat: 0, new: 1, referral: 0 });
  });

  it("missing jobs_count + seen in multiple jobs falls back to repeat", () => {
    const jobs: HcpJob[] = [
      { customer: { id: "c1" } },
      { customer: { id: "c1" } },
      { customer: { id: "c2" } },
    ];
    expect(computeCustomerMix(jobs)).toEqual({ repeat: 1, new: 1, referral: 0 });
  });

  it("skips jobs with no customer.id", () => {
    const jobs: HcpJob[] = [
      { customer: {} },
      { customer: undefined },
    ];
    expect(computeCustomerMix(jobs)).toEqual({ repeat: 0, new: 0, referral: 0 });
  });
});

describe("detectMembership", () => {
  it("exports MEMBERSHIP_JOB_TAGS constant containing 'potential member'", () => {
    expect(MEMBERSHIP_JOB_TAGS).toContain("potential member");
  });

  it("returns field_missing for empty job list", () => {
    expect(detectMembership([])).toEqual({
      count: null,
      projected_mrr: null,
      status: "field_missing",
    });
  });

  it("returns field_missing when no job has a membership tag", () => {
    const jobs: HcpJob[] = [
      { id: "j1", tags: ["Campaigns"], customer: { id: "c1" } },
      { id: "j2", tags: ["callback"], customer: { id: "c2" } },
    ];
    expect(detectMembership(jobs)).toEqual({
      count: null,
      projected_mrr: null,
      status: "field_missing",
    });
  });

  it("counts unique customers across jobs tagged 'Potential Member'", () => {
    const jobs: HcpJob[] = [
      { id: "j1", tags: ["Potential Member"], customer: { id: "c1" } },
      { id: "j2", tags: ["Potential Member"], customer: { id: "c2" } },
      { id: "j3", tags: ["Campaigns"], customer: { id: "c3" } },
    ];
    const result = detectMembership(jobs);
    expect(result.count).toBe(2);
    expect(result.status).toBe("available");
  });

  it("is case-insensitive for the tag match", () => {
    const jobs: HcpJob[] = [
      { id: "j1", tags: ["potential member"], customer: { id: "c1" } },
      { id: "j2", tags: ["POTENTIAL MEMBER"], customer: { id: "c2" } },
    ];
    expect(detectMembership(jobs).count).toBe(2);
  });

  it("deduplicates: same customer with two tagged jobs counts as one", () => {
    const jobs: HcpJob[] = [
      { id: "j1", tags: ["Potential Member"], customer: { id: "c1" } },
      { id: "j2", tags: ["Potential Member"], customer: { id: "c1" } },
    ];
    expect(detectMembership(jobs).count).toBe(1);
  });

  it("falls back to job ID when customer.id is missing", () => {
    const jobs: HcpJob[] = [
      { id: "j1", tags: ["Potential Member"] }, // no customer
      { id: "j2", tags: ["Potential Member"] }, // different job, no customer
    ];
    expect(detectMembership(jobs).count).toBe(2);
  });

  it("calculates projected_mrr as count * 999 cents", () => {
    // $9.99/mo placeholder until Justin confirms the membership price
    const jobs: HcpJob[] = [
      { id: "j1", tags: ["Potential Member"], customer: { id: "c1" } },
      { id: "j2", tags: ["Potential Member"], customer: { id: "c2" } },
    ];
    expect(detectMembership(jobs).projected_mrr).toBe(2 * 999);
  });
});
