# GA4 Analytics Implementation Brief — Stragentech Site
*Prepared for Claude Code. Companion to SITE_ASSESSMENT.md.*

## Objective
Install Google Analytics 4 across all live pages of stragentech.com, plus event tracking on the specific conversion points that matter for this business: tool usage, assessment/booking CTA clicks, and contact form submissions. This lets us measure whether the vertical-page restructuring (see SITE_ASSESSMENT.md) actually improves conversion, not just traffic.

## Prerequisite (human step, not Claude Code's job)
Before any code changes: Bilal needs to create a GA4 property at analytics.google.com (if one doesn't already exist) and get the **Measurement ID** (format: `G-XXXXXXXXXX`). All snippets below use `G-XXXXXXXXXX` as a placeholder — **find/replace this with the real Measurement ID before deploying**. Do not deploy with the placeholder still in place; it will silently collect no data.

## Step 1 — Locate all live HTML pages
Search the repo for every page that gets deployed (not just the files listed here — confirm against the actual `stragentech-site` repo structure, since filenames may differ slightly from the project reference copies):
- Homepage (index.html and/or stragentech.html — resolve per the canonicalization fix in SITE_ASSESSMENT.md; only the canonical version needs the tag, but if both are still live, tag both)
- apps.html / apps_stragentech.html
- whitepaper-ai-readiness.html
- Tech debt calculator page
- Fraud ROI calculator page
- OI Readiness Scorecard page
- Agentic AIoT playbook page
- Any future vertical pages (/fraud, /industrial, /diligence) — these need the tag from day one when built

Every page that can be a visitor's first landing page or a conversion point needs the base tag. Missing even one page creates a blind spot in the funnel data.

## Step 2 — Add the base GA4 tag
Insert this snippet into the `<head>` of every page identified in Step 1, as early as possible in `<head>` (before other scripts, per Google's recommendation for accurate measurement):

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

This alone gives pageviews, sessions, traffic source, device type, and geography — no further work needed for baseline traffic reporting.

## Step 3 — Event tracking for conversion points

GA4 auto-tracks some things (scrolls, outbound clicks, file downloads) if "Enhanced measurement" is on by default in the property settings — verify that's enabled in the GA4 admin panel, it usually is by default.

For the events that matter specifically to this business, add manual event calls. Below are the four event types to implement, with example code. **Claude Code should locate the actual button/form elements in each file and attach these, adjusting selectors to match the real DOM** — the selectors below are illustrative based on the copy described in SITE_ASSESSMENT.md and may not match exact class/id names in the live HTML.

### 3a. Tool usage (calculator submissions, scorecard completions)
Fire when a user completes a tool, not just opens it — completion is the meaningful signal.

```html
<script>
  document.getElementById('calculator-submit-btn').addEventListener('click', function() {
    gtag('event', 'tool_completed', {
      'tool_name': 'tech_debt_calculator' // change per page: 'fraud_roi_calculator', 'oi_readiness_scorecard', etc.
    });
  });
</script>
```

Apply this pattern to each tool's submit/calculate/results button, with `tool_name` set appropriately per page.

### 3b. Assessment / "Book a Call" CTA clicks
Fire on click, regardless of destination (whether it goes to a form or an external scheduler):

```html
<script>
  document.querySelectorAll('.cta-book-call, .cta-assessment').forEach(function(btn) {
    btn.addEventListener('click', function() {
      gtag('event', 'cta_click', {
        'cta_label': btn.textContent.trim(),
        'page_location': window.location.pathname
      });
    });
  });
</script>
```

Claude Code should find the actual CTA button selectors on each page — there may be multiple CTA variants ("Book a Call," "Get Assessment," "Start Free Tool") that should each fire with their own `cta_label` so we can see which phrasing/placement converts best.

### 3c. Contact form submission
This is the primary business conversion event — track it explicitly rather than relying on Enhanced Measurement's generic form detection, since we want the situation-type dropdown value captured too:

```html
<script>
  document.getElementById('contact-form').addEventListener('submit', function() {
    var situationField = document.getElementById('situation-dropdown'); // adjust id to actual field
    gtag('event', 'contact_form_submit', {
      'situation_type': situationField ? situationField.value : 'unknown'
    });
  });
</script>
```

Capturing `situation_type` lets us see, in GA4, which ICP segment is actually converting — directly answers the "are we reaching the right targets" question from the site performance discussion.

### 3d. GitHub repo / deck link clicks (once those are fixed per SITE_ASSESSMENT.md Week 1)
Once the dead links are resolved, track outbound engagement with proof-of-work content:

```html
<script>
  document.querySelectorAll('a[href*="github.com"], .cta-open-deck').forEach(function(link) {
    link.addEventListener('click', function() {
      gtag('event', 'proof_content_click', {
        'content_type': link.href.includes('github.com') ? 'github_repo' : 'deck',
        'content_label': link.textContent.trim()
      });
    });
  });
</script>
```

## Step 4 — UTM parameter support (no code needed, process only)
For outbound channels (LinkedIn posts, cold email links), append UTM parameters to any link back to the site so GA4 attributes traffic correctly:

```
https://stragentech.com/industrial?utm_source=linkedin&utm_medium=social&utm_campaign=chicago_manufacturing_q3
https://stragentech.com?utm_source=coldemail&utm_medium=email&utm_campaign=midwest_pe_outreach
```

This is a habit for Bilal going forward, not something Claude Code needs to build — flagging here so the brief is complete.

## Step 5 — Verify
After deployment:
1. Open GA4 → Reports → Realtime, visit the live site, confirm pageview registers.
2. Trigger each event manually (submit a test form entry, click a CTA, complete a calculator) and confirm each shows up in Realtime → Event count by Event name.
3. Do NOT submit a real contact form with fake data in production if it emails Bilal directly — check whether there's a way to test without triggering an actual lead notification, or test in a staging/preview deploy (Vercel preview URLs are ideal for this since they're isolated from production).

## Notes for Claude Code
- Do not hardcode a real Measurement ID — leave `G-XXXXXXXXXX` as the placeholder and flag it clearly in the PR/commit description as something Bilal must fill in before merge, since this brief doesn't include the real ID.
- If the site uses a shared header/footer include (check for a partials or template pattern in the repo) rather than repeated raw HTML per page, add the base tag there once rather than duplicating it across every file — check for this before doing a manual per-file edit.
- Keep this as its own reviewable commit, separate from the Week 1 hygiene fixes in SITE_ASSESSMENT.md, so analytics installation doesn't get tangled with link fixes in the same diff.
