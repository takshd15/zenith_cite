# Insights publishing plan

Prepared 1 October 2026. Owner and named author: Taksh Dange. UK English.

## Launch articles

The four articles are complete locally under `/insights/`, with visible author
links, dates, primary sources, Article schema, related reading and a closing
free-snapshot CTA. Word counts include the closing CTA and exclude navigation,
the contents list, byline and related links.

| Article | URL | Words |
| --- | --- | ---: |
| How to check whether your business appears in ChatGPT answers | `/insights/check-business-in-chatgpt/` | 1,350 |
| What an AI visibility audit includes | `/insights/what-an-ai-visibility-audit-includes/` | 1,335 |
| GEO and SEO: what overlaps and what should you measure? | `/insights/geo-and-seo-measurement/` | 1,416 |
| Why ChatGPT recommends your competitor instead of you | `/insights/why-chatgpt-recommends-your-competitor/` | 1,319 |

Each guide distinguishes documented platform behaviour, the proposed method,
verifiable examples from Zenith Cite's own pages, and hypothetical scenarios.
The hypothetical figures are explicitly labelled. No customer audit, screenshot,
testimonial or outcome has been invented. Takkie AI and DonoLink remain excluded
at the user's request.

Primary documentation is linked beside the claims it supports:

- [OpenAI crawler controls](https://developers.openai.com/api/docs/bots)
- [ChatGPT web search](https://learn.chatgpt.com/docs/web-search)
- [Google AI search features](https://developers.google.com/search/docs/appearance/ai-features)
- [Perplexity crawlers](https://docs.perplexity.ai/docs/resources/perplexity-crawlers)
- [Bing AI Performance reporting](https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/)

## Two articles per month from week six

Use the actual production launch as week zero; no launch date is confirmed yet.
These are planned editorial slots, not scheduled automatic publication. Verify
reader demand with actual enquiries and available search data. The original
plan's low-competition and search-volume claims are not treated as verified.

| Slot | Topic and intended reader | Evidence to gather | Distinct reader outcome |
| --- | --- | --- | --- |
| Week 6 | AI visibility for SaaS startups; founders and small product teams | Public product documentation, real integration and pricing examples, official crawler guidance | Build a question set around customer type, integrations and switching constraints; identify documentation gaps. |
| Week 8 | How to get your Shopify store recommended by ChatGPT; store owners | Current Shopify and OpenAI commerce documentation, a permitted product-page example, verified stock/shipping/returns facts | Review product information and discoverability without promising recommendations or inventing shopping eligibility. |
| Week 10 | AI visibility for local service businesses; owner-operators | Current Google Business Profile guidance and verified public service-area, contact and opening-hours examples | Check location and service accuracy, including cases where the business is not a suitable local recommendation. |
| Week 12 | ChatGPT not recommending my business; website owners troubleshooting access | A documented, permitted public technical walkthrough, deployment responses, exact observed prompts and official platform controls | Diagnose missing access or information in sequence; use the launch competitor guide for competitive comparison rather than repeating it. |

The query theme “why AI recommends my competitor” is already covered by the
fourth launch guide. Improve that page when new evidence warrants it rather
than publishing a near-duplicate. Choose the next two monthly topics from
observed reader questions after reviewing the first four niche pieces.

## Publication and maintenance checklist

1. Confirm the intended customer question and how the piece differs from the
   existing guides. Agree any product or customer permissions before using them.
2. Verify current platform-specific claims with primary documentation. Keep
   observation, interpretation and illustrative examples clearly separated.
3. Use a named author and the actual publication date. The launch files currently
   use 1 October 2026; if first deployment is later, update visible dates,
   Article/OG dates and hub dates to that actual day. Update `dateModified` and
   sitemap `lastmod` only for substantive changes.
4. Keep one H1, a short description, canonical URL, Article schema, author link,
   relevant internal links and a closing `/book/` CTA. The shared article styles
   live in `assets/insights.css`; there is no build step or CMS dependency.
5. Add the directory route to `server.js`, link it from the Insights hub and
   related articles, and update the hub's ItemList, sitemap, sitemap template
   and `llms.txt`. Maintain Article `wordCount` and the displayed reading time.
6. Run `npm run test:seo`, validate changed structured data, and check the page
   at desktop and narrow mobile widths. Verify public URLs after deployment.
7. Review relevant enquiries, available search data and a dated answer sample
   monthly. Keep mentions, recommendations, citations and commercial outcomes
   separate; do not invent a platform-wide visibility percentage.

Article schema intentionally has no generic logo masquerading as an article
image. The shared branded social card is used in Open Graph metadata. Add an
Article image when a relevant, publishable illustration or screenshot exists.
