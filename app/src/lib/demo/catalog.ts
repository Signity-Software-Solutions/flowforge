import type { DemoProvider, DemoWorkflow, Payload } from "./types";
import type { WorkflowNode } from "../../stores/workflow-store";

export const PROVIDERS: DemoProvider[] = [
  { id: "typeform", name: "Typeform", color: "#262627", category: "Forms", sample: { name: "Maya Chen", email: "maya@northstar.example", company: "Northstar Studio", budget: 8500 } },
  { id: "hubspot", name: "HubSpot", color: "#f87652", category: "CRM", sample: { contactId: "HS-1042", company: "Northstar Studio", stage: "Qualified", owner: "Alex Rivera" } },
  { id: "claude", name: "Claude", color: "#c27a58", category: "AI", sample: { classification: "High intent", leadScore: 92, summary: "Growing agency looking to automate lead handoffs." } },
  { id: "slack", name: "Slack", color: "#611f69", category: "Communication", sample: { channel: "#sales", message: "New qualified lead: Maya Chen · $8,500 budget", delivered: true } },
  { id: "gmail", name: "Gmail", color: "#dc4639", category: "Communication", sample: { from: "billing@acme.example", subject: "Invoice INV-2026-0148", attachment: "invoice.pdf", amount: 1240 } },
  { id: "shopify", name: "Shopify", color: "#679a31", category: "Ecommerce", sample: { orderId: "ORD-1048", customer: "Jordan Lee", email: "jordan@example.com", items: 3, total: 189, currency: "USD" } },
  { id: "stripe", name: "Stripe", color: "#635bff", category: "Finance", sample: { paymentId: "pi_demo_1048", orderId: "ORD-1048", amount: 189, currency: "USD", paymentStatus: "paid" } },
  { id: "sheets", name: "Google Sheets", color: "#188038", category: "Data", sample: { sheet: "Operations tracker", row: 148, status: "Recorded" } },
  { id: "quickbooks", name: "QuickBooks", color: "#2ca01c", category: "Finance", sample: { billId: "QB-148", vendor: "Acme Supplies", invoiceNumber: "INV-2026-0148", amount: 1240, status: "Pending approval" } },
  { id: "zendesk", name: "Zendesk", color: "#17494d", category: "Support", sample: { ticketId: "ZD-2084", subject: "Order arrived damaged", priority: "high", assignee: "Customer Care" } },
  { id: "calendly", name: "Calendly", color: "#006bff", category: "Scheduling", sample: { invitee: "Taylor Morgan", email: "taylor@example.com", appointment: "Discovery call", startsAt: "2026-10-15T10:00:00Z" } },
  { id: "notion", name: "Notion", color: "#323232", category: "Projects", sample: { project: "Northstar onboarding", tasks: 5, status: "Ready for kickoff" } },
  { id: "meta", name: "Meta Ads", color: "#0866ff", category: "Marketing", sample: { campaign: "Autumn acquisition", spend: 1200, leads: 80, revenue: 5400 } },
  { id: "buffer", name: "Buffer", color: "#168eea", category: "Marketing", sample: { channel: "LinkedIn", postId: "BUF-320", status: "Queued for review" } },
];

type StepSpec = [label: string, provider: string, operation: string, fields: Payload];
function workflow(
  meta: Omit<DemoWorkflow, "nodes" | "edges" | "failureNodeId" | "status">,
  steps: StepSpec[],
  branch?: { index: number; trueIndex: number; falseIndex: number },
): DemoWorkflow {
  const nodes: WorkflowNode[] = steps.map(([label, provider, operation, fields], index) => {
    const category = operation === "trigger" ? "triggers" : operation === "condition" ? "logic" : provider === "claude" ? "ai" : "actions";
    const type = operation === "trigger" ? "webhook" : operation === "condition" ? "ifElse" : provider === "claude" ? "callClaude" : provider === "gmail" ? "sendEmail" : provider === "slack" ? "sendSlack" : "httpRequest";
    return {
      id: `${meta.id}-${index}`, type: "custom",
      position: { x: branch && index === branch.falseIndex ? 390 : 80, y: branch && index === branch.falseIndex ? branch.trueIndex * 150 : index * 150 },
      data: { label, type, category, icon: operation === "trigger" ? "Zap" : operation === "condition" ? "GitBranch" : provider === "claude" ? "Brain" : provider === "gmail" ? "Mail" : provider === "slack" ? "MessageSquare" : "Globe", color: PROVIDERS.find(p => p.id === provider)?.color ?? "#64748b", status: "idle", config: { provider, operation, fields } },
    };
  });
  const edges = steps.slice(1).flatMap((_, i) => {
    if (branch && i >= branch.index) return [];
    return [{ id: `${meta.id}-edge-${i}`, source: nodes[i].id, target: nodes[i + 1].id, type: "smoothstep" }];
  });
  if (branch) {
    for (const [handle, index] of [["true", branch.trueIndex], ["false", branch.falseIndex]] as const) {
      edges.push({ id: `${meta.id}-${handle}`, source: nodes[branch.index].id, target: nodes[index].id, type: "smoothstep", ...{ sourceHandle: handle, label: handle === "true" ? "Qualified" : "Nurture" } });
    }
  }
  return { ...meta, nodes, edges, failureNodeId: nodes.find((n, i) => i > 0 && n.data.config.provider !== "claude")?.id ?? nodes[1].id, status: "ACTIVE" };
}

export const WORKFLOWS: DemoWorkflow[] = [
  workflow({
    id: "lead-qualification", name: "Turn new leads into sales conversations", category: "Agencies",
    description: "Qualify a form submission, update your CRM, and route the right leads to sales.",
    problem: "Leads sit in a spreadsheet while your team researches, scores, and assigns them manually.",
    outcome: "A scored CRM contact and a personalized sales alert—or a nurture email for smaller opportunities.",
    manualMinutes: 18, providers: ["typeform", "claude", "hubspot", "slack", "gmail"],
    input: { name: "Maya Chen", email: "maya@northstar.example", company: "Northstar Studio", budget: 8500, teamSize: 24, interest: "Automate lead follow-up" },
    alternateInput: { name: "Sam Ellis", email: "sam@launchpad.example", company: "Launchpad Design", budget: 800, teamSize: 2, interest: "Explore automation" }, alternateLabel: "Small-budget lead → nurture",
  }, [
    ["New enquiry", "typeform", "trigger", {}],
    ["Score lead intent", "claude", "score", {}],
    ["Create CRM contact", "hubspot", "map", { contactId: "HS-DEMO-1042", contactName: "{{name}}", contactEmail: "{{email}}", companyName: "{{company}}", score: "{{leadScore}}" }],
    ["Qualified for sales?", "claude", "condition", { field: "leadScore", threshold: 70 }],
    ["Notify the sales team", "slack", "map", { channel: "#qualified-leads", message: "New lead: {{name}} at {{company}}. Budget ${{budget}} · Score {{leadScore}}/100. Assigned to Alex Rivera.", delivery: "Virtual Slack message delivered" }],
    ["Send nurture email", "gmail", "map", { to: "{{email}}", subject: "Your first automation, {{name}}", message: "Thanks for reaching out! Here is our starter guide to planning your first automation. Tell us more about your goal: {{interest}}. We will check in next week.", delivery: "Virtual email delivered" }],
  ], { index: 3, trueIndex: 4, falseIndex: 5 }),
  workflow({
    id: "order-fulfillment", name: "From paid order to fulfillment", category: "Ecommerce",
    description: "Verify payment, prepare fulfillment, and send a customer confirmation.",
    problem: "Someone checks every payment, copies order details, and writes the same confirmation email.",
    outcome: "A fulfillment row, warehouse notification, and customer email carrying the same order details.",
    manualMinutes: 12, providers: ["shopify", "stripe", "sheets", "slack", "gmail"],
    input: { orderId: "ORD-1048", name: "Jordan Lee", email: "jordan@example.com", product: "Everyday Travel Kit", quantity: 3, total: 189, currency: "USD", city: "Austin" },
  }, [
    ["Order received", "shopify", "trigger", {}],
    ["Verify sample payment", "stripe", "map", { paymentId: "pi_demo_1048", paymentStatus: "paid", chargedAmount: "{{total}}", reference: "{{orderId}}" }],
    ["Add fulfillment row", "sheets", "map", { sheet: "Fulfillment queue", order: "{{orderId}}", customer: "{{name}}", units: "{{quantity}}", destination: "{{city}}", fulfillmentStatus: "Ready to pack" }],
    ["Notify warehouse", "slack", "map", { channel: "#fulfillment", message: "Pack {{quantity}} × {{product}} for {{name}} in {{city}}. Order {{orderId}} is paid." }],
    ["Send order confirmation", "gmail", "map", { to: "{{email}}", subject: "Order {{orderId}} confirmed", message: "Hi {{name}}, your {{product}} order is confirmed. Total: ${{total}} {{currency}}. Our warehouse is preparing your shipment.", delivery: "Virtual email delivered" }],
  ]),
  workflow({
    id: "client-onboarding", name: "Give every new client a warm welcome", category: "Agencies",
    description: "A signed client becomes a project, kickoff checklist, and personal welcome email.",
    problem: "Client details get copied between CRM, project tools, and email—and kickoff tasks get missed.",
    outcome: "A ready-to-use client workspace, a five-task checklist, and a tailored kickoff invitation.",
    manualMinutes: 35, providers: ["hubspot", "notion", "slack", "gmail"],
    input: { name: "Avery Patel", email: "avery@cedar.example", company: "Cedar & Co", service: "Website redesign", projectValue: 6500, owner: "Alex Rivera", kickoff: "Tuesday at 10:00 AM" },
  }, [
    ["Deal marked won", "hubspot", "trigger", {}],
    ["Create client workspace", "notion", "map", { project: "{{company}} — {{service}}", projectOwner: "{{owner}}", tasks: ["Collect brand assets", "Send discovery questionnaire", "Schedule kickoff", "Request access", "Confirm milestones"], projectStatus: "Ready for kickoff" }],
    ["Introduce client to the team", "slack", "map", { channel: "#new-clients", message: "Welcome {{company}}! {{service}} · ${{projectValue}} project. {{owner}} owns the kickoff on {{kickoff}}." }],
    ["Send personalized welcome", "gmail", "map", { to: "{{email}}", subject: "Welcome aboard, {{company}}", message: "Hi {{name}}, we are excited to start your {{service}}. {{owner}} will meet you {{kickoff}}. Your project workspace and kickoff checklist are ready.", delivery: "Virtual email delivered" }],
  ]),
  workflow({
    id: "invoice-processing", name: "Process invoices without retyping", category: "Service businesses",
    description: "Extract an invoice, check the totals, and prepare a bill for human approval.",
    problem: "Your team retypes invoice fields and chases approvals across inboxes.",
    outcome: "A checked QuickBooks draft bill and an approval notification. No payment is made.",
    manualMinutes: 15, providers: ["gmail", "claude", "quickbooks", "slack"],
    input: { from: "billing@acme.example", attachment: "INV-2026-0148.pdf", vendor: "Acme Supplies", invoiceNumber: "INV-2026-0148", subtotal: 1150, tax: 90, total: 1240, currency: "USD", dueDate: "2026-10-30" },
  }, [
    ["Invoice arrives", "gmail", "trigger", {}],
    ["Validate invoice totals", "claude", "invoice", {}],
    ["Prepare draft bill", "quickbooks", "map", { billId: "QB-DEMO-148", supplier: "{{vendor}}", reference: "{{invoiceNumber}}", billAmount: "{{total}}", due: "{{dueDate}}", billStatus: "Draft — awaiting human approval" }],
    ["Request approval", "slack", "map", { channel: "#finance-approvals", message: "Approve {{invoiceNumber}} from {{vendor}}: ${{total}} {{currency}}, due {{dueDate}}. Totals validated; draft bill {{billId}} is ready. No payment has been initiated." }],
  ]),
  workflow({
    id: "support-triage", name: "Get urgent support to the right person", category: "Ecommerce",
    description: "Classify an incoming support request, set priority, and draft a helpful reply.",
    problem: "Urgent messages wait in the same queue as routine questions.",
    outcome: "A prioritized support ticket, a team alert, and a response draft for a human to review.",
    manualMinutes: 9, providers: ["gmail", "claude", "zendesk", "slack"],
    input: { name: "Riley Brooks", email: "riley@example.com", orderId: "ORD-1041", subject: "Order arrived damaged", body: "My ceramic set arrived damaged and I need a replacement before Friday." },
    alternateInput: { name: "Riley Brooks", email: "riley@example.com", orderId: "ORD-1041", subject: "Question about care instructions", body: "Can this ceramic set go in the dishwasher?" }, alternateLabel: "Routine question → normal priority",
  }, [
    ["Receive customer email", "gmail", "trigger", {}],
    ["Classify and draft reply", "claude", "classify", {}],
    ["Create support ticket", "zendesk", "map", { ticketId: "ZD-DEMO-2084", requester: "{{email}}", ticketSubject: "{{subject}}", ticketPriority: "{{priority}}", team: "Customer Care", responseDraft: "{{draftReply}}" }],
    ["Alert support team", "slack", "map", { channel: "#customer-care", message: "{{priority}} priority: {{subject}} · {{ticketId}} · {{name}}. A response draft is ready for review." }],
  ]),
  workflow({
    id: "appointment-followup", name: "Make every appointment feel personal", category: "Service businesses",
    description: "Capture a booking, update the CRM, and prepare the client and your team.",
    problem: "Booking details are scattered and clients arrive without the information they need.",
    outcome: "A complete CRM activity and a personalized appointment email with a preparation checklist.",
    manualMinutes: 10, providers: ["calendly", "hubspot", "gmail", "slack"],
    input: { name: "Taylor Morgan", email: "taylor@example.com", company: "Oakridge Consulting", appointment: "Automation discovery call", startsAt: "October 15, 10:00 AM UTC", goal: "Reduce weekly reporting work" },
  }, [
    ["New booking", "calendly", "trigger", {}],
    ["Update CRM activity", "hubspot", "map", { contactName: "{{name}}", contactEmail: "{{email}}", meeting: "{{appointment}}", meetingTime: "{{startsAt}}", notes: "{{goal}}" }],
    ["Send preparation email", "gmail", "map", { to: "{{email}}", subject: "Your {{appointment}} is booked", message: "Hi {{name}}, see you on {{startsAt}}. We will focus on: {{goal}}. Please bring an example of your current process and the tools your team uses.", delivery: "Virtual email delivered" }],
    ["Brief the consultant", "slack", "map", { channel: "#appointments", message: "{{name}} at {{company}} booked {{startsAt}}. Goal: {{goal}}. CRM updated and preparation email sent." }],
  ]),
  workflow({
    id: "campaign-report", name: "Deliver a client-ready campaign report", category: "Agencies",
    description: "Turn campaign sample data into a concise performance summary and client update.",
    problem: "Account managers spend Monday mornings copying numbers and writing status emails.",
    outcome: "Calculated cost per lead and ROAS, a reporting row, and a readable client email.",
    manualMinutes: 45, providers: ["meta", "sheets", "claude", "gmail"],
    input: { client: "Northstar Studio", email: "maya@northstar.example", campaign: "Autumn acquisition", spend: 1200, leads: 80, revenue: 5400, period: "Sample week: Oct 5–11" },
  }, [
    ["Read campaign metrics", "meta", "trigger", {}],
    ["Calculate performance", "sheets", "report", {}],
    ["Prepare performance summary", "claude", "map", { summary: "{{campaign}} generated {{leads}} leads at ${{costPerLead}} each, with {{roas}}× return on ad spend. Next step: review creative performance before increasing budget." }],
    ["Send client report", "gmail", "map", { to: "{{email}}", subject: "{{client}} — {{period}} performance", message: "Hi team, here is your campaign update: {{summary}} Spend: ${{spend}}. Attributed revenue: ${{revenue}}.", delivery: "Virtual email delivered" }],
  ]),
  workflow({
    id: "content-approval", name: "Turn a content brief into a review-ready post", category: "Agencies",
    description: "Take a marketing brief through a sample AI draft and an explicit approval handoff.",
    problem: "Ideas, copy drafts, and approval requests get lost between documents and chat.",
    outcome: "A branded draft queued for review, with an approval request. Nothing is published automatically.",
    manualMinutes: 25, providers: ["notion", "claude", "buffer", "slack"],
    input: { brand: "Cedar & Co", topic: "Sustainable everyday travel", audience: "Remote workers", tone: "Helpful and practical", channel: "LinkedIn", reviewer: "Alex Rivera" },
  }, [
    ["New content brief", "notion", "trigger", {}],
    ["Prepare sample copy", "claude", "map", { draft: "Small choices, lighter journeys. At {{brand}}, we believe {{topic}} starts with essentials you will use every day. Built for {{audience}}. What is the one item you never travel without?", draftTone: "{{tone}}" }],
    ["Queue draft for review", "buffer", "map", { postId: "BUF-DEMO-320", destination: "{{channel}}", content: "{{draft}}", publishingStatus: "Awaiting human approval — not published" }],
    ["Request content approval", "slack", "map", { channel: "#content-review", message: "{{reviewer}}, your {{brand}} {{destination}} draft is ready: {{draft}}", approvalStatus: "Waiting for reviewer" }],
  ]),
];
