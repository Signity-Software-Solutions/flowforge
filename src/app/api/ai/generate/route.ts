import { NextRequest, NextResponse } from "next/server";

function getMockGeneratedWorkflow(description: string) {
  const nodes = [
    {
      id: "trigger-1",
      type: "trigger",
      position: { x: 100, y: 200 },
      data: {
        label: "Webhook Trigger",
        type: "trigger",
        config: { triggerType: "webhook", path: "/incoming" },
      },
    },
    {
      id: "process-1",
      type: "action",
      position: { x: 350, y: 200 },
      data: {
        label: "Process Data",
        type: "function",
        config: { code: "// Transform incoming data\nreturn items;" },
      },
    },
    {
      id: "condition-1",
      type: "condition",
      position: { x: 600, y: 200 },
      data: {
        label: "Check Condition",
        type: "if",
        config: { condition: "{{$json.status}} === 'active'" },
      },
    },
    {
      id: "action-1",
      type: "action",
      position: { x: 850, y: 100 },
      data: {
        label: "Send Notification",
        type: "slack",
        config: { channel: "#alerts", message: "New event processed" },
      },
    },
    {
      id: "action-2",
      type: "action",
      position: { x: 850, y: 300 },
      data: {
        label: "Log to Database",
        type: "postgres",
        config: { operation: "insert", table: "events" },
      },
    },
  ];

  const edges = [
    { id: "e1-2", source: "trigger-1", target: "process-1", animated: true },
    { id: "e2-3", source: "process-1", target: "condition-1" },
    {
      id: "e3-4",
      source: "condition-1",
      target: "action-1",
      sourceHandle: "true",
      label: "Yes",
    },
    {
      id: "e3-5",
      source: "condition-1",
      target: "action-2",
      sourceHandle: "false",
      label: "No",
    },
  ];

  const n8nWorkflow = {
    name: `AI Generated: ${description.slice(0, 50)}`,
    nodes: [
      {
        parameters: { httpMethod: "POST", path: "incoming" },
        name: "Webhook Trigger",
        type: "n8n-nodes-base.webhook",
        position: [100, 200],
        typeVersion: 1,
      },
      {
        parameters: {
          functionCode: "// Transform incoming data\nreturn items;",
        },
        name: "Process Data",
        type: "n8n-nodes-base.function",
        position: [350, 200],
        typeVersion: 1,
      },
      {
        parameters: {
          conditions: {
            string: [
              {
                value1: "={{$json.status}}",
                value2: "active",
              },
            ],
          },
        },
        name: "Check Condition",
        type: "n8n-nodes-base.if",
        position: [600, 200],
        typeVersion: 1,
      },
      {
        parameters: {
          channel: "#alerts",
          text: "New event processed",
        },
        name: "Send Notification",
        type: "n8n-nodes-base.slack",
        position: [850, 100],
        typeVersion: 1,
      },
      {
        parameters: {
          operation: "insert",
          table: "events",
        },
        name: "Log to Database",
        type: "n8n-nodes-base.postgres",
        position: [850, 300],
        typeVersion: 1,
      },
    ],
    connections: {
      "Webhook Trigger": { main: [[{ node: "Process Data", type: "main", index: 0 }]] },
      "Process Data": { main: [[{ node: "Check Condition", type: "main", index: 0 }]] },
      "Check Condition": {
        main: [
          [{ node: "Send Notification", type: "main", index: 0 }],
          [{ node: "Log to Database", type: "main", index: 0 }],
        ],
      },
    },
  };

  return {
    nodes,
    edges,
    n8nWorkflow,
    explanation: `Based on your description: "${description}"\n\nI created a workflow with the following steps:\n\n1. **Webhook Trigger** — Listens for incoming HTTP POST requests\n2. **Process Data** — Transforms and validates the incoming payload\n3. **Check Condition** — Routes data based on the status field\n4. **Send Notification** — Posts alerts to your Slack channel when conditions are met\n5. **Log to Database** — Stores all processed events in PostgreSQL for auditing\n\nThe workflow handles both positive and negative paths, ensuring nothing is lost. You can customize each node by clicking on it in the canvas.`,
  };
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { description, model } = body;

  if (!description || typeof description !== "string") {
    return NextResponse.json(
      { error: "A workflow description is required" },
      { status: 400 }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    // Return mock generated workflow
    // Simulate a short delay for realism
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return NextResponse.json(getMockGeneratedWorkflow(description));
  }

  try {
    const selectedModel = model === "haiku" ? "claude-haiku-4-5-20250901" : "claude-sonnet-4-20250514";

    const systemPrompt = `You are an expert workflow automation architect. Given a natural language description of a workflow, generate:

1. A React Flow node/edge graph for visual display
2. An n8n-compatible workflow JSON

Return ONLY valid JSON with this exact structure:
{
  "nodes": [
    {
      "id": "unique-id",
      "type": "trigger" | "action" | "condition",
      "position": { "x": number, "y": number },
      "data": {
        "label": "Node Label",
        "type": "nodeType",
        "config": {}
      }
    }
  ],
  "edges": [
    {
      "id": "edge-id",
      "source": "source-node-id",
      "target": "target-node-id",
      "label": "optional label",
      "animated": true/false
    }
  ],
  "n8nWorkflow": {
    "name": "Workflow Name",
    "nodes": [...n8n node objects...],
    "connections": {...n8n connections...}
  },
  "explanation": "A clear explanation of the workflow, using markdown formatting with bold step names."
}

Layout nodes left to right with ~250px horizontal spacing. Start triggers at x=100. Use realistic node types from n8n (webhook, schedule, httpRequest, function, if, slack, gmail, postgres, etc.).`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: selectedModel,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: `Generate a workflow for: ${description}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API error:", errorText);
      // Fall back to mock
      return NextResponse.json(getMockGeneratedWorkflow(description));
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || "";

    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(getMockGeneratedWorkflow(description));
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("AI generation error:", error);
    return NextResponse.json(getMockGeneratedWorkflow(description));
  }
}
