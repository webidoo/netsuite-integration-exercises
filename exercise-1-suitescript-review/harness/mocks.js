'use strict';

/**
 * Minimal, simplified stand-ins for a few SuiteScript 2.x modules.
 * This is NOT NetSuite: costs and behaviours are approximations meant
 * only to let you observe what your code does when it runs.
 */

const LIMIT = 1000; // simplified governance limit per script invocation
const COST = { load: 10, save: 20, submitFields: 10, post: 10, lookup: 1 };

function createMocks(state) {
  const err = (name, message) => {
    const e = new Error(message);
    e.name = name;
    return e;
  };

  const spend = (units, what) => {
    state.units += units;
    state.totalUnits += units;
    if (state.units > LIMIT) {
      throw err('SSS_USAGE_LIMIT_EXCEEDED', `Script execution usage limit exceeded (${what})`);
    }
  };

  const fieldName = (a) => (typeof a === 'string' ? a : a.fieldId);

  const invoiceValue = (inv, f) => {
    switch (f) {
      case 'tranid': return inv.tranid;
      case 'total': return inv.total;
      case 'custbody_customer_taxid': return inv.taxId;
      case 'custbody_portal_ref': return inv.portalRef || '';
      case 'custbody_portal_status': return inv.portalStatus || '';
      default: return null;
    }
  };

  const applyValues = (inv, values) => {
    if ('custbody_portal_ref' in values) inv.portalRef = values.custbody_portal_ref;
    if ('custbody_portal_status' in values) inv.portalStatus = values.custbody_portal_status;
  };

  const Type = {
    INVOICE: 'invoice',
    INVENTORY_ITEM: 'inventoryitem',
    SERVICE_ITEM: 'serviceitem',
    NON_INVENTORY_ITEM: 'noninventoryitem',
  };

  const record = {
    Type,
    load({ type, id }) {
      spend(COST.load, `record.load ${type}`);
      id = String(id);
      if (type === Type.INVOICE) {
        const inv = state.invoices[id];
        if (!inv || inv.deleted) throw err('RCRD_DSNT_EXIST', 'That record does not exist.');
        const pending = {};
        return {
          id,
          getValue: (a) => (fieldName(a) in pending ? pending[fieldName(a)] : invoiceValue(inv, fieldName(a))),
          setValue: ({ fieldId, value }) => { pending[fieldId] = value; },
          getLineCount: () => inv.lines.length,
          getSublistValue: ({ fieldId, line }) => {
            const l = inv.lines[line];
            if (fieldId === 'item') return l.item;
            if (fieldId === 'quantity') return l.qty;
            if (fieldId === 'amount') return l.amount;
            return null;
          },
          getSublistText: ({ fieldId, line }) =>
            fieldId === 'item' ? state.items[inv.lines[line].item].itemid : null,
          save: () => {
            spend(COST.save, 'record.save');
            applyValues(inv, pending);
            state.trigger('edit', id); // saving a record fires its user events again
            return id;
          },
        };
      }
      const item = state.items[id];
      if (!item || item.type !== type) throw err('RCRD_DSNT_EXIST', 'That record does not exist.');
      return { id, getValue: (a) => (fieldName(a) === 'itemid' ? item.itemid : null) };
    },
    submitFields({ type, id, values }) {
      spend(COST.submitFields, 'record.submitFields');
      id = String(id);
      const inv = state.invoices[id];
      if (type !== Type.INVOICE || !inv || inv.deleted) throw err('RCRD_DSNT_EXIST', 'That record does not exist.');
      applyValues(inv, values || {});
      state.trigger('xedit', id); // inline edits fire user events with type "xedit"
      return id;
    },
  };

  const https = {
    Method: { GET: 'GET', POST: 'POST' },
    post({ body }) {
      spend(COST.post, 'https.post');
      let payload = {};
      try { payload = JSON.parse(body); } catch (e) { /* ignore */ }
      state.apiCalls += 1;
      state.portalRequests.push(payload.invoiceNo || '(unknown)');
      switch (state.scenario) {
        case 'timeout':
          if (state.apiCalls === 1) throw err('SSS_REQUEST_TIME_EXCEEDED', 'Request timed out after the portal processed it');
          return { code: 200, body: JSON.stringify({ ref: 'PORTAL-' + (1000 + state.apiCalls) }), headers: {} };
        case 'server-error':
          return { code: 500, body: '<html><body>502 Bad Gateway</body></html>', headers: {} };
        case 'bad-json':
          return { code: 200, body: 'OK', headers: {} };
        default:
          return { code: 200, body: JSON.stringify({ ref: 'PORTAL-' + (1000 + state.apiCalls) }), headers: {} };
      }
    },
  };

  const makeLog = (level) => (a, b) => {
    const o = a && typeof a === 'object' ? a : { title: a, details: b };
    const details = typeof o.details === 'string' ? o.details : JSON.stringify(o.details);
    state.logs.push({ level, title: o.title, details });
    console.log(`  [log.${level}] ${o.title}: ${details}`);
  };
  const log = { debug: makeLog('debug'), audit: makeLog('audit'), error: makeLog('error'), emergency: makeLog('emergency') };

  const runtime = {
    getCurrentScript: () => ({
      getParameter: (p) => state.parameters[typeof p === 'string' ? p : p.name],
      getRemainingUsage: () => LIMIT - state.units,
    }),
  };

  const search = {
    lookupFields({ id, columns }) {
      spend(COST.lookup, 'search.lookupFields');
      const item = state.items[String(id)];
      if (!item) throw err('RCRD_DSNT_EXIST', 'That record does not exist.');
      const out = {};
      [].concat(columns).forEach((c) => { out[c] = c === 'itemid' ? item.itemid : null; });
      return out;
    },
  };

  return { 'N/record': record, 'N/https': https, 'N/log': log, 'N/runtime': runtime, 'N/search': search };
}

module.exports = { createMocks, LIMIT };
