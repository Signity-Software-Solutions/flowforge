export interface ConfigField {
  name: string;
  type: "text" | "textarea" | "select" | "number" | "boolean" | "json" | "cron";
  label: string;
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
  defaultValue?: string | number | boolean;
}

export interface NodeTypeDefinition {
  type: string;
  label: string;
  category: "triggers" | "actions" | "logic" | "ai" | "utilities";
  icon: string;
  color: string;
  description: string;
  configFields: ConfigField[];
  inputs?: number;
  outputs?: number;
}

export const CATEGORY_COLORS: Record<string, string> = {
  triggers: "#3b82f6",
  actions: "#22c55e",
  logic: "#f59e0b",
  ai: "#a855f7",
  utilities: "#6b7280",
};

export const CATEGORY_LABELS: Record<string, string> = {
  triggers: "Triggers",
  actions: "Actions",
  logic: "Logic",
  ai: "AI",
  utilities: "Utilities",
};

export const NODE_TYPES: Record<string, NodeTypeDefinition> = {
  // ── Triggers ──────────────────────────────────────────────
  webhook: {
    type: "webhook",
    label: "Webhook",
    category: "triggers",
    icon: "Globe",
    color: "#3b82f6",
    description: "Trigger workflow via HTTP webhook",
    inputs: 0,
    outputs: 1,
    configFields: [
      { name: "url", type: "text", label: "Webhook URL", required: true, placeholder: "https://..." },
      {
        name: "method",
        type: "select",
        label: "HTTP Method",
        required: true,
        options: [
          { label: "GET", value: "GET" },
          { label: "POST", value: "POST" },
          { label: "PUT", value: "PUT" },
        ],
        defaultValue: "POST",
      },
      { name: "headers", type: "json", label: "Headers", placeholder: '{"Content-Type":"application/json"}' },
    ],
  },
  schedule: {
    type: "schedule",
    label: "Schedule",
    category: "triggers",
    icon: "Clock",
    color: "#3b82f6",
    description: "Trigger on a cron schedule",
    inputs: 0,
    outputs: 1,
    configFields: [
      { name: "cron", type: "cron", label: "Cron Expression", required: true, placeholder: "0 9 * * 1-5" },
      {
        name: "timezone",
        type: "select",
        label: "Timezone",
        options: [
          { label: "UTC", value: "UTC" },
          { label: "US/Eastern", value: "US/Eastern" },
          { label: "US/Pacific", value: "US/Pacific" },
          { label: "Europe/London", value: "Europe/London" },
          { label: "Asia/Kolkata", value: "Asia/Kolkata" },
        ],
        defaultValue: "UTC",
      },
    ],
  },
  emailTrigger: {
    type: "emailTrigger",
    label: "Email Trigger",
    category: "triggers",
    icon: "Mail",
    color: "#3b82f6",
    description: "Trigger when an email is received",
    inputs: 0,
    outputs: 1,
    configFields: [
      { name: "mailbox", type: "text", label: "Mailbox", required: true, placeholder: "inbox" },
      { name: "filter", type: "text", label: "Subject Filter", placeholder: "Contains..." },
    ],
  },
  formSubmit: {
    type: "formSubmit",
    label: "Form Submit",
    category: "triggers",
    icon: "FileText",
    color: "#3b82f6",
    description: "Trigger when a form is submitted",
    inputs: 0,
    outputs: 1,
    configFields: [
      { name: "formId", type: "text", label: "Form ID", required: true, placeholder: "form_abc123" },
    ],
  },
  appEvent: {
    type: "appEvent",
    label: "App Event",
    category: "triggers",
    icon: "Zap",
    color: "#3b82f6",
    description: "Trigger on an application event",
    inputs: 0,
    outputs: 1,
    configFields: [
      { name: "eventName", type: "text", label: "Event Name", required: true, placeholder: "user.created" },
      { name: "source", type: "text", label: "Source App", placeholder: "my-app" },
    ],
  },

  // ── Actions ───────────────────────────────────────────────
  sendEmail: {
    type: "sendEmail",
    label: "Send Email",
    category: "actions",
    icon: "Send",
    color: "#22c55e",
    description: "Send an email message",
    inputs: 1,
    outputs: 1,
    configFields: [
      { name: "to", type: "text", label: "To", required: true, placeholder: "user@example.com" },
      { name: "subject", type: "text", label: "Subject", required: true, placeholder: "Email subject" },
      { name: "body", type: "textarea", label: "Body", required: true, placeholder: "Email body..." },
    ],
  },
  httpRequest: {
    type: "httpRequest",
    label: "HTTP Request",
    category: "actions",
    icon: "Globe",
    color: "#22c55e",
    description: "Make an HTTP request",
    inputs: 1,
    outputs: 1,
    configFields: [
      { name: "url", type: "text", label: "URL", required: true, placeholder: "https://api.example.com/data" },
      {
        name: "method",
        type: "select",
        label: "Method",
        required: true,
        options: [
          { label: "GET", value: "GET" },
          { label: "POST", value: "POST" },
          { label: "PUT", value: "PUT" },
          { label: "PATCH", value: "PATCH" },
          { label: "DELETE", value: "DELETE" },
        ],
        defaultValue: "GET",
      },
      { name: "headers", type: "json", label: "Headers", placeholder: '{"Authorization":"Bearer ..."}' },
      { name: "body", type: "json", label: "Request Body", placeholder: '{"key":"value"}' },
    ],
  },
  sendSlack: {
    type: "sendSlack",
    label: "Send Slack Message",
    category: "actions",
    icon: "MessageSquare",
    color: "#22c55e",
    description: "Send a message to Slack",
    inputs: 1,
    outputs: 1,
    configFields: [
      { name: "channel", type: "text", label: "Channel", required: true, placeholder: "#general" },
      { name: "message", type: "textarea", label: "Message", required: true, placeholder: "Hello from FlowForge!" },
    ],
  },
  createRecord: {
    type: "createRecord",
    label: "Create Record",
    category: "actions",
    icon: "Plus",
    color: "#22c55e",
    description: "Create a new database record",
    inputs: 1,
    outputs: 1,
    configFields: [
      { name: "table", type: "text", label: "Table/Collection", required: true, placeholder: "users" },
      { name: "data", type: "json", label: "Record Data", required: true, placeholder: '{"name":"...","email":"..."}' },
    ],
  },
  updateRecord: {
    type: "updateRecord",
    label: "Update Record",
    category: "actions",
    icon: "Pencil",
    color: "#22c55e",
    description: "Update an existing record",
    inputs: 1,
    outputs: 1,
    configFields: [
      { name: "table", type: "text", label: "Table/Collection", required: true, placeholder: "users" },
      { name: "recordId", type: "text", label: "Record ID", required: true, placeholder: "{{id}}" },
      { name: "data", type: "json", label: "Update Data", required: true, placeholder: '{"status":"active"}' },
    ],
  },
  runCode: {
    type: "runCode",
    label: "Run Code",
    category: "actions",
    icon: "Code",
    color: "#22c55e",
    description: "Execute custom JavaScript code",
    inputs: 1,
    outputs: 1,
    configFields: [
      { name: "code", type: "textarea", label: "JavaScript Code", required: true, placeholder: "// Your code here\nreturn data;" },
    ],
  },

  // ── Logic ─────────────────────────────────────────────────
  ifElse: {
    type: "ifElse",
    label: "IF/Else",
    category: "logic",
    icon: "GitBranch",
    color: "#f59e0b",
    description: "Branch based on a condition",
    inputs: 1,
    outputs: 2,
    configFields: [
      { name: "field", type: "text", label: "Field", required: true, placeholder: "data.status" },
      {
        name: "operator",
        type: "select",
        label: "Operator",
        required: true,
        options: [
          { label: "Equals", value: "eq" },
          { label: "Not Equals", value: "neq" },
          { label: "Greater Than", value: "gt" },
          { label: "Less Than", value: "lt" },
          { label: "Contains", value: "contains" },
          { label: "Is Empty", value: "empty" },
        ],
        defaultValue: "eq",
      },
      { name: "value", type: "text", label: "Value", placeholder: "expected value" },
    ],
  },
  switch: {
    type: "switch",
    label: "Switch",
    category: "logic",
    icon: "GitFork",
    color: "#f59e0b",
    description: "Route to multiple outputs based on value",
    inputs: 1,
    outputs: 3,
    configFields: [
      { name: "field", type: "text", label: "Switch Field", required: true, placeholder: "data.type" },
      { name: "cases", type: "json", label: "Cases", required: true, placeholder: '["case1","case2","default"]' },
    ],
  },
  merge: {
    type: "merge",
    label: "Merge",
    category: "logic",
    icon: "Merge",
    color: "#f59e0b",
    description: "Merge multiple inputs into one",
    inputs: 2,
    outputs: 1,
    configFields: [
      {
        name: "mode",
        type: "select",
        label: "Merge Mode",
        options: [
          { label: "Wait for All", value: "waitAll" },
          { label: "First Available", value: "first" },
        ],
        defaultValue: "waitAll",
      },
    ],
  },
  loop: {
    type: "loop",
    label: "Loop",
    category: "logic",
    icon: "Repeat",
    color: "#f59e0b",
    description: "Iterate over items",
    inputs: 1,
    outputs: 1,
    configFields: [
      { name: "items", type: "text", label: "Items Field", required: true, placeholder: "data.items" },
      { name: "batchSize", type: "number", label: "Batch Size", placeholder: "10", defaultValue: 1 },
    ],
  },
  waitDelay: {
    type: "waitDelay",
    label: "Wait/Delay",
    category: "logic",
    icon: "Timer",
    color: "#f59e0b",
    description: "Wait for a specified duration",
    inputs: 1,
    outputs: 1,
    configFields: [
      { name: "duration", type: "number", label: "Duration (seconds)", required: true, placeholder: "30" },
    ],
  },

  // ── AI ────────────────────────────────────────────────────
  callClaude: {
    type: "callClaude",
    label: "Call Claude",
    category: "ai",
    icon: "Brain",
    color: "#a855f7",
    description: "Send a prompt to Claude AI",
    inputs: 1,
    outputs: 1,
    configFields: [
      { name: "prompt", type: "textarea", label: "Prompt", required: true, placeholder: "Analyze the following data..." },
      {
        name: "model",
        type: "select",
        label: "Model",
        options: [
          { label: "Claude Sonnet 4", value: "claude-sonnet-4-20250514" },
          { label: "Claude Haiku 3.5", value: "claude-3-5-haiku-20241022" },
          { label: "Claude Opus 4", value: "claude-opus-4-20250514" },
        ],
        defaultValue: "claude-sonnet-4-20250514",
      },
      { name: "maxTokens", type: "number", label: "Max Tokens", placeholder: "1024", defaultValue: 1024 },
    ],
  },
  summarize: {
    type: "summarize",
    label: "Summarize",
    category: "ai",
    icon: "FileText",
    color: "#a855f7",
    description: "Summarize text content using AI",
    inputs: 1,
    outputs: 1,
    configFields: [
      { name: "inputField", type: "text", label: "Input Field", required: true, placeholder: "data.text" },
      {
        name: "length",
        type: "select",
        label: "Summary Length",
        options: [
          { label: "Brief (1-2 sentences)", value: "brief" },
          { label: "Short (paragraph)", value: "short" },
          { label: "Detailed", value: "detailed" },
        ],
        defaultValue: "short",
      },
    ],
  },
  extractData: {
    type: "extractData",
    label: "Extract Data",
    category: "ai",
    icon: "Search",
    color: "#a855f7",
    description: "Extract structured data from text",
    inputs: 1,
    outputs: 1,
    configFields: [
      { name: "inputField", type: "text", label: "Input Field", required: true, placeholder: "data.text" },
      { name: "schema", type: "json", label: "Output Schema", required: true, placeholder: '{"name":"string","email":"string"}' },
    ],
  },
  classify: {
    type: "classify",
    label: "Classify",
    category: "ai",
    icon: "Tags",
    color: "#a855f7",
    description: "Classify text into categories",
    inputs: 1,
    outputs: 1,
    configFields: [
      { name: "inputField", type: "text", label: "Input Field", required: true, placeholder: "data.text" },
      { name: "categories", type: "json", label: "Categories", required: true, placeholder: '["positive","negative","neutral"]' },
    ],
  },
  generateContent: {
    type: "generateContent",
    label: "Generate Content",
    category: "ai",
    icon: "Sparkles",
    color: "#a855f7",
    description: "Generate text content using AI",
    inputs: 1,
    outputs: 1,
    configFields: [
      { name: "prompt", type: "textarea", label: "Generation Prompt", required: true, placeholder: "Write a..." },
      {
        name: "tone",
        type: "select",
        label: "Tone",
        options: [
          { label: "Professional", value: "professional" },
          { label: "Casual", value: "casual" },
          { label: "Formal", value: "formal" },
          { label: "Creative", value: "creative" },
        ],
        defaultValue: "professional",
      },
    ],
  },

  // ── Utilities ─────────────────────────────────────────────
  setVariable: {
    type: "setVariable",
    label: "Set Variable",
    category: "utilities",
    icon: "Variable",
    color: "#6b7280",
    description: "Set a workflow variable",
    inputs: 1,
    outputs: 1,
    configFields: [
      { name: "variableName", type: "text", label: "Variable Name", required: true, placeholder: "myVar" },
      { name: "value", type: "text", label: "Value", required: true, placeholder: "{{data.field}}" },
    ],
  },
  formatDate: {
    type: "formatDate",
    label: "Format Date",
    category: "utilities",
    icon: "Calendar",
    color: "#6b7280",
    description: "Format a date value",
    inputs: 1,
    outputs: 1,
    configFields: [
      { name: "inputField", type: "text", label: "Date Field", required: true, placeholder: "data.createdAt" },
      { name: "format", type: "text", label: "Output Format", required: true, placeholder: "yyyy-MM-dd HH:mm" },
    ],
  },
  parseJson: {
    type: "parseJson",
    label: "Parse JSON",
    category: "utilities",
    icon: "Braces",
    color: "#6b7280",
    description: "Parse a JSON string into an object",
    inputs: 1,
    outputs: 1,
    configFields: [
      { name: "inputField", type: "text", label: "Input Field", required: true, placeholder: "data.jsonString" },
    ],
  },
  filter: {
    type: "filter",
    label: "Filter",
    category: "utilities",
    icon: "Filter",
    color: "#6b7280",
    description: "Filter items based on a condition",
    inputs: 1,
    outputs: 1,
    configFields: [
      { name: "field", type: "text", label: "Field", required: true, placeholder: "item.status" },
      {
        name: "operator",
        type: "select",
        label: "Operator",
        options: [
          { label: "Equals", value: "eq" },
          { label: "Not Equals", value: "neq" },
          { label: "Contains", value: "contains" },
          { label: "Greater Than", value: "gt" },
          { label: "Less Than", value: "lt" },
        ],
        defaultValue: "eq",
      },
      { name: "value", type: "text", label: "Value", required: true, placeholder: "active" },
    ],
  },
  aggregate: {
    type: "aggregate",
    label: "Aggregate",
    category: "utilities",
    icon: "BarChart3",
    color: "#6b7280",
    description: "Aggregate data (sum, count, average)",
    inputs: 1,
    outputs: 1,
    configFields: [
      { name: "field", type: "text", label: "Field", required: true, placeholder: "item.amount" },
      {
        name: "operation",
        type: "select",
        label: "Operation",
        required: true,
        options: [
          { label: "Sum", value: "sum" },
          { label: "Count", value: "count" },
          { label: "Average", value: "avg" },
          { label: "Min", value: "min" },
          { label: "Max", value: "max" },
        ],
        defaultValue: "sum",
      },
    ],
  },
};

export function getNodeType(type: string): NodeTypeDefinition | undefined {
  return NODE_TYPES[type];
}

export function getNodesByCategory(category: string): NodeTypeDefinition[] {
  return Object.values(NODE_TYPES).filter((n) => n.category === category);
}

export function getNodeColor(type: string): string {
  const nodeDef = NODE_TYPES[type];
  return nodeDef?.color ?? "#6b7280";
}

export function getNodeIcon(type: string): string {
  const nodeDef = NODE_TYPES[type];
  return nodeDef?.icon ?? "Circle";
}

export function getAllCategories(): string[] {
  return ["triggers", "actions", "logic", "ai", "utilities"];
}
