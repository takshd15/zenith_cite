'use strict';

const { getPool } = require('./database');

const allowedInterests = new Set(['snapshot', 'visibility-audit', 'growth', 'authority', 'custom']);
const allowedBudgets = new Set(['under-1500', '1500-3000', '3000-6000', '6000-plus', 'one-time']);

function clean(value, maxLength) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function hostnameOf(value) {
  try {
    return new URL(value).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function parseBookingRequest(body = {}) {
  const email = clean(body.email, 320).toLowerCase();
  const website = clean(body.website, 2048);
  const booking = {
    name: clean(body.name, 120) || null,
    email,
    businessName: clean(body.business, 180) || null,
    website,
    problem: clean(body.problem, 3000) || null,
    competitor: clean(body.competitor, 300) || null,
    interest: clean(body.interest, 40),
    timezone: clean(body.timezone, 100),
    budget: clean(body.budget, 20) || null
  };

  const valid = Boolean(
    validEmail(booking.email) && validHttpUrl(booking.website) && booking.timezone &&
    allowedInterests.has(booking.interest) &&
    (booking.budget === null || allowedBudgets.has(booking.budget))
  );

  return { booking, valid };
}

async function saveBookingRequest(booking) {
  try {
    return await insertBookingRequest(booking);
  } catch (error) {
    // Database not yet migrated (no budget column, interest check without 'custom', or
    // name/business/problem still not null): keep the lead by saving it in the original
    // shape, with the extra details in the problem text and derived values for missing fields.
    if (error.code !== '42703' && error.code !== '23514' && error.code !== '23502') throw error;
    console.warn('booking_requests needs `npm run db:migrate`:', error.message);
    const extras = [booking.interest === 'custom' && 'Custom quote', booking.budget && `Budget: ${booking.budget}`].filter(Boolean);
    const legacy = await getPool().query(
      `insert into public.booking_requests
        (name, email, business_name, website, problem, competitor, interest, timezone)
       values ($1, $2, $3, $4, $5, $6, $7, $8)
       returning id, created_at`,
      [booking.name || booking.email.split('@')[0].slice(0, 120), booking.email,
       booking.businessName || hostnameOf(booking.website).slice(0, 180) || booking.website.slice(0, 180),
       booking.website, (extras.length ? `[${extras.join(' · ')}] ` : '') + (booking.problem || '(not provided)'),
       booking.competitor,
       booking.interest === 'custom' ? 'authority' : booking.interest, booking.timezone]
    );
    return legacy.rows[0];
  }
}

async function insertBookingRequest(booking) {
  const result = await getPool().query(
    `insert into public.booking_requests
      (name, email, business_name, website, problem, competitor, interest, timezone, budget)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     returning id, created_at`,
    [booking.name, booking.email, booking.businessName, booking.website,
     booking.problem, booking.competitor, booking.interest, booking.timezone, booking.budget]
  );

  return result.rows[0];
}

module.exports = { parseBookingRequest, saveBookingRequest };
