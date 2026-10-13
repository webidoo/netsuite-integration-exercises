# Simplified data model

This is a **simplified** subset of the NetSuite SuiteQL tables, for the exercise only.
Real accounts have many more columns.

## `transaction` (one row per transaction)

| Column | Description |
| --- | --- |
| `id` | Internal ID |
| `tranid` | Document number, e.g. `INV-00042` |
| `type` | Transaction type code. Invoices are `CustInvc` |
| `status` | Status code. For invoices: `A` = open, `B` = paid in full |
| `trandate` | Transaction date |
| `entity` | Customer internal ID (joins to `customer.id`) |
| `subsidiary` | Subsidiary internal ID (joins to `subsidiary.id`) |
| `currency` | Currency internal ID (joins to `currency.id`) |
| `foreigntotal` | Total in the transaction currency |
| `foreignamountunpaid` | Unpaid amount in the transaction currency |

## `customer`

| Column | Description |
| --- | --- |
| `id` | Internal ID |
| `companyname` | Customer name |

## `subsidiary`

| Column | Description |
| --- | --- |
| `id` | Internal ID |
| `name` | Subsidiary name |

## `currency`

| Column | Description |
| --- | --- |
| `id` | Internal ID |
| `symbol` | Currency code, e.g. `EUR`, `USD` |
