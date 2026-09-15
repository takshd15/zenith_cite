'use strict';

const { parseBookingRequest, saveBookingRequest } = require('../lib/booking-request');

module.exports = async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed.' });
  }

  let body = request.body || {};
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return response.status(400).json({ error: 'Invalid request body.' });
    }
  }

  const { booking, valid } = parseBookingRequest(body);
  if (!valid) {
    return response.status(400).json({ error: 'Please check the required booking details.' });
  }

  try {
    const saved = await saveBookingRequest(booking);
    return response.status(201).json({
      ok: true,
      requestId: saved.id,
      createdAt: saved.created_at
    });
  } catch (error) {
    console.error('Booking request insert failed:', error.message);
    return response.status(500).json({ error: 'The request could not be saved. Please try again.' });
  }
};
