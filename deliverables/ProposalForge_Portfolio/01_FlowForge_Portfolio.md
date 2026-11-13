# FlowForge — Visual Business Automation Studio

**Portfolio category:** Workflow automation, business process automation, integration UX, operational dashboards.

**Project type:** Interactive, deployed portfolio demonstration with working workflow execution against virtual providers.

**Demo URL:** https://web-production-64a22.up.railway.app/dashboard

**Ideal clients:** Agencies, ecommerce businesses, service companies, and operations teams seeking to connect repetitive work across multiple applications.

**Core proposition:** Turn a business event into a visible sequence of decisions, mapped records, prepared communications, and operational handoffs—and show exactly what happens at every step.

**Documentation reviewed:** 9 October 2026. Dataset counts describe the initial demo workspace; interactive changes can alter them.

## Portfolio summary

FlowForge is a visual automation studio that helps prospective clients experience how their everyday processes could work across CRM, email, ecommerce, finance, support, and collaboration applications. Eight ready-to-present workflows cover lead qualification, order fulfillment, client onboarding, invoice processing, support triage, appointment follow-up, campaign reporting, and content approval.

Users can inspect and edit workflow graphs, review field mappings, change sample inputs, run a scenario, and open the resulting business records and communications. Branching, validation, provider availability, simulated failures, and retries make the demonstration more useful than a collection of static screens. A dashboard, execution history, and illustrative savings calculator connect the technical flow to an operational conversation.

The application demonstrates working orchestration logic using fictional records and fourteen virtual providers. It does not require access to a prospect’s accounts, send messages, charge payments, or publish content. Its strongest portfolio value is making automation logic, exceptions, and business outcomes understandable before a real integration project begins.

## Business problem

Growing teams often copy the same information between forms, spreadsheets, CRM records, email, and task tools. Qualification rules can live in individual employees’ heads, handoffs lose context, and failures are discovered only after an expected action does not happen. It is also difficult for a nontechnical buyer to evaluate an automation proposal from an architecture diagram alone.

FlowForge addresses the demonstration and discovery side of this problem: a prospect can see a familiar process, trace their sample data through it, inspect the intended outputs, and discuss the rules and exceptions that a commissioned implementation would need to support.

## Features and client benefits

| Feature | What the current solution demonstrates | Client benefit |
| --- | --- | --- |
| Business dashboard | Workflow activity, successful runs, operational summaries, and illustrative savings | Gives stakeholders an accessible overview of the automation story |
| Curated workflow library | Eight complete business scenarios with before-and-after context | Starts discovery from a recognizable business problem |
| Template finder | Keyword matching against the curated process and application catalog | Helps visitors find a relevant scenario quickly |
| Visual workflow builder | Editable nodes, edges, and connected workflow paths | Makes process structure reviewable by technical and business users |
| Node configuration | Virtual provider, sample operation, and mapped fields | Shows the configuration required behind each business action |
| Field mapping | Expressions such as `{{field}}` resolve against the current run’s data | Demonstrates how consistent details move between applications |
| Editable sample runner | Fictional names, budgets, orders, and campaign amounts can be changed | Makes the demonstration specific to a prospect’s process |
| Conditional branching | Different inputs follow different connected paths | Explains qualification, routing, and exception rules clearly |
| Graph validation | Checks supported graph structure before execution | Surfaces configuration issues before presenting downstream results |
| Step traces | Inspectable inputs, outputs, execution states, and skipped steps | Supports troubleshooting and explains why an output was produced |
| Business output previews | Prepared emails, team messages, CRM-style records, project checklists, and approval requests | Lets clients evaluate the actual content and handoff, not just the diagram |
| Numeric calculations | Campaign metrics and invoice checks derive from mapped amounts | Demonstrates consistent calculations rather than fixed display values |
| Virtual connections | Fourteen providers with connection states and representative records | Enables integration discovery without requesting account credentials |
| Failure simulation | A provider error interrupts execution and skips downstream actions | Shows that operational exceptions are part of the design |
| Retry demonstration | A temporary error can be cleared and the sample rerun | Makes recovery behavior tangible during a sales conversation |
| Execution history | Twenty-four labeled example runs plus new runs; up to 200 recent executions retained | Provides a populated starting point and evidence of subsequent interaction |
| Browser persistence and reset | Workflow edits, connections, and history survive refresh in the same browser | Supports repeatable demonstrations and a clean reset between presentations |
| Guided presentation | In-app demo guide and scenario talking points | Helps a presenter connect implementation details to business value |
| Savings calculator | Editable manual-time and hourly-rate assumptions | Supports a preliminary business-case discussion without inventing measured ROI |

## Eight business workflows

### 1. Lead qualification and sales routing

**Flow:** Typeform-style submission → sample qualification → conditional branch → HubSpot-style sales record and Slack alert, or Gmail-style nurture message.

The high-budget and small-budget examples demonstrate different outcomes. Name, contact details, budget, and qualification context carry through the outputs. This is useful for agencies or service firms that need to prioritize suitable enquiries while giving other prospects an appropriate next step.

**Benefit:** A clear, consistent qualification handoff with less potential for repeated data entry or lost context.

### 2. Ecommerce order fulfillment

**Flow:** Shopify-style order → Stripe-style payment context → Google Sheets warehouse record → Slack notification → Gmail customer update.

The sample order keeps its identifier, items, amount, and delivery details consistent across records. An example uses order ORD-1048, three items, a $189 total, and Austin as the destination.

**Benefit:** Demonstrates how sales, fulfillment, and customer communication can operate from the same order context. It does not process a real payment or shipment.

### 3. Client onboarding

**Flow:** HubSpot-style client event → Notion-style project checklist → Slack team handoff → personalized Gmail welcome.

The output includes a five-task onboarding checklist and communications based on the same client details.

**Benefit:** Makes the transition from a sale to service delivery more consistent and easier to review.

### 4. Invoice processing

**Flow:** Gmail-style invoice input → sample extraction step → total validation → QuickBooks-style draft bill → Slack approval request.

The demonstration validates the amounts before producing the draft financial record. A seeded example uses a $1,240 invoice.

**Benefit:** Illustrates how validation and a review handoff can precede financial action. The approval request is an output preview, not a functioning approval system or payment instruction.

### 5. Customer support triage

**Flow:** Gmail-style support enquiry → sample classification → Zendesk-style ticket preparation → Slack escalation context.

A damaged-order scenario receives a different priority from a routine question.

**Benefit:** Shows how classification can direct attention while preserving the customer’s original context.

### 6. Appointment preparation and follow-up

**Flow:** Calendly-style booking → HubSpot-style CRM update → customer preparation email → consultant briefing.

**Benefit:** Demonstrates how the same booking details can prepare both the customer and the service provider, reducing manual coordination in a production implementation.

### 7. Campaign performance reporting

**Flow:** Meta Ads-style campaign data → Google Sheets-style reporting → sample narrative summary → Gmail report.

Editable spend, lead, and revenue amounts produce calculated cost per lead and return on ad spend. One sample produces a $15 cost per lead and 4.5× ROAS; these are fictional input-derived values.

**Benefit:** Connects reporting calculations with a client-readable explanation and repeatable delivery format.

### 8. Content review handoff

**Flow:** Notion-style content brief → mapped draft text → Buffer-style preparation → Slack review request.

**Benefit:** Shows the transition from a brief to a prepared item awaiting human review. Nothing is published, and no live generative model is called.

## Integration coverage

The virtual provider catalog contains Typeform, Claude, HubSpot, Slack, Gmail, Shopify, Stripe, Google Sheets, Notion, QuickBooks, Zendesk, Calendly, Meta Ads, and Buffer. Provider branding represents the intended integration context; it does not indicate a connected account or certified partnership.

The value of these adapters is inspectable mapping: the presenter can show where information comes from, which fields an action expects, and what the prepared output contains. AI-labeled operations use transparent sample rules or mapped draft text.

## Suggested client walkthrough

1. Select the workflow closest to the prospect’s repetitive process.
2. Explain the trigger, decision, and expected business output.
3. Inspect one node’s mappings and adjust a fictional input.
4. Run the workflow and open the prepared email, record, or checklist.
5. Show an alternate branch or simulate a provider error and recovery.
6. Review execution history and discuss savings using the prospect’s own assumptions.
7. Capture the real project’s account access, field mapping, volume, approval, and exception requirements.

## Technical capabilities demonstrated

The application uses Next.js, React, TypeScript, Tailwind CSS, Zustand, a React Flow/XYFlow canvas, and Recharts. A deterministic graph engine follows connected acyclic paths and conditional handles, resolves mappings, performs calculations, and returns step traces. Browser-local state supports presentation continuity. The deployed application uses Railway and a containerized Next.js standalone build.

The implementation demonstrates visual process design, domain modeling, mapped integration interfaces, rule execution, validation, failure visibility, and operational UX. Default demo mode blocks legacy data and paid-AI endpoints; the retained backend scaffolding is not itself a production integration platform.

## Business value and demonstrated outcomes

The working outcome is an inspectable path from sample input to business output across eight scenarios. The intended client benefits are less duplicate entry, clearer routing, consistent customer communication, and more reliable handoffs after a real implementation. No client revenue, time-saving percentage, adoption figure, or financial return has been measured or claimed.

The savings display is an illustration based on editable assumptions for successful runs. It excludes implementation effort, provider costs, and human review. Execution durations are presentation pacing rather than throughput benchmarks.

## Current scope and possible commissioned extensions

**Current scope:** Browser-local demonstration, virtual connectors, deterministic rules, connected acyclic graphs, sample failure/retry, and prepared output previews. It does not include real webhooks, background scheduling, arbitrary code execution, parallel joins, live AI generation, durable jobs, or an operational human-approval service.

**Potential follow-on scope:** Authenticated workspaces, role-based access, provider OAuth, real API adapters, webhook verification, durable execution queues, idempotency, retry policies, approval inboxes, monitoring, and client-specific workflow templates. These are implementation opportunities, not features claimed as already delivered.

## Proposal relevance

**Best-fit engagements:** Lead routing, ecommerce operations, onboarding automation, invoice intake, support triage, appointment coordination, campaign reporting, and cross-application workflow design.

**Searchable capability tags:** Workflow automation; visual workflow builder; API mapping; CRM automation; ecommerce automation; lead qualification; operational dashboards; error handling; Next.js; React; TypeScript; Railway.

**Reusable proposal reference:** “FlowForge is my interactive automation portfolio demo. It shows eight business processes with editable mappings, conditional routing, inspectable outputs, and failure recovery, making it useful for discussing the rules and handoffs your implementation needs.”
