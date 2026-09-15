'use strict';

require('dotenv').config();
const fs = require('node:fs/promises');
const path = require('node:path');
const { Client } = require('pg');

async function migrate() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required.');
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  try {
    const sql = await fs.readFile(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf8');
    await client.query(sql);
    const result = await client.query(
      "select to_regclass('public.booking_requests') as table_name"
    );
    console.log(`Migration complete: ${result.rows[0].table_name}`);
  } finally {
    await client.end();
  }
}

migrate().catch((error) => {
  console.error(`Migration failed: ${error.message}`);
  process.exitCode = 1;
});
