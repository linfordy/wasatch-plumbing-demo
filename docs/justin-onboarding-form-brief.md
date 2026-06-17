# Brief: Build Justin Zmolik's Voice-Recording Onboarding Form

**For:** The Claude session building this on the Linfordy platform
**From:** Scott + Claude (Larry's Plumbing site session, 2026-05-21)
**Goal:** Capture Justin's business in enough detail that we can stop guessing and start automating

---

## Context

Larry's Plumbing Service (Rockwall, TX) is a Linfordy client. The site is live at https://larrysplumbingservice.com. We've built the marketing site, HouseCall Pro CRM integration, UTM attribution, admin dashboard, GA4, and the Linfordy chatbot embed is now live on the site.

Today (2026-05-21) Scott met with the owner, Justin Zmolik, on Zoom. They walked through what's live, brainstormed automations, and Scott told Justin he'd be sending him an onboarding questionnaire **tonight**. This brief is the spec for that questionnaire.

The same questionnaire pattern was built recently for another client (the "she" Scott referenced who completed 46 of 68 questions). Reuse that pattern.

## What the Form Is

A web-based questionnaire on the Linfordy platform with these properties:

- **Voice-first** — every question has a Press-Play-to-Record button. Audio is uploaded and transcribed.
- **Type as fallback** — every question also has a text input. Justin can type if voice isn't an option.
- **Per-section progress** — show "X of Y answered" so Justin can pause and resume.
- **Email-delivered link** — Justin gets a magic link from Scott (`scott@linfordy.com`). No login friction.
- **Final open section** — "Anything we missed? Talk here." (multiple recordings allowed)
- **AI-processed output** — once submitted, run all transcripts through Claude to build a custom automation plan / system blueprint. The plan should call out: tech-stack consolidation opportunities, automations to enable, referral campaigns to launch, content gaps, asset gaps.

Scott told Justin to **assume the listener knows nothing about his business** — even if Scott already knows something, Justin should restate it for the rest of the team.

## Tone & Onboarding Copy

Suggested opening screen text (adapt as needed):

> **Hey Justin — welcome.**
>
> This form is how we get inside your head so we can stop guessing and start building you real automations that actually drive jobs and free up your day.
>
> **The fastest way to fill this out is to hit the record button on each question and just talk.** Pretend the person listening has never met you and knows nothing about Larry's Plumbing. The more detail, the better — even if it feels redundant.
>
> You can type instead if you need to. You can pause and come back anytime. There's a section at the end for anything we didn't cover.
>
> Goal: get this back to Scott before the weekend so we can show you a real automation plan next Tuesday or Wednesday.

## Functional Requirements

- Auth: magic-link via email (Justin = `apverble@gmail.com` — wait, the transcript shows Adam Verbal at `apverble@gmail.com` was being added as a *second* user. **Justin's email is in `src/data/company.ts` as empty — confirm with Scott before sending the form to Justin directly.**)
- Audio capture: browser MediaRecorder API, upload to S3/Vercel Blob/equivalent
- Transcription: Whisper or Anthropic equivalent
- Question shape: `{ id, section, prompt, helper_text?, type: "voice_or_text" | "single_select" | "multi_select", options? }`
- Save on every answer (no submit button needed mid-flow)
- Final "Submit & Build My Plan" button at end
- Storage: each answer keeps both transcript AND audio file (audio for tone/voice cloning later, transcript for AI processing)
- Output: triggers a backend job that runs all answers through Claude with a system prompt to produce a structured plan doc

## The Questionnaire

Aim for ~65 questions across 9 sections. Below is the recommended set — adapt question wording for voice (conversational, open-ended) vs. selects (short and decisive).

### Section 1 — Business Vision & Goals (6 questions)

1. **Tell us in your own words what Larry's Plumbing does and what makes it different from other plumbers in your area.**
2. **Walk us through where you want the company to be in 2-3 years. Bigger crew? More locations? Same size but more profitable? Acquired?**
3. **What does a perfect week look like for you personally? What are you doing — and not doing?**
4. **What's the biggest thing slowing down your growth right now?**
5. **If you could wave a wand and have one thing in the business be 100% automated by next month, what would it be?**
6. **What kinds of jobs do you most want more of? (Tankless installs? Commercial? Emergency? Maintenance contracts?)**

### Section 2 — Tech Stack: How You Actually Use Each Tool (10 questions)

7. **Walk us through how you use HouseCall Pro day-to-day. What's working? What's annoying?**
8. **HCP automations are currently turned OFF (you had them off when on Podium). Which ones do you want back on? Booking confirmation, technician-on-the-way, job-complete, review-request — talk about each.**
9. **HCP's native SMS would require switching to one of their assigned phone numbers (not your real one). Sales Captain can send from your real number but you'd have to email them the scripts. Talk us through which path you want and why.**
10. **You moved from Podium to Sales Captain because Sales Captain is 1/4 the price. What did Podium do well that Sales Captain doesn't?**
11. **How exactly are you using Sales Captain today? Calls only? Texts? Reviews? Walk us through.**
12. **What other software, apps, or platforms are you using that we haven't talked about? (Accounting, scheduling, payroll, parts ordering, fleet tracking, anything.)**
13. **What's your Google Business Profile situation? Do you manage it? Who responds to reviews? Any issues with it?**
14. **Are you running ads anywhere right now? Google, Facebook, Yelp, Nextdoor, direct mail, anything?**
15. **What's your email situation? Do you have a list? Where does it live? When did you last email customers?**
16. **Phone setup — what number rings to who, and what happens when you can't answer?**

### Section 3 — Customer Journey & Daily Operations (8 questions)

17. **Walk us through what happens from the moment a customer calls you. Who answers? What do you collect? How does it get into HCP?**
18. **What's the average time between a customer calling and you being on-site?**
19. **What's your process when a customer doesn't pick up your call back? (You mentioned you currently text "technician on the way" — what else?)**
20. **What's the typical job pricing flow — when do you quote, do you give estimates over the phone, on-site only, etc.?**
21. **After a job's complete — what's your follow-up process? Anything? Nothing? Manual? Automated?**
22. **What % of your calls are repeat customers vs. new?**
23. **What % of jobs come in after-hours? What's the after-hours flow today?**
24. **Tell us about the rest of your team — who else fields calls, books jobs, runs trucks?**

### Section 4 — Marketing & Lead Generation (8 questions)

25. **Where are most of your leads coming from today? (Word of mouth? Google? Repeat customers? Referrals?)**
26. **What marketing have you tried that worked? What flopped?**
27. **What's your current monthly marketing spend (rough)?**
28. **If we turned on Google Ads next month, what services would you want them pointed at first?**
29. **Are there seasonal patterns we should know about? (Freeze season = burst pipes, summer = water heaters, etc.)**
30. **What's your view on Yelp? HomeAdvisor? Angi? Are you on them, do they work, are they worth the money?**
31. **Do you do anything with email or text outreach to past customers right now? (Sounds like no — confirm and tell us why not.)**
32. **What's a "good month" in revenue or jobs for you, and what would a "great month" look like?**

### Section 5 — Referrals (8 questions)

33. **Who sends you the most referrals today? Real estate agents, foundation companies, water mitigation companies — name names if you can.**
34. **Roughly what % of your jobs come from referrals?**
35. **Do you currently have a referral program for past customers? Anything formal?**
36. **For pro referrals (agents, mitigation, etc.) — do you have any kind of agreement, kickback, or just goodwill?**
37. **If we built an AI outreach system to scrape and contact real estate agents, foundation companies, and water mitigation in a radius around Rockwall — what radius makes sense, and who else would you want it to target?**
38. **What should the messaging sound like? Voicemail drop, text, email? Talk us through how you'd want to introduce yourself to a real estate agent you've never met.**
39. **Anyone in particular you've been wanting to build a referral relationship with but haven't gotten around to?**
40. **What's the best incentive for getting a referral, in your experience? Money? Free service? Gift card?**

### Section 6 — Online Presence & Listings (5 questions)

41. **You mentioned 20-30 online listings, some with wrong info. Which listings have you already claimed and fixed? Which are giving you trouble? (MapQuest specifically?)**
42. **What's the current address you want everywhere? (We just updated the site to 2139 S Farm to Market 549.)**
43. **Are there listings or directories you'd like us to add you to that you're NOT on yet?**
44. **How do you feel about asking customers for reviews? Comfortable doing it on-site? Want it automated? Both?**
45. **Any reviews online you're worried about, or competitors whose presence we should be aware of?**

### Section 7 — Pricing & Service Offering (7 questions)

46. **For the chatbot to give honest answers — walk us through your service-fee policy. Free estimates for residential? Backflow has a fee? Anything else with a fee?**
47. **Are there services you DON'T do that you sometimes get calls for? (So the chatbot can route correctly.)**
48. **The current site has two specials: $500 off tankless, $1,000 off Halo 5 water treatment. Are those still active? Anything else seasonal we should rotate?**
49. **Do you have a price book or rough price ranges you'd be willing to share for common jobs (water heater swap, drain cleaning, slab leak, etc.)? Even ranges help the chatbot set expectations.**
50. **What service do you make the most margin on? What service is the biggest headache?**
51. **What jobs do you want to push customers toward (e.g., upsell from tank to tankless)?**
52. **What's your warranty / guarantee story?**

### Section 8 — Brand Story & Assets (8 questions)

53. **Tell us the Larry's Plumbing story — your grandfather Larry started it in 1970, you took it over. Tell it the way you'd tell it at a backyard BBQ.**
54. **Who was Larry? What was he like? Any specific stories that capture the character of the business?**
55. **You mentioned an AI-generated old-timey photo of Larry in a plumbing uniform — please upload it. Also Larry's old Master Plumber license number if you can find it (you mentioned 7692 — confirm).**
56. **When can your team be available for new team photos? (You said you need to schedule this.)**
57. **Any individual photos, jobsite photos, before/after shots we should use? Upload here.**
58. **What logo files do you have? PNG, SVG, color variants? Upload.**
59. **Anything you'd NOT want associated with the brand? Tone to avoid, words you hate, competitors you don't want to be confused with?**
60. **How do you want customers to feel after a Larry's Plumbing job is done? In one or two sentences.**

### Section 9 — Open Catch-All (5 questions, all voice-or-text, multiple recordings allowed)

61. **Talk to us about anything we missed that you think we need to know to build automations for your business.**
62. **What's something a competitor does that you wish you did?**
63. **What's the dumbest manual task in your business right now that you'd love to never do again?**
64. **If you could see ONE dashboard every morning, what would it show?**
65. **Anything else — vent, brainstorm, share an idea. The floor is yours.**

---

## After Submission

When Justin clicks "Submit & Build My Plan":

1. Run all transcripts + selects through Claude with a system prompt like:
   > "You are an automation strategist. Read this onboarding intake from Justin Zmolik, owner of Larry's Plumbing Service (Rockwall, TX). Produce a structured plan covering: (1) immediate quick wins, (2) tech-stack consolidation recommendations, (3) automation phases in priority order, (4) referral / outreach campaign plan, (5) content & asset gaps, (6) open questions for Scott to follow up on. Cite specific things Justin said."

2. Generate a markdown doc, save to the Linfordy platform under Larry's Plumbing, notify Scott via email.

3. Optionally: tag specific answers with `→ Larry's site repo` (e.g., specials, service areas, pricing) so the Larry's site Claude can pull them in directly.

## Cross-References (Things Already Known)

The other Claude doesn't need to re-ask Justin about these — they're already in our system:

- Business: Larry's Plumbing Service LLC, Rockwall TX, est. 1970
- Owner: Justin Zmolik, TX Master Plumber License #41106
- Phone: (214) 729-3586, Text: (214) 549-1290
- Address: **2139 S Farm to Market 549, Rockwall, TX 75032** (just updated today — confirm with Justin)
- Service areas currently on site: Rockwall, Royse City, Rowlett, Garland, Plano, Highland Park, University Park
- Justin wants to ADD: Heath, Fate, and other neighboring towns (he has a document with descriptions, will send)
- 7 services on the site: emergency, residential, commercial, water heaters, tankless, drain cleaning, backflow
- Currently has: HouseCall Pro + Sales Captain. NO MailChimp. Used to have Podium.
- All HCP messaging automations currently OFF
- Chatbot embedded on the site as of 2026-05-21
- Justin's Google Business Profile has a verified address discrepancy he wants resolved
- A second user (Adam Verbal, `apverble@gmail.com`) is being added to the Linfordy platform alongside Justin
- HCP API key: shared in the chat with Scott earlier today (Scott will paste it for the platform Claude)
- HCP API has limited scopes on current token — Scott may need to file an HCP support ticket for expanded API access
- Sales Captain API exists but per Scott "isn't the best" — Justin's Sales Captain rep said they can turn on appointment reminders & review requests on their end if Justin emails them the scripts

## Deliverables Checklist for Other Claude

- [ ] Build the voice-recording form on the Linfordy platform
- [ ] Implement audio capture + transcription pipeline
- [ ] Build all 65 questions across 9 sections (use the list above; refine wording as needed)
- [ ] Implement progress tracking and resume-anywhere
- [ ] Send Scott a magic link he can forward to Justin **before the weekend** (target: 2026-05-23 Fri or earlier)
- [ ] On submit, run AI plan generation and deliver the markdown plan back to Scott
- [ ] Add Adam Verbal as a second user with view access to Larry's Plumbing on the platform

## Open Items for Scott to Confirm Before Sending

- [ ] Justin's direct email (transcript only confirmed Adam's email)
- [ ] Any questions to add/remove based on what Scott prefers
- [ ] Whether the AI-generated plan should be visible to Justin or Scott-only
