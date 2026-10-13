# Exercise 3 – Integration design

**Suggested time: 10 minutes**

This is a design exercise: there is **no code to write and nothing to run**.
You can draw on a whiteboard or work directly in `design.md`.

## Scenario

When a HubSpot deal reaches **Closed Won**, NetSuite must, within **two minutes**, have:

- the **customer** (created, or matched if it already exists), and
- a **sales order** in the right **subsidiary and currency**, with the deal's line items.

Facts and constraints:

- About **300 deals per day**, with up to **60 deals in 10 minutes** at month end.
- HubSpot can deliver **the same webhook more than once**.
- NetSuite is **unavailable for 20 minutes** during a maintenance window.
- Customers can belong to different subsidiaries and use different currencies.

## Your task

Design the flow end to end and explain:

1. how the data moves from HubSpot to NetSuite and which components are involved,
2. how you avoid duplicates and handle retries,
3. how you map HubSpot data to NetSuite (subsidiary, currency, items, customer),
4. what happens on failure and how operators recover,
5. what you would build in an integration platform and what, if anything, inside NetSuite,
6. how you monitor the integration and check that nothing was lost.

## Material

- `samples/hubspot-deal-webhook.json` – an example webhook payload (fictional data).
- `samples/netsuite-sales-order.json` – an illustrative sales order body with placeholders
  (field names are simplified).
- `design.md` – a template to fill in.

State your assumptions explicitly; if something is unclear, write it down as an open question.
