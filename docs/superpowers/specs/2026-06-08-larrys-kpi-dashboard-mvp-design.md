---
title: Larry's Plumbing — KPI Dashboard MVP
date: 2026-06-08
status: approved-design
owner: Scott Linford / Linfordy
related:
  - docs/larrys-discovery-synthesis.md
---

# Larry's Plumbing — KPI Dashboard MVP

## Why this exists

Justin Zmolik's **#1 explicit ask** in the discovery (said twice across two recordings) was:

> *"If I could wave a wand and have one thing in the business 100% automated by next month, it would be tracking KPIs."*

He tracks KPIs in Excel today. This MVP automates that into a live, in-browser scoreboard at `larrysplumbingservice.com/admin`. It's also the **fastest credibility win** in the engagement and the demo we'll walk Adam through to elicit Justin's actual top-5 metric list (currently an open question in the synthesis).

## Scope

- **In:** revenue, jobs completed, AOV, lead→complete conversion %, customer-mix split (repeat/new/referral), tech utilization with bus-factor flag, membership/MRR card (with graceful fallback), goal-progress bar using Justin's own $80K/$100K/$120K framing.
- **Out (deferred to v1.1+):** GBP review velocity, SalesCaptain call volume, GA4 form-conversion attribution, period-over-period deltas, sparklines, goal customization UI, CSV export, email digest.
- **Data source:** HouseCall Pro only. No new integrations.

## Design

### Architecture

Extend the existing `/admin` page (live, in production, password `larrys2026`). No new auth, no new infra, no new data store.

**Files touched** (all in `~/larrys-plumbing`):

- `src/app/api/admin/funnel/route.ts` — extended to compute a new `kpis` block alongside the existing `overview / funnel / by_source / recent_jobs` blocks. Same path, same cache, back-compat preserved.
- `src/app/admin/page.tsx` — restructured to render the new scoreboard hero + collapsible sections.
- `src/components/admin/` — **new folder.** Splits the page into focused components so `page.tsx` doesn't grow into a 600-line file: `KpiTile.tsx`, `GoalBar.tsx`, `BusFactorCard.tsx`, `MembershipCard.tsx`, `RepeatNewReferralBar.tsx`, `CollapsibleSection.tsx`.
- `src/lib/kpi-derivations.ts` — **new.** Pure derivation functions (AOV, tech utilization, customer mix, membership detection, goal progress) extracted from the API route so they are unit-testable.
- `src/lib/hcp-types.ts` — **new.** Just-enough `Job`, `Lead`, `Customer` types to replace the scattered `Record<string, unknown>` casts in the current route.

### API contract — new `kpis` block

```ts
kpis: {
  revenue_mtd: number;              // cents
  revenue_last_30d: number;
  revenue_last_90d: number;
  jobs_completed_period: number;
  aov_period: number;               // cents, mean of completed job amounts
  conversion: {
    leads: number;
    estimates: number;
    scheduled: number;
    completed: number;
    pct_lead_to_complete: number;
  };
  by_source_extended: Array<{
    source: string;
    leads: number;
    jobs: number;
    completed: number;
    revenue: number;
    pct_of_total: number;
  }>;
  customer_mix: { repeat: number; new: number; referral: number };  // counts in period
  tech_utilization: Array<{ tech_name: string; jobs: number; pct_of_total: number }>;
  membership: {
    count: number | null;
    projected_mrr: number | null;
    status: "available" | "field_missing";
  };
  goals: {
    revenue_good: 8000000;        // cents, $80K — synthesis "good month"
    revenue_great: 10000000;      // cents, $100K — synthesis "great month" lower bound
    revenue_great_plus: 12000000; // cents, $120K — synthesis "great month" upper bound
  };
}
```

The `membership.status: "field_missing"` sentinel is the deterministic fallback when HCP doesn't expose membership data cleanly — the UI renders a "not yet wired" card rather than a fake number. Membership detection is the only piece we cannot fully spec until we inspect a real HCP customer payload during implementation.

### Caching

Reuse the existing 5-min in-memory cache keyed by `dashboard_<days>`. The new `kpis` block is computed during the same response cycle and lives inside the same cache entry. Zero new infra.

### Derivations from HCP

All derivable from the existing `jobs / leads / estimates / customers` arrays already fetched by the route — no new HCP calls.

| Metric | Source field(s) | Edge case → behavior |
|---|---|---|
| AOV | `mean(job.total_amount where work_status includes "complete")` | Zero completed jobs → render `—` |
| Tech utilization | Group jobs by `assigned_employees[0].id`; name from same payload | Missing assignment → bucket `"Unassigned"`, exclude from top-tech calc |
| Repeat customer | `customer.jobs_count > 1` | Field missing → fall back to scanning filtered jobs for prior jobs by same `customer.id` within fetched window; if no prior, treat as new |
| Referral source | `lead_source` matched case-insensitively against `["referral", "referred", "word of mouth", "wom"]` | No match → not referral |
| Membership | Scan `customer.tags` / `customer.notes` for membership identifier | Inspection-driven during build. No clean signal → `status: "field_missing"` |
| Goal progress | `revenue_mtd` vs `$80K / $100K / $120K` thresholds | Always uses MTD regardless of period toggle (goals are monthly by nature) |

### UI structure

Top-to-bottom on `/admin`:

```
HEADER     "Dashboard" · cached timestamp · [7d | 30d | 90d | All]
GOAL BAR   full-width revenue MTD progress, $80K / $100K / $120K tiers
KPI TILES  4-col grid (2-col mobile): Revenue, Jobs, AOV, Conversion %
STRATEGIC  2-col grid (stack on mobile): Bus Factor · Membership
MIX BAR    full-width segmented: Repeat % · New % · Referral %
─────  collapsible sections (state persists in localStorage)  ─────
▼ Lead-to-Job Funnel             (open by default)  — existing bars
▼ Revenue by Source              (open by default)  — existing table
▶ Recent Jobs                    (closed by default) — existing table
```

### Component contracts

- **`GoalBar`** — horizontal progress bar with three tier markers. Color: gray → brand-red at $80K → brand-red glow at $100K → gold at $120K. Subtitle dynamically renders "X% past good" or "$X to next tier."
- **`KpiTile`** — reusable label / big number / optional sublabel. Matches existing /admin overview-card styling. No deltas in MVP.
- **`BusFactorCard`** — top tech + percentage + next two techs. Warning chip if top tech > 80%; muted info chip otherwise. Tooltip on title: "Acquisition red flag if one tech runs the majority of revenue."
- **`MembershipCard`** — two render modes from `kpis.membership.status`. `"available"` shows count + projected MRR. `"field_missing"` shows a one-line "not yet wired — Linfordy is investigating" notice.
- **`RepeatNewReferralBar`** — single segmented horizontal bar, three colored segments summing to 100%. Subtitle shows the 75/25/5 target (Justin's own framing) in muted text.
- **`CollapsibleSection`** — chevron toggle, Framer Motion height animation. Persists open/closed state in `localStorage` (key per section).

### Mobile behavior

- KPI tiles collapse 4 → 2 cols
- Strategic row stacks vertically
- Goal bar stays full-width
- All collapsibles behave the same
- Tested at 390px wide minimum (iPhone)

## Error handling

| Failure | Behavior |
|---|---|
| HCP API down/timeout | Return existing `{ error: "Failed to fetch dashboard data" }`. UI renders a top-banner card showing cached-at age + retry button instead of `null`. |
| Malformed job (missing `total_amount`) | Default to `0` (current behavior, preserved). |
| Membership scan throws | Catch locally inside the derivation, set `status: "field_missing"`, do NOT fail the whole response. |
| Empty period (toggle returns 0 jobs) | Tiles render `—` / `0` / empty bars. No crashes. |

Auth is unchanged — existing client-side localStorage password. This is not an auth project.

## Testing

1. **Unit tests** for the pure derivation functions in `src/lib/kpi-derivations.ts`:
   - `computeAov(jobs)`, `computeTechUtilization(jobs)`, `computeCustomerMix(jobs, customers)`, `computeMembership(customers)`, `computeGoalProgress(revenueMtd)`.
   - Each gets fixture-based tests with empty / single / multi / edge-case inputs.
2. **No live-HCP integration tests** — too slow, rate-limited, drifts.
3. **Manual smoke test** post-deploy: load `/admin`, exercise all four period toggles, spot-check each metric against Justin's most recent HCP report.
4. **Mobile visual check** — Chrome DevTools responsive mode at 390px before merging.

## What is intentionally NOT in MVP (YAGNI)

- No state-management library — `useState` is enough.
- No new DB / KV / Blob writes — MVP is read-only.
- No GBP, GA4, SalesCaptain integrations — separate v1.1 tickets.
- No goal-editing UI — three numbers hardcoded from Justin's own words; iterate after Adam call.
- No CSV export / email digest — not asked for; trivial to add later if requested.
- No period-over-period deltas — requires historical snapshot infrastructure; deferred to v1.1.

## Acceptance criteria

- `/admin` loads with the new scoreboard layout; all four period toggles work.
- Goal bar reflects real MTD revenue with the three tier markers.
- Bus-factor card identifies the top tech and percentage from real HCP data.
- Repeat / new / referral split renders with real numbers.
- Membership card either shows real numbers OR shows "not yet wired" — never a fake value.
- Collapsible sections remember their open/closed state across reloads.
- Mobile layout works at 390px wide.
- Existing funnel, source breakdown, and recent-jobs sections still render correctly.
- No regressions to the form submission flow (`submit-form.ts` untouched).

## Open questions for next Adam call

(carried forward from the synthesis — the dashboard is the artifact we walk through to answer these)

1. Are these the right 5 headline metrics for Justin, or does his Excel track something different?
2. Confirm the $80K / $100K / $120K monthly tiers are still current.
3. Should the bus-factor card be visible to Adam, or owner-only?
4. Is membership the right name for the recurring-revenue program, or is "Plumb Safe" the public name we should use in the UI?

## Implementation plan

To be produced by the `writing-plans` skill after this design is approved.
