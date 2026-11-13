import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  // Seeding is opt-in outside local development: set ALLOW_SEED="true" to enable it,
  // and unset it again afterwards.
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_SEED !== "true") {
    return NextResponse.json({ success: false, error: "Seeding is disabled" }, { status: 403 });
  }

  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    return NextResponse.json(
      { success: false, error: "SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set" },
      { status: 400 }
    );
  }

  try {
    // ── 1. Seed admin user ──────────────────────────────────────────────
    let admin = await prisma.user.findUnique({ where: { email: adminEmail } });

    if (!admin) {
      const hashed = await hashPassword(adminPassword);
      admin = await prisma.user.create({
        data: {
          email: adminEmail,
          name: "Admin",
          password: hashed,
          role: "OWNER",
        },
      });
    }

    // ── 2. Seed integrations (30 across 8 categories) ───────────────────
    const integrations = [
      // CRM (4)
      { name: "Salesforce", slug: "salesforce", description: "Connect to Salesforce CRM for lead and contact management", category: "CRM", icon: "☁️", authType: "oauth" },
      { name: "HubSpot", slug: "hubspot", description: "HubSpot CRM integration for marketing and sales automation", category: "CRM", icon: "🟠", authType: "oauth" },
      { name: "Pipedrive", slug: "pipedrive", description: "Manage deals and contacts through Pipedrive", category: "CRM", icon: "🟢", authType: "api_key" },
      { name: "Zoho CRM", slug: "zoho-crm", description: "Zoho CRM for customer relationship management", category: "CRM", icon: "🔴", authType: "oauth" },
      // Email (4)
      { name: "Gmail", slug: "gmail", description: "Send and receive emails via Gmail", category: "Email", icon: "📧", authType: "oauth" },
      { name: "SendGrid", slug: "sendgrid", description: "Transactional and marketing email delivery", category: "Email", icon: "📨", authType: "api_key" },
      { name: "Mailchimp", slug: "mailchimp", description: "Email marketing campaigns and audience management", category: "Email", icon: "🐵", authType: "oauth" },
      { name: "Outlook", slug: "outlook", description: "Microsoft Outlook email integration", category: "Email", icon: "📬", authType: "oauth" },
      // Communication (4)
      { name: "Slack", slug: "slack", description: "Team messaging and notifications via Slack", category: "Communication", icon: "💬", authType: "oauth" },
      { name: "Microsoft Teams", slug: "ms-teams", description: "Collaboration and messaging through Microsoft Teams", category: "Communication", icon: "🟣", authType: "oauth" },
      { name: "Discord", slug: "discord", description: "Send messages and manage channels in Discord", category: "Communication", icon: "🎮", authType: "oauth" },
      { name: "Twilio", slug: "twilio", description: "SMS, voice, and WhatsApp messaging", category: "Communication", icon: "📱", authType: "api_key" },
      // E-commerce (4)
      { name: "Shopify", slug: "shopify", description: "E-commerce store management and order processing", category: "E-commerce", icon: "🛍️", authType: "oauth" },
      { name: "WooCommerce", slug: "woocommerce", description: "WordPress e-commerce integration", category: "E-commerce", icon: "🛒", authType: "api_key" },
      { name: "Magento", slug: "magento", description: "Adobe Commerce (Magento) store integration", category: "E-commerce", icon: "🏪", authType: "api_key" },
      { name: "BigCommerce", slug: "bigcommerce", description: "BigCommerce store and product management", category: "E-commerce", icon: "🏬", authType: "oauth" },
      // Payment (4)
      { name: "Stripe", slug: "stripe", description: "Payment processing and subscription management", category: "Payment", icon: "💳", authType: "api_key" },
      { name: "PayPal", slug: "paypal", description: "PayPal payment and invoicing integration", category: "Payment", icon: "🅿️", authType: "oauth" },
      { name: "Square", slug: "square", description: "In-person and online payment processing", category: "Payment", icon: "⬛", authType: "oauth" },
      { name: "Razorpay", slug: "razorpay", description: "Payment gateway for Indian and global businesses", category: "Payment", icon: "💰", authType: "api_key" },
      // AI/ML (4)
      { name: "OpenAI", slug: "openai", description: "GPT models for text generation and analysis", category: "AI/ML", icon: "🤖", authType: "api_key" },
      { name: "Anthropic", slug: "anthropic", description: "Claude models for advanced AI reasoning", category: "AI/ML", icon: "🧠", authType: "api_key" },
      { name: "Google AI", slug: "google-ai", description: "Gemini and Vertex AI model integration", category: "AI/ML", icon: "🔮", authType: "oauth" },
      { name: "Hugging Face", slug: "hugging-face", description: "Open-source ML model inference and hosting", category: "AI/ML", icon: "🤗", authType: "api_key" },
      // Database (3)
      { name: "PostgreSQL", slug: "postgresql", description: "Connect to PostgreSQL databases for queries and operations", category: "Database", icon: "🐘", authType: "basic" },
      { name: "MongoDB", slug: "mongodb", description: "MongoDB document database integration", category: "Database", icon: "🍃", authType: "basic" },
      { name: "Supabase", slug: "supabase", description: "Supabase backend-as-a-service integration", category: "Database", icon: "⚡", authType: "api_key" },
      // Cloud Storage (3)
      { name: "AWS S3", slug: "aws-s3", description: "Amazon S3 file storage and management", category: "Cloud Storage", icon: "☁️", authType: "api_key" },
      { name: "Google Drive", slug: "google-drive", description: "File storage and sharing via Google Drive", category: "Cloud Storage", icon: "📁", authType: "oauth" },
      { name: "Dropbox", slug: "dropbox", description: "Cloud file storage and synchronization", category: "Cloud Storage", icon: "📦", authType: "oauth" },
    ];

    for (const integration of integrations) {
      await prisma.integration.upsert({
        where: { slug: integration.slug },
        update: {},
        create: integration,
      });
    }

    // ── 3. Seed workflow templates (5) ──────────────────────────────────
    const workflowTemplates = [
      {
        name: "Lead Enrichment Pipeline",
        description: "Automatically enrich new CRM leads with company data and assign scores",
        isTemplate: true,
        templateCategory: "Sales",
        triggerType: "webhook",
        status: "ACTIVE" as const,
        estimatedManualMinutes: 15,
        nodes: [
          { id: "trigger-1", type: "trigger", position: { x: 50, y: 200 }, data: { label: "New Lead Webhook", type: "webhook", config: {} } },
          { id: "enrich-1", type: "action", position: { x: 300, y: 200 }, data: { label: "Fetch Company Data", type: "http_request", config: { url: "https://api.clearbit.com/v2/companies/find" } } },
          { id: "ai-1", type: "ai", position: { x: 550, y: 200 }, data: { label: "Score Lead (AI)", type: "openai", config: { model: "gpt-4o-mini", prompt: "Score this lead 1-100 based on..." } } },
          { id: "condition-1", type: "condition", position: { x: 800, y: 200 }, data: { label: "Score > 70?", type: "if", config: { condition: "score > 70" } } },
          { id: "crm-1", type: "action", position: { x: 1050, y: 100 }, data: { label: "Update Salesforce", type: "salesforce", config: { action: "update_lead" } } },
          { id: "notify-1", type: "action", position: { x: 1050, y: 300 }, data: { label: "Notify via Slack", type: "slack", config: { channel: "#sales" } } },
        ],
        edges: [
          { id: "e1", source: "trigger-1", target: "enrich-1" },
          { id: "e2", source: "enrich-1", target: "ai-1" },
          { id: "e3", source: "ai-1", target: "condition-1" },
          { id: "e4", source: "condition-1", target: "crm-1", label: "Yes" },
          { id: "e5", source: "condition-1", target: "notify-1", label: "No" },
        ],
        n8nWorkflowJson: {
          name: "Lead Enrichment Pipeline",
          nodes: [
            { parameters: { httpMethod: "POST", path: "lead-webhook" }, name: "Webhook", type: "n8n-nodes-base.webhook", position: [250, 300] },
            { parameters: { url: "https://api.clearbit.com/v2/companies/find", method: "GET" }, name: "Fetch Company", type: "n8n-nodes-base.httpRequest", position: [450, 300] },
            { parameters: { model: "gpt-4o-mini" }, name: "Score Lead", type: "@n8n/n8n-nodes-langchain.openAi", position: [650, 300] },
            { parameters: { conditions: { number: [{ value1: "={{$json.score}}", value2: 70, operation: "larger" }] } }, name: "If Score High", type: "n8n-nodes-base.if", position: [850, 300] },
          ],
          connections: {},
        },
      },
      {
        name: "Order Notification Flow",
        description: "Send multi-channel notifications when a new Shopify order arrives",
        isTemplate: true,
        templateCategory: "E-commerce",
        triggerType: "webhook",
        status: "ACTIVE" as const,
        estimatedManualMinutes: 10,
        nodes: [
          { id: "trigger-1", type: "trigger", position: { x: 50, y: 200 }, data: { label: "Shopify Order", type: "shopify_webhook", config: { event: "orders/create" } } },
          { id: "transform-1", type: "action", position: { x: 300, y: 200 }, data: { label: "Format Order Data", type: "transform", config: {} } },
          { id: "email-1", type: "action", position: { x: 550, y: 100 }, data: { label: "Send Confirmation Email", type: "sendgrid", config: { template: "order_confirmation" } } },
          { id: "slack-1", type: "action", position: { x: 550, y: 300 }, data: { label: "Slack Notification", type: "slack", config: { channel: "#orders" } } },
          { id: "sheet-1", type: "action", position: { x: 800, y: 200 }, data: { label: "Log to Google Sheet", type: "google_sheets", config: { spreadsheet: "Orders Log" } } },
        ],
        edges: [
          { id: "e1", source: "trigger-1", target: "transform-1" },
          { id: "e2", source: "transform-1", target: "email-1" },
          { id: "e3", source: "transform-1", target: "slack-1" },
          { id: "e4", source: "email-1", target: "sheet-1" },
          { id: "e5", source: "slack-1", target: "sheet-1" },
        ],
        n8nWorkflowJson: {
          name: "Order Notification Flow",
          nodes: [
            { parameters: { event: "orders/create" }, name: "Shopify Trigger", type: "n8n-nodes-base.shopifyTrigger", position: [250, 300] },
            { parameters: {}, name: "Format Data", type: "n8n-nodes-base.set", position: [450, 300] },
            { parameters: { to: "{{$json.email}}", subject: "Order Confirmed" }, name: "Send Email", type: "n8n-nodes-base.sendGrid", position: [650, 200] },
            { parameters: { channel: "#orders" }, name: "Slack", type: "n8n-nodes-base.slack", position: [650, 400] },
          ],
          connections: {},
        },
      },
      {
        name: "Email Triage Assistant",
        description: "AI-powered email classification, prioritization, and auto-routing",
        isTemplate: true,
        templateCategory: "Productivity",
        triggerType: "schedule",
        status: "DRAFT" as const,
        estimatedManualMinutes: 30,
        nodes: [
          { id: "trigger-1", type: "trigger", position: { x: 50, y: 200 }, data: { label: "Every 5 Minutes", type: "cron", config: { interval: "*/5 * * * *" } } },
          { id: "fetch-1", type: "action", position: { x: 300, y: 200 }, data: { label: "Fetch Unread Emails", type: "gmail", config: { query: "is:unread" } } },
          { id: "ai-1", type: "ai", position: { x: 550, y: 200 }, data: { label: "Classify & Prioritize", type: "anthropic", config: { model: "claude-sonnet-4-20250514", prompt: "Classify this email..." } } },
          { id: "condition-1", type: "condition", position: { x: 800, y: 200 }, data: { label: "Priority?", type: "switch", config: { property: "priority" } } },
          { id: "urgent-1", type: "action", position: { x: 1050, y: 100 }, data: { label: "Slack DM (Urgent)", type: "slack", config: { channel: "@user" } } },
          { id: "label-1", type: "action", position: { x: 1050, y: 300 }, data: { label: "Apply Gmail Label", type: "gmail", config: { action: "addLabel" } } },
        ],
        edges: [
          { id: "e1", source: "trigger-1", target: "fetch-1" },
          { id: "e2", source: "fetch-1", target: "ai-1" },
          { id: "e3", source: "ai-1", target: "condition-1" },
          { id: "e4", source: "condition-1", target: "urgent-1", label: "High" },
          { id: "e5", source: "condition-1", target: "label-1", label: "Normal" },
        ],
        n8nWorkflowJson: {
          name: "Email Triage Assistant",
          nodes: [
            { parameters: { rule: { interval: [{ field: "minutes", minutesInterval: 5 }] } }, name: "Schedule", type: "n8n-nodes-base.scheduleTrigger", position: [250, 300] },
            { parameters: { query: "is:unread" }, name: "Gmail", type: "n8n-nodes-base.gmail", position: [450, 300] },
            { parameters: { model: "claude-sonnet-4-20250514" }, name: "Classify", type: "@n8n/n8n-nodes-langchain.anthropic", position: [650, 300] },
          ],
          connections: {},
        },
      },
      {
        name: "Social Media Posting",
        description: "AI-generate and schedule social media posts across platforms",
        isTemplate: true,
        templateCategory: "Marketing",
        triggerType: "manual",
        status: "ACTIVE" as const,
        estimatedManualMinutes: 45,
        nodes: [
          { id: "trigger-1", type: "trigger", position: { x: 50, y: 200 }, data: { label: "Manual Trigger", type: "manual", config: {} } },
          { id: "input-1", type: "action", position: { x: 300, y: 200 }, data: { label: "Get Topic & Tone", type: "form", config: { fields: ["topic", "tone", "platforms"] } } },
          { id: "ai-1", type: "ai", position: { x: 550, y: 200 }, data: { label: "Generate Content", type: "openai", config: { model: "gpt-4o", prompt: "Write a social media post about {{topic}} in a {{tone}} tone" } } },
          { id: "twitter-1", type: "action", position: { x: 800, y: 100 }, data: { label: "Post to X/Twitter", type: "twitter", config: {} } },
          { id: "linkedin-1", type: "action", position: { x: 800, y: 300 }, data: { label: "Post to LinkedIn", type: "linkedin", config: {} } },
          { id: "log-1", type: "action", position: { x: 1050, y: 200 }, data: { label: "Log to Sheet", type: "google_sheets", config: {} } },
        ],
        edges: [
          { id: "e1", source: "trigger-1", target: "input-1" },
          { id: "e2", source: "input-1", target: "ai-1" },
          { id: "e3", source: "ai-1", target: "twitter-1" },
          { id: "e4", source: "ai-1", target: "linkedin-1" },
          { id: "e5", source: "twitter-1", target: "log-1" },
          { id: "e6", source: "linkedin-1", target: "log-1" },
        ],
        n8nWorkflowJson: {
          name: "Social Media Posting",
          nodes: [
            { parameters: {}, name: "Manual Trigger", type: "n8n-nodes-base.manualTrigger", position: [250, 300] },
            { parameters: { model: "gpt-4o" }, name: "Generate", type: "@n8n/n8n-nodes-langchain.openAi", position: [450, 300] },
            { parameters: {}, name: "Twitter", type: "n8n-nodes-base.twitter", position: [650, 200] },
            { parameters: {}, name: "LinkedIn", type: "n8n-nodes-base.linkedIn", position: [650, 400] },
          ],
          connections: {},
        },
      },
      {
        name: "Data Backup Automation",
        description: "Scheduled backup of database records to cloud storage with encryption",
        isTemplate: true,
        templateCategory: "DevOps",
        triggerType: "schedule",
        status: "ACTIVE" as const,
        estimatedManualMinutes: 20,
        nodes: [
          { id: "trigger-1", type: "trigger", position: { x: 50, y: 200 }, data: { label: "Daily at 2 AM", type: "cron", config: { interval: "0 2 * * *" } } },
          { id: "db-1", type: "action", position: { x: 300, y: 200 }, data: { label: "Export DB Records", type: "postgresql", config: { query: "SELECT * FROM ..." } } },
          { id: "transform-1", type: "action", position: { x: 550, y: 200 }, data: { label: "Compress & Encrypt", type: "code", config: { language: "javascript" } } },
          { id: "upload-1", type: "action", position: { x: 800, y: 200 }, data: { label: "Upload to S3", type: "aws_s3", config: { bucket: "backups", prefix: "daily/" } } },
          { id: "notify-1", type: "action", position: { x: 1050, y: 200 }, data: { label: "Send Report", type: "slack", config: { channel: "#devops" } } },
        ],
        edges: [
          { id: "e1", source: "trigger-1", target: "db-1" },
          { id: "e2", source: "db-1", target: "transform-1" },
          { id: "e3", source: "transform-1", target: "upload-1" },
          { id: "e4", source: "upload-1", target: "notify-1" },
        ],
        n8nWorkflowJson: {
          name: "Data Backup Automation",
          nodes: [
            { parameters: { rule: { interval: [{ field: "hours", hoursInterval: 24 }] } }, name: "Schedule", type: "n8n-nodes-base.scheduleTrigger", position: [250, 300] },
            { parameters: { query: "SELECT * FROM records" }, name: "Postgres", type: "n8n-nodes-base.postgres", position: [450, 300] },
            { parameters: {}, name: "Code", type: "n8n-nodes-base.code", position: [650, 300] },
            { parameters: { bucketName: "backups" }, name: "S3", type: "n8n-nodes-base.s3", position: [850, 300] },
          ],
          connections: {},
        },
      },
    ];

    for (const template of workflowTemplates) {
      const existing = await prisma.workflow.findFirst({
        where: { name: template.name, isTemplate: true },
      });

      if (!existing) {
        await prisma.workflow.create({
          data: {
            name: template.name,
            description: template.description,
            isTemplate: template.isTemplate,
            templateCategory: template.templateCategory,
            triggerType: template.triggerType,
            status: template.status,
            estimatedManualMinutes: template.estimatedManualMinutes,
            nodes: template.nodes,
            edges: template.edges,
            n8nWorkflowJson: template.n8nWorkflowJson,
            createdById: admin.id,
          },
        });
      }
    }

    // ── 4. Seed mock executions (20) ────────────────────────────────────
    const workflows = await prisma.workflow.findMany({
      where: { isTemplate: true },
      take: 5,
    });

    const existingExecutions = await prisma.execution.count();

    if (existingExecutions === 0 && workflows.length > 0) {
      const statuses: Array<"SUCCESS" | "ERROR" | "RUNNING" | "PENDING" | "CANCELLED"> = [
        "SUCCESS", "SUCCESS", "SUCCESS", "SUCCESS", "SUCCESS",
        "SUCCESS", "SUCCESS", "SUCCESS", "SUCCESS", "SUCCESS",
        "ERROR", "ERROR", "ERROR",
        "RUNNING", "RUNNING",
        "PENDING", "PENDING",
        "CANCELLED", "CANCELLED", "CANCELLED",
      ];

      const executionData = statuses.map((status, i) => {
        const workflow = workflows[i % workflows.length];
        const startedAt = new Date(Date.now() - (i + 1) * 3600000);
        const durationMs = status === "RUNNING" || status === "PENDING"
          ? null
          : Math.floor(Math.random() * 30000) + 500;
        const finishedAt = durationMs
          ? new Date(startedAt.getTime() + durationMs)
          : null;

        return {
          workflowId: workflow.id,
          status,
          startedAt,
          finishedAt,
          durationMs,
          estimatedCost: durationMs ? parseFloat((Math.random() * 0.05).toFixed(4)) : null,
          errorMessage: status === "ERROR" ? [
            "Connection timeout: Salesforce API did not respond within 30s",
            "Rate limit exceeded: Slack API (429)",
            "Invalid credentials: SendGrid API key expired",
          ][i % 3] : null,
          triggeredById: admin.id,
        };
      });

      await prisma.execution.createMany({ data: executionData });
    }

    return NextResponse.json({
      success: true,
      message: "Seeded",
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { success: false, error: "Seeding failed. See server logs." },
      { status: 500 }
    );
  }
}
