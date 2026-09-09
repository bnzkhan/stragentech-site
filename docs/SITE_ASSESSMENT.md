# Stragentech Site Assessment — ICP Positioning & Structure Review
*Prepared for use by Claude Code as an implementation brief. Date: July 2026*

## Context
Site reviewed: www.stragentech.com, apps.stragentech.com/apps.html, tech-debt-calculator.html, agentic-aiot-playbook.html, whitepaper-ai-readiness.html.

## Overall Verdict
The site is well-built, credible, and unusually substantive for a solo fractional practice — the free tools, playbook, and whitepaper are genuine differentiators. But positioning is diffused: the homepage sells 6 services to 4 ICPs on a single page, forcing every visitor type (manufacturing COO, SaaS CEO, PE partner, e-commerce operator) to self-locate on one undifferentiated page.

## What's Working
- Problem-led hero ("The Signals Are There. Is Anyone Acting on Them?") names a felt pain rather than listing services.
- Quantified proof points ($37M savings, 75% automation, 30%→95% compliance, $7M EMEA) are the right currency for this audience.
- Conversion ladder is well-designed: free tools → $3.5–5K assessment → $10–15K/mo retainer.
- Contact form's situation dropdown segments leads at capture.
- apps.stragentech.com delivers "show, don't tell" — a working Claude-powered analyzer is a stronger credential than bullet lists.

## Diffusion Problems

1. **Positioning matrix, not a position.** 4 ICP cards × 6 service cards. Hero itself hedges ("e-commerce **and** industrial companies") before SaaS and PE appear further down. Undercuts the actual edge: deep vertical pattern recognition, not generalist coverage.
2. **Revenue bands contradict each other.** Hero says $5M–$100M; ICP cards say $25M–$150M (manufacturers), $10M–$50M ARR (SaaS), $10M–$100M GMV (e-commerce). Creates a self-disqualification moment for otherwise-qualified visitors.
3. **One page can't win search for three markets.** "Fraud prevention consultant," "IoT predictive maintenance fractional CTO," and "technical due diligence for PE" are three distinct search intents that a single anchor-link page can't rank for individually. Also breaks cold-email targeting — a manufacturing-outreach link lands on a page where fraud prevention appears first.
4. **Inconsistent voice.** Homepage speaks as "the team"/"the practice" (implies a firm); apps page and playbook speak as "I" (Bilal). The first-person voice is stronger and should win site-wide.

## Trust/Hygiene Issues (fix first — cheap, high credibility cost if left)

1. **GitHub repo links 404** (e.g., agentic-ops-playbook) while the apps page advertises "4 open-source GitHub repos." Publish minimal real repos or remove the claim/section.
2. **Three deck buttons on apps page link to "#"** ("Open the Playbook →" etc.) — dead anchors. The one real playbook (agentic-aiot-playbook.html) should be linked properly; others published or removed.
3. **Testimonials read as colleague endorsements, not client testimonials** (e.g., "James M., Engineering Director · Amazon Marketplace" reads as a coworker; "David K., CEO · Mid-Market E-commerce" reads anonymized/invented). Relabel honestly or use verifiable full names/LinkedIn where permitted.
4. **URL/canonical inconsistencies.** stragentech.com, /index.html, /stragentech.html all appear to serve as "the homepage" in different links — potential duplicate-content SEO issue; needs a 301 + canonical tag decision. LinkedIn URL inconsistency: some links use /in/bilalkhan, others /in/bilalakhan — verify which is correct and standardize everywhere.
5. **Credential claims must match reality exactly** (e.g., playbook footer cites "Harvard Agentic AI · Google AI Certified") — verify naming/status before a PE diligence buyer checks.

## Structural Recommendation

**Don't narrow the brand — narrow the pages.** Keep "Agentic Operational Intelligence" as the umbrella. Fix architecture:

- **Homepage becomes a router, not a warehouse.** Keep hero, Detect→Investigate→Act motif, proof numbers. Present exactly three doors:
  - Fraud & Trust (e-commerce)
  - Predictive Ops (industrial)
  - Diligence & Value Creation (PE)
  
  Fold "AI Transformation" and "Fractional CTO Retainer" in as engagement models *within* each vertical, not peer services. Six cards → three doors + one universal entry point (OI Assessment).

- **Build three vertical landing pages**: `/fraud`, `/industrial`, `/diligence`. Each needs:
  - Vertical-specific pain framing (already drafted in existing copy)
  - One deep case study matched to vertical (Amazon → fraud; AWS IoT/Dedicated Computing → industrial; Dedicated Computing PE context → diligence)
  - Matching free tool embedded on-page
  - Vertical-specific pricing
  - Own title tag + meta description (SEO surface area, also becomes cold-email landing destination)
  
  Priority: **build `/industrial` first** — matches current active Chicago/Midwest manufacturing outreach pipeline.

- **Unify voice to first person site-wide.** Best existing line: "the same frameworks I use in client engagements, available to try before you ever talk to me" (from apps page). Rewrite homepage About in this voice.

- **Reduce booking friction.** Replace/supplement "Book a Call" → form with an embedded scheduler (Calendly or Google Calendar appointments, given existing Google Workspace infra). Keep form as fallback.

## Priority Order / Implementation Sequence

**Week 1 (hygiene, no new pages):**
- Fix or remove dead GitHub repo links and "4 repos" claim
- Fix or remove dead deck button links ("#")
- Fix LinkedIn URL inconsistency (bilalkhan vs bilalakhan) site-wide
- Resolve index.html / stragentech.html canonical duplication (301 + canonical tag)
- Reconcile revenue bands across hero and all ICP cards to one consistent set of numbers per vertical

**Week 2–3:**
- Build `/industrial` vertical landing page (highest priority — active pipeline)
- Rewrite homepage About section to first-person voice
- Convert homepage service/ICP section into 3-door router structure

**Week 4+:**
- Build `/fraud` and `/diligence` vertical pages
- Testimonial section upgrade (verifiable names/permissions)
- Per-page SEO metadata + schema.org ProfessionalService/Person markup
- Embedded scheduler integration

## Notes for Implementation
- Existing copy for ICP pain points already exists on the current homepage and can be relocated/expanded into vertical pages rather than rewritten from scratch.
- Existing case study material (Amazon Marketplace, AWS IoT Analytics, Dedicated Computing, Boeing/Jeppesen) should be redistributed one-per-vertical-page rather than compressed into homepage bullets.
- Deployment: Vercel via GitHub repo `stragentech-site` (private), auto-deploy on push to main. DNS via Squarespace.
