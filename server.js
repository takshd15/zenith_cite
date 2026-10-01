'use strict';

require('dotenv').config();
const path = require('node:path');
const express = require('express');
const { closePool } = require('./lib/database');
const bookingRequestHandler = require('./api/booking-request');
const healthHandler = require('./api/health');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required. Copy .env.example to .env and add the server-side connection string.');
}

const app = express();
const root = __dirname;

app.disable('x-powered-by');
app.use(express.json({ limit: '20kb' }));

app.post('/api/booking-request', bookingRequestHandler);
app.get('/api/health', healthHandler);

function sendPage(relativePath) {
  return (_request, response) => response.sendFile(path.join(root, relativePath));
}

// Mirror Vercel's clean URLs locally, including query strings on redirects.
function registerPage(canonicalPath, relativePath, aliases) {
  const send = sendPage(relativePath);
  app.get([canonicalPath, ...aliases], (request, response) => {
    if (request.path !== canonicalPath) {
      const queryStart = request.originalUrl.indexOf('?');
      const query = queryStart === -1 ? '' : request.originalUrl.slice(queryStart);
      return response.redirect(308, canonicalPath + query);
    }
    return send(request, response);
  });
}

app.use('/assets', express.static(path.join(root, 'assets'), { index: false }));
registerPage('/', 'index.html', ['/index', '/index.html', '/Zenith_Website_Layout.html']);
for (const page of [
  'book', 'ai-visibility-audit', 'generative-engine-optimisation', 'about', 'insights', 'privacy', 'terms',
  'insights/check-business-in-chatgpt',
  'insights/what-an-ai-visibility-audit-includes',
  'insights/geo-and-seo-measurement',
  'insights/why-chatgpt-recommends-your-competitor'
]) {
  registerPage(`/${page}/`, `${page}/index.html`, [`/${page}`, `/${page}/index`, `/${page}/index.html`]);
}
app.get('/robots.txt', sendPage('robots.txt'));
app.get('/sitemap.xml', sendPage('sitemap.xml'));
app.get('/llms.txt', sendPage('llms.txt'));
app.get('/zenith_logo.png', sendPage('zenith_logo.png'));
app.get('/zenith-social-share.png', sendPage('zenith-social-share.png'));

const port = Number(process.env.PORT) || 3000;
const server = app.listen(port, () => console.log(`Zenith is running at http://localhost:${port}`));

async function shutdown() {
  server.close(async () => {
    await closePool();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
