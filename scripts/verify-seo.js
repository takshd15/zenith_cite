'use strict';

// Site-wide SEO checks. Dutch is the default language at the root; English lives under /en/.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const origin = 'https://zenith-cite.com';
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const normalise = text => text.replace(/\s+/g, ' ').trim();
const schemas = html => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]));
const isEnglish = route => route.startsWith('/en/');

// Every directory with an index.html is a page.
const skip = new Set(['node_modules', '.git', '.vercel', 'api', 'lib', 'db', 'scripts', 'assets']);
const routes = [];
(function walk(dir, route) {
  if (fs.existsSync(path.join(dir, 'index.html'))) routes.push(route);
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && !skip.has(entry.name)) walk(path.join(dir, entry.name), `${route}${entry.name}/`);
  }
})(root, '/');
const pages = new Map(routes.map(route => [route, read(route === '/' ? 'index.html' : route.slice(1) + 'index.html')]));

const sitemapUrls = [...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]).sort();
const indexable = [...pages].filter(([, html]) => !/name="robots" content="noindex/.test(html)).map(([route]) => origin + route).sort();
assert.deepEqual(sitemapUrls, indexable, 'Sitemap and page indexing directives disagree');

const alternate = (html, lang) => (html.match(new RegExp(`<link rel="alternate" hreflang="${lang}" href="([^"]+)">`)) || [])[1];

for (const [route, html] of pages) {
  assert.ok(html.includes(`rel="canonical" href="${origin}${route}"`), `Canonical URL: ${route}`);
  assert.ok(!/\$(?:750|1,500|2,800)/.test(html), `Old dollar prices: ${route}`);
  schemas(html);
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `Expected one H1: ${route}`);
  assert.ok(html.includes(isEnglish(route) ? '<html lang="en-GB">' : '<html lang="nl">'), `Page language: ${route}`);
  for (const property of ['title', 'description', 'type', 'url', 'site_name', 'locale', 'image', 'image:width', 'image:height', 'image:alt']) {
    assert.match(html, new RegExp(`<meta property="og:${property}" content="[^"]+"`), `Missing social metadata: ${route}`);
  }
  // Language pairs: nl + en + x-default, pointing at each other.
  const nl = alternate(html, 'nl'), en = alternate(html, 'en'), xDefault = alternate(html, 'x-default');
  assert.ok(nl && en && xDefault, `Missing hreflang: ${route}`);
  assert.equal(xDefault, nl, `x-default should be Dutch: ${route}`);
  assert.equal(isEnglish(route) ? en : nl, origin + route, `hreflang self-reference: ${route}`);
  const counterpart = new URL(isEnglish(route) ? nl : en).pathname;
  assert.ok(pages.has(counterpart), `Missing language counterpart: ${route} -> ${counterpart}`);
  assert.equal(alternate(pages.get(counterpart), isEnglish(route) ? 'en' : 'nl'), origin + route, `hreflang not reciprocal: ${route}`);
  assert.ok(html.includes('class="lang-switch"'), `Missing language switcher: ${route}`);

  for (const [, href] of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)) {
    const target = new URL(href, origin + route);
    if (target.origin !== origin || href.startsWith('#')) continue;
    assert.ok(pages.has(target.pathname), `Unknown internal page: ${route} -> ${href}`);
    if (target.hash) assert.ok(pages.get(target.pathname).includes(`id="${target.hash.slice(1)}"`), `Missing anchor: ${route} -> ${href}`);
  }
}

// Per-language checks
const site = {
  nl: { home: '/', about: '/over-ons/', hub: '/kennisbank/', book: '/boeken/', tax: 'Alle prijzen zijn in euro’s en inclusief btw.', locale: 'nl-NL' },
  en: { home: '/en/', about: '/en/about/', hub: '/en/insights/', book: '/en/book/', tax: 'All prices are in euros and include taxes.', locale: 'en-GB' },
};
let faqTotal = 0, articleTotal = 0, offerCount = 0;
const articleCounts = [];
let person;
for (const [lang, s] of Object.entries(site)) {
  const home = pages.get(s.home);
  const homeSchemas = schemas(home);
  const faq = homeSchemas.find(data => data['@type'] === 'FAQPage');
  assert.ok(faq, `Missing FAQPage: ${lang}`);
  const visibleFaq = [...home.matchAll(/<details(?:\s[^>]*)?><summary>([\s\S]*?)<\/summary><div class="answer">([\s\S]*?)<\/div><\/details>/g)];
  assert.equal(faq.mainEntity.length, visibleFaq.length, `FAQ count differs from visible content: ${lang}`);
  visibleFaq.forEach(([, question, answer], index) => {
    assert.equal(normalise(faq.mainEntity[index].name), normalise(question), `FAQ question ${index + 1}: ${lang}`);
    assert.equal(normalise(faq.mainEntity[index].acceptedAnswer.text), normalise(answer), `FAQ answer ${index + 1}: ${lang}`);
  });
  faqTotal += visibleFaq.length;

  const organisation = homeSchemas.find(data => data['@type'] === 'Organization');
  const about = pages.get(s.about);
  person = schemas(about).find(data => data['@type'] === 'Person');
  assert.ok(organisation && person, `Missing organisation or founder: ${lang}`);
  assert.equal(organisation.founder['@id'], person['@id'], `Founder identity differs: ${lang}`);
  assert.equal(person.worksFor['@id'], organisation['@id']);
  assert.ok(about.includes(`mailto:${person.email}`), `Founder email is not visible: ${lang}`);
  for (const profile of person.sameAs) assert.ok(about.includes(`href="${profile}"`), `Founder profile link is not visible: ${lang}`);
  const portrait = new URL(person.image);
  assert.ok(fs.existsSync(path.join(root, portrait.pathname)), 'Founder image file is missing');
  assert.ok(about.includes(`src="${portrait.pathname}"`), `Founder image must be visible: ${lang}`);

  const hub = pages.get(s.hub);
  const articleRoutes = routes.filter(route => route.startsWith(s.hub) && route !== s.hub);
  assert.ok(articleRoutes.length >= 4, `Missing articles: ${lang}`);
  const collection = schemas(hub).find(data => data['@type'] === 'CollectionPage');
  assert.deepEqual(collection.mainEntity.itemListElement.map(item => item.url).sort(), articleRoutes.map(route => origin + route).sort());
  for (const route of articleRoutes) {
    const html = pages.get(route);
    const article = schemas(html).find(data => data['@type'] === 'Article');
    assert.ok(article, `Missing Article: ${route}`);
    assert.equal(article.url, origin + route);
    assert.equal(article.mainEntityOfPage['@id'], article.url);
    assert.equal(article.author['@id'], person['@id']);
    assert.equal(article.publisher['@id'], organisation['@id']);
    assert.ok(html.includes(`rel="author" href="${s.about}#taksh-dange">${person.name}</a>`), `Missing visible author: ${route}`);
    assert.ok(html.includes(`<time datetime="${article.datePublished}">`), `Missing publication date: ${route}`);
    assert.equal(article.headline, html.match(/<h1>([^<]+)<\/h1>/)[1]);
    const body = html.match(/<div class="reading-body">([\s\S]*?)\n    <\/div>/)[1];
    const words = body.replace(/<[^>]*>/g, ' ').replace(/&[^;]+;/g, ' ').trim().split(/\s+/).length;
    assert.ok(words >= 1200 && words <= 1800, `Article length ${words}: ${route}`);
    assert.equal(article.wordCount, words, `Stale word count: ${route}`);
    for (const source of article.citation) assert.ok(body.includes(`href="${source}"`), `Source not linked in article: ${source}`);
    assert.ok(body.includes(`href="${s.book}"`), `Missing closing snapshot CTA: ${route}`);
    assert.ok(hub.includes(`href="${route}"`), `Article missing from hub: ${route}`);
    articleCounts.push(words);
    articleTotal++;
  }

  for (const route of routes.filter(r => (lang === 'en') === isEnglish(r))) {
    const service = schemas(pages.get(route)).find(data => data['@type'] === 'Service' && data.offers);
    if (!service) continue;
    const body = pages.get(route).split('<body>')[1];
    assert.ok(body.includes(s.tax), `Missing visible tax treatment: ${route}`);
    for (const offer of service.offers) {
      const price = offer.priceSpecification;
      assert.equal(price.priceCurrency, 'EUR');
      assert.equal(price.valueAddedTaxIncluded, true);
      assert.ok(body.includes(`€${Number(price.price).toLocaleString(s.locale)}`), `Offer price is not visible: ${route} ${offer.name}`);
      offerCount++;
    }
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
  if (url.hash) assert.ok(pages.get(url.pathname).includes(`id="${url.hash.slice(1)}"`), `Missing llms.txt anchor: ${url.hash}`);
}

console.log(`SEO checks passed: ${pages.size} pages (${routes.filter(r => !isEnglish(r)).length} NL, ${routes.filter(isEnglish).length} EN), ${articleTotal} articles (${articleCounts.join(', ')} words), ${faqTotal} matching FAQs, ${offerCount} EUR offers, hreflang pairs, language switchers, internal links, metadata, sitemap and llms.txt.`);
