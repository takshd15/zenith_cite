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

app.use('/assets', express.static(path.join(root, 'assets'), { index: false }));
app.get(['/', '/Zenith_Website_Layout.html'], sendPage('Zenith_Website_Layout.html'));
app.get(['/book', '/book/', '/book/index.html'], sendPage('book/index.html'));
app.get(['/ai-visibility-audit', '/ai-visibility-audit/', '/ai-visibility-audit/index.html'], sendPage('ai-visibility-audit/index.html'));
app.get(['/generative-engine-optimisation', '/generative-engine-optimisation/', '/generative-engine-optimisation/index.html'], sendPage('generative-engine-optimisation/index.html'));
app.get(['/about', '/about/', '/about/index.html'], sendPage('about/index.html'));
app.get(['/insights', '/insights/', '/insights/index.html'], sendPage('insights/index.html'));
app.get(['/privacy', '/privacy/', '/privacy/index.html'], sendPage('privacy/index.html'));
app.get(['/terms', '/terms/', '/terms/index.html'], sendPage('terms/index.html'));
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
