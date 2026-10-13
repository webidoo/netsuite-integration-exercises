'use strict';

/**
 * Task C – implement fetchAllRows().
 *
 * The query endpoint returns results in pages. A response looks like this:
 *
 *   {
 *     "links": [],
 *     "count": 1000,          // rows in this page
 *     "hasMore": true,        // are there more pages?
 *     "items": [ ... ],       // the rows
 *     "offset": 0,            // offset of this page
 *     "totalResults": 2350
 *   }
 *
 * Requirements
 *  - Return ALL rows, in order, with no duplicates and no missing rows.
 *  - The page size is chosen with the `limit` query-string parameter and the position
 *    with `offset`. The server never returns more than 1000 rows per page.
 *  - Send the query as a POST with a JSON body, and the headers the endpoint requires.
 *  - Do NOT handle authentication: the `transport` object does it for you.
 *  - Temporary failures (HTTP 429 or 5xx) must be retried with a bounded number of
 *    attempts and an increasing delay. Wait only when you are about to retry.
 *  - Errors that retrying cannot fix (other 4xx) must fail immediately.
 *  - When giving up, throw an Error with a clear message.
 *
 * transport.post(url, { headers, body }) -> Promise<{ status, body }>
 *   `body` of the response is already parsed JSON.
 */

const BASE_URL = 'https://1234567-sb1.suitetalk.api.netsuite.com/services/rest/query/v1/suiteql';

async function fetchAllRows(transport, query, options = {}) {
  const {
    pageSize = 1000,
    maxRetries = 5,
    baseDelayMs = 500,
    sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  } = options;

  // TODO: implement
  throw new Error('Not implemented');
}

module.exports = { fetchAllRows, BASE_URL };
