# HouseCall Pro API — Confirmed-From-Source Reference

**Probed live:** 2026-05-25 using Larry's Plumbing API token + UI walkthrough
**Production company_id:** `698b2ce0-1139-43f5-b7f1-4bb89a5b3ed8` (Larry's Plumbing Service)
**Plan tier:** ✅ MAX (confirmed in-app — Basic/Essentials = Not Available, MAX = Current Plan)

This doc captures what we verified against the live HouseCall Pro API and the HCP web UI. Anything not listed here was either not tested or returned 404 / 500 with our token.

**Key correction (2026-05-25):** Earlier versions of this doc claimed an "OAuth Partner App" approval process is required for photos/webhooks. **That was wrong.** HCP gates these features by plan tier (MAX), and they're self-serve from the App Store. There is no separate developer-program enrollment. HCP explicitly tells pros to hire their own dev — they don't run a developer relations team.

---

## Auth & Base URL

```
Base URL:    https://api.housecallpro.com
Auth header: Authorization: Token {API_KEY}
```

⚠️ **It's `Token`, not `Bearer`.** This trips up everyone who reads it for the first time.

---

## Pagination Pattern (consistent across list endpoints)

```
Query params:  ?page=N&page_size=200   (200 is the max)
Response:      { page, page_size, total_pages, total_items, <resource>: [...] }
```

**Performance:** ~5-6s per 200-record page. Plan for parallel fetch + cache.

---

## ✅ Confirmed Working Endpoints

### `GET /jobs` — list jobs

Returns paginated jobs. **Total for Larry's:** 5,360 jobs (as of probe).

### `GET /jobs/{id}` — single job

Full job object. **Sample shape (every key on the response):**

```ts
{
  id: "job_3c0cbc331199442e94b6d8b90b2c8fc2",
  invoice_number: "13737125",
  description: "Residential Service Call",

  // Customer (inlined — saves a round trip)
  customer: {
    id: "cus_85dade...",
    first_name: "Luvy",
    last_name: "Amaya",
    email: "luvy.ann@gmail.com",
    mobile_number: "2147179628",
    home_number: null,
    work_number: null,
    company: null,
    notifications_enabled: true,
    lead_source: "SalesCaptainAI",   // HCP pre-configured value
    notes: null,
    kind: "homeowner",                // also seen: commercial probably exists
    created_at: "2026-05-21T12:00:59Z",
    updated_at: "2026-05-21T12:01:45Z",
    company_name: "Larry's Plumbing Service",
    company_id: "698b2ce0-...",
    tags: []
  },

  // Job-specific service address (separate from customer.addresses)
  address: {
    id: "adr_5c259cfd...",
    type: "service",
    street: "5530 Morningside Avenue",
    street_line_2: "",
    city: "Dallas",
    state: "TX",
    zip: "75206",
    country: "United States"
  },

  notes: [],

  // Status + lifecycle timestamps
  work_status: "scheduled",
  work_timestamps: {
    on_my_way_at: null,
    started_at: null,
    completed_at: null    // ← perfect trigger for auto-review automation
  },

  schedule: {
    scheduled_start: "2026-05-26T14:00:00Z",
    scheduled_end:   "2026-05-26T17:00:00Z",
    arrival_window:  120,
    appointments:    []
  },

  // Money (all in CENTS)
  total_amount:        515695,   // $5,156.95
  outstanding_balance: 515695,   // 0 means paid in full
  subtotal:            572995,
  job_fields: { job_type: null, business_unit: null },

  // Assigned employees with full permission objects
  assigned_employees: [
    {
      id: "pro_3fac6ae3...",
      first_name: "Evan",
      last_name: "Hatcher",
      email: "evanh22@gmail.com",
      mobile_number: "4695591196",
      color_hex: "e65100",
      avatar_url: "https://housecall-attachments-production.s3....png",
      role: "office staff",
      tags: [],
      permissions: {
        can_add_and_edit_job, can_call_and_text_with_customers,
        can_chat_with_customers, can_delete_and_cancel_job,
        can_edit_message_on_invoice, can_see_street_view_data,
        can_take_payment_see_prices, can_see_customers,
        can_see_marketing_campaigns, can_see_reporting,
        can_edit_settings, can_be_booked_online, can_share_job,
        can_see_full_schedule, can_see_future_jobs,
        is_point_of_contact, is_admin
      },
      created_at: "2024-07-30T20:03:11Z",
      company_name: "Larry's Plumbing Service",
      company_id: "698b2ce0-..."
    }
  ],

  // Estimate link
  original_estimate_id:    "est_3ec595dc...",
  original_estimate_uuids: ["est_3ec595dc..."],

  // Misc
  tags: [],
  lead_source: null,
  locked_at: null,
  created_at: "2026-05-22T18:16:05Z",
  updated_at: "2026-05-22T18:16:51Z",
  canceled_at: null,
  deleted_at: null,
  assigned_route_template_id: null,
  company_name: "Larry's Plumbing Service",
  company_id:   "698b2ce0-...",
  recurrence_number: null,
  recurrence_rule:   null
}
```

### `GET /jobs/{id}/line_items` — work items / pricing breakdown

Returns array of line items with `name`, `description` (including work-performed notes), `unit_price`, `unit_cost`, `quantity`, `duration_in_minutes`, `kind` (e.g. `"labor"`).

**Useful for auto-review messages:** the `description` field on line items contains "Work Performed" notes the tech writes — this is gold for personalizing review-request messages without needing photos.

### `GET /jobs/{id}/appointments` — appointment data per job

### `GET /customers` — list customers (paginated)

### `POST /customers` — create customer (used by Larry's form)

⚠️ **`lead_source` field requires a pre-configured value in HCP settings** — sending arbitrary strings returns "Lead source not found." Workaround: put source info in `notes`. Or have Justin pre-configure values in HCP UI (he already has `"SalesCaptainAI"` configured).

### `GET /leads` — list leads

### `POST /leads` — create lead (used by Larry's form)

### `GET /estimates` — list estimates

### `GET /invoices` — list invoices

### `GET /employees` — list employees / staff

### `GET /events` — calendar events / follow-ups

⚠️ NOT a webhook activity stream. These are user-created calendar events / follow-up reminders Justin sets in HCP (e.g. "Follow up with Jim Ilkenhans on estimates provided"). Useful for surfacing pending follow-ups on a dashboard.

### `GET /company` — company profile

Returns the business's HCP-side profile: name, phone, support_email, logo URL, address, website, time zone, service area zip codes.

---

## ❌ Confirmed NOT Working (with personal API token)

All of the following returned **404** (or 500 for `/oauth/applications`):

| Path | Status |
|---|---|
| `GET /jobs/{id}/attachments` | 404 |
| `GET /jobs/{id}/photos` | 404 |
| `GET /jobs/{id}/files` | 404 |
| `GET /jobs/{id}/images` | 404 |
| `GET /jobs/{id}/messages` | 404 |
| `GET /jobs/{id}/notes` | 404 |
| `GET /jobs/{id}/payments` | 404 |
| `GET /attachments?job_id={id}` | 404 |
| `GET /webhooks` | 404 |
| `GET /webhook_subscriptions` | 404 |
| `GET /oauth/applications` | 500 |

**The job object itself has NO photo/attachment fields embedded** (verified — the 28-key shape above is the entirety of what comes back).

---

## Plan Tier Requirements

HCP gates API and webhooks behind plan tiers:

| Feature | Basic | Essentials | MAX |
|---|---|---|---|
| API key generation | ❌ Not available | ❌ Not available | ✅ Available |
| Webhooks app | ❌ Not available | ❌ Not available | ✅ Available |

Larry's is on **MAX** (confirmed in-app). No separate developer application required — everything is self-serve via the App Store inside `pro.housecallpro.com`.

### How to enable Webhooks (self-serve)

1. Login → My Apps (3×3 grid icon, top right) → **Go to App Store**
2. Find the **Webhooks** app card
3. Toggle **Active** (turns blue)
4. Enter your webhook endpoint URL → Save
5. Copy the **Signing Secret** (used to verify incoming webhooks server-side)
6. Toggle on the specific events you want to receive

### How to generate an API key (self-serve, admin users only)

1. Login → My Apps → App Store
2. Find the **API** app card → click **Generate API Key**
3. Name the key (for tracking purposes — multiple keys allowed)
4. Use as `Authorization: Token {key}` (NOT Bearer)

⚠️ API keys grant **full account access**. Treat like a password. Deleting a key breaks integrations using it.

---

## Webhooks (Confirmed In-App)

**Webhook URL field:** single URL per HCP account. HCP does NOT support multiple destination URLs natively.

### Currently configured for Larry's (as of 2026-05-25)

- ✅ Webhooks app: **Active**
- 🎯 Destination URL: `https://app.salescaptain.com/api/v1/housecallpro/...` (Sales Captain receives ALL webhooks today)
- 🔑 Signing secret: present (sample format: 32-char hex)

**Currently enabled events on Larry's account:**
- `customer.created`, `customer.updated`
- `invoice.paid`
- `job.completed`, `job.created`, `job.on_my_way`, `job.paid`, `job.scheduled`

### ⚠️ Fan-Out Architecture Required (confirmed by HCP support, 2026-05-25)

HCP support confirmed in writing:

> "Housecall Pro does not currently support multiple webhook destination URLs per account. To send webhook events to more than one consumer (e.g., your SMS provider and your own automation system), you would need to build a fan-out proxy that receives the webhook from Housecall Pro and then forwards the events to both destinations."

So because HCP supports only one webhook URL per account, and Sales Captain is the current consumer, **we cannot just point HCP at our own endpoint without breaking Sales Captain**.

The pattern we need:

```
HCP webhook → Our endpoint (Linfordy/ProofPop) → ┬→ Forward verbatim to Sales Captain
                                                  └→ Process our own automation pipeline
```

Our endpoint becomes the single destination HCP sees, then fans out events to (a) Sales Captain (preserving their integration) and (b) our automation system. Each tenant's "downstream destinations" become configurable in our platform.

### Full Event Catalog (Larry's MAX account, 2026-05-25)

**Customer (3):**
`customer.created` · `customer.deleted` · `customer.updated`

**Estimate (9):**
`estimate.completed` · `estimate.copy_to_job` · `estimate.created` · `estimate.on_my_way` · `estimate.option.approval_status_change` · `estimate.option.created` · `estimate.scheduled` · `estimate.sent` · `estimate.updated`

**Invoice (9):**
`invoice.amount_updated` · `invoice.canceled` · `invoice.created` · `invoice.paid` · `invoice.payment.failed` · `invoice.payment.succeeded` · `invoice.refund.succeeded` · `invoice.sent` · `invoice.voided`

**Job appointment (5):**
`job.appointment.appointment_discarded` · `job.appointment.appointment_pros_assigned` · `job.appointment.appointment_pros_unassigned` · `job.appointment.rescheduled` · `job.appointment.scheduled`

**Job (9):**
`job.canceled` · `job.completed` · `job.created` · `job.deleted` · `job.on_my_way` · `job.paid` · `job.scheduled` · `job.started` · `job.updated`

**Lead (5):**
`lead.converted` · `lead.created` · `lead.deleted` · `lead.lost` · `lead.updated`

**Pro (1):**
`pro.created`

**Total: 41 confirmed events.** HCP's docs claim "46+" — the 5 unaccounted-for events may be hidden behind a sub-section or only on certain MAX add-ons.

**Webhook payload format:** HCP sends `{"foo": "bar"}` as a test on save. Real payload shape per event needs probing (or check HCP docs — open question in support email).

---

## Photos / Attachments — Confirmed NOT Accessible (HCP support, 2026-05-25)

HCP support (AI chat) confirmed in writing:

> "Currently, job attachments such as photos uploaded by technicians in the field are not accessible through the public REST API, even on the MAX plan. The endpoints you tried (/jobs/{id}/attachments, /photos, /files, /images) returning 404 indicate that this functionality is not exposed at this time. There is no publicly documented workaround or roadmap information available about exposing job attachments via API."

Same for estimate attachments — confirmed not exposed.

**Implication:** Any "auto-review-with-photos" feature has to source photos from somewhere other than the HCP REST API. The workarounds below are now mandatory, not optional.

> ⚠️ Source: HCP support **AI chat**, not a human rep. If we ever need to challenge this (e.g. lobby HCP product team to expose attachments), a human account-manager conversation should be the next step.

### Workarounds if photos are NOT accessible via API

1. **Tech-uploaded photos to a separate channel** — techs upload to our mobile-web page before marking jobs complete. We control that pipeline.
2. **Manual photo attach per job** — admin dashboard with drag-drop. Lower friction than a separate app.
3. **Use line-item descriptions instead of photos** — `GET /jobs/{id}/line_items` `description` field contains "Work Performed" notes the tech writes. Auto-review messages can quote that work narrative even without photos.
4. **Photos-optional review request (recommended for Phase 1)** — send the request immediately on `job.completed` webhook with text only. If photos become accessible later (or via the manual attach workaround), send a follow-up "here are your photos" message.

---

## Trigger Strategy for Auto-Review

**Preferred: webhook-driven** (now confirmed available). Subscribe to `job.completed` (or `job.paid` if we want to wait until customer has paid) and process inbound webhooks in real-time.

**Fallback: polling** (if fan-out service isn't ready yet, or for tenants where webhooks aren't enabled):

```
Every 15 min:
  Fetch /jobs?page=1&page_size=200 sorted by updated_at desc
  For each job where work_timestamps.completed_at is NOT null
    AND completed_at > last_check_timestamp
    AND we haven't already sent a review request for job.id:
      → enqueue review-request workflow
  Persist last_check_timestamp
```

**Idempotency:** `{company_id}:{job_id}` as the dedup key in the queue. Never send twice for the same job.

**Paid-job trigger alternative:** `outstanding_balance === 0` is the "paid" signal. Use the `job.paid` webhook directly, or `updated_at` in poll mode.

---

## ⚠️ Issues Discovered in Larry's HCP Data

While probing, found inconsistencies in HCP's record of Larry's:

1. **Address mismatch with the site:**
   - Old site address: `6730 Horizon Rd Suite B, Rockwall, TX 75032`
   - New site address (updated 2026-05-21): `2139 S Farm to Market 549, Rockwall, TX 75032`
   - **HCP's `/company.address`:** `457 Laurence Drive #608, Heath, TX 75032`

   Three different addresses across systems. Justin mentioned in the 2026-05-21 Zoom that GBP was showing two addresses — HCP may be one of the upstream sources of that inconsistency. Recommend syncing HCP to match the new GBP address.

2. **Website typo in HCP:**
   - HCP shows: `http://www.larrrysplumbingservice.com` (3 r's in "larrrys"), HTTP not HTTPS
   - Correct: `https://larrysplumbingservice.com`

   If HCP sends customer-facing messages with the website link, customers hit a typo'd URL. Justin should fix this in HCP settings.

3. **Lead source `"SalesCaptainAI"` exists** — this is a pre-configured value in Larry's HCP. We can pass `"SalesCaptainAI"` (or other pre-configured values) as `lead_source` on POST /customers without the "Lead source not found" error.

---

## Rate Limits

**HCP support reply (2026-05-25):** "There is no publicly documented information on exact REST API rate limits (requests per minute) or webhook delivery retry policies for slow or 5xx responses. For specifics on rate limiting and webhook retry behavior, I recommend contacting Housecall Pro's developer support or your account manager."

**Operationally:** never hit a limit in our probes. Parallel page fetches (5+ pages of 200 simultaneously) returned 200s consistently. Recommend implementing exponential backoff anyway since the limits exist but are undocumented.

**Action item:** If we scale this to many tenants, escalate to an HCP account manager to get rate-limit numbers in writing.

---

## HCP Support Replies (received 2026-05-25, via AI chat)

| Question | Answer | Implication |
|---|---|---|
| Job photos/attachments via REST? | ❌ Not accessible on MAX or any tier. No roadmap info. | Photos-optional design is mandatory. |
| Estimate attachments via REST? | ❌ Not accessible. | Same as above. |
| Multiple webhook URLs per account? | ❌ No — must build fan-out proxy. | Fan-out architecture is non-negotiable. |
| Rate limits documented? | ❌ Not publicly. Contact account manager for specifics. | Implement exponential backoff; escalate before scaling tenants. |
| OpenAPI/Swagger spec link? | Not provided in reply. | Live probing remains the source of truth. |

⚠️ Source caveat: HCP support **AI chat** (not human rep). Reliable for operational guidance; escalate to a human account manager if we need to challenge any of these answers or get rate limits in writing.
