# FlowForge Live

FlowForge Live is a visual workflow automation application. Teams model a business process as a graph of connected steps (a trigger, actions, decisions), run it against sample data, and inspect exactly what happened at every step: the input, the mapped output, the branch taken, and any failure and its recovery.

It ships with eight ready-to-run business workflows for agencies, ecommerce, and service businesses, and runs in two modes:

| Mode | What it is | Needs |
| --- | --- | --- |
| **Demo mode** (default) | A self-contained workspace. Workflows are executed by a deterministic engine in the browser against virtual providers. State is stored in the browser. | Nothing: no database, no credentials |
| **Legacy mode** | A database-backed version with sign-in, REST API routes, PostgreSQL persistence, and optional AI workflow generation. | PostgreSQL, `NEXTAUTH_SECRET`, and a build with `NEXT_PUBLIC_DEMO_MODE=false` |

> **Important:** no mode sends real emails, creates real CRM records, charges payments, or calls third-party business APIs. Provider integrations (Slack, Gmail, HubSpot, and others) are simulated. See [Implemented vs. simulated](#implemented-vs-simulated).

## Table of contents

1. [Project overview](#project-overview)
2. [Project purpose and objectives](#project-purpose-and-objectives)
3. [Key features and functionalities](#key-features-and-functionalities)
4. [The eight workflows](#the-eight-workflows)
5. [Technology stack](#technology-stack)
6. [System architecture](#system-architecture)
7. [Project directory structure](#project-directory-structure)
8. [Installation and setup](#installation-and-setup)
9. [Environment configuration](#environment-configuration)
10. [How to run the application](#how-to-run-the-application)
11. [Testing](#testing)
12. [Docker and Railway deployment](#docker-and-railway-deployment)

---

## Project overview

FlowForge Live is a single Next.js 14 application (App Router) written in TypeScript. The frontend, the API route handlers, and the workflow engine live in one codebase and deploy as one service. There is no separate backend application.

- **Workflow builder:** a drag-and-drop canvas ([React Flow](https://reactflow.dev)) with a node palette and a per-step configuration panel.
- **Workflow engine:** executes a graph by following its edges and conditional branches, resolving `{{field}}` mappings between steps and recording a trace for every step.
- **Run inspection:** step-by-step input/output traces, skipped branches, business-output previews (for example the email or Slack message a workflow would send), and a run history with retry.

The application source is in [`app/`](app/). The product requirements are in [`PRD.md`](PRD.md).

## Project purpose and objectives

**Purpose.** Make workflow automation understandable and testable for business teams: design a process visually, see precisely how data moves through it, and handle exceptions deliberately instead of discovering them in production.

**Objectives**

1. **Visual design.** Build and edit workflows on a canvas, without writing code.
2. **Transparent execution.** Every run produces an inspectable trace: inputs, outputs, branch decisions, skipped steps, errors, and retries.
3. **Safe exploration.** Try workflows with editable sample data and simulate provider failures without touching real accounts.
4. **AI-assisted authoring.** Generate a workflow graph from a plain-English description (legacy mode, using the Anthropic API when a key is configured).
5. **Path to real execution.** The product direction in [`PRD.md`](PRD.md) is to run workflows on a real execution layer (n8n) with live provider connections. That layer is **not implemented yet**. The current build simulates execution.

## Key features and functionalities

### Demo mode

- **Overview dashboard:** workflow, run, success-rate, and estimated-hours-saved figures computed from the run history, plus a savings calculator based on the lead-qualification workflow (enquiries per month × its 18 assumed manual minutes × an hourly cost you set).
- **Workflow library:** the eight workflows, filterable by business type and searchable by process or app name. A keyword-based template finder suggests workflows from a plain-language description. It matches words against the catalogue and does not use AI.
- **Visual builder:** edit a workflow on the React Flow canvas, add steps from the palette, change a step's virtual provider, sample operation, and JSON field mappings, save changes, or duplicate a workflow as a draft.
- **Run dialog:** edit the sample trigger event as JSON and run a scenario: a successful run, an alternate sample input (for the two workflows that define one), or a simulated provider rate limit followed by **Retry**.
- **Execution traces:** per-step input, mapped output, duration, status (success, error, skipped), and business-output previews such as emails, Slack messages, ticket drafts, and checklists.
- **Run history:** search, filter by status, paginate, expand a run to see its trace, and retry a failed run. Seeded example runs (24 at first load) are labelled separately from runs made in the browser. History is capped at 200 runs.
- **Connections:** 14 virtual providers. Pause one to see how dependent steps fail with a clear message, then reconnect and retry.
- **Contextual assistant ("Ask FlowForge"):** a rule-based assistant scoped to one workflow or all of them. It can explain a workflow, show its mappings, diagnose failed runs, report connection readiness, open a test-run dialog, and summarise run performance, with CSV export of an answer. It never runs or modifies a workflow, and it does not call an AI model.
- **Walkthrough guide:** a built-in page that explains how to present and try the workflows (it is the `/settings` route in demo mode).
- **Reset:** restores the eight original workflows, reconnects all providers, and clears runs.
- **Persistence:** workflows, runs, and connection state are kept in the browser's `localStorage`. Each browser has its own isolated workspace.

### Legacy mode

- **Authentication:** NextAuth credentials sign-in (bcrypt-hashed passwords, JWT sessions). All `/api/*` routes except `/api/health`, `/api/auth/*` and `/api/seed` require a valid session.
- **Workflow management:** list, create, edit, version, and delete workflows stored in PostgreSQL, using the same React Flow builder with a catalogue of **26 node types** in five categories:
  - Triggers (5): Webhook, Schedule, Email Trigger, Form Submit, App Event
  - Actions (6): Send Email, HTTP Request, Send Slack Message, Create Record, Update Record, Run Code
  - Logic (5): IF/Else, Switch, Merge, Loop, Wait/Delay
  - AI (5): Call Claude, Summarize, Extract Data, Classify, Generate Content
  - Utilities (5): Set Variable, Format Date, Parse JSON, Filter, Aggregate
- **AI workflow generation:** describe a workflow in English and receive a node/edge graph. With `ANTHROPIC_API_KEY` set, the server calls the Anthropic Messages API. Without a key, or if the call fails, it returns a built-in sample workflow instead.
- **Execution and history:** run a workflow and browse executions with filters, pagination, and per-step results (execution is simulated; see below).
- **Dashboard:** execution counts, success rate, and a 7-day trend chart (Recharts) computed from the database.
- **Integrations catalogue:** 30 integrations in 8 categories that can be toggled connected or disconnected. This only records a flag; it does not connect to the service.
- **Seeding:** an admin user, the integrations catalogue, 5 workflow templates, and sample executions.
- **Health check:** `GET /api/health` for platform health checks.

### Implemented vs. simulated

| Area | Status |
| --- | --- |
| Workflow canvas, node palette, configuration panels | **Implemented** |
| Graph execution (edge following, branching, `{{field}}` mapping, validation) | **Implemented** in the demo engine, deterministic |
| Execution of workflow steps against real services | **Simulated.** Demo mode runs a pure in-browser engine. Legacy mode's `POST /api/workflows/:id/execute` writes execution records with random durations and a roughly 95% per-step success rate. |
| Provider integrations (Slack, Gmail, HubSpot, Stripe, and others) | **Simulated.** No external calls. |
| "Claude" steps in the eight workflows | **Rule-based sample logic.** No model is called. |
| AI workflow generation (legacy mode) | **Real Anthropic API call** when a key is set, otherwise a canned sample |
| Time-saved figures | **Illustrative estimates** from assumed manual minutes per run, not measurements |
| n8n integration (`src/lib/n8n-client.ts`) | **Not wired up.** The module has a mock mode and no route imports it. |
| Legacy Settings page (General, Team, API Keys, n8n Connection, AI Model tabs) | **UI only.** Nothing is persisted and the API key entries are placeholders. |
| `ApiKey` and `AuditLog` database models | **Schema only.** No code reads or writes them. |
| Redis / BullMQ queues | **Not implemented.** Packages are declared but unused. |
| Role-based access control | **Not implemented.** Any signed-in user can use every legacy endpoint. |

Screenshots of the legacy-mode interface (sample data shown):

| Dashboard | Workflow builder |
| --- | --- |
| ![Legacy-mode dashboard](screenshots/01-dashboard.jpg) | ![Legacy-mode workflow builder](screenshots/04-workflow-builder.jpg) |

| Execution history | AI workflow generator |
| --- | --- |
| ![Legacy-mode execution history](screenshots/05-history.jpg) | ![Legacy-mode AI workflow generator](screenshots/08-ai-generate.jpg) |

## The eight workflows

Defined in [`app/src/lib/demo/catalog.ts`](app/src/lib/demo/catalog.ts). Each is a connected graph with a sample input, a before/after description, and an assumed manual effort used for its time-saved estimate. All eight run to completion in the automated tests.

| # | Workflow | Business type | Steps (provider) | What it produces | Est. min saved/run |
| --- | --- | --- | --- | --- | --- |
| 1 | **Turn new leads into sales conversations** (`lead-qualification`) | Agencies | New enquiry (Typeform) → Score lead intent → Create CRM contact (HubSpot) → *Qualified for sales?* → **Yes:** Notify sales (Slack) / **No:** Send nurture email (Gmail) | A scored CRM contact and a sales alert, or a nurture email for smaller budgets. Scoring uses budget and team size. | 18 |
| 2 | **From paid order to fulfillment** (`order-fulfillment`) | Ecommerce | Order received (Shopify) → Verify payment (Stripe) → Add fulfillment row (Google Sheets) → Notify warehouse (Slack) → Send confirmation (Gmail) | A fulfillment row, warehouse notification, and customer email carrying the same order details. | 12 |
| 3 | **Give every new client a warm welcome** (`client-onboarding`) | Agencies | Deal won (HubSpot) → Create client workspace (Notion) → Introduce client to team (Slack) → Send welcome email (Gmail) | A client workspace, a five-task kickoff checklist, and a tailored welcome email. | 35 |
| 4 | **Process invoices without retyping** (`invoice-processing`) | Service businesses | Invoice arrives (Gmail) → Validate totals → Prepare draft bill (QuickBooks) → Request approval (Slack) | A draft bill and an approval request. The run stops with an error if subtotal + tax does not equal the total. No payment is made. | 15 |
| 5 | **Get urgent support to the right person** (`support-triage`) | Ecommerce | Receive customer email (Gmail) → Classify and draft reply → Create ticket (Zendesk) → Alert team (Slack) | A prioritised ticket, a team alert, and a reply draft for human review. A routine-question scenario gets normal priority. | 9 |
| 6 | **Make every appointment feel personal** (`appointment-followup`) | Service businesses | New booking (Calendly) → Update CRM activity (HubSpot) → Send preparation email (Gmail) → Brief consultant (Slack) | A CRM activity, a personalised preparation email, and a team briefing. | 10 |
| 7 | **Deliver a client-ready campaign report** (`campaign-report`) | Agencies | Read campaign metrics (Meta Ads) → Calculate performance (Google Sheets) → Prepare summary → Send client report (Gmail) | Cost per lead and return on ad spend calculated from the editable sample amounts, plus a client email. | 45 |
| 8 | **Turn a content brief into a review-ready post** (`content-approval`) | Agencies | New brief (Notion) → Prepare sample copy → Queue draft (Buffer) → Request approval (Slack) | A draft queued for human approval. Nothing is published. | 25 |

Workflow 1 has a conditional branch, and the unselected branch is shown as skipped in the trace. Workflows 1 and 5 include an alternate sample scenario. All eight can be run with a simulated rate-limit failure and then retried.

## Technology stack

| Technology | Purpose in this project |
| --- | --- |
| **Next.js 14** (App Router) | Full-stack framework: pages, API route handlers, middleware, and standalone production output for Docker |
| **React 18** | UI components |
| **TypeScript 5** | Type safety across the UI, engine, and API |
| **Tailwind CSS 3** (+ `tailwindcss-animate`) | Styling |
| **class-variance-authority, clsx, tailwind-merge** | Variant and class-name handling for the UI primitives in `src/components/ui` |
| **lucide-react** | Icons |
| **@xyflow/react** (React Flow) 12 | The interactive workflow canvas: nodes, edges, drag and drop, conditional handles |
| **Zustand** 5 | Client state: the canvas/workflow editing store and the demo store (with `persist` to `localStorage`) |
| **Recharts** 3 | Legacy dashboard execution-trend chart |
| **NextAuth** 4 (Credentials, JWT sessions) | Legacy-mode authentication; the JWT is also validated in the middleware to protect API routes |
| **bcryptjs** | Password hashing for stored users |
| **Prisma** 5 + **PostgreSQL** | Legacy-mode persistence (users, workflows, versions, executions, steps, integrations) |
| **Anthropic Messages API** (via `fetch`) | Legacy-mode AI workflow generation |
| **Node's built-in test runner** | Unit tests for the workflow engine and assistant |
| **ESLint** (`eslint-config-next`) | Linting |
| **Docker** and **Railway** | Container build and hosting |

Some packages are declared in `package.json` but not imported by the source: `@anthropic-ai/sdk`, `bullmq`, `ioredis`, `date-fns`, `nanoid`, and `uuid`.

## System architecture

One Next.js application serves the UI and the API. The mode is selected by `NEXT_PUBLIC_DEMO_MODE`, which Next.js inlines at **build time**. Demo mode is the default and is on unless the value is exactly `false`.

### Demo mode

```mermaid
flowchart LR
  subgraph Browser
    UI["React pages and components<br/>(src/components/demo)"]
    Store["Zustand demo store"]
    Engine["Workflow engine<br/>(src/lib/demo/engine.ts)"]
    Canvas["React Flow canvas<br/>(src/components/builder)"]
    LS[("localStorage")]
  end
  MW["Next.js middleware"]
  UI --> Canvas
  UI --> Store
  Store -->|"simulateWorkflow(graph, input)"| Engine
  Engine -->|"execution trace"| Store
  Store <--> LS
  UI -.->|"/api/* requests"| MW
  MW -->|"403, except /api/health"| UI
```

1. The `(dashboard)` layout renders `DemoWorkspace` instead of the legacy pages.
2. The workflow catalogue (`catalog.ts`) seeds the store on first load. Edits and runs are written to `localStorage`.
3. **Run sample** calls the pure function `simulateWorkflow`. It finds the single trigger node, follows edges, and for each step resolves the field mappings, applies the step's sample operation (`trigger`, `map`, `score`, `condition`, `classify`, `invoice`, `report`), and merges the output into the context passed to the next step. A `condition` step follows only the edge whose handle matches the decision. Unreached nodes are marked skipped, and a failure stops the run. It validates that the graph has exactly one trigger and no loops. It makes no network calls and executes no user-supplied code.
4. `src/middleware.ts` returns `403` for every `/api/*` request except `/api/health`, and redirects `/login` to `/dashboard`. The demo never reaches a database or a paid API.

### Legacy mode

```mermaid
flowchart LR
  Browser["Browser<br/>React pages + React Flow builder"]
  MW["Middleware<br/>(JWT check)"]
  Auth["NextAuth<br/>/api/auth/*"]
  API["API route handlers<br/>/api/workflows, /executions,<br/>/dashboard, /integrations, /ai/generate, /seed"]
  DB[("PostgreSQL<br/>via Prisma")]
  AI["Anthropic API"]
  Browser -->|"fetch /api/*"| MW
  MW -->|"valid session"| API
  MW -->|"no session: 401"| Browser
  Browser --> Auth
  Auth --> DB
  API --> DB
  API -.->|"if ANTHROPIC_API_KEY is set"| AI
```

1. Pages under `src/app/(dashboard)` fetch data from the API routes and keep editor state in a Zustand store.
2. **Middleware** requires a valid NextAuth session token for every `/api/*` route except `/api/health`, `/api/auth/*`, and `/api/seed` (which protects itself; see [Seeding](#seeding-legacy-mode)). Unauthenticated requests receive `401`.
3. **Route handlers** read and write PostgreSQL through the Prisma client (`src/lib/prisma.ts`). The `/api/dashboard`, `/api/executions`, and `/api/integrations` routes fall back to built-in sample data when the database is empty or unreachable.
4. **Execution** (`POST /api/workflows/:id/execute`) creates an `Execution` and one `ExecutionStep` per node, with simulated durations and outcomes, then marks the run `SUCCESS` or `ERROR`.
5. **AI generation** (`POST /api/ai/generate`) sends the description to the Anthropic API when a key is configured and returns a node/edge graph (plus an n8n-style definition). Otherwise it returns a built-in sample workflow.
6. **Data model** (`prisma/schema.prisma`): `User`, `Workflow`, `WorkflowVersion`, `Execution`, `ExecutionStep`, `Integration`, `ApiKey`, `AuditLog`. The workflow graph (`nodes` and `edges`) is stored as JSON on `Workflow`.

Legacy-mode limitations: workflows created through the API are attributed to the first user in the database rather than the signed-in user, and the repository contains no Prisma migrations (see [Installation](#legacy-mode-setup)).

## Project directory structure

```
.
├── README.md
├── PRD.md                          Product requirements document
├── FlowForge_Live_Presentation.pptx
├── screenshots/                    Legacy-mode interface screenshots
├── deliverables/                   FlowForge presentation and portfolio material
└── app/                            The application (deployed from this directory)
    ├── Dockerfile                  Multi-stage build, non-root runtime
    ├── railway.json                Railway deployment settings
    ├── .dockerignore
    ├── .env.example                Environment variable template
    ├── package.json
    ├── next.config.mjs             output: "standalone"
    ├── tailwind.config.ts / postcss.config.mjs / tsconfig.json / .eslintrc.json
    ├── prisma/
    │   └── schema.prisma           Database schema (legacy mode)
    ├── public/
    ├── tests/
    │   ├── demo-engine.test.cjs    Workflow engine tests
    │   └── assistant.test.cjs      Contextual assistant tests
    └── src/
        ├── middleware.ts           Demo-mode API lockdown / legacy-mode JWT guard
        ├── app/
        │   ├── layout.tsx, page.tsx, globals.css
        │   ├── (auth)/login/       Sign-in page (legacy)
        │   ├── (dashboard)/        dashboard, workflows, workflows/[id], history,
        │   │                       integrations, settings (legacy pages; demo mode
        │   │                       renders DemoWorkspace from this layout)
        │   └── api/                ai/generate, auth/[...nextauth], dashboard,
        │                           executions, health, integrations, seed, workflows
        ├── components/
        │   ├── demo/               Demo workspace, library, builder, run dialog, assistant
        │   ├── builder/            React Flow canvas, custom node, palette, config panel
        │   ├── ai/                 AI workflow generator dialog
        │   ├── shared/             Sidebar, session provider
        │   └── ui/                 Reusable UI primitives (button, dialog, tabs, ...)
        ├── lib/
        │   ├── demo/               catalog.ts (8 workflows, 14 providers), engine.ts,
        │   │                       store.ts, assistant.ts, types.ts, config.ts
        │   ├── auth.ts             NextAuth options
        │   ├── prisma.ts           Prisma client
        │   ├── node-types.ts       Builder node catalogue (26 types)
        │   ├── n8n-client.ts       n8n client (mock mode; not wired to any route)
        │   └── utils.ts
        └── stores/
            └── workflow-store.ts   Canvas/editor state (Zustand)
```

## Installation and setup

**Prerequisites:** Node.js 20 or newer and npm. PostgreSQL is needed only for legacy mode. Docker is optional.

All commands run from the `app/` directory.

```sh
cd app
npm ci
npx prisma generate
```

The `prisma generate` step creates the Prisma client that the code imports, in both modes.

Demo mode needs no further setup.

### Legacy mode setup

1. Create a PostgreSQL database.
2. Copy the template and edit it (see [Environment configuration](#environment-configuration)):
   ```sh
   cp .env.example .env
   ```
   Set `NEXT_PUBLIC_DEMO_MODE="false"`, `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, and the `SEED_ADMIN_*` values.
3. Create the tables. The repository has no migrations directory, so use:
   ```sh
   npx prisma db push
   ```
4. Start the app and [seed the database](#seeding-legacy-mode).

## Environment configuration

Copy [`app/.env.example`](app/.env.example) to `app/.env`. The `.env` file is git-ignored. Never commit real values.

| Variable | Needed for | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_DEMO_MODE` | Mode selection | Demo mode unless exactly `"false"`. Read **at build time**; rebuild after changing it. |
| `DATABASE_URL` | Legacy mode | PostgreSQL connection string, for example `postgresql://USER:PASSWORD@localhost:5432/flowforge` |
| `NEXTAUTH_SECRET` | Legacy mode | Secret that signs and verifies session tokens. Required: without it, session validation fails and protected API calls return `401`. Generate one with `openssl rand -base64 32`. |
| `NEXTAUTH_URL` | Legacy mode | Public base URL of the app. Use an `https://` URL in production so the secure session cookie is recognised. |
| `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` | Seeding | Credentials for the admin user that `/api/seed` creates. Seeding returns `400` if either is missing. |
| `ALLOW_SEED` | Seeding in production | `/api/seed` returns `403` when `NODE_ENV=production` unless this is `"true"`. Unset it after seeding. |
| `DEV_ADMIN_EMAIL`, `DEV_ADMIN_PASSWORD` | Optional, development only | Database-free sign-in for local development. Active only when both are set and `NODE_ENV` is not `production`. |
| `ANTHROPIC_API_KEY` | Optional | Enables real AI workflow generation. Without it, a built-in sample workflow is returned. |
| `N8N_BASE_URL`, `N8N_API_KEY`, `N8N_MOCK` | Reserved | Read by `src/lib/n8n-client.ts`, which no route currently uses. These variables have no effect today. |
| `REDIS_URL` | Reserved | Not read by any code. |

Demo mode requires none of these variables.

## How to run the application

### Development

```sh
cd app
npm run dev
```

Open <http://localhost:3000>. In demo mode, `/` and `/login` redirect to `/dashboard`.

### Production build (local preview)

The build produces Next.js standalone output:

```sh
npm run build
cp -R public .next/standalone/public
mkdir -p .next/standalone/.next && cp -R .next/static .next/standalone/.next/static
PORT=3000 HOSTNAME=127.0.0.1 node .next/standalone/server.js
```

### Legacy mode

With the environment configured and the schema pushed (see [Legacy mode setup](#legacy-mode-setup)):

```sh
npm run dev
```

Then sign in at <http://localhost:3000/login> with the credentials you chose in `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` after seeding.

For local development without a database you can instead set `DEV_ADMIN_EMAIL` and `DEV_ADMIN_PASSWORD` and sign in with those. Routes that need data (for example `/api/workflows`) return an error without a database. Dashboard, executions, and integrations fall back to sample data.

#### Seeding (legacy mode)

With `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` set:

```sh
curl http://localhost:3000/api/seed
```

This creates the admin user (role `OWNER`), the integrations catalogue, five workflow templates, and sample executions. It is safe to run again. The endpoint needs no session (so the first user can be created), but in production it is disabled unless `ALLOW_SEED="true"`. Set it only while seeding.

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create the production build |
| `npm test` | Run the unit tests |
| `npm run typecheck` | Run the TypeScript compiler without emitting files |
| `npm run lint` | Run ESLint |

## Testing

```sh
cd app
npm test
npm run typecheck
npm run lint
```

`npm test` uses Node's built-in test runner and runs the real TypeScript engine source (no extra test dependencies). There are 24 tests:

- **All eight workflows:** each sample runs to completion and produces a business output, and every step uses a registered virtual provider.
- **Branching:** qualified leads notify sales and skip nurture; small-budget leads take the nurture branch.
- **Data mapping:** edited trigger values flow through every provider mapping, and edited mappings are honoured by the engine.
- **Failure and recovery:** a provider failure stops downstream steps and a retry succeeds as a new run; a paused virtual connection blocks the relevant steps.
- **Validation:** invoice totals that do not add up stop bill creation, missing mapped fields produce an actionable error, and invalid roots and cycles fail safely.
- **Ordering and calculations:** graph order follows edges, not array order; campaign metrics and dashboard aggregates are computed correctly, excluding savings from failed runs.
- **Assistant:** reports are scoped correctly, an invalid scope cannot fall back to workspace data, and disconnected providers are reported as unavailable.

The legacy API routes and the React components are not covered by automated tests.

## Docker and Railway deployment

### Docker

The [`Dockerfile`](app/Dockerfile) is a multi-stage build on `node:20-slim`: dependencies, then `prisma generate` and `next build`, then a minimal runtime that runs the standalone server as a non-root user on port 3000.

```sh
docker build -t flowforge-live app
docker run --rm -p 3000:3000 flowforge-live
```

Open <http://localhost:3000>. Check health with `curl http://localhost:3000/api/health`, which returns `{"status":"ok", ...}`.

The `.dockerignore` excludes `.env` files, `node_modules`, and `.next`, so secrets are never copied into the image.

**Image mode:** `NEXT_PUBLIC_DEMO_MODE` is inlined at build time, and the Dockerfile does not set it during the build, so the image is built in **demo mode**. Running legacy mode in a container requires a build with `NEXT_PUBLIC_DEMO_MODE=false` available to the build stage, which means adapting the Dockerfile (for example with a build argument). Provide the runtime variables from the table above when you run it.

### Railway

[`app/railway.json`](app/railway.json) configures the deployment:

- **Builder:** the Dockerfile
- **Start command:** `node server.js`
- **Health check:** `/api/health`
- **Restart policy:** on failure, up to 10 retries

To deploy:

1. Create a Railway service from this repository.
2. Set the service's **Root Directory** to `/app`.
3. Deploy. Demo mode needs no environment variables or additional services.

Railway provides the `PORT` variable, and the container listens on the port it is given (default 3000). Because the image is built in demo mode, the service exposes only the interactive workspace and `/api/health`. All other API routes return `403`.
