'use strict';

// Fictional sample data used by the local simulator.
const items = {
  '501': { type: 'inventoryitem', itemid: 'SKU-501' },
  '502': { type: 'serviceitem', itemid: 'SVC-502' },
  '503': { type: 'inventoryitem', itemid: 'SKU-503' },
};

function bigInvoiceLines(n) {
  const lines = [];
  for (let i = 0; i < n; i++) {
    lines.push({ item: i % 2 === 0 ? '501' : '503', qty: 1, amount: 10 });
  }
  return lines;
}

const invoices = {
  // Small invoice, inventory items only.
  '1001': {
    tranid: 'INV-1001',
    total: 300,
    taxId: 'XX00000000001',
    lines: [
      { item: '501', qty: 2, amount: 100 },
      { item: '503', qty: 4, amount: 200 },
    ],
  },
  // Large invoice with inventory items only.
  '1002': {
    tranid: 'INV-1002',
    total: 1200,
    taxId: 'XX00000000002',
    lines: bigInvoiceLines(120),
  },
};

// Small invoice that also contains a service item.
invoices['1003'] = {
  tranid: 'INV-1003',
  total: 380.5,
  taxId: 'XX00000000003',
  lines: [
    { item: '501', qty: 2, amount: 100 },
    { item: '502', qty: 1, amount: 80.5 },
    { item: '503', qty: 4, amount: 200 },
  ],
};

module.exports = { items, invoices };
