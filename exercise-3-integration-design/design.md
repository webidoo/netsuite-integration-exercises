# Design

Fill in this file (or draw on a whiteboard and summarise here). Short bullet points are fine.

## 1. Flow

Draw the flow from the webhook to the final result. A Mermaid diagram or a simple
ASCII sketch is fine.

```mermaid
flowchart LR
    A[HubSpot webhook] --> B[...]
```

## 2. Duplicates and idempotency

How do you make sure that the same deal never creates two customers or two sales orders?

## 3. Mapping

| HubSpot data | NetSuite field | Rule / notes |
| --- | --- | --- |
| Deal ID | | |
| Company | | |
| Deal currency | | |
| Region | | |
| Line item SKU | | |
| Line item quantity / unit price | | |

## 4. Failure handling

What happens when NetSuite is unavailable, when a request is rejected, or when the same
event arrives twice? What do operators see, and how do they recover?

## 5. What runs where

Which parts would you build in an integration platform / middleware, and which (if any)
inside NetSuite? Why?

## 6. Monitoring and reconciliation

How do you know, every day, that nothing was lost?

## 7. Assumptions and open questions
