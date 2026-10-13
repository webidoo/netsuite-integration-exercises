#!/usr/bin/env node
'use strict';

/**
 * Local simulator for the User Event script in ../invoice_push_ue.js.
 * It loads the script, simulates a save event on a sample invoice and
 * prints what happened. Nothing here talks to a real NetSuite account.
 */

const path = require('path');
const { createMocks, LIMIT } = require('./mocks');
const data = require('./data');

function parseArgs(argv) {
  const out = { invoice: '1001', event: 'create', scenario: 'ok', status: '', script: path.join(__dirname, '..', 'invoice_push_ue.js') };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') out.help = true;
    else if (a.startsWith('--')) out[a.slice(2)] = argv[++i];
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
if (args.help) {
  console.log(`Usage: node harness/run.js [options]

  --invoice  1001 | 1002 | 1003   sample invoice (default 1001)
  --event    create | edit | delete | xedit   save event to simulate (default create)
  --scenario ok | timeout | server-error | bad-json   behaviour of the external portal (default ok)
  --status   <text>               initial value of custbody_portal_status (default empty)
  --script   <path>               script file to run (default ../invoice_push_ue.js)`);
  process.exit(0);
}

const state = {
  invoices: JSON.parse(JSON.stringify(data.invoices)),
  items: data.items,
  parameters: {},
  scenario: args.scenario,
  logs: [],
  portalRequests: [],
  apiCalls: 0,
  units: 0,
  totalUnits: 0,
  maxUnits: 0,
  invocations: 0,
  depth: 0,
};
if (!state.invoices[args.invoice]) {
  console.error(`Unknown invoice "${args.invoice}". Use 1001, 1002 or 1003.`);
  process.exit(1);
}
state.invoices[args.invoice].portalStatus = args.status;
if (args.event === 'delete') state.invoices[args.invoice].deleted = true;

// Capture the AMD define() call made by the script.
let captured = null;
global.define = (deps, factory) => {
  if (typeof deps === 'function') { factory = deps; deps = []; }
  captured = { deps, factory };
};
const scriptPath = path.resolve(args.script);
require(scriptPath);
delete global.define;
if (!captured) {
  console.error('The script did not call define(). Is it a SuiteScript 2.x entry point script?');
  process.exit(1);
}

const mocks = createMocks(state);
const modules = captured.deps.map((d) => {
  if (!(d in mocks)) {
    throw new Error(`Module "${d}" is not available in this simulator. Add a stand-in to harness/mocks.js or avoid it.`);
  }
  return mocks[d];
});
const entry = captured.factory(...modules);

const UserEventType = { CREATE: 'create', EDIT: 'edit', DELETE: 'delete', XEDIT: 'xedit', COPY: 'copy' };

function makeContext(type, id) {
  const inv = state.invoices[id];
  return {
    type,
    UserEventType,
    newRecord: {
      id,
      type: 'invoice',
      getValue: (a) => {
        const f = typeof a === 'string' ? a : a.fieldId;
        if (f === 'custbody_portal_status') return inv.portalStatus || '';
        if (f === 'custbody_portal_ref') return inv.portalRef || '';
        if (f === 'tranid') return inv.tranid;
        return null;
      },
    },
  };
}

function invoke(type, id) {
  if (state.depth >= 5) {
    console.log('  [simulator] stopped: afterSubmit was re-entered 5 times in a row');
    return;
  }
  state.depth += 1;
  state.invocations += 1;
  const saved = state.units;
  state.units = 0;
  try {
    if (typeof entry.afterSubmit === 'function') entry.afterSubmit(makeContext(type, id));
  } finally {
    state.maxUnits = Math.max(state.maxUnits, state.units);
    state.units = saved;
    state.depth -= 1;
  }
}
state.trigger = invoke;

console.log(`Simulating "${args.event}" on invoice ${args.invoice} (portal scenario: ${args.scenario})`);
let failure = null;
try {
  invoke(args.event, args.invoice);
} catch (e) {
  failure = e;
  console.log(`  [uncaught error] ${e.name}: ${e.message}`);
}

const inv = state.invoices[args.invoice];
console.log('\n--- Summary ---');
console.log(`afterSubmit invocations         : ${state.invocations}`);
console.log(`peak governance units / run     : ${state.maxUnits} (simplified limit: ${LIMIT})`);
console.log(`requests received by the portal : ${state.apiCalls}${state.apiCalls ? ' -> ' + state.portalRequests.join(', ') : ''}`);
console.log(`invoice status / portal ref     : "${inv.portalStatus || ''}" / "${inv.portalRef || ''}"`);
console.log(`script finished without error   : ${failure ? 'no' : 'yes'}`);
