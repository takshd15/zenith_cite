# Zenith SEO and credibility launch checklist

## Implemented

- Crawlable HTML with one H1 per page and logical section headings.
- Unique titles and descriptions for the homepage, booking page, two service pages, About draft, Insights draft, and 404 page.
- Relative canonical paths that resolve against the final HTTPS domain.
- Internal links between the homepage, service pages, and booking page.
- `robots.txt`, a domain-ready `sitemap.template.xml`, and a branded `404.html`.
- Visible keyboard focus, labelled booking fields, responsive layouts, reduced-motion support, and a text-based homepage LCP candidate.
- No fabricated dashboards, client logos, testimonials, or growth charts.

## Required before publishing

1. Confirm the production HTTPS domain.
2. Replace `{{CANONICAL_ORIGIN}}` in `sitemap.template.xml`, save the result as `sitemap.xml`, and add its absolute URL to `robots.txt`.
3. Configure HTTP redirects: HTTP to HTTPS, the chosen `www` or non-`www` host, and clean-directory routes to each `index.html` file.
4. Provide the verified business email, legal/trading name, operating location, and any required tax wording.
5. Confirm the displayed currency and whether prices include or exclude applicable tax.
6. Connect `/api/booking-request` to email delivery and test a complete request, Calendly booking, invitation, and rescheduling flow.
7. Add accurate Organisation structured data only after the visible business details are verified.
8. Supply a factual founder biography and a real photograph before removing `noindex` from `/about/`.
9. Supply a real anonymised audit, report preview, named authors, dates, screenshots, and primary sources before removing `noindex` from `/insights/`.
10. Add the completed About and Insights URLs to `sitemap.xml`.
11. Verify the site in Google Search Console, submit the sitemap, and inspect the homepage, service pages, and booking page.
12. Configure the production server to return `404.html` with an actual HTTP 404 status.

## Performance validation

- Run Lighthouse and mobile laboratory tests before launch.
- Measure field Core Web Vitals once traffic is available.
- Target the 75th percentile: LCP at or below 2.5 seconds, INP at or below 200 milliseconds, and CLS at or below 0.1.
- When real images are supplied, export responsive WebP or AVIF variants, include `width` and `height`, add descriptive `alt` text, and use `loading="lazy"` below the fold.
