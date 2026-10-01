# Zenith Cite — SEO & AI Visibility Fix Plan

Derived from the 1 Oct 2026 audit, then re-checked against this repo. Where the
audit and the code disagree, the code wins — those cases are flagged.

Deploy target is **Vercel** (static HTML + `/api/*` serverless). `server.js` is
local dev only. That distinction matters: several fixes must land in
`vercel.json`, not `server.js`.

---

## Phase 0 — Two decisions that block everything else

Nothing in Phase 1 can be written until these are settled, because both get
hard-coded into files.

### 0.1 Pick the exact canonical origin

Every absolute URL in the sitemap, schema, and OG tags must use one spelling.
The audit text uses `https://www.zenith-cite.com`, but the brand copy and the
domain itself read `zenith-cite.com`. Pick one and never vary:

- **Recommended: `https://zenith-cite.com`** (no `www`) — shorter, matches how
  you say the brand out loud, and avoids a redirect hop on every request.
- In Vercel → Settings → Domains, add both, mark the non-`www` as **Primary**,
  and let Vercel 308 the `www` variant to it.

Write the chosen value down once here and reuse it verbatim:

```
CANONICAL_ORIGIN = https://zenith-cite.com
```

### 0.2 Settle the brand name

Five other "Zenith" companies sell AI visibility (zenithai.one, tryzenith.ai,
zenithelevation.com, az-zenith.com, zenithmedia.com). Google and every AI
assistant will merge you into them. Options:

| Option | Cost | Verdict |
| --- | --- | --- |
| Keep bare "Zenith" | $0 | Don't. You will never out-rank five incumbents for a word you share with them. |
| **"Zenith Cite"** everywhere | ~1 hour of edits | **Recommended.** Matches the domain, is unique on Google today, and needs no new domain. |
| New distinct name | days + new domain | Only worth it if you are willing to restart brand equity from zero. Decide now, not in month three. |

Everything below assumes **Zenith Cite**. If you choose differently, the string
substitutions in Phase 2 change but the structure does not.

---

## Phase 1 — Get indexed (do this first, ~2 hours)

**Implementation status — 1 Oct 2026:** Steps 1.1–1.7 are implemented locally
using `https://zenith-cite.com` and the Organization name `Zenith Cite`.
Local checks passed for all eight page routes, 64 redirect/query-string cases,
86 internal links, robots/sitemap responses, and Organization JSON-LD.
At the Phase 1 checkpoint, About and Insights remained `noindex` and were
excluded from the six-page sitemap. Phase 4 completes those pages and expands
the current sitemap to 12 URLs.

**Still required after deployment (1.8):** Confirm the Vercel primary domain and
`www` redirect; verify the domain in Google Search Console via DNS; submit
`https://zenith-cite.com/sitemap.xml` and request indexing for its current 12 URLs;
import the property into Bing Webmaster Tools and configure IndexNow. These
account/DNS steps remain unverified. The 1 Oct 2026 live check found the old
site still deployed: missing sitemap, placeholder robots/schema, duplicate page
URLs, and the apex redirecting to `www`. Re-check production after deployment
and after making the apex domain primary.
Update each sitemap `lastmod` when that page is meaningfully changed.

Nothing else in this document produces a single visitor until this phase is
done. Zero pages are in Google or Bing today.

### 1.1 Rename the homepage file — the biggest structural problem

**This is not in the PDF audit. It is the worst on-page issue after indexing.**

The homepage lives at `Zenith_Website_Layout.html` and is served at `/` by a
rewrite in [vercel.json](vercel.json). But **15 links across the subpages point
at `../Zenith_Website_Layout.html`** — including the logo in every header and
footer.

```
15 href="../Zenith_Website_Layout.html"
 2 href="../Zenith_Website_Layout.html#faqs"
```

So the homepage is reachable at two URLs that both return HTTP 200:
`/` and `/Zenith_Website_Layout.html`. The canonical tag says `/`, which
*mitigates* the duplicate — but every internal link vote you have is being cast
for the non-canonical URL. For a site with ~20 total links, that is most of your
internal link equity pointed at a URL you don't want indexed.

Fix, in order:

1. `git mv Zenith_Website_Layout.html index.html`
2. Replace all `../Zenith_Website_Layout.html` → `/` and
   `../Zenith_Website_Layout.html#faqs` → `/#faqs` across the 7 subpages.
3. Delete the `{ "source": "/", "destination": "/Zenith_Website_Layout.html" }`
   rewrite from [vercel.json](vercel.json) — once the file is `index.html`,
   Vercel serves it at `/` natively.
4. Update the `/` and `/Zenith_Website_Layout.html` route in
   [server.js:28](server.js#L28) to match.
5. Add a permanent redirect so the old URL doesn't linger, in `vercel.json`:

```json
"redirects": [
  { "source": "/Zenith_Website_Layout.html", "destination": "/", "permanent": true }
]
```

This also resolves the audit's "`/index.html` returns 404" note — same root cause.

### 1.2 Generate the real sitemap

`sitemap.template.xml` exists and has never been rendered. There is no build
step in [package.json](package.json), so commit the output as a static file.

```bash
sed 's|{{CANONICAL_ORIGIN}}|https://zenith-cite.com|g' sitemap.template.xml \
  | grep -v '^<!--' > sitemap.xml
```

Include only the six pages that are currently indexable. **Do not add `/about/`
or `/insights/` yet** — they are `noindex` for a reason (see Phase 3). Adding a
noindexed URL to a sitemap is a direct contradiction that Search Console will
flag as an error.

Also add `<lastmod>` to each entry; it is cheap and helps recrawl scheduling.

### 1.3 Fix robots.txt

Currently [robots.txt](robots.txt) is a placeholder comment. Replace with:

```
User-agent: *
Allow: /

Sitemap: https://zenith-cite.com/sitemap.xml
```

Do **not** add AI-crawler blocks (`GPTBot`, `ClaudeBot`, `PerplexityBot`,
`Google-Extended`). You are selling AI visibility — blocking the crawlers that
produce it would be the single most self-defeating line you could ship.

### 1.4 Serve robots.txt and sitemap.xml in local dev

**Also not in the PDF.** [server.js](server.js) whitelists every route
explicitly and has no entry for `robots.txt` or `sitemap.xml`. Vercel serves
root static files automatically, so production is fine — but you will never be
able to test them locally, which is how placeholder files survive to launch in
the first place. Add:

```js
app.get('/robots.txt', sendPage('robots.txt'));
app.get('/sitemap.xml', sendPage('sitemap.xml'));
```

### 1.5 Replace the schema placeholders

[index.html:206-216](index.html#L206-L216) originally shipped
three `{{CANONICAL_ORIGIN}}` placeholders inside the Organization JSON-LD. The
`url` and `logo` values are currently invalid URLs, which means Google discards
the whole block. Replace all three (including the HTML comment on line 206),
and set `name` to `Zenith Cite`.

### 1.6 Collapse duplicate URLs to one per page

Every page currently answers HTTP 200 at up to three URLs, with no redirects:

| URL | Source |
| --- | --- |
| `/book` | `rewrites` in [vercel.json](vercel.json) |
| `/book/` | Vercel directory index |
| `/book/index.html` | raw static file |

Canonical tags cover you, but you are spending three times the crawl budget per
page on a site Google has not yet decided to trust. In `vercel.json` add:

```json
"cleanUrls": true,
"trailingSlash": true
```

`cleanUrls` makes `/book/index.html` **308** to the clean path rather than
serving it. With both set, every page has exactly one 200 URL. The existing
`rewrites` block becomes redundant and can be deleted.

Note this interacts with 1.7 — do them together and re-check every link once.

### 1.7 Point internal links at clean URLs

Links currently use `index.html` suffixes throughout:

```
14 href="../book/index.html"
 8 href="../generative-engine-optimisation/index.html"
 8 href="../ai-visibility-audit/index.html"
 6 href="book/index.html"
```

Rewrite all of them to `/book/`, `/ai-visibility-audit/`,
`/generative-engine-optimisation/`, `/privacy/`, `/terms/`. Use root-relative
paths (leading `/`), not `../`, so they stay correct regardless of what depth a
future page sits at. Keep the query strings: `/book/?interest=growth`.

### 1.8 Verify in Search Console and Bing

- Google Search Console → add the domain property → verify via DNS TXT.
- Submit `https://zenith-cite.com/sitemap.xml`.
- URL Inspection → Request Indexing for each of the six pages individually.
- Bing Webmaster Tools → **Import from Search Console** (fastest path).
- Enable **IndexNow** in Bing. Bing powers ChatGPT search, so this is the
  shortest route to being citable by an AI assistant.

> **Checkpoint:** 3–7 days after this phase, `site:zenith-cite.com` should
> return 6 results and `zenith cite` should return you first. If it does not,
> stop and debug indexing before starting Phase 3 — content published to an
> unindexed site is wasted work.

---

## Phase 2 — On-page and metadata (~3 hours)

**Implementation status — 1 Oct 2026:** Website changes for 2.1–2.8 are complete
locally. UK English (`en-GB`) was explicitly selected; the existing
`/generative-engine-optimisation/` URL is retained. The homepage H1 keeps its
original “ask AI” wording, as the ChatGPT substitution was optional.

- All HTML titles and website wordmarks/footers now use Zenith Cite.
- Requested titles, homepage H2s, and the booking H1 are updated. Homepage and
  booking descriptions are 148 and 149 characters respectively.
- All eight main pages have complete Open Graph metadata, large-image Twitter
  cards, and absolute canonical/social URLs. About and Insights were noindex at
  this checkpoint; Phase 4 completes and makes them indexable.
- The social card was re-exported from its updated HTML source at 1200×630;
  the PNG is 141,413 bytes (under 150 KB), down from 540,770 bytes.
- Verification passed: eight pages' metadata, eleven HTML files' branding and
  language, seven homepage H2s, 64 redirect/query cases, 86 internal links,
  booking interest preselection, API validation, and the six-page sitemap.
- Browser checks passed at 1440, 390 and 320 pixels (24 page/viewport checks),
  with no page overflow, clipped headings, wrapped wordmarks, overlapping
  navigation, or JavaScript errors. The social card and representative desktop
  and mobile screenshots were also visually reviewed.

**Remaining outside the local website changes:** Deploy and verify production
after correcting the Phase 1 primary-domain setting. The LinkedIn company-page
rename in 2.1 is pending its URL and access to an authorised company-page admin
session. No LinkedIn change or production deployment was made here.

### 2.1 Rebrand strings to "Zenith Cite"

Replace the brand token in: every `<title>`, every `og:title`, the JSON-LD
`name`, the logo lockup text, the footer, and your LinkedIn company page.
Leave body copy that reads naturally as "Zenith" alone — titles and schema are
what the machines read.

### 2.2 New titles and descriptions

| Page | New title | New description |
| --- | --- | --- |
| `/` | `AI Visibility Agency: Get Recommended by ChatGPT \| Zenith Cite` | See whether ChatGPT, Perplexity and Google AI recommend your business. Free AI visibility snapshot, audits from €750 and monthly GEO work. |
| `/ai-visibility-audit/` | `AI Visibility Audit from €750: See How AI Ranks You \| Zenith Cite` | keep current (129 chars, good) |
| `/generative-engine-optimisation/` | keep, swap brand | keep (149 chars, good) |
| `/book/` | keep, swap brand | **Rewrite — currently 57 chars.** "Book a free 15-minute AI visibility snapshot. We check how ChatGPT, Perplexity and Google AI describe your business and show you the gaps." |
| `/about/` | `About Zenith Cite \| AI Visibility Specialists` | keep |

Target 140–155 characters for descriptions. Put the price in the audit title —
a number in a SERP listing is a click magnet and pre-qualifies the lead.

### 2.3 Add Open Graph tags to the five subpages

Confirmed by grep: the homepage has 6 `og:` tags; **`/about/`,
`/ai-visibility-audit/`, `/book/`, `/generative-engine-optimisation/` and
`/insights/` have zero.** Any of those shared on LinkedIn today renders as a
bare link with no image — which directly undercuts the LinkedIn-led strategy in
Phase 5.

Add to each `<head>`: `og:title`, `og:description`, `og:type`, `og:url`,
`og:image`, `og:image:width`, `og:image:height`, `twitter:card`.

### 2.4 Make og:image absolute

[index.html:10](index.html#L10) uses
`content="/zenith-social-share.png"`. **Relative OG image URLs are not resolved
by most scrapers** — LinkedIn, Slack and X will all show no image. Must be
`https://zenith-cite.com/zenith-social-share.png`.

While here: the source PNG is 528 KB. Re-export at 1200×630 and compress to
under 150 KB.

### 2.5 Make canonicals absolute

Relative canonicals (`href="/about/"`) are legal and do resolve, so this is a
lower priority than the audit implies — but absolute URLs remove any ambiguity
about `www`/protocol and cost nothing. Do it while you are in each file.

### 2.6 Add an H1 to the booking page

[book/index.html](book/index.html) has three `<h2>`s and **no `<h1>`**. Add:

```html
<h1>book your free AI visibility snapshot</h1>
```

### 2.7 Rewrite homepage H2s to match real searches

Current H2s are slogans. They read well but match no query, so they give Google
and AI extractors nothing to anchor an answer to.

| Current | Replace with |
| --- | --- |
| does your brand appear in the answer? | does your brand appear in ChatGPT's answer? |
| help more potential customers discover and consider you. | how GEO helps customers find you in AI search |
| understand the gaps. know your next move. | what's in an AI visibility audit |
| built for businesses that depend on being discovered. | who we help: SaaS, e-commerce, local services |
| start with clarity. build from there. | pricing: audit, growth and authority plans |
| questions, answered. | AI visibility FAQ |
| let's see where your brand stands. | book your free AI visibility snapshot |

The H1 — "get found when your customers ask AI." — is strong. Consider
"...ask ChatGPT." since that is the word people actually type.

The lowercase styling is a CSS `text-transform`, so the source text can carry
proper capitalisation without changing the visual design.

### 2.8 Settle UK vs US spelling

The site uses "optimisation" (including in the URL
`/generative-engine-optimisation/`) but declares `lang="en"`. Decide:

- **Selling to the US?** Switch to `lang="en-US"` and "optimization". The URL
  change needs a 301 — do it now while the page has zero authority to lose, or
  never.
- **Selling to the UK?** Set `lang="en-GB"` and leave the spelling.

Do not stay in the current ambiguous state. Pick one today; the cost of this
change rises every week the page is indexed.

---

## Phase 3 — Trust and proof (~3 days)

**Implementation status — 1 Oct 2026:**

- **3.1:** Replaced the About placeholders with Taksh Dange's founder profile,
  professional background from his supplied LinkedIn profile, public email,
  and linked `Person` schema. During Phase 4 the user supplied a real portrait;
  responsive WebP versions, descriptive alt text and the Person image URL are
  now added. About is `index,follow` and included in the sitemap.
- **3.2:** Deferred at the user's explicit request. No case-study pages,
  client claims, or case-study links have been added.
- **3.3:** Added a seven-question `FAQPage` matching the visible homepage FAQ,
  `Service` records on both service pages, and `Person` on About. Connected the
  records to a stable Organization ID. All five JSON-LD blocks passed the
  [Schema.org validator](https://validator.schema.org/) with zero errors and
  zero warnings. `ProfessionalService` was replaced with Organization + Service
  because [Schema.org marks it deprecated](https://schema.org/ProfessionalService).
  Pricing is represented through valid Offer/PriceSpecification records;
  `serviceType` belongs on Service. Geographic coverage remains omitted because
  the countries served have not been confirmed.
- **3.4:** Added `llms.txt` with the services, published prices, founder,
  contact information and current page links, and added its local GET/HEAD route.

**Confirmed pricing:** The user selected euros with taxes included. The existing
amounts are now €750 one-time, €1,500/month and €2,800/month across page copy,
metadata, structured data and `llms.txt`. Scope is agreed before work begins.

**Verification:** `npm run test:seo` checks FAQ/schema consistency, EUR pricing,
founder identity, canonical URLs, sitemap exclusions and `llms.txt`. Local HTTP
checks passed for eight pages, 64 redirects, 86 internal links, the new text-file
route and booking validation. Fifteen desktop/mobile checks passed, including
FAQ interaction. Production deployment has not been performed.

**Founder source:** [Taksh Dange's supplied LinkedIn profile](https://www.linkedin.com/in/taksh-dange-b98081273/).
Name, public email, founder role and pricing were supplied by the user. No
completed degree, employment dates, client outcomes, legal entity, postal
address or service geography have been inferred.

This is the highest-leverage phase for *conversion*, and the audit scores it
lowest (EEAT 2/10). A visitor today cannot tell who runs Zenith Cite, what it
has achieved, or who its clients are.

### 3.1 Un-hide the About page — but earn it first

`/about/` is `noindex,follow`. The PDF says "remove the noindex." The repo's own
[SEO_LAUNCH_CHECKLIST.md](SEO_LAUNCH_CHECKLIST.md) item 8 explains why it is
there: *"Supply a factual founder biography and a real photograph before
removing noindex."* The page even has an H2 reading "publish verified details,
not placeholders."

**That constraint is correct — honour it.** Indexing a trust page that contains
no verifiable trust signals is worse than not indexing it. Order of operations:

1. Write a real founder bio: your name, background, why you started this.
2. Add a real photograph with descriptive `alt` text.
3. Add `Person` schema linking your LinkedIn (`sameAs`).
4. *Then* flip to `index,follow` and add `/about/` to `sitemap.xml`.

Budget an hour for the writing. This single page is what a prospect checks
after your outreach email lands.

### 3.2 Publish two case studies

You already own the proof: the **Takkie AI** and **DonoLink** audits.

1. Ask Bazzo (Takkie AI) and Sjors (DonoLink) for permission in writing.
2. If either declines, anonymise: "AI support SaaS, Netherlands" /
   "creator-payments platform".
3. Create `/case-studies/` with one page each. Structure: the business →
   what AI said about them before → what we found → what changed → what to
   measure next.
4. Add both to the sitemap and link from `/ai-visibility-audit/` and the footer.

One real example outperforms every slogan on the site. This is also the content
most likely to get cited by an AI assistant, because it contains specific,
checkable claims rather than marketing language.

### 3.3 Add the remaining schema types

Original audit recommendation (see the implementation correction above):

- `ProfessionalService` — with `priceRange`, `areaServed`, `serviceType`.
- `Person` — you, as founder, on `/about/`.
- `Service` — one per service page.
- `FAQPage` — on the homepage FAQ block. **Highest priority of the four.**
  FAQ schema is structured Q&A, which is the single most directly extractable
  format for an AI assistant building an answer.

Validate every block at `validator.schema.org` before committing.

### 3.4 Publish `llms.txt`

Returns 404 today. A plain-text summary at `/llms.txt`: what Zenith Cite does,
services, pricing, founder, contact, key URLs.

Be realistic: `llms.txt` is a proposed convention with limited adoption, not a
ranking factor. It takes 20 minutes and for *this* business doubles as a
demonstration artefact you can point clients at. Do it for that reason.

Remember to add it to the `server.js` route list (see 1.4).

---

## Phase 4 — Content (~1 week, then ongoing)

**Implementation status — 1 Oct 2026:** Steps 4.1–4.2 are complete locally.
The existing Insights hub now links to all four launch articles, each with
1,200–1,800 words, Taksh Dange's linked byline, a visible publication date,
Article schema, primary sources, related reading and a closing free-snapshot CTA.
The articles contain 1,350, 1,335, 1,416 and 1,319 words respectively, including
their closing CTA. Sources support platform-specific claims; worked numbers
are explicitly illustrative and public Zenith Cite examples are identified.
No client case study or AI-answer screenshot has been invented.

About and Insights are now indexable, with the four articles included in the
12-page sitemap. Added article routes and redirects locally, responsive reading
styles, internal discovery links, and current `llms.txt` entries. The founder
portrait supplied by the user is served as responsive WebP images (20 KB and
44 KB), with dimensions, descriptive alt text and lazy loading.

**4.3 is an ongoing publishing commitment:** The next four niche article briefs
and the two-per-month cadence from week six are recorded in
[SEO_CONTENT_PLAN.md](SEO_CONTENT_PLAN.md). Week zero is the actual production
launch, whose date is not confirmed. Future articles are planned, not published
or automatically scheduled. The original keyword competition estimates remain
unverified; use real enquiries and search data to refine the backlog.

**Verification:** `npm run test:seo` passes for all 12 pages, article lengths,
author/date/schema consistency, internal links and anchors, metadata, EUR
prices, founder portrait, sitemap and `llms.txt`. All six new or updated Person,
CollectionPage and Article blocks passed Schema.org with zero errors and warnings.
Local HTTP checks passed for all 12 pages, 96 redirect/query cases, 228 internal
links, GET/HEAD `llms.txt`, article assets and booking input validation. All 36
page/viewport checks passed at 1440, 390 and 320 pixels, with no page overflow,
clipped headings or JavaScript errors. FAQ interaction and the founder image
load passed. Representative article, hub and portrait screenshots were visually
reviewed. JavaScript syntax and Git whitespace checks also passed.

**Deployment remains outstanding.** If first publication is later than
1 October 2026, update the launch articles' visible and structured publication
dates to the actual date. Recheck production routes, the primary domain and
indexing after deployment; local indexability does not establish live indexing.

### 4.1 The blog already exists — the PDF is wrong about this

The audit says *"no blog (`/blog/` is 404)"*. True for `/blog/`, but
**[insights/index.html](insights/index.html) is a complete content hub that is
`noindex`**, and it already contains a written editorial plan with three
article titles:

- "how to check whether your business appears in ChatGPT answers"
- "what an AI visibility audit includes"
- "GEO and SEO: what overlaps and what should you measure?"

So this is not a week of building a blog. It is: write three articles that are
already scoped, drop them in `/insights/`, remove the `noindex`, add to sitemap.
Significantly cheaper than the audit assumes — **do not rebuild this at
`/blog/`**; use the URL you have.

Checklist item 9 applies here too: real authors, dates, and primary sources
before the `noindex` comes off.

### 4.2 Launch articles

Write the three planned pieces, plus a fourth the audit identified as a gap:

4. "Why ChatGPT recommends your competitor instead of you"

Each one: 1,200–1,800 words, your own voice, named author, publish date,
`Article` schema, and a closing CTA to the free snapshot.

### 4.3 Then go after the niches the incumbents ignore

Head terms are contested (`ai visibility audit` ≈ 6,480 competing titles,
against Semrush, Forbes and Cision — you will not win those this year). Target
instead:

- AI visibility for SaaS startups
- how to get your Shopify store recommended by ChatGPT
- AI visibility for local service businesses
- why AI recommends my competitor
- ChatGPT not recommending my business

These have low competition, high commercial intent, and map directly to the two
case studies from 3.2. Two per month from week six.

---

## Phase 5 — Authority and measurement (ongoing)

### 5.1 Off-site

AI assistants repeat what multiple independent sources say. You currently have
zero third-party mentions, so there is nothing for them to repeat.

- Clutch, G2 (services), Crunchbase, LinkedIn company page — all renamed
  **Zenith Cite** so mentions don't credit the other five Zeniths.
- Outreach to the "best AI visibility / GEO agency" listicles: Digital
  Elevator, Optimist, Hamster Garage, Passion Digital. Ten emails.
- Answer the Reddit threads that rank for your terms — genuinely and without
  pitching. A useful answer that happens to be from you is worth more than a
  link drop, which will be removed.

### 5.2 LinkedIn as the engine

Your outreach already lives there. Post short teardowns from each audit (with
permission): *"Google rewrites this SaaS's brand name to a competitor's."*
These build authority, drive profile visits, and create citable content tied to
your name — which is the entity AI assistants need to disambiguate you from
zenithmedia.com.

### 5.3 Instrument it

- GA4 with a conversion event on booking submit, so you can attribute
  snapshots to organic vs LinkedIn vs outreach.
- Search Console: watch coverage weekly for the first month.
- A monthly 10-prompt AI visibility log for your own business, run across
  ChatGPT, Perplexity and Gemini. You sell this; run it on yourself and
  publish the results.

---

## Execution order (condensed)

| # | Task | Phase | Effort | Blocks |
| --- | --- | --- | --- | --- |
| 1 | Decide canonical origin + brand name | 0 | 30 min | everything |
| 2 | Rename homepage to `index.html`, fix 15 links, add redirect | 1 | 45 min | — |
| 3 | Generate `sitemap.xml` | 1 | 15 min | #1 |
| 4 | Fix `robots.txt` | 1 | 5 min | #3 |
| 5 | Serve robots/sitemap in `server.js` | 1 | 5 min | — |
| 6 | Replace 3 `{{CANONICAL_ORIGIN}}` in schema | 1 | 5 min | #1 |
| 7 | `cleanUrls` + `trailingSlash` in `vercel.json` | 1 | 10 min | — |
| 8 | Internal links → clean root-relative URLs | 1 | 30 min | #7 |
| 9 | **Search Console + Bing + IndexNow** | 1 | 30 min | #3, #4 |
| 10 | Rebrand strings to "Zenith Cite" | 2 | 1 hr | #1 |
| 11 | New titles + descriptions | 2 | 20 min | #10 |
| 12 | OG tags on 5 subpages | 2 | 30 min | #10 |
| 13 | Absolute `og:image` + canonicals | 2 | 15 min | #1 |
| 14 | H1 + 140-char meta on `/book/` | 2 | 10 min | — |
| 15 | Rewrite homepage H2s | 2 | 30 min | — |
| 16 | Decide en-GB vs en-US | 2 | 5 min | — |
| 17 | Founder bio + photo, un-noindex `/about/` | 3 | 1 hr | your copy |
| 18 | Two case studies | 3 | 2 days | permissions |
| 19 | FAQPage + ProfessionalService + Person + Service schema | 3 | 1 hr | #6 |
| 20 | `llms.txt` | 3 | 20 min | #1 |
| 21 | 4 articles → `/insights/`, remove noindex | 4 | 1 week | — |
| 22 | Directory profiles + listicle outreach | 5 | half day | #10 |
| 23 | GA4 conversion tracking | 5 | 30 min | — |
| 24 | Monthly 10-prompt AI visibility log | 5 | 1 hr/mo | — |

---

## What only you can do

Everything else is code I can write. These are not:

1. **Decide the canonical origin and the brand name** (Phase 0) — blocks all of
   Phase 1 and 2.
2. **Verify Google Search Console and Bing Webmaster Tools** — requires your
   login and DNS access. Nothing gets indexed until you do this.
3. **Confirm the Vercel primary domain** and that `www` 308s to the apex.
4. **Write the founder bio and supply a real photograph** — I will not invent
   biographical facts, and a fabricated one is the fastest way to destroy the
   trust this page exists to build.
5. **Ask Bazzo (Takkie AI) and Sjors (DonoLink) for case-study permission.**
   Send these two emails today; they gate the highest-value asset on the site
   and have the longest lead time of anything here.
6. **Decide UK vs US market** — determines spelling, `lang`, and whether the
   `/generative-engine-optimisation/` URL changes.
7. **Pricing display confirmed on 1 Oct 2026:** €750 / €1,500 / €2,800,
   with taxes included. Implemented in pages, metadata, schema and `llms.txt`.

---

## Expected outcomes

Realistic for a new domain with zero backlinks. Not guarantees.

| When | What should happen |
| --- | --- |
| Week 1–2 | All 6 pages indexed; `zenith cite` returns you first |
| Month 1–2 | Articles indexed; first long-tail impressions; 1–2 directory listings live |
| Month 2–4 | Page-1 for niche terms; first organic snapshot bookings; named in some AI answers for niche prompts |
| Month 4–6 | Competing for `ai visibility agency`; inbound leads alongside outreach |

The honest caveat: head terms like `ai visibility agency` are contested by
funded companies with years of links. Phases 1–3 are near-certain wins because
they fix objectively broken things. Phase 4–5 rankings depend on sustained
publishing, and the audit's month 4–6 projection assumes you keep shipping two
articles a month. If that slips, the timeline slips with it.
