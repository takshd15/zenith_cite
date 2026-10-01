# Zenith SEO and credibility launch checklist

## Implemented

- Crawlable HTML with one H1 per page and logical section headings.
- Unique titles and descriptions for the main pages, four Insights articles and 404 page.
- Absolute canonical URLs using `https://zenith-cite.com`.
- Internal links between the homepage, service pages, and booking page.
- `robots.txt` advertising the 12-page `sitemap.xml` at `https://zenith-cite.com`, with per-page `lastmod` dates, plus a branded `404.html`.
- Homepage at `index.html`, clean root-relative page links, and permanent redirects configured in Vercel and local development.
- Organization JSON-LD with the name `Zenith Cite` and absolute production URLs.
- Linked Organization, founder Person, service and FAQ structured data, validated at Schema.org with zero errors or warnings.
- Founder biography, real responsive portrait, Person image and direct public contact for Taksh Dange; About is now indexable.
- Four substantive Insights articles with Taksh's byline, dates, primary sources, Article schema and free-snapshot CTAs; the hub is now indexable.
- User-confirmed EUR prices with taxes included in page copy, metadata and structured offers.
- `llms.txt` summarising current services, pricing, founder, contact and key pages, served in local development.
- Zenith Cite titles, wordmarks and footers, with UK English (`en-GB`) throughout the HTML.
- Complete social metadata on all 12 pages and a 1200×630 social image below 150 KB.
- Updated homepage search headings and a booking-page H1, verified in desktop and mobile layouts.
- Visible keyboard focus, labelled booking fields, responsive layouts, reduced-motion support, and a text-based homepage LCP candidate.
- No fabricated dashboards, client logos, testimonials, or growth charts.

## Required before publishing

1. Confirm `https://zenith-cite.com` is the primary production domain in Vercel.
2. After deployment, verify `/robots.txt` and `/sitemap.xml` return HTTP 200 and contain the production URLs. Keep `lastmod` dates accurate when pages change.
3. Verify HTTP to HTTPS and `www` to non-`www` redirects in production, plus the configured legacy homepage and clean-directory redirects.
4. Public business email supplied: `takshdange@gmail.com`. Confirm the legal/trading name, operating location and service geography before adding those facts.
5. Confirmed: €750 one-time, €1,500/month and €2,800/month, with taxes included.
6. Connect `/api/booking-request` to email delivery and test a complete request, Calendly booking, invitation, and rescheduling flow.
7. Organisation and founder JSON-LD now include the supplied name, email and LinkedIn identity. Add postal address, legal identity and service geography only once confirmed.
8. Completed: founder biography and user-supplied portrait are present; About is indexable and in the sitemap.
9. Completed: four guides have a real named author, publication dates, primary sources and verifiable public website examples. Hypothetical scenarios are labelled. Client audits and screenshots remain excluded at the user's request; the guides do not claim to be client reports.
10. Completed: About, Insights and all four articles are in the 12-page sitemap. If launch is later than 1 October 2026, set article publication dates to the actual day as described in `SEO_CONTENT_PLAN.md`.
11. Verify the domain in Google Search Console via DNS, submit `https://zenith-cite.com/sitemap.xml`, and request indexing for all 12 sitemap URLs. Import into Bing Webmaster Tools and configure IndexNow.
12. Configure the production server to return `404.html` with an actual HTTP 404 status.
13. Rename the LinkedIn company page to Zenith Cite once its URL and admin access are available.

## Performance validation

- Run Lighthouse and mobile laboratory tests before launch.
- Measure field Core Web Vitals once traffic is available.
- Target the 75th percentile: LCP at or below 2.5 seconds, INP at or below 200 milliseconds, and CLS at or below 0.1.
- When real images are supplied, export responsive WebP or AVIF variants, include `width` and `height`, add descriptive `alt` text, and use `loading="lazy"` below the fold.
