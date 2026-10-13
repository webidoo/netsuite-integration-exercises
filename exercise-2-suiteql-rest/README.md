# Exercise 2 – SuiteQL over REST

**Suggested time: 10 minutes**

NetSuite exposes a REST endpoint that runs SuiteQL (SQL-like) queries. In this exercise you
write two queries, fix a faulty request, and implement paging with retries.

**No NetSuite account and no real credentials are needed.** Everything is done in your local
editor; the files are text and a small local simulator checks Task C.

## Task A – SuiteQL queries (`query.sql`)

Read `schema.md`, then write the two queries described in `query.sql` and answer the
question at the end of the file in a comment.

## Task B – Review a REST request (`request.http`)

The request in `request.http` should run a SuiteQL query against a sandbox account.
Find and fix everything that is wrong, and add a comment for each credential or value
saying where it comes from. Use placeholders instead of real secrets.

## Task C – Paging and retries (`fetch-all.js`)

Implement `fetchAllRows()` following the requirements in the comment at the top of
`fetch-all.js`. Then check your work with the local simulator:

```bash
node harness/run.js
```

The simulator uses a fake HTTP transport that behaves like a paged endpoint, sometimes
fails with HTTP 429 or 500, and rejects requests that are not well formed. It needs
Node.js 18 or newer and has no dependencies.

You can edit only `fetch-all.js`; the `harness/` folder is there to support the checks.

## Things to think about while you work

- What happens to your results if a page request fails halfway through?
- What would you log or monitor in a real integration that runs this code every night?
- When would you choose a saved search or a dataset instead of SuiteQL?
