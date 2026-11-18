/**
 * utils.js — Reusable helper functions
 */

/** querySelector shorthand */
const $ = (sel, ctx = document) => ctx.querySelector(sel);

/** querySelectorAll → Array */
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/**
 * Pad a number to 2 digits
 * @param {number} n
 * @returns {string}
 */
function pad2(n) {
  return String(n).padStart(2, '0');
}

/**
 * Generate an .ics calendar blob URL for a single event.
 * @param {Object} opts
 * @returns {string} blob URL
 */
function generateICS(opts) {
  const { title, start, end, location, description, uid } = opts;
  const fmt = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Wedding Invitation//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid || (Date.now() + '@wedding-invitation')}`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(new Date(start))}`,
    `DTEND:${fmt(new Date(end))}`,
    `SUMMARY:${title}`,
    `LOCATION:${location}`,
    `DESCRIPTION:${description}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar' });
  return URL.createObjectURL(blob);
}

/**
 * Generate a WhatsApp share URL.
 * @param {string} text
 * @returns {string}
 */
function whatsappShareURL(text) {
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}

/**
 * Throttle a function to fire at most once per animation frame.
 * @param {Function} fn
 * @returns {Function}
 */
function rafThrottle(fn) {
  let frame = null;
  return (...args) => {
    if (frame !== null) return;
    frame = requestAnimationFrame(() => { frame = null; fn(...args); });
  };
}

window.WeddingUtils = { $, $$, pad2, generateICS, whatsappShareURL, rafThrottle };
