/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 *
 * Pushes an invoice to an external portal after it has been saved,
 * and stores the portal reference and status on the invoice.
 */
define(['N/record', 'N/https', 'N/log'], (record, https, log) => {

  const API_URL = 'https://api.example-portal.com/v1/invoices';
  const API_KEY = 'demo_api_key_do_not_use';

  const afterSubmit = (context) => {
    const inv = record.load({
      type: record.Type.INVOICE,
      id: context.newRecord.id
    });

    const lines = [];
    const count = inv.getLineCount({ sublistId: 'item' });
    for (let i = 0; i < count; i++) {
      const itemId = inv.getSublistValue({ sublistId: 'item', fieldId: 'item', line: i });
      const item = record.load({
        type: record.Type.INVENTORY_ITEM,
        id: itemId
      });
      lines.push({
        sku: item.getValue('itemid'),
        qty: inv.getSublistValue({ sublistId: 'item', fieldId: 'quantity', line: i }),
        amount: inv.getSublistValue({ sublistId: 'item', fieldId: 'amount', line: i })
      });
    }

    const payload = {
      invoiceNo: inv.getValue('tranid'),
      customerTaxId: inv.getValue('custbody_customer_taxid'),
      total: inv.getValue('total'),
      lines: lines
    };
    log.debug('Sending payload', JSON.stringify(payload));

    const response = https.post({
      url: API_URL,
      headers: {
        'Authorization': 'Bearer ' + API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = JSON.parse(response.body);
    inv.setValue({ fieldId: 'custbody_portal_ref', value: result.ref });
    inv.setValue({ fieldId: 'custbody_portal_status', value: 'SENT' });
    inv.save();
  };

  return { afterSubmit };
});
