# Exercise 1 – Review and refactor a SuiteScript

**Suggested time: 10 minutes** (about 5 to review, 5 to rewrite)

## Context

`invoice_push_ue.js` is a SuiteScript 2.1 **User Event** script. After an invoice is saved,
it sends the invoice to an external portal and stores the portal reference and a status
on the invoice.

Since it went live, users report:

- saving an invoice feels slow,
- some invoices are pushed to the portal more than once,
- they sometimes see unexplained errors when saving.

## Your task

1. **Review** `invoice_push_ue.js`. Think aloud and write the problems you find in
   `findings.md`, **highest priority first**. For each one say what goes wrong and how you
   would fix it.
2. **Rewrite** the `afterSubmit` function in `invoice_push_ue.js` so that it is safe and
   efficient. Any reasonable design is welcome; explain your choices.
3. *(Optional)* In `findings.md`, describe how you would change the overall design.

## Important notes

- Nothing needs to be uploaded to NetSuite and no account or credentials are needed.
  Everything is done in your local editor.
- The custom fields (`custbody_*`) and the portal URL are fictional. The API key in the
  file is fake.
- You may add helper functions or modules (`N/runtime`, `N/search`, …) if you need them.

## Running the local simulator (optional but recommended)

A small simulator lets you run your script and observe what it does. It has no
dependencies; Node.js 18 or newer is enough.

```bash
node harness/run.js                                   # create an invoice, portal is healthy
node harness/run.js --invoice 1002                    # a large invoice
node harness/run.js --invoice 1003                    # an invoice that contains a service item
node harness/run.js --event edit --status SENT        # edit an invoice that was already sent
node harness/run.js --event delete                    # delete an invoice
node harness/run.js --scenario timeout                # portal processes the request, then times out
node harness/run.js --scenario server-error           # portal answers with an HTTP 500
node harness/run.js --scenario bad-json               # portal answers 200 with a non-JSON body
node harness/run.js --help
```

| Option | Values | Meaning |
| --- | --- | --- |
| `--invoice` | `1001`, `1002`, `1003` | Sample invoice to save (`1001` small, `1002` large, `1003` includes a service item) |
| `--event` | `create`, `edit`, `delete`, `xedit` | Save event that triggers the script |
| `--scenario` | `ok`, `timeout`, `server-error`, `bad-json` | How the external portal behaves |
| `--status` | any text | Initial value of `custbody_portal_status` |
| `--script` | file path | Run a different copy of the script |

The simulator is a **simplified approximation**: governance costs and some behaviours
are not the real NetSuite ones. Use it to observe your code, not as a reference for exact
limits. Consult the official NetSuite documentation for real values.

## What to look at

- What happens in each scenario above before and after your changes?
- How many requests reach the portal, how many governance units does a run use, and
  what is left on the invoice at the end?
