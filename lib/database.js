'use strict';

const { Pool } = require('pg');

function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured.');
  }

  if (!globalThis.__zenithDatabasePool) {
    globalThis.__zenithDatabasePool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: process.env.VERCEL ? 1 : 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    });
  }

  return globalThis.__zenithDatabasePool;
}

async function closePool() {
  if (globalThis.__zenithDatabasePool) {
    await globalThis.__zenithDatabasePool.end();
    globalThis.__zenithDatabasePool = null;
  }
}

module.exports = { getPool, closePool };
