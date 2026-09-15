'use strict';

const { getPool } = require('../lib/database');

module.exports = async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');

  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    await getPool().query('select 1');
    return response.status(200).json({ ok: true, database: 'connected' });
  } catch (_error) {
    return response.status(503).json({ ok: false, database: 'unavailable' });
  }
};
