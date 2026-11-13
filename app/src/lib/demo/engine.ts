import type { DemoExecution, DemoWorkflow, Payload, DemoStep } from "./types";

export function resolveMapping(value: unknown, context: Payload): unknown {
  if (typeof value !== "string") return value;
  const get = (path: string): unknown => path.split(".").reduce<unknown>((obj, key) => {
    if (["__proto__", "constructor", "prototype"].includes(key)) return undefined;
    return obj && typeof obj === "object" ? (obj as Payload)[key] : undefined;
  }, context);
  const exact = value.match(/^\{\{([\w.]+)\}\}$/);
  if (exact) {
    const result = get(exact[1]);
    if (result === undefined) throw new Error(`Missing mapped field: ${exact[1]}`);
    return result;
  }
  return value.replace(/\{\{([\w.]+)\}\}/g, (_, path: string) => {
    const result = get(path);
    if (result === undefined) throw new Error(`Missing mapped field: ${path}`);
    return String(result);
  });
}

function transform(operation: string, fields: Payload, input: Payload): Payload {
  const number = (key: string) => {
    if (input[key] === "" || input[key] === null || input[key] === undefined || !Number.isFinite(Number(input[key])) || Number(input[key]) < 0) throw new Error(`${key} must be a non-negative number.`);
    return Number(input[key]);
  };
  switch (operation) {
    case "trigger": return { ...input };
    case "score": {
      const leadScore = Math.min(98, 30 + (number("budget") >= 5000 ? 40 : 5) + (number("teamSize") >= 10 ? 22 : 5));
      return { leadScore, assessment: leadScore >= 70 ? "Qualified: budget and team size fit the service." : "Nurture: share starter resources before a sales handoff.", scoringMethod: "Deterministic sample scoring; no AI request" };
    }
    case "condition": {
      const actual = Number(input[String(fields.field)]);
      if (!Number.isFinite(actual) || !Number.isFinite(Number(fields.threshold))) throw new Error("A numeric field and threshold are required for this branch.");
      return { branch: actual >= Number(fields.threshold) ? "true" : "false", decision: `${fields.field}: ${actual} / threshold: ${fields.threshold}` };
    }
    case "invoice": {
      const total = number("total");
      if (Math.abs(number("subtotal") + number("tax") - total) > 0.01) throw new Error("Invoice totals do not match. Human review required before creating a bill.");
      return { validatedTotal: total, validation: "Subtotal + tax matches total", extractionMode: "Mapped sample invoice fields", requiresApproval: true };
    }
    case "report": {
      const spend = number("spend"), leads = number("leads"), revenue = number("revenue");
      return { costPerLead: leads ? Number((spend / leads).toFixed(2)) : 0, roas: spend ? Number((revenue / spend).toFixed(2)) : 0, reportStatus: "Calculated from sample inputs" };
    }
    case "classify": {
      const urgent = /damaged|refund|urgent|broken|replacement/i.test(`${input.subject} ${input.body}`);
      return { priority: urgent ? "high" : "normal", intent: urgent ? "Order issue" : "Product question", draftReply: urgent ? `Hi ${input.name}, I am sorry your order ${input.orderId} arrived damaged. Our customer care team will review the issue and help arrange the next steps.` : `Hi ${input.name}, thanks for your question about order ${input.orderId}. Our team will check the product care instructions and get back to you.`, reviewRequired: true };
    }
    case "map": return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, resolveMapping(value, input)]));
    default: throw new Error("This node needs a sample operation before it can run in the demo.");
  }
}

// Pure graph execution: follows edges and conditional handles, never calls a provider.
export function simulateWorkflow(workflow: DemoWorkflow, input: Payload, options: { fail?: boolean; disconnected?: string[]; id?: string; startedAt?: string; retryOf?: string } = {}): DemoExecution {
  const steps: DemoStep[] = [];
  const incoming = new Set(workflow.edges.map(e => e.target));
  const roots = workflow.nodes.filter(n => !incoming.has(n.id));
  const queue = roots.length === 1 ? [roots[0].id] : [];
  const visited = new Set<string>();
  let context = { ...input };
  let failed = roots.length !== 1 || roots[0]?.data.config.operation !== "trigger";
  if (failed) steps.push({ nodeId: "graph", nodeName: "Validate workflow", provider: "flowforge", status: "ERROR", inputData: input, outputData: {}, durationMs: 0, errorMessage: "Connect the graph to exactly one sample trigger before running." });
  while (queue.length && !failed) {
    const id = queue.shift()!;
    const node = workflow.nodes.find(n => n.id === id);
    if (!node || visited.has(id)) {
      steps.push({ nodeId: id, nodeName: "Validate connections", provider: "flowforge", status: "ERROR", inputData: {}, outputData: {}, durationMs: 0, errorMessage: "This demo supports connected, acyclic paths. Remove loops or duplicate paths." });
      failed = true;
      break;
    }
    visited.add(id);
    const { provider, operation, fields } = node.data.config;
    const step: DemoStep = { nodeId: id, nodeName: node.data.label, provider: String(provider ?? "flowforge"), status: "SUCCESS", inputData: { ...context }, outputData: {}, durationMs: 480 + steps.length * 80 };
    try {
      if (options.disconnected?.includes(String(provider))) throw new Error(`Virtual ${provider} connection is paused. Reconnect it in Connections, then retry.`);
      if (options.fail && id === workflow.failureNodeId) throw new Error("Simulated provider rate limit (429). Retry runs the same sample again with the temporary failure cleared.");
      step.outputData = transform(String(operation), (fields ?? {}) as Payload, context);
      context = { ...context, ...step.outputData };
      const next = workflow.edges.filter(e => e.source === id && (operation !== "condition" || e.sourceHandle === step.outputData.branch));
      queue.push(...next.map(e => e.target));
    } catch (error) {
      step.status = "ERROR";
      step.errorMessage = error instanceof Error ? error.message : "Sample operation failed.";
      failed = true;
    }
    steps.push(step);
  }
  // Both unselected branches and steps after a failure remain visibly skipped.
  for (const node of workflow.nodes.filter(n => !visited.has(n.id))) {
    steps.push({ nodeId: node.id, nodeName: node.data.label, provider: String(node.data.config.provider ?? "flowforge"), status: "CANCELLED", inputData: {}, outputData: {}, durationMs: 0 });
  }
  return { id: options.id ?? `demo-${Date.now()}`, workflowId: workflow.id, workflowName: workflow.name, status: failed ? "ERROR" : "SUCCESS", startedAt: options.startedAt ?? new Date().toISOString(), durationMs: steps.reduce((sum, step) => sum + step.durationMs, 0), steps, input, minutesSaved: failed ? 0 : workflow.manualMinutes, retryOf: options.retryOf };
}

export function executionStats(executions: DemoExecution[]) {
  const successful = executions.filter(e => e.status === "SUCCESS");
  return { runs: executions.length, successRate: executions.length ? Math.round(successful.length / executions.length * 100) : 0, hoursSaved: Number((successful.reduce((sum, e) => sum + e.minutesSaved, 0) / 60).toFixed(1)) };
}
