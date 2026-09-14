# Session Inspector — Kore.ai Agent Platform

A small internal tool for looking up a Kore.ai Agent Platform session by ID and
browsing its traces and observations: collapsible detail panels, latency /
token-usage charts, and an execution-graph view of each trace's observation
tree.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui (Radix primitives, hand-added — no CLI dependency)
- Recharts for the latency / token charts
- React Flow (`reactflow`) for the per-trace execution graph
- Axios inside a Next.js Route Handler, used as a same-origin proxy

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000. Nothing needs to go in `.env` — the App ID,
Session ID and API key are all entered in the UI at request time and sent
straight to the proxy route for that one request only (nothing is persisted
to disk, a database, or localStorage).

## Using it

In the header bar, fill in:

- **App ID** — the `appId` path segment from your Kore.ai Agent Platform app.
- **Session ID** — the session you want to inspect (e.g. `s-93e37e46-...`).
- **x-api-key** — your API key. It's masked by default; click the eye icon to
  reveal it.
- **Include traces / Include observations** — checking "Include observations"
  automatically checks "Include traces" too, since observations are returned
  nested under traces and won't render without them.
- **Advanced → API base URL** — defaults to `https://agent-platform.kore.ai`.
  Override this if you need to point at a different environment.

Hit **Search**. Results render as:

1. **Session overview** — key session fields as stat pills, plus a
   collapsible raw-JSON view of every field the API returned for the session.
2. **Traces** tab — one collapsible card per trace. Each trace expands into a
   "Details" view (trace input/output + a collapsible list of its
   observations, each with its own input/output, latency, token usage and
   model/provider) and an "Execution graph" view (a React Flow diagram of how
   that trace's observations relate via `parent_observation_id`).
3. **Analytics** tab — a bar chart of latency per trace, and a stacked bar
   chart of input/output tokens per observation.
4. **Raw response** tab — the full API response for that session as a
   collapsible JSON tree, for whenever the structured views aren't enough.

## Why there's a server-side proxy route (`app/api/sessions/route.ts`)

The upstream endpoint is a `GET` request that also carries a
`x-www-form-urlencoded` body (per the curl you gave):

```
curl --location --request GET '.../sessions?session_id=...&include=traces&include=observations' \
  --header 'x-api-key: ...' \
  --data-urlencode 'session_id=...' \
  --data-urlencode 'include=traces' \
  --data-urlencode 'include=observations'
```

Two things make calling this directly from the browser impractical:

1. Browsers refuse to send a body on a `fetch()` GET request — it throws.
2. The Kore.ai API doesn't return CORS headers for browser-origin requests,
   so it would be blocked even if the body issue weren't there.

The route handler runs in Node (not the Edge runtime) and uses `axios`,
which doesn't enforce the GET-without-body restriction, so it reproduces the
curl exactly: `session_id` and `include` are sent both as query parameters
*and* as a urlencoded body, with the `x-api-key` header attached. It was
verified against a local mock server to confirm the outgoing request matches
the curl byte-for-byte and that error responses (validation, upstream
timeout, upstream non-2xx) all surface cleanly in the UI.

If your actual deployment of the Kore.ai API only accepts the query-string
form (most REST GETs do), the duplicated body is harmless — it'll just be
ignored.

## Project structure

```
app/
  page.tsx                 client-side page: form state, fetch, result views
  api/sessions/route.ts     server-side proxy to the Kore.ai API
  layout.tsx, globals.css   fonts + design tokens
components/
  ui/                       shadcn/ui primitives (button, input, tabs, ...)
  session/                  SearchHeader, SessionOverviewCard, TraceItem,
                             ObservationItem, SessionCharts, StatPill
  charts/                   LatencyChart, TokenUsageChart (Recharts)
  graph/                    ObservationGraph, GraphNode (React Flow)
  ContentBlock.tsx           smart input/output renderer (text vs JSON)
  JsonTree.tsx               generic collapsible JSON viewer
  CopyButton.tsx
lib/
  types.ts                  Session / Trace / Observation types
  format.ts                 date/latency/id formatting helpers
  graph.ts                  tree-layout for the execution graph
  utils.ts                  cn() helper
```

## Notes

- The API key is only ever held in React state on the client and forwarded
  once per search to your own `/api/sessions` route, which attaches it as a
  header on the single outgoing request. It is not logged, stored, or
  included in the JSON the browser receives back.
- Long strings and deeply nested JSON (this API returns raw LangChain message
  objects for `GENERATION` observation input/output) are truncated with a
  "show more" toggle and lazy-collapsed past one level of nesting, so a large
  session doesn't dump thousands of lines onto the screen at once.
