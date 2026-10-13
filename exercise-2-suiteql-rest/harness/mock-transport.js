'use strict';

/**
 * A fake HTTP transport that behaves like a paged query endpoint.
 * It is a simplified stand-in used only by run.js.
 */
function createTransport({ total = 2350, plan = () => null, maxLimit = 1000 } = {}) {
  const rows = Array.from({ length: total }, (_, i) => ({
    id: String(i + 1),
    tranid: 'INV-' + String(i + 1).padStart(5, '0'),
    unpaid: ((i % 97) + 1) * 10,
  }));
  const calls = [];

  async function post(url, { headers = {}, body } = {}) {
    const callNumber = calls.length + 1;
    const u = new URL(url);
    const limit = Math.min(parseInt(u.searchParams.get('limit') || '1000', 10), maxLimit);
    const offset = parseInt(u.searchParams.get('offset') || '0', 10);
    calls.push({ url, offset, limit });

    const h = {};
    Object.keys(headers).forEach((k) => { h[k.toLowerCase()] = headers[k]; });

    if ((h.prefer || '').toLowerCase() !== 'transient') {
      return { status: 400, body: { title: 'Bad Request', detail: 'A required header is missing or invalid' } };
    }
    let parsed = null;
    try { parsed = JSON.parse(body); } catch (e) { /* ignore */ }
    if (!parsed || typeof parsed.q !== 'string') {
      return { status: 400, body: { title: 'Bad Request', detail: 'The body must be JSON with a "q" property' } };
    }
    if (/invalid/i.test(parsed.q)) {
      return { status: 400, body: { title: 'Bad Request', detail: 'Invalid search query' } };
    }

    const forced = plan(callNumber);
    if (forced) {
      return { status: forced, body: { title: forced === 429 ? 'Too Many Requests' : 'Server Error' } };
    }

    const items = rows.slice(offset, offset + limit);
    return {
      status: 200,
      body: {
        links: [],
        count: items.length,
        hasMore: offset + items.length < total,
        items,
        offset,
        totalResults: total,
      },
    };
  }

  return { post, calls, rows };
}

module.exports = { createTransport };
