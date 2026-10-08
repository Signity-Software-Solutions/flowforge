import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SEED_INTEGRATIONS = [
  // CRM
  { name: "HubSpot", slug: "hubspot", description: "CRM, marketing, and sales automation platform", category: "CRM", icon: "🟠", authType: "oauth" },
  { name: "Salesforce", slug: "salesforce", description: "Enterprise CRM and cloud computing platform", category: "CRM", icon: "☁️", authType: "oauth" },
  { name: "Pipedrive", slug: "pipedrive", description: "Sales CRM and pipeline management tool", category: "CRM", icon: "🟢", authType: "api_key" },
  { name: "Zoho CRM", slug: "zoho-crm", description: "Cloud-based CRM for businesses of all sizes", category: "CRM", icon: "🔴", authType: "oauth" },
  // Email
  { name: "Gmail", slug: "gmail", description: "Google email service with API access", category: "Email", icon: "📧", authType: "oauth" },
  { name: "Outlook", slug: "outlook", description: "Microsoft email and calendar service", category: "Email", icon: "📬", authType: "oauth" },
  { name: "SendGrid", slug: "sendgrid", description: "Transactional and marketing email API", category: "Email", icon: "📨", authType: "api_key" },
  { name: "Mailchimp", slug: "mailchimp", description: "Email marketing and automation platform", category: "Email", icon: "🐵", authType: "api_key" },
  // Communication
  { name: "Slack", slug: "slack", description: "Team messaging and collaboration platform", category: "Communication", icon: "💬", authType: "oauth" },
  { name: "Discord", slug: "discord", description: "Community chat platform with bot support", category: "Communication", icon: "🎮", authType: "api_key" },
  { name: "Microsoft Teams", slug: "microsoft-teams", description: "Microsoft collaboration and video platform", category: "Communication", icon: "🟦", authType: "oauth" },
  { name: "Telegram", slug: "telegram", description: "Cloud-based instant messaging with bot API", category: "Communication", icon: "✈️", authType: "api_key" },
  // E-commerce
  { name: "Shopify", slug: "shopify", description: "E-commerce platform for online stores", category: "E-commerce", icon: "🛍️", authType: "oauth" },
  { name: "WooCommerce", slug: "woocommerce", description: "Open-source WordPress e-commerce plugin", category: "E-commerce", icon: "🛒", authType: "api_key" },
  { name: "Stripe (Payments)", slug: "stripe-ecommerce", description: "Payment processing for e-commerce", category: "E-commerce", icon: "💳", authType: "api_key" },
  { name: "BigCommerce", slug: "bigcommerce", description: "SaaS e-commerce platform for enterprises", category: "E-commerce", icon: "🏪", authType: "oauth" },
  // Payment
  { name: "Stripe", slug: "stripe", description: "Online payment processing for internet businesses", category: "Payment", icon: "💳", authType: "api_key" },
  { name: "PayPal", slug: "paypal", description: "Digital payments platform and wallet", category: "Payment", icon: "🅿️", authType: "oauth" },
  { name: "Square", slug: "square", description: "Payment processing and POS system", category: "Payment", icon: "⬛", authType: "oauth" },
  { name: "Braintree", slug: "braintree", description: "Full-stack payment platform by PayPal", category: "Payment", icon: "🌳", authType: "api_key" },
  // AI/ML
  { name: "Claude (Anthropic)", slug: "claude-anthropic", description: "Advanced AI assistant and language model", category: "AI/ML", icon: "🤖", authType: "api_key" },
  { name: "OpenAI", slug: "openai", description: "GPT language models and DALL-E image generation", category: "AI/ML", icon: "🧠", authType: "api_key" },
  { name: "HuggingFace", slug: "huggingface", description: "Open-source ML models and datasets", category: "AI/ML", icon: "🤗", authType: "api_key" },
  { name: "Replicate", slug: "replicate", description: "Run ML models in the cloud via API", category: "AI/ML", icon: "🔁", authType: "api_key" },
  // Database
  { name: "PostgreSQL", slug: "postgresql", description: "Advanced open-source relational database", category: "Database", icon: "🐘", authType: "connection_string" },
  { name: "MySQL", slug: "mysql", description: "Popular open-source relational database", category: "Database", icon: "🐬", authType: "connection_string" },
  { name: "MongoDB", slug: "mongodb", description: "NoSQL document database for modern apps", category: "Database", icon: "🍃", authType: "connection_string" },
  { name: "Airtable", slug: "airtable", description: "Spreadsheet-database hybrid for teams", category: "Database", icon: "📊", authType: "api_key" },
  // Cloud Storage
  { name: "Google Drive", slug: "google-drive", description: "Cloud file storage and synchronization", category: "Cloud Storage", icon: "📁", authType: "oauth" },
  { name: "Dropbox", slug: "dropbox", description: "Cloud storage and file sharing service", category: "Cloud Storage", icon: "📦", authType: "oauth" },
  { name: "AWS S3", slug: "aws-s3", description: "Scalable object storage in the cloud", category: "Cloud Storage", icon: "☁️", authType: "api_key" },
  { name: "OneDrive", slug: "onedrive", description: "Microsoft cloud storage service", category: "Cloud Storage", icon: "🔵", authType: "oauth" },
];

async function getOrSeedIntegrations() {
  try {
    let integrations = await prisma.integration.findMany({
      orderBy: { name: "asc" },
    });

    if (integrations.length === 0) {
      // Seed them
      await prisma.integration.createMany({
        data: SEED_INTEGRATIONS.map((i) => ({
          ...i,
          isConnected: false,
          config: {},
        })),
        skipDuplicates: true,
      });
      integrations = await prisma.integration.findMany({
        orderBy: { name: "asc" },
      });
    }

    return integrations;
  } catch {
    // DB not available — return mock list
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return SEED_INTEGRATIONS.map((i: any, idx: number) => ({
      id: `int-${String(idx + 1).padStart(3, "0")}`,
      ...i,
      isConnected: ["slack", "claude-anthropic", "postgresql"].includes(i.slug),
      config: {},
      createdAt: new Date().toISOString(),
    }));
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  let integrations = await getOrSeedIntegrations();

  if (category && category !== "All") {
    integrations = integrations.filter((i) => i.category === category);
  }

  return NextResponse.json({ integrations });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { id, isConnected } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing integration id" }, { status: 400 });
  }

  try {
    const updated = await prisma.integration.update({
      where: { id },
      data: { isConnected },
    });

    return NextResponse.json({ integration: updated });
  } catch {
    // Mock response
    return NextResponse.json({
      integration: { id, isConnected, message: "Updated (mock)" },
    });
  }
}
