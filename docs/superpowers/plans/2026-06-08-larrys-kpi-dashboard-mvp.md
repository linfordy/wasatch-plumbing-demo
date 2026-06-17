# Larry's Plumbing KPI Dashboard MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the existing `/admin` page into a live KPI scoreboard that automates Justin Zmolik's Excel KPI tracker (his #1 explicit ask in discovery).

**Architecture:** Single Next.js 16 app, no new infra. Extend the existing `/api/admin/funnel` route with a new `kpis` block computed from already-fetched HouseCall Pro data. Restructure `/admin/page.tsx` into a scoreboard hero + collapsible operational sections. New pure derivation library is unit-tested with Vitest (first tests in the repo).

**Tech Stack:** Next.js 16 (App Router, React 19), TypeScript 5, Tailwind CSS v4 (CSS-based @theme), Framer Motion 12, Vitest (new, this plan).

**Spec:** `docs/superpowers/specs/2026-06-08-larrys-kpi-dashboard-mvp-design.md`

**Critical context for the implementer:**

- **Read `AGENTS.md` and `CLAUDE.md` at the repo root before writing any code.** Next.js 16 has breaking changes — dynamic route params are Promises (different from 14/15). Tailwind v4 reads colors from `@theme` in `globals.css`, not from `tailwind.config.ts`.
- **HCP job amounts are in CENTS.** 8900 = $89.00. The display layer divides by 100; derivations stay in cents.
- **HCP API is slow.** 5-6 seconds per page of 200 records. The existing route caches for 5 minutes — preserve that cache; do NOT add more HCP calls.
- **The existing `/admin` page is live in production** at https://larrysplumbingservice.com/admin (password `larrys2026`). Every PR must preserve the existing funnel / source-table / recent-jobs sections. Auth is unchanged.
- **Brand colors** (already in `src/app/globals.css` `@theme`): `bg-brand-red` (#c41e1e), `bg-brand-black` (#0a0a0a) for page bg, `bg-brand-dark` (#111111) for cards, `bg-brand-darker` (#1a1a1a) for borders, `text-brand-gold` (#f59e0b) for the "great+" goal tier.
- **Justin's goal thresholds** are hardcoded from synthesis: $80K = good month, $100K = great month lower, $120K = great+ upper. In cents: `8_000_000 / 10_000_000 / 12_000_000`.
- **TDD discipline:** every derivation gets a failing test first, then minimal implementation, then commit. Do not skip the "run the test and watch it fail" step.

---

## File Structure

**New files:**

| Path | Responsibility |
|---|---|
| `vitest.config.ts` | Vitest test runner config |
| `src/lib/hcp-types.ts` | Minimal `HcpJob`, `HcpLead`, `HcpCustomer` types — just enough to replace `Record<string, unknown>` casts in the API route |
| `src/lib/kpi-derivations.ts` | Pure derivation functions: `computeGoalProgress`, `computeAov`, `computeTechUtilization`, `computeCustomerMix`, `detectMembership` |
| `src/lib/kpi-derivations.test.ts` | Vitest unit tests for the derivations |
| `src/components/admin/CollapsibleSection.tsx` | Wrapper with chevron toggle, Framer Motion height animation, localStorage state persistence |
| `src/components/admin/KpiTile.tsx` | Reusable label / big number / optional sublabel card |
| `src/components/admin/GoalBar.tsx` | Full-width revenue progress bar with $80K / $100K / $120K tier markers |
| `src/components/admin/BusFactorCard.tsx` | Top tech + % + next two techs, warning chip if >80% |
| `src/components/admin/MembershipCard.tsx` | Two render modes from `membership.status` (`"available"` shows count + MRR; `"field_missing"` shows the "not yet wired" notice) |
| `src/components/admin/RepeatNewReferralBar.tsx` | Single segmented horizontal bar with the 75/25/5 target subtitle |

**Modified files:**

| Path | Change |
|---|---|
| `package.json` | Add `vitest` and `@types/node` (already present) to devDependencies; add `test` script |
| `src/app/api/admin/funnel/route.ts` | Add `kpis` block to the response. Wire in derivation calls. No new HCP fetches. |
| `src/app/admin/page.tsx` | Restructure: scoreboard hero (goal bar, KPI tiles, strategic row, mix bar) + collapsible sections (funnel, by-source, recent jobs). Preserve auth, period toggles, and existing data shape consumption. |

---

### Task 1: Add Vitest test infrastructure

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: Install Vitest**

Run from `~/larrys-plumbing`:
```bash
npm install --save-dev vitest
```

Expected: `vitest` appears in `devDependencies` in `package.json`.

- [ ] **Step 2: Add test script to package.json**

In `package.json`, in the `"scripts"` object, add:
```json
"test": "vitest run",
"test:watch": "vitest"
```

Final scripts block should look like:
```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 3: Create vitest.config.ts**

Create `vitest.config.ts` at repo root:
```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    globals: false,
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
```

- [ ] **Step 4: Verify Vitest runs with zero tests**

Run:
```bash
npm test
```

Expected output (no errors):
```
No test files found, exiting with code 0
```
(Vitest will exit 0 because we haven't written tests yet — that's fine.)

If you see `exit code 1` with "No test files found, exiting with code 1", that's also acceptable for this step — we'll write tests in Task 3+.

- [ ] **Step 5: Commit**

```bash
cd ~/larrys-plumbing
git add package.json package-lock.json vitest.config.ts
git commit -m "chore: add Vitest for KPI derivation unit tests"
```

---

### Task 2: Define minimal HCP types

**Files:**
- Create: `src/lib/hcp-types.ts`

- [ ] **Step 1: Write the types file**

Create `src/lib/hcp-types.ts`:
```ts
// Minimal HouseCall Pro type definitions.
// Only the fields the dashboard reads. NOT a complete API typing.

export interface HcpAddress {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
}

export interface HcpEmployee {
  id?: string;
  first_name?: string;
  last_name?: string;
}

export interface HcpCustomer {
  id?: string;
  first_name?: string;
  last_name?: string;
  lead_source?: string;
  jobs_count?: number;
  tags?: string[];
  notes?: string;
}

export interface HcpJobSchedule {
  scheduled_start?: string;
}

export interface HcpJob {
  id?: string;
  description?: string;
  work_status?: string;
  total_amount?: number; // cents
  lead_source?: string;
  created_at?: string;
  schedule?: HcpJobSchedule;
  customer?: HcpCustomer;
  assigned_employees?: HcpEmployee[];
}

export interface HcpLead {
  id?: string;
  lead_source?: string;
  created_at?: string;
}

export interface HcpEstimate {
  id?: string;
  created_at?: string;
}
```

- [ ] **Step 2: Verify it type-checks**

Run:
```bash
npx tsc --noEmit
```

Expected: clean exit. If errors, fix them before continuing.

- [ ] **Step 3: Commit**

```bash
git add src/lib/hcp-types.ts
git commit -m "feat: add minimal HouseCall Pro type definitions"
```

---

### Task 3: TDD computeGoalProgress

**Files:**
- Create: `src/lib/kpi-derivations.ts`
- Create: `src/lib/kpi-derivations.test.ts`

`computeGoalProgress` takes MTD revenue (cents) and returns the tier the business is in plus the dollar gap to the next tier.

- [ ] **Step 1: Write the failing test**

Create `src/lib/kpi-derivations.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { computeGoalProgress } from "./kpi-derivations";

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
```

- [ ] **Step 2: Run test, verify it fails**

Run:
```bash
npm test -- kpi-derivations
```

Expected: FAIL with "Cannot find module './kpi-derivations'" or similar import error.

- [ ] **Step 3: Implement computeGoalProgress**

Create `src/lib/kpi-derivations.ts`:
```ts
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
```

- [ ] **Step 4: Run test, verify it passes**

Run:
```bash
npm test -- kpi-derivations
```

Expected: All 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/kpi-derivations.ts src/lib/kpi-derivations.test.ts
git commit -m "feat: add computeGoalProgress with unit tests"
```

---

### Task 4: TDD computeAov

**Files:**
- Modify: `src/lib/kpi-derivations.ts`
- Modify: `src/lib/kpi-derivations.test.ts`

AOV = mean of `total_amount` across jobs whose `work_status` contains `"complete"`. Returns `null` when no completed jobs (UI renders `—`).

- [ ] **Step 1: Add the failing tests**

Append to `src/lib/kpi-derivations.test.ts`:
```ts
import { computeAov } from "./kpi-derivations";
import type { HcpJob } from "./hcp-types";

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
```

- [ ] **Step 2: Run test, verify it fails**

Run:
```bash
npm test -- kpi-derivations
```

Expected: FAIL with "computeAov is not a function" or import error.

- [ ] **Step 3: Implement computeAov**

Append to `src/lib/kpi-derivations.ts`:
```ts
import type { HcpJob } from "./hcp-types";

export function computeAov(jobs: HcpJob[]): number | null {
  const completed = jobs.filter((j) => (j.work_status ?? "").includes("complete"));
  if (completed.length === 0) return null;
  const total = completed.reduce((sum, j) => sum + (j.total_amount ?? 0), 0);
  return Math.round(total / completed.length);
}
```

- [ ] **Step 4: Run test, verify it passes**

Run:
```bash
npm test -- kpi-derivations
```

Expected: 6 prior + 5 new = 11 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/kpi-derivations.ts src/lib/kpi-derivations.test.ts
git commit -m "feat: add computeAov with unit tests"
```

---

### Task 5: TDD computeTechUtilization

**Files:**
- Modify: `src/lib/kpi-derivations.ts`
- Modify: `src/lib/kpi-derivations.test.ts`

Groups jobs by first assigned employee. Returns array sorted by job count descending, with `pct_of_total` per tech. Unassigned jobs bucket as `"Unassigned"` and ARE included in totals.

- [ ] **Step 1: Add the failing tests**

Append to `src/lib/kpi-derivations.test.ts`:
```ts
import { computeTechUtilization } from "./kpi-derivations";

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
```

- [ ] **Step 2: Run test, verify it fails**

```bash
npm test -- kpi-derivations
```

Expected: FAIL with "computeTechUtilization is not a function".

- [ ] **Step 3: Implement computeTechUtilization**

Append to `src/lib/kpi-derivations.ts`:
```ts
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
```

- [ ] **Step 4: Run test, verify it passes**

```bash
npm test -- kpi-derivations
```

Expected: 11 prior + 5 new = 16 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/kpi-derivations.ts src/lib/kpi-derivations.test.ts
git commit -m "feat: add computeTechUtilization with unit tests"
```

---

### Task 6: TDD computeCustomerMix

**Files:**
- Modify: `src/lib/kpi-derivations.ts`
- Modify: `src/lib/kpi-derivations.test.ts`

Returns `{ repeat, new, referral }` counts. A job is "referral" if its customer's `lead_source` (or the job's own) matches the referral pattern. Otherwise: "repeat" if `customer.jobs_count > 1`, else "new". Unique by customer ID — count each customer once.

- [ ] **Step 1: Add the failing tests**

Append to `src/lib/kpi-derivations.test.ts`:
```ts
import { computeCustomerMix, isReferralSource } from "./kpi-derivations";

describe("isReferralSource", () => {
  it("matches referral terms case-insensitively", () => {
    expect(isReferralSource("Referral")).toBe(true);
    expect(isReferralSource("REFERRED by friend")).toBe(true);
    expect(isReferralSource("Word of mouth")).toBe(true);
    expect(isReferralSource("WOM")).toBe(true);
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
      { customer: { id: "c1", jobs_count: 3 } },                          // repeat
      { customer: { id: "c2", jobs_count: 1 } },                          // new
      { customer: { id: "c3", lead_source: "Referral", jobs_count: 1 } }, // referral
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
```

- [ ] **Step 2: Run test, verify it fails**

```bash
npm test -- kpi-derivations
```

Expected: FAIL with import errors for the new functions.

- [ ] **Step 3: Implement computeCustomerMix and isReferralSource**

Append to `src/lib/kpi-derivations.ts`:
```ts
const REFERRAL_PATTERNS = ["referral", "referred", "word of mouth", "wom"];

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
```

- [ ] **Step 4: Run test, verify it passes**

```bash
npm test -- kpi-derivations
```

Expected: 16 prior + 11 new = 27 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/kpi-derivations.ts src/lib/kpi-derivations.test.ts
git commit -m "feat: add computeCustomerMix with referral detection"
```

---

### Task 7: TDD detectMembership

**Files:**
- Modify: `src/lib/kpi-derivations.ts`
- Modify: `src/lib/kpi-derivations.test.ts`

Scans customer `tags` and `notes` for membership keywords. Returns `{ count, projected_mrr, status }`. The MVP membership keyword list is best-effort — once real HCP data is inspected during the manual smoke test (Task 16), the implementer should add/refine patterns based on what's actually in the customer records.

- [ ] **Step 1: Add the failing tests**

Append to `src/lib/kpi-derivations.test.ts`:
```ts
import { detectMembership } from "./kpi-derivations";
import type { HcpCustomer } from "./hcp-types";

describe("detectMembership", () => {
  it("returns field_missing for empty customer list", () => {
    expect(detectMembership([])).toEqual({
      count: null,
      projected_mrr: null,
      status: "field_missing",
    });
  });

  it("returns field_missing when no customer has membership signal", () => {
    const customers: HcpCustomer[] = [
      { id: "c1", tags: ["new-customer"], notes: "no signal here" },
      { id: "c2", notes: "regular customer" },
    ];
    expect(detectMembership(customers)).toEqual({
      count: null,
      projected_mrr: null,
      status: "field_missing",
    });
  });

  it("counts customers with 'member' tag", () => {
    const customers: HcpCustomer[] = [
      { id: "c1", tags: ["member"] },
      { id: "c2", tags: ["Member"] },
      { id: "c3", tags: ["other"] },
    ];
    const result = detectMembership(customers);
    expect(result.count).toBe(2);
    expect(result.status).toBe("available");
  });

  it("counts customers with 'membership' in notes", () => {
    const customers: HcpCustomer[] = [
      { id: "c1", notes: "Active membership since 2024" },
      { id: "c2", notes: "" },
    ];
    const result = detectMembership(customers);
    expect(result.count).toBe(1);
    expect(result.status).toBe("available");
  });

  it("counts each customer at most once", () => {
    const customers: HcpCustomer[] = [
      { id: "c1", tags: ["member"], notes: "Active membership plan" },
    ];
    expect(detectMembership(customers).count).toBe(1);
  });

  it("calculates projected_mrr as count * 999 cents", () => {
    // $9.99/mo placeholder until Justin confirms the membership price
    const customers: HcpCustomer[] = [
      { id: "c1", tags: ["member"] },
      { id: "c2", tags: ["member"] },
    ];
    expect(detectMembership(customers).projected_mrr).toBe(2 * 999);
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

```bash
npm test -- kpi-derivations
```

Expected: FAIL with "detectMembership is not a function".

- [ ] **Step 3: Implement detectMembership**

Append to `src/lib/kpi-derivations.ts`:
```ts
import type { HcpCustomer } from "./hcp-types";

// Placeholder MRR rate (cents). Replace with real membership price after
// Justin confirms. Used for the v1 "projected MRR" display.
const MEMBERSHIP_PRICE_CENTS = 999;
const MEMBERSHIP_KEYWORDS = ["member", "membership"];

export interface MembershipResult {
  count: number | null;
  projected_mrr: number | null;
  status: "available" | "field_missing";
}

export function detectMembership(customers: HcpCustomer[]): MembershipResult {
  let count = 0;
  for (const c of customers) {
    if (hasMembershipSignal(c)) count++;
  }
  if (count === 0) {
    return { count: null, projected_mrr: null, status: "field_missing" };
  }
  return {
    count,
    projected_mrr: count * MEMBERSHIP_PRICE_CENTS,
    status: "available",
  };
}

function hasMembershipSignal(c: HcpCustomer): boolean {
  const tags = (c.tags ?? []).map((t) => t.toLowerCase());
  if (tags.some((t) => MEMBERSHIP_KEYWORDS.includes(t))) return true;
  const notes = (c.notes ?? "").toLowerCase();
  return MEMBERSHIP_KEYWORDS.some((k) => notes.includes(k));
}
```

- [ ] **Step 4: Run test, verify it passes**

```bash
npm test -- kpi-derivations
```

Expected: 27 prior + 6 new = 33 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/kpi-derivations.ts src/lib/kpi-derivations.test.ts
git commit -m "feat: add detectMembership with field_missing fallback"
```

---

### Task 8: Wire derivations into the API route

**Files:**
- Modify: `src/app/api/admin/funnel/route.ts`

Add the `kpis` block to the dashboard response. Also compute `revenue_mtd`, `revenue_last_30d`, `revenue_last_90d` from the full unfiltered jobs array (not the period-filtered one — these specific numbers ignore the period toggle).

- [ ] **Step 1: Update the DashboardData interface**

In `src/app/api/admin/funnel/route.ts`, replace the existing `DashboardData` interface (around lines 73-104) with:
```ts
import type {
  GoalProgress,
  TechUtilization,
  CustomerMix,
  MembershipResult,
} from "@/lib/kpi-derivations";

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
```

- [ ] **Step 2: Add a helper to sum revenue within a window**

Add this helper at the top of the file, after the `setCache` function (around line 27):
```ts
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
```

- [ ] **Step 3: Wire derivations into the response builder**

Inside the `GET` handler, just before the `const dashboard: DashboardData = { ... }` assignment (around line 218), add:
```ts
// Extract customers from the jobs array (deduped by ID) for membership detection.
const customerMap = new Map<string, Record<string, unknown>>();
for (const job of filteredJobs) {
  const cust = job.customer as Record<string, unknown> | undefined;
  const id = cust?.id as string | undefined;
  if (cust && id && !customerMap.has(id)) {
    customerMap.set(id, cust);
  }
}
const customersForMembership = Array.from(customerMap.values()) as import("@/lib/hcp-types").HcpCustomer[];

const filteredHcpJobs = filteredJobs as unknown as import("@/lib/hcp-types").HcpJob[];

const revenueMtd = sumRevenueThisMonth(jobs);
const revenueLast30 = sumRevenueWithinDays(jobs, 30);
const revenueLast90 = sumRevenueWithinDays(jobs, 90);

const { computeGoalProgress, computeAov, computeTechUtilization, computeCustomerMix, detectMembership } =
  await import("@/lib/kpi-derivations");

const kpis = {
  revenue_mtd: revenueMtd,
  revenue_last_30d: revenueLast30,
  revenue_last_90d: revenueLast90,
  jobs_completed_period: completedCount,
  aov_period: computeAov(filteredHcpJobs),
  customer_mix: computeCustomerMix(filteredHcpJobs),
  tech_utilization: computeTechUtilization(filteredHcpJobs),
  membership: detectMembership(customersForMembership),
  goal_progress: computeGoalProgress(revenueMtd),
  goals: {
    revenue_good: 8_000_000,
    revenue_great: 10_000_000,
    revenue_great_plus: 12_000_000,
  },
};
```

Then add `kpis,` inside the `dashboard` object literal (around line 218).

- [ ] **Step 4: Verify type-check passes**

```bash
npx tsc --noEmit
```

Expected: clean exit. Fix any type errors before continuing. The `await import(...)` is allowed — Next.js 16 supports dynamic imports in route handlers.

- [ ] **Step 5: Run dev server and hit the endpoint**

In one terminal:
```bash
npm run dev
```

In another terminal:
```bash
curl -s http://localhost:3000/api/admin/funnel?days=30 | python3 -m json.tool | head -80
```

Expected: JSON response includes a top-level `"kpis": {...}` key with all the new fields. The numbers may be zero or `null` if there's no relevant HCP data — that's fine for now. What matters: the shape is right and the route doesn't 500.

If you see an error response, check `next dev`'s output — likely an import path or type mismatch.

- [ ] **Step 6: Commit**

```bash
git add src/app/api/admin/funnel/route.ts
git commit -m "feat: extend /api/admin/funnel with kpis block"
```

---

### Task 9: Build CollapsibleSection component

**Files:**
- Create: `src/components/admin/CollapsibleSection.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/admin/CollapsibleSection.tsx`:
```tsx
"use client";

import { useState, useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  id: string;            // for localStorage key
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function CollapsibleSection({ id, title, defaultOpen = true, children }: Props) {
  const storageKey = `larrys_admin_collapse_${id}`;
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved !== null) setOpen(saved === "1");
  }, [storageKey]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    localStorage.setItem(storageKey, next ? "1" : "0");
  };

  return (
    <div className="bg-brand-dark border border-brand-darker rounded-xl mb-8 overflow-hidden">
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-brand-darker/40 transition-colors"
        aria-expanded={open}
      >
        <h2 className="text-lg font-bold">{title}</h2>
        <span
          className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
          aria-hidden="true"
        >
          ▶
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-6 pt-0">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 2: Verify type-check passes**

```bash
npx tsc --noEmit
```

Expected: clean exit.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/CollapsibleSection.tsx
git commit -m "feat: add CollapsibleSection component with localStorage persistence"
```

---

### Task 10: Build KpiTile component

**Files:**
- Create: `src/components/admin/KpiTile.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/admin/KpiTile.tsx`:
```tsx
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
```

- [ ] **Step 2: Verify type-check passes**

```bash
npx tsc --noEmit
```

Expected: clean exit.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/KpiTile.tsx
git commit -m "feat: add KpiTile component"
```

---

### Task 11: Build GoalBar component

**Files:**
- Create: `src/components/admin/GoalBar.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/admin/GoalBar.tsx`:
```tsx
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
  // The bar maxes out at $150K so even past great_plus stays readable.
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
```

- [ ] **Step 2: Verify type-check passes**

```bash
npx tsc --noEmit
```

Expected: clean exit.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/GoalBar.tsx
git commit -m "feat: add GoalBar component with tier markers"
```

---

### Task 12: Build BusFactorCard component

**Files:**
- Create: `src/components/admin/BusFactorCard.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/admin/BusFactorCard.tsx`:
```tsx
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
```

- [ ] **Step 2: Verify type-check passes**

```bash
npx tsc --noEmit
```

Expected: clean exit.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/BusFactorCard.tsx
git commit -m "feat: add BusFactorCard with acquisition-risk flag"
```

---

### Task 13: Build MembershipCard component

**Files:**
- Create: `src/components/admin/MembershipCard.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/admin/MembershipCard.tsx`:
```tsx
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
```

- [ ] **Step 2: Verify type-check passes**

```bash
npx tsc --noEmit
```

Expected: clean exit.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/MembershipCard.tsx
git commit -m "feat: add MembershipCard with field_missing render mode"
```

---

### Task 14: Build RepeatNewReferralBar component

**Files:**
- Create: `src/components/admin/RepeatNewReferralBar.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/admin/RepeatNewReferralBar.tsx`:
```tsx
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
```

- [ ] **Step 2: Verify type-check passes**

```bash
npx tsc --noEmit
```

Expected: clean exit.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/RepeatNewReferralBar.tsx
git commit -m "feat: add RepeatNewReferralBar with 75/25/5 target subtitle"
```

---

### Task 15: Restructure /admin page into scoreboard layout

**Files:**
- Modify: `src/app/admin/page.tsx`

Preserve everything: auth flow, period toggles, funnel rendering, source table, recent jobs table. ADD the new scoreboard sections at the top. Move funnel/source/recent-jobs into `CollapsibleSection` wrappers. Add an HCP-failure banner with cached-at age + retry button (per the spec's error-handling section).

- [ ] **Step 1: Add error state to the page**

In `src/app/admin/page.tsx`, find the existing `useState` declarations near the top of `AdminPage` (around line 53-57). Add an `error` state and update `fetchData` to set it:

```tsx
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
```

- [ ] **Step 2: Update DashboardData interface in the page**

Replace the existing `DashboardData` interface at the top of `src/app/admin/page.tsx` (around lines 5-26) with:
```ts
import type {
  GoalProgress,
  TechUtilization,
  CustomerMix,
  MembershipResult,
} from "@/lib/kpi-derivations";

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
```

- [ ] **Step 3: Import the new components**

Add to the top of `src/app/admin/page.tsx` (after existing imports):
```ts
import { GoalBar } from "@/components/admin/GoalBar";
import { KpiTile } from "@/components/admin/KpiTile";
import { BusFactorCard } from "@/components/admin/BusFactorCard";
import { MembershipCard } from "@/components/admin/MembershipCard";
import { RepeatNewReferralBar } from "@/components/admin/RepeatNewReferralBar";
import { CollapsibleSection } from "@/components/admin/CollapsibleSection";
```

- [ ] **Step 4: Replace the rendered dashboard body (with new error banner)**

Also: just BEFORE the existing `if (!data) return null;` guard, add a separate guard for the initial-fetch-failed case (no cached data + error present). The new guard should render a full-screen error with a retry button:

```tsx
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
```

Then keep the existing `if (!data) return null;` line after it (handles the rare loading-but-not-loading-yet case).

Now replace the main return block (the JSX returned when `data` is present, originally lines 123-272) with:

Replace the JSX returned for the authenticated state (the entire `return (` block when `data` is present, currently lines 123-272) with:
```tsx
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
```

- [ ] **Step 5: Verify type-check passes**

```bash
npx tsc --noEmit
```

Expected: clean exit. The two existing wrapper `div` elements that used to wrap funnel/source/recent-jobs sections are now replaced with `CollapsibleSection` — should be no orphaned closing tags.

- [ ] **Step 6: Verify lint passes**

```bash
npm run lint
```

Expected: clean exit. If unused-variable warnings appear (e.g. an unused import left over), remove them.

- [ ] **Step 7: Commit**

```bash
git add src/app/admin/page.tsx
git commit -m "feat: restructure /admin into KPI scoreboard with collapsible operational sections"
```

---

### Task 16: Manual smoke test + mobile check + deploy

**Files:** none (verification only)

- [ ] **Step 1: Run dev server**

```bash
npm run dev
```

Open http://localhost:3000/admin in a browser. Enter password `larrys2026`.

- [ ] **Step 2: Verify every section renders**

Walk through the page and confirm:
- Header + cached timestamp + four period toggle buttons
- Goal bar with revenue number, three tier markers, and a subtitle ("X to next tier" or "past Y")
- Four KPI tiles: Revenue, Jobs Completed, AOV, Lead → Done %
- Bus Factor card with top tech and percentage
- Membership card — either "available" or "not yet wired"
- Customer Mix bar with three segments and the 75/25/5 target
- Lead-to-Job Funnel section (open) with bars
- Revenue by Source section (open) with table
- Recent Jobs section (CLOSED) with chevron — click to open and see the table

Click each period toggle (7d / 30d / 90d / All Time). Verify the tiles below the goal bar update; the goal bar itself should stay on MTD regardless.

Toggle each collapsible section open and closed. Reload the page. Verify the open/closed state persisted.

- [ ] **Step 3: Inspect membership data**

If the membership card shows "Not yet wired", inspect a real customer payload:
```bash
curl -s -H "Authorization: Token $HOUSECALL_PRO_API_KEY" \
  "https://api.housecallpro.com/customers?page=1&page_size=5" | python3 -m json.tool | head -120
```

(Run this in a terminal that has `HOUSECALL_PRO_API_KEY` exported, or pull it from Vercel: `npx vercel env pull .env.local`.)

Look for fields that indicate membership: `tags`, `notes`, `customer_type`, or custom fields. If you find a reliable signal:
1. Update `MEMBERSHIP_KEYWORDS` (and/or add new logic) in `src/lib/kpi-derivations.ts`.
2. Add a new test case to `src/lib/kpi-derivations.test.ts` covering the new signal.
3. Run `npm test` to verify; commit as a follow-up fix.

If there is no reliable signal, leave the "not yet wired" card as-is and flag it for the Adam call as a question.

- [ ] **Step 4: Mobile responsive check**

Open Chrome DevTools (Cmd-Opt-I), toggle device toolbar (Cmd-Shift-M), pick iPhone 14 Pro (390 × 844). Reload `/admin`.

Verify:
- KPI tiles collapse from 4 columns to 2 columns
- Strategic row (Bus Factor + Membership) stacks vertically
- Goal bar stays full width and readable
- All collapsible sections still toggle correctly
- No horizontal scrolling

- [ ] **Step 5: Run full check before deploy**

```bash
npm test && npm run lint && npm run build
```

Expected: tests pass, lint clean, build succeeds.

If `npm run build` fails on Next.js 16 type issues (e.g. params-are-Promises), check `node_modules/next/dist/docs/` for the relevant migration note before fixing — see `AGENTS.md`.

- [ ] **Step 6: Deploy to Vercel preview, then production**

```bash
npx vercel       # preview deploy first
```

Open the preview URL, repeat the smoke test from Step 2 against production HCP data. If everything looks right:

```bash
npx vercel --prod
```

- [ ] **Step 7: Final commit / push**

```bash
git push origin main
```

If there are any tweaks made during the smoke test (e.g. membership keyword refinement from Step 3), commit them as a separate fix commit with a descriptive message before pushing.

- [ ] **Step 8: Notify Scott / send Adam-call demo link**

The dashboard is now live at https://larrysplumbingservice.com/admin (password `larrys2026`). Send the link to Scott — this is the artifact for the Adam call to elicit Justin's actual top-5 metric list (the open question from the synthesis).

---

## Open follow-ups (NOT in this MVP)

These were intentionally deferred per the spec. Each becomes a separate plan if Scott prioritizes it:

1. **GBP review velocity card** (v1.1) — pull review count + avg rating + 30d delta. Proven integration path in `project_proofpop_gbp_project`.
2. **SalesCaptain call-volume card** (v1.1) — needs SalesCaptain API discovery first.
3. **GA4 form-conversion attribution** (v1.2) — existing G-PLNSMKB6FM, service account exists.
4. **Period-over-period deltas + sparklines** — requires daily-snapshot infrastructure (cron writes to Vercel KV or Blob).
5. **Goal customization UI** — replace hardcoded $80K/$100K/$120K with editable thresholds.
6. **Real membership price + program name confirmation** (Adam-call dependency).
7. **The four open-questions for next Adam call** listed at the bottom of the spec.
