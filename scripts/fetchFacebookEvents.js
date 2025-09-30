#!/usr/bin/env node
const fs = require('fs/promises');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const PAGE_ID = process.env.FACEBOOK_PAGE_ID;
const ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const EVENTS_PATH = path.join(__dirname, '..', 'content', 'events.json');

async function readExistingEvents() {
  try {
    const raw = await fs.readFile(EVENTS_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    return { lastUpdated: null, events: [] };
  }
}

function normaliseEvent(event) {
  return {
    id: event.id ?? null,
    title: event.name ?? '',
    startDate: event.start_time ?? null,
    endDate: event.end_time ?? null,
    location: event.place
      ? {
          name: event.place.name ?? null,
          street: event.place.location?.street ?? null,
          city: event.place.location?.city ?? null,
          state: event.place.location?.state ?? null,
          postalCode: event.place.location?.zip ?? null,
          country: event.place.location?.country ?? null,
        }
      : null,
    ticketUrl: event.ticket_uri ?? null,
    facebookUrl: event.id ? `https://www.facebook.com/events/${event.id}` : null,
    isCanceled: Boolean(event.is_canceled),
  };
}

async function fetchEvents() {
  if (!PAGE_ID || !ACCESS_TOKEN) {
    console.warn(
      'FACEBOOK_PAGE_ID or FACEBOOK_ACCESS_TOKEN missing. Skipping event fetch and keeping existing data.'
    );
    return readExistingEvents();
  }

  const url = new URL(`https://graph.facebook.com/v17.0/${PAGE_ID}/events`);
  url.searchParams.set('access_token', ACCESS_TOKEN);
  url.searchParams.set('time_filter', 'upcoming');
  url.searchParams.set(
    'fields',
    ['id', 'name', 'start_time', 'end_time', 'place', 'ticket_uri', 'is_canceled'].join(',')
  );

  const response = await fetch(url);

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Facebook API error (${response.status}): ${body}`);
  }

  const payload = await response.json();
  const events = Array.isArray(payload.data) ? payload.data : [];

  return {
    lastUpdated: new Date().toISOString(),
    events: events.filter((event) => !event.is_canceled).map(normaliseEvent),
  };
}

async function writeEventsFile(data) {
  await fs.mkdir(path.dirname(EVENTS_PATH), { recursive: true });
  await fs.writeFile(EVENTS_PATH, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

async function main() {
  try {
    const data = await fetchEvents();
    await writeEventsFile(data);
    console.log(`Saved ${data.events.length} event(s) to content/events.json`);
  } catch (error) {
    console.error('Failed to fetch Facebook events:', error.message);
    const existing = await readExistingEvents();
    await writeEventsFile(existing);
    process.exitCode = 1;
  }
}

main();
