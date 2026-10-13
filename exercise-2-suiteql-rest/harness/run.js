#!/usr/bin/env node
'use strict';

const path = require('path');
const { createTransport } = require('./mock-transport');

const implPath = process.env.IMPL
  ? path.resolve(process.env.IMPL)
  : path.join(__dirname, '..', 'fetch-all.js');
const { fetchAllRows } = require(implPath);

const QUERY = 'SELECT id, tranid FROM transaction WHERE type = \'CustInvc\'';
let failed = 0;

function check(name, ok, detail) {
  if (ok) {
    console.log(`PASS  ${name}`);
  } else {
    failed += 1;
    console.log(`FAIL  ${name}${detail ? ' -> ' + detail : ''}`);
  }
}

function fakeSleep() {
  const delays = [];
  const sleep = async (ms) => { delays.push(ms); };
  return { sleep, delays };
}

function sameRows(result, transport) {
  if (!Array.isArray(result)) return 'the function did not return an array';
  if (result.length !== transport.rows.length) return `expected ${transport.rows.length} rows, got ${result.length}`;
  for (let i = 0; i < result.length; i++) {
    if (result[i].id !== transport.rows[i].id) return `row ${i} differs (duplicate, missing or out of order)`;
  }
  return null;
}

async function run(name, fn) {
  try {
    await fn();
  } catch (e) {
    check(name, false, `threw: ${e && e.message}`);
  }
}

(async () => {
  await run('A. returns all rows when nothing fails', async () => {
    const t = createTransport();
    const { sleep, delays } = fakeSleep();
    const rows = await fetchAllRows(t, QUERY, { pageSize: 1000, sleep });
    const problem = sameRows(rows, t);
    check('A. returns all rows when nothing fails', !problem, problem);
    check('A. does not wait when nothing fails', delays.length === 0, `slept ${delays.length} times`);
  });

  await run('B. retries after temporary 429 errors', async () => {
    const t = createTransport({ plan: (n) => (n === 2 || n === 4 ? 429 : null) });
    const { sleep, delays } = fakeSleep();
    const rows = await fetchAllRows(t, QUERY, { pageSize: 1000, maxRetries: 3, sleep });
    const problem = sameRows(rows, t);
    check('B. rows are complete, ordered and unique after retries', !problem, problem);
    check('B. waits before each retry', delays.length >= 2 && delays.every((d) => d > 0), `delays: ${JSON.stringify(delays)}`);
  });

  await run('C. uses increasing delays', async () => {
    const t = createTransport({ plan: (n) => (n >= 2 && n <= 4 ? 429 : null) });
    const { sleep, delays } = fakeSleep();
    const rows = await fetchAllRows(t, QUERY, { pageSize: 1000, maxRetries: 5, sleep });
    const problem = sameRows(rows, t);
    check('C. succeeds after three consecutive 429 responses', !problem, problem);
    check('C. delay grows between consecutive retries', delays.length >= 3 && delays[delays.length - 1] > delays[0], `delays: ${JSON.stringify(delays)}`);
  });

  await run('D. gives up after a bounded number of retries', async () => {
    const t = createTransport({ plan: (n) => (n >= 2 ? 500 : null) });
    const { sleep } = fakeSleep();
    let threw = false;
    try {
      await fetchAllRows(t, QUERY, { pageSize: 1000, maxRetries: 3, sleep });
    } catch (e) {
      threw = e instanceof Error && !!e.message;
    }
    check('D. throws a clear Error when the server keeps failing', threw && t.calls.length >= 2, threw ? 'it gave up before retrying' : 'no error was thrown');
    check('D. number of requests is bounded', t.calls.length <= 5, `${t.calls.length} requests`);
  });

  await run('E. does not retry errors that retrying cannot fix', async () => {
    const t = createTransport();
    const { sleep, delays } = fakeSleep();
    let threw = false;
    try {
      await fetchAllRows(t, 'SELECT INVALID', { pageSize: 1000, maxRetries: 3, sleep });
    } catch (e) {
      threw = e instanceof Error;
    }
    check('E. throws on a client error (HTTP 400)', threw && t.calls.length >= 1, 'no request was made or no error was thrown');
    check('E. makes exactly one request and does not wait', t.calls.length === 1 && delays.length === 0, `${t.calls.length} requests, ${delays.length} waits`);
  });

  console.log(failed === 0 ? '\nAll checks passed.' : `\n${failed} check(s) failed.`);
  process.exit(failed === 0 ? 0 : 1);
})();
