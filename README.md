# NetSuite integration exercises

Three short, hands-on exercises on NetSuite integrations. They are meant to be solved
**in your own local editor**.

| # | Folder | Topic | Suggested time |
| --- | --- | --- | --- |
| 1 | [`exercise-1-suitescript-review`](exercise-1-suitescript-review) | Review and refactor a SuiteScript 2.1 User Event script | 10 min |
| 2 | [`exercise-2-suiteql-rest`](exercise-2-suiteql-rest) | SuiteQL queries, a REST request, paging and retries | 10 min |
| 3 | [`exercise-3-integration-design`](exercise-3-integration-design) | Design of a CRM-to-ERP integration | 10 min |

## Before you start

- **No NetSuite account is needed.** Nothing has to be uploaded to NetSuite, and no real
  authentication is involved. Never add real credentials, tokens or customer data to any file.
- **Requirements:** a code editor you are comfortable with, and [Node.js](https://nodejs.org)
  18 or newer for the small local simulators (no `npm install` is needed; there are no dependencies).
- Each exercise folder has its own `README.md` with the context, the tasks and how to
  run the simulator when there is one.
- Use only the resources you were told are allowed for the session.

## How to work

1. Read the exercise `README.md` first.
2. Think aloud: explain what you are looking at, what you notice, and why you choose a given fix.
3. Work directly in the files of the exercise (edit the code, fill in the Markdown templates).
4. Run the local simulator when one is provided, and use its output to check your reasoning.
5. If something is ambiguous, state your assumption and continue.

Quality matters more than quantity: it is better to do part of an exercise well than to
rush through all of it. Priorities, trade-offs and clear explanations are part of the work.

## Repository layout

```
.
├── README.md
├── package.json                      # convenience scripts only, no dependencies
├── exercise-1-suitescript-review/
│   ├── README.md
│   ├── invoice_push_ue.js            # code to review and rewrite
│   ├── findings.md                   # your findings
│   └── harness/                      # local simulator (do not modify)
├── exercise-2-suiteql-rest/
│   ├── README.md
│   ├── schema.md
│   ├── query.sql                     # Task A
│   ├── request.http                  # Task B
│   ├── fetch-all.js                  # Task C
│   └── harness/                      # local checks (do not modify)
└── exercise-3-integration-design/
    ├── README.md
    ├── design.md                     # your design
    └── samples/
```

## Handy commands

```bash
node exercise-1-suitescript-review/harness/run.js --help
node exercise-2-suiteql-rest/harness/run.js
```

Equivalent npm scripts: `npm run ex1` and `npm run ex2:test`.

The simulators are simplified approximations meant to help you observe behaviour. They are
not NetSuite: refer to the official NetSuite documentation for real limits and behaviour.
