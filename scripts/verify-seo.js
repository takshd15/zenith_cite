'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const origin = 'https://zenith-cite.com';
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const normalise = text => text.replace(/\s+/g, ' ').trim();
const schemas = html => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]));
const routes = ['/', '/book/', '/ai-visibility-audit/', '/generative-engine-optimisation/', '/about/', '/insights/', '/privacy/', '/terms/', '/ai-seo/', '/ai-findability/', '/chatgpt-visibility/', '/perplexity-optimization/', '/nl/geo-diensten/', '/nl/ai-zichtbaarheid-audit/', '/nl/ai-zoekoptimalisatie/', '/nl/ai-vindbaarheid/', '/nl/chatgpt-vindbaarheid/', '/nl/', '/nl/boeken/', '/industries/', '/industries/dental-clinics/', '/industries/law-firms/', '/industries/real-estate/', '/industries/ecommerce/', '/industries/saas/', '/europe/', '/white-label-geo/'];
const articleRoutes = fs.readdirSync(path.join(root, 'insights'), { withFileTypes: true })
  .filter(entry => entry.isDirectory() && fs.existsSync(path.join(root, 'insights', entry.name, 'index.html')))
  .map(entry => `/insights/${entry.name}/`);
routes.push(...articleRoutes);
const pages = new Map(routes.map(route => [route, read(route === '/' ? 'index.html' : route.slice(1) + 'index.html')]));

// The sitemap must match the actual indexing directives, including draft pages.
const sitemapUrls = [...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]).sort();
const indexable = [...pages].filter(([, html]) => !/name="robots" content="noindex/.test(html)).map(([route]) => origin + route).sort();
assert.deepEqual(sitemapUrls, indexable, 'Sitemap and page indexing directives disagree');
for (const [route, html] of pages) {
  assert.ok(html.includes(`rel="canonical" href="${origin}${route}"`), `Canonical URL: ${route}`);
  assert.ok(!html.includes('{{CANONICAL_ORIGIN}}'), `Placeholder URL: ${route}`);
  assert.ok(!/\$(?:750|1,500|2,800)/.test(html), `Old dollar prices: ${route}`);
  schemas(html); // Every JSON-LD block must parse, including pages not listed below.
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `Expected one H1: ${route}`);
  assert.ok(html.includes(route.startsWith('/nl/') ? '<html lang="nl">' : '<html lang="en-GB">'), `Page language: ${route}`);
  for (const property of ['title', 'description', 'type', 'url', 'site_name', 'locale', 'image', 'image:width', 'image:height', 'image:alt']) {
    assert.match(html, new RegExp(`<meta property="og:${property}" content="[^"]+"`), `Missing social metadata: ${route}`);
  }
  for (const [, href] of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)) {
    const target = new URL(href, origin + route);
    if (target.origin !== origin) continue;
    assert.ok(pages.has(target.pathname), `Unknown internal page: ${route} -> ${href}`);
    if (target.hash) assert.ok(pages.get(target.pathname).includes(`id="${target.hash.slice(1)}"`), `Missing anchor: ${route} -> ${href}`);
  }
}

// A visible FAQ edit must also update the structured answer; do not let them drift.
const home = pages.get('/');
const homeSchemas = schemas(home);
const faq = homeSchemas.find(data => data['@type'] === 'FAQPage');
assert.ok(faq, 'Missing FAQPage');
const visibleFaq = [...home.matchAll(/<details(?:\s[^>]*)?><summary>([\s\S]*?)<\/summary><div class="answer">([\s\S]*?)<\/div><\/details>/g)];
assert.equal(faq.mainEntity.length, visibleFaq.length, 'FAQ count differs from visible content');
assert.ok(visibleFaq.length > 0, 'No visible FAQs');
visibleFaq.forEach(([, question, answer], index) => {
  const structured = faq.mainEntity[index];
  assert.equal(structured['@type'], 'Question');
  assert.equal(structured.acceptedAnswer['@type'], 'Answer');
  assert.equal(normalise(structured.name), normalise(question), `FAQ question ${index + 1}`);
  assert.equal(normalise(structured.acceptedAnswer.text), normalise(answer), `FAQ answer ${index + 1}`);
});

const organisation = homeSchemas.find(data => data['@type'] === 'Organization');
const person = schemas(pages.get('/about/')).find(data => data['@type'] === 'Person');
assert.ok(organisation && person, 'Missing organisation or founder');
assert.equal(organisation.founder['@id'], person['@id'], 'Founder identity differs between pages');
assert.equal(person.worksFor['@id'], organisation['@id']);
assert.equal(organisation.email, person.email);
assert.ok(pages.get('/about/').includes(`mailto:${person.email}`), 'Founder email is not visible');
for (const profile of person.sameAs) assert.ok(pages.get('/about/').includes(`href="${profile}"`), 'Founder profile link is not visible');
assert.ok(indexable.includes(origin + '/about/'), 'Completed founder profile should be indexable');
const portrait = new URL(person.image);
assert.equal(portrait.origin, origin);
assert.ok(fs.existsSync(path.join(root, portrait.pathname)), 'Founder image file is missing');
assert.ok(pages.get('/about/').includes(`src="${portrait.pathname}"`), 'Founder image must be visible');

// Published guides must retain their evidence, attribution and discovery paths.
assert.ok(articleRoutes.length >= 4, 'Missing launch articles');
const hub = pages.get('/insights/');
const collection = schemas(hub).find(data => data['@type'] === 'CollectionPage');
assert.ok(collection, 'Missing Insights collection schema');
assert.deepEqual(collection.mainEntity.itemListElement.map(item => item.url).sort(), articleRoutes.map(route => origin + route).sort());
const articleCounts = [];
for (const route of articleRoutes) {
  const html = pages.get(route);
  const article = schemas(html).find(data => data['@type'] === 'Article');
  assert.ok(article, `Missing Article: ${route}`);
  assert.ok(indexable.includes(origin + route), `Article is not indexable: ${route}`);
  assert.equal(article.url, origin + route);
  assert.equal(article.mainEntityOfPage['@id'], article.url);
  assert.equal(article.author['@id'], person['@id']);
  assert.equal(article.author.name, person.name);
  assert.equal(article.publisher['@id'], organisation['@id']);
  assert.ok(html.includes(`rel="author" href="/about/#taksh-dange">${person.name}</a>`), `Missing visible author: ${route}`);
  assert.match(article.datePublished, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(html.includes(`<time datetime="${article.datePublished}">`), `Missing publication date: ${route}`);
  assert.equal(article.headline, html.match(/<h1>([^<]+)<\/h1>/)[1]);
  const body = html.match(/<div class="reading-body">([\s\S]*?)\n    <\/div>/)[1];
  const words = body.replace(/<[^>]*>/g, ' ').replace(/&[^;]+;/g, ' ').trim().split(/\s+/).length;
  assert.ok(words >= 1200 && words <= 1800, `Article length ${words}: ${route}`);
  assert.equal(article.wordCount, words, `Stale word count: ${route}`);
  assert.ok(article.citation.length >= 2, `Missing primary sources: ${route}`);
  for (const source of article.citation) assert.ok(body.includes(`href="${source}"`), `Source not linked in article: ${source}`);
  assert.ok(body.includes('href="/book/"'), `Missing closing snapshot CTA: ${route}`);
  assert.ok(hub.includes(`href="${route}"`), `Article missing from hub: ${route}`);
  articleCounts.push(words);
}

let offerCount = 0;
for (const route of ['/ai-visibility-audit/', '/generative-engine-optimisation/']) {
  const html = pages.get(route);
  const service = schemas(html).find(data => data['@type'] === 'Service');
  assert.ok(service, `Missing Service: ${route}`);
  assert.equal(service.provider['@id'], organisation['@id']);
  assert.equal(service.url, origin + route);
  const body = html.split('<body>')[1];
  assert.ok(body.includes('All prices are in euros and include taxes.'), `Missing visible tax treatment: ${route}`);
  for (const offer of service.offers) {
    const price = offer.priceSpecification;
    assert.equal(price.priceCurrency, 'EUR');
    assert.equal(price.valueAddedTaxIncluded, true);
    assert.ok(body.includes(`€${Number(price.price).toLocaleString('en-GB')}`), `Offer price is not visible: ${offer.name}`);
    if (price['@type'] === 'UnitPriceSpecification') assert.equal(price.unitCode, 'MON');
    offerCount++;
  }
}

const llms = read('llms.txt');
assert.ok(llms.startsWith('# Zenith Cite\n'));
assert.ok(llms.includes(person.name) && llms.includes(person.email), 'Founder/contact missing from llms.txt');
assert.ok(llms.includes('All prices are in euros and include taxes.'));
for (const [, target] of llms.matchAll(/\]\(([^)]+)\)/g)) {
  const url = new URL(target);
  if (url.origin !== origin) continue;
  assert.ok(pages.has(url.pathname), `Unknown llms.txt page: ${url.pathname}`);
  assert.ok(indexable.includes(origin + url.pathname), `Draft page in llms.txt: ${url.pathname}`);
  if (url.hash) assert.ok(pages.get(url.pathname).includes(`id="${url.hash.slice(1)}"`), `Missing llms.txt anchor: ${url.hash}`);
}

console.log(`SEO checks passed: ${pages.size} pages, ${articleRoutes.length} articles (${articleCounts.join(', ')} words), ${visibleFaq.length} matching FAQs, ${offerCount} EUR offers, founder portrait, internal links, metadata, sitemap and llms.txt.`);
