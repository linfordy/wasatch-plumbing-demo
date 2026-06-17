# Brief: Auto Review-Request with Job Photos — ProofPop Feature

**For:** The Claude session building ProofPop
**From:** Scott + Claude (Larry's Plumbing site session, 2026-05-22; updated 2026-05-25)
**Status:** Concept handoff. Not yet built. ProofPop is the natural home for this.

---

## ⚠️ HCP Integration Realities (verified 2026-05-25)

We probed the live HCP API and walked through the HCP web UI on Larry's MAX account. Key findings that shape the architecture:

### What's confirmed working

1. **API access is plan-gated, not application-gated.** HCP requires the **MAX plan** for API + webhooks. There is NO OAuth Partner App enrollment, no developer-program approval, no contact for "developer relations." Each pro just needs to be on MAX, then they self-serve API keys and webhooks from the in-app App Store. (Earlier briefs claimed otherwise — that was wrong.)

2. **Webhooks ARE supported on MAX and work today.** 41 confirmed events across Customer / Estimate / Invoice / Job / Job Appointment / Lead / Pro. The key event for this feature (`job.completed`) is available. See `hcp-api-reference.md` for the full catalog.

### The hard constraint that drives architecture

**HCP supports only ONE webhook URL per account.** Whatever URL is configured in the Webhooks app receives every event. You cannot register multiple consumers.

For Larry's specifically, the existing URL is already `https://app.salescaptain.com/api/v1/housecallpro/...` — Sales Captain depends on it for their SMS automations. **If we just point HCP at our endpoint, we break Sales Captain.** This generalizes: many MAX-tier HCP customers already have *something* consuming their webhook (Zapier, a CRM bridge, or another vendor). We can't assume the slot is empty.

**Required architecture: fan-out proxy.**

```
HCP webhook → ProofPop endpoint → ┬→ Forward verbatim to existing consumer (Sales Captain, Zapier, etc.)
                                   └→ Process for our automation pipeline (review requests, etc.)
```

ProofPop becomes the single destination HCP sees. Per-tenant config in our platform lets each pro specify "downstream destinations" to forward events to. This is non-optional for any tenant who already has a webhook configured.

### Photos status — confirmed NOT accessible via REST (HCP support, 2026-05-25)

HCP support confirmed in writing that job photos/attachments are **not accessible through the public REST API at any tier including MAX**, with no documented workaround and no public roadmap commitment. Same for estimate attachments.

**This means "auto-review-with-photos" cannot get photos from HCP.** Period. Photos for the review request have to come from somewhere else. Options (recommend supporting all three over time):

1. **Tech mobile-web uploader (recommended)** — ProofPop publishes a mobile-web page each tech opens before marking a job complete. They drag-drop the same photos they'd put in HCP, but to us. Adds 30 sec to the tech's workflow per job.
2. **Owner-side manual attach** — owner sees a list of newly-completed jobs in ProofPop dashboard, drag-drops photos per job before the review request fires. Higher friction but doesn't require tech behavior change.
3. **Photos-optional (the actual MVP)** — review request fires with text only, AI-personalized using line-item descriptions (the tech's "Work Performed" notes) which ARE accessible via REST. Customer still gets a thoughtful, personalized message and a review link. Photos can be retrofitted later via option 1 or 2.

> ⚠️ The HCP support reply was from their AI chat, not a human rep. Reliable for operational guidance. If product strategy demands photos, a human-rep escalation is the path to lobby HCP product team to expose the attachments API.

### What this means for ProofPop (multi-tenant)

1. **Per-tenant API key + webhook config** — each ProofPop customer connects their own HCP MAX account, generates their own API key, and pastes ProofPop's webhook URL into their HCP Webhooks app. ProofPop receives + fans out + processes.
2. **Surface the fan-out feature explicitly in onboarding** — ask new tenants "Do you already have a webhook URL configured in HCP? Paste it here so we can forward events to keep your existing integration working." If yes → fan-out mode. If empty slot → simple consume mode.
3. **No OAuth flow needed for HCP.** API key paste + webhook URL config is sufficient. (Other CRMs may differ — verify per-CRM before promising integrations.)
4. **Ship Phase 1 webhook-driven** (not polling). Polling is the fallback only if a tenant won't grant us their webhook slot.

---

## The Feature in One Sentence

When a job is marked completed in a customer's CRM (HouseCall Pro, JobNimbus, ServiceTitan, etc.), ProofPop auto-pulls the technician's job photos, generates a personalized AI message asking for a review, and sends it to the customer via SMS/email with the photos attached — offering a reward (gift card) for posting a social post or Google review.

## Why ProofPop Is the Right Home

This feature is a near-perfect overlap with ProofPop's existing stack:

| ProofPop already has | This feature needs |
|---|---|
| AI Composer (5 templates, FB+IG publish) | Personalized AI review-request generation |
| Reward providers (Giftbit / Runa / Tremendous) | Auto gift-card payout for social post / review |
| FB + IG publishing | Tracking and verifying customer-posted social proof |
| Widget that captures social proof | Closing the loop on review collection |
| Lead engine messaging | SMS/email delivery infrastructure |

The only **net-new** piece for ProofPop is a CRM integration layer that listens for job completions and grabs photos. Everything downstream (AI message, reward, publish, verify) is already in the product.

## Concrete Use Case (Larry's Plumbing, Rockwall TX)

Justin (owner) is a master plumber. His techs upload photos to each job in HouseCall Pro — water heater installs, drain camera screenshots, before/after shots. Currently those photos sit in HCP and never reach the customer.

The desired flow:

1. Tech marks job "completed" or "paid" in HCP
2. ProofPop detects the status change (webhook or poll)
3. ProofPop fetches the photos the tech uploaded to *that specific job*
4. AI generates a personalized message:
   > "Hey Sarah — Justin here from Larry's Plumbing. Hope your new water heater is treating you right. Here are the photos we took of the install for your records. If you have a minute and you're happy with the work, would you mind dropping us a Google review? We're a 3rd-generation family business and reviews are how we keep the lights on. **Bonus: post one of these photos with a tag of @larrysplumbing on Facebook or Instagram and we'll send you a $25 Amazon gift card as a thank-you.**"
5. ProofPop sends the message (SMS + email) with photos either attached or linked to a hosted page
6. Customer clicks Google review link → posts review → ProofPop verifies and tracks (manual reward) OR customer posts social → ProofPop AI Composer detects the post via FB/IG integration → auto-pays the $25 gift card via Giftbit

## Architecture Sketch

```
CRM (HCP / JobNimbus / ServiceTitan)
        │
        │  webhook or poll
        ▼
ProofPop Job Completion Listener
        │
        ├─► Fetch job photos via CRM API
        │       (re-host to ProofPop CDN — CRM URLs expire)
        │
        ├─► Generate AI review-request message
        │       (reuse AI Composer — add "review request" template type)
        │
        ├─► Send via SMS (Twilio) + email (existing infra)
        │       (photos embedded inline or linked to /reviews/{job_id} page)
        │
        ├─► Listen for customer action:
        │       (a) Google review posted → manual or API-detected
        │       (b) FB/IG post tagged → existing AI Composer detection logic
        │
        └─► Pay reward (Giftbit / Runa / Tremendous) on social post
```

## CRM Integrations to Build (in priority order)

1. **HouseCall Pro** — needed first (Larry's Plumbing, plus most home-services SMBs)
2. **JobNimbus** — already in our world (Utah Radon Services uses it)
3. **ServiceTitan** — large home-services TAM
4. **Jobber** — popular alternative
5. **Square Appointments** — for service-based businesses (Plus7 ecosystem)

Each integration needs:
- OAuth or API key auth flow
- Job-completion event (webhook preferred, poll as fallback)
- Attachments/photos endpoint
- Customer contact info (phone + email)
- Job description / service type (for AI message context)
- Technician name (for AI message personalization)

## UX Inside ProofPop

### Customer-facing (the SMB business owner using ProofPop)

- New section: **"CRM Auto-Review"** in the ProofPop dashboard
- Connect CRM button (OAuth or paste API key)
- Configure:
  - Which job statuses trigger the request (completed, paid, or both)
  - Delay before sending (immediately, 24h after, 3 days after)
  - SMS, email, or both
  - Reward amount + which provider
  - AI message tone (use existing AI Composer voice settings)
  - Owner name to sign messages with
- Preview: shows what a sample message looks like with their branding

### Customer-of-customer-facing (the homeowner getting the message)

- SMS: short link to a branded page on `reviews.proofpop.com/{job_id}`
- Email: photos embedded inline + clear "Leave a review" + "Post & earn $25" CTAs
- Branded page hosted by ProofPop:
  - Photo gallery (downloadable individually)
  - Big "Leave a Google review" button (deep-linked with place ID)
  - Big "Share on Instagram / Facebook" button (pre-fills caption, attaches photo)
  - "How to earn $25" explainer
  - Plumber's business card (phone, address, social links)

## What ProofPop Already Has That Plugs Right In

- **AI Composer** — extend with a "review_request" template type. Inputs: customer first name, service performed, technician name, business name, owner name, business voice. Outputs: SMS draft + email draft + social-post draft (for the customer to use).
- **Reward providers** — Giftbit / Runa / Tremendous already wired. Just add a "review-request reward" config.
- **FB+IG publish + detect** — used today for the AI Composer's own posts. Reuse the detection logic to spot when a customer posts with the business tag.
- **Reporting** — leverage existing analytics to show: review request sent → opened → clicked → review posted → reward paid (full funnel).

## Phasing

**Phase 0 — Partner App application (file Day 1, runs in parallel):**
- Email `developer@housecallpro.com` requesting OAuth Partner App status
- Describe ProofPop's multi-tenant CRM-triggered review automation use case
- Provide business + technical contact, expected scope list
- Expect weeks for approval

**Phase 1 — MVP, photos-optional (HCP poll, email-only, no reward automation):**
- HCP integration via personal API key per-tenant (acceptable for MVP only)
- Polling `GET /jobs?page=1` every 15 min, dedup by `{company_id}:{job_id}`
- Trigger when `work_timestamps.completed_at` flips from null to a timestamp (preferred over `work_status` — confirmed in `hcp-api-reference.md`)
- AI message generation via Composer (new "review_request" template type)
- Email send via existing infra
- **No photos until Partner App approval** — use line-item descriptions instead (the `description` field on `GET /jobs/{id}/line_items` contains tech-written "Work Performed" notes — gold for personalization)
- Manual reward handling (owner clicks "send $25" in dashboard when they see a social post)

**Phase 2 — Photos unlock + SMS + auto-reward (gated on Partner App approval):**
- Replace per-tenant personal API tokens with OAuth flow
- Unlock attachments/photos endpoints (currently 404 on personal tokens)
- Move from polling to webhooks (cheaper, faster, real-time)
- Photos re-hosted to ProofPop CDN, embedded in email + customer-facing page
- Twilio SMS delivery
- Auto-detect customer social posts via existing FB/IG hooks
- Auto-pay reward via Giftbit on detected post

**Phase 3 — More CRMs:**
- JobNimbus, ServiceTitan, Jobber (each likely requires its own partner-app application — verify before scoping)

**Phase 4 — Smarter targeting:**
- AI scores jobs for review-request potential (skip jobs where customer was unhappy, skip warranty callbacks, etc.)
- A/B test message variants
- Optimal send time per customer (text vs email, time of day)

## Gotchas & Things to Solve

1. **CRM photo URLs expire** — must re-host. ProofPop CDN or Vercel Blob.
2. **Customer consent / privacy** — these are photos of the customer's home. Standard trade practice is fine to share back to the customer, but NEVER cross-reference photos between jobs/customers. Strict `job_id` filter.
3. **CRM API scopes vary** — some need expanded scopes (e.g. HCP token may need re-auth for attachments). Build the connector to surface this clearly.
4. **SMS sender number** — for ProofPop SMBs, sending from a ProofPop-pooled Twilio number is fine (customers know it's a notification), but high-touch businesses may want to send from their real number. Offer both modes.
5. **Reward attribution** — how do we know the customer's post was BECAUSE of the request, not organic? Probably fine to just pay anyone who tags within X days of the request — fraud risk is low for this category.
6. **Multi-tech jobs** — some jobs have 2+ techs. Personalization can name "Justin and Mike" or just the primary tech. Define what HCP returns.
7. **Re-send protection** — never send a review request twice for the same job. Idempotency key = `{business_id}:{job_id}`.

## Cross-Reference: Larry's Plumbing Specifics

The Linfordy agency is building this same feature on the Linfordy platform side, scoped to Linfordy's agency clients. ProofPop's version is the SaaS-product version of the same idea — different audience (any SMB self-onboarding), bigger reach, more reusable infrastructure.

If ProofPop ships this first, the Linfordy platform can just *use ProofPop* for its agency clients (Larry's, Kirkland, Pesh, Gaurav, etc.) instead of building a parallel implementation. That's probably the right move long-term — avoid duplicating CRM connectors in two places.

## Open Questions for Scott

1. Should ProofPop's onboarding for SMBs include this feature out of the gate, or gate it behind a "Pro" tier?
2. Pricing — is this bundled with the existing ProofPop subscription, or a usage-based add-on (e.g. $0.X per successful review)?
3. Should the AI message-generation step let the SMB approve before sending, or fully auto?
4. Reward funding — does the SMB pre-fund their reward pool with ProofPop, or charge per payout to their card on file?

## Deliverables Checklist for ProofPop Claude

- [ ] Add "review_request" template type to AI Composer (SMS + email + social-post variants)
- [ ] Build HCP integration (auth, job-completed event, attachments fetch)
- [ ] Photo re-hosting to ProofPop CDN
- [ ] Email delivery via existing infra
- [ ] Branded customer-facing review page (`reviews.proofpop.com/{job_id}`)
- [ ] Dashboard config UI ("CRM Auto-Review" section)
- [ ] Phase 1 ships email-only with manual reward; Phase 2 adds SMS + auto-reward
