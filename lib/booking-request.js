'use strict';

const { getPool } = require('./database');

const allowedInterests = new Set(['snapshot', 'visibility-audit', 'growth', 'authority']);

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

function parseBookingRequest(body = {}) {
  const booking = {
    name: clean(body.name, 120),
    email: clean(body.email, 320).toLowerCase(),
    businessName: clean(body.business, 180),
    website: clean(body.website, 2048),
    problem: clean(body.problem, 3000),
    competitor: clean(body.competitor, 300) || null,
    interest: clean(body.interest, 40),
    timezone: clean(body.timezone, 100)
  };

  const valid = Boolean(
    booking.name && validEmail(booking.email) && booking.businessName &&
    validHttpUrl(booking.website) && booking.problem && booking.timezone &&
    allowedInterests.has(booking.interest)
  );

  return { booking, valid };
}

async function saveBookingRequest(booking) {
  const result = await getPool().query(
    `insert into public.booking_requests
      (name, email, business_name, website, problem, competitor, interest, timezone)
     values ($1, $2, $3, $4, $5, $6, $7, $8)
     returning id, created_at`,
    [booking.name, booking.email, booking.businessName, booking.website,
     booking.problem, booking.competitor, booking.interest, booking.timezone]
  );

  return result.rows[0];
}

module.exports = { parseBookingRequest, saveBookingRequest };
