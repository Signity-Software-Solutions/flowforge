const N8N_BASE_URL = process.env.N8N_BASE_URL || "http://localhost:5678";
const N8N_API_KEY = process.env.N8N_API_KEY || "";

const USE_MOCK = process.env.N8N_MOCK !== "false";

interface N8nWorkflow {
  id?: string;
  name: string;
  nodes: N8nNode[];
  connections: Record<string, { main: Array<Array<{ node: string; type: string; index: number }>> }>;
  settings?: Record<string, unknown>;
  active?: boolean;
}

interface N8nNode {
  parameters: Record<string, unknown>;
  name: string;
  type: string;
  position: [number, number];
  typeVersion?: number;
}

interface N8nExecution {
  id: string;
  workflowId: string;
  status: "running" | "success" | "error" | "waiting";
  startedAt: string;
  finishedAt?: string;
  data?: Record<string, unknown>;
}

async function n8nFetch(path: string, options: RequestInit = {}): Promise<Response> {
  return fetch(`${N8N_BASE_URL}/api/v1${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-N8N-API-KEY": N8N_API_KEY,
      ...options.headers,
    },
  });
}

// --- Mock data for development without n8n running ---

const mockWorkflows: Record<string, N8nWorkflow & { id: string }> = {};
let mockExecCounter = 0;
const mockExecutions: Record<string, N8nExecution> = {};

function generateMockId(): string {
  return Math.random().toString(36).slice(2, 10);
}

// --- API Methods ---

export async function createWorkflow(workflow: N8nWorkflow): Promise<{ id: string }> {
  if (USE_MOCK) {
    const id = generateMockId();
    mockWorkflows[id] = { ...workflow, id, active: false };
    return { id };
  }
  const res = await n8nFetch("/workflows", {
    method: "POST",
    body: JSON.stringify(workflow),
  });
  return res.json();
}

export async function getWorkflow(id: string): Promise<N8nWorkflow | null> {
  if (USE_MOCK) {
    return mockWorkflows[id] || null;
  }
  const res = await n8nFetch(`/workflows/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export async function updateWorkflow(id: string, data: Partial<N8nWorkflow>): Promise<N8nWorkflow> {
  if (USE_MOCK) {
    if (mockWorkflows[id]) {
      Object.assign(mockWorkflows[id], data);
    }
    return mockWorkflows[id];
  }
  const res = await n8nFetch(`/workflows/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteWorkflow(id: string): Promise<void> {
  if (USE_MOCK) {
    delete mockWorkflows[id];
    return;
  }
  await n8nFetch(`/workflows/${id}`, { method: "DELETE" });
}

export async function activateWorkflow(id: string, active: boolean): Promise<void> {
  if (USE_MOCK) {
    if (mockWorkflows[id]) mockWorkflows[id].active = active;
    return;
  }
  await n8nFetch(`/workflows/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ active }),
  });
}

export async function executeWorkflow(id: string, data?: Record<string, unknown>): Promise<{ executionId: string }> {
  if (USE_MOCK) {
    const execId = `exec_${++mockExecCounter}`;
    mockExecutions[execId] = {
      id: execId,
      workflowId: id,
      status: "running",
      startedAt: new Date().toISOString(),
    };
    setTimeout(() => {
      if (mockExecutions[execId]) {
        mockExecutions[execId].status = Math.random() > 0.15 ? "success" : "error";
        mockExecutions[execId].finishedAt = new Date().toISOString();
      }
    }, 2000 + Math.random() * 3000);
    return { executionId: execId };
  }
  const res = await n8nFetch(`/workflows/${id}/run`, {
    method: "POST",
    body: JSON.stringify({ data }),
  });
  return res.json();
}

export async function getExecution(executionId: string): Promise<N8nExecution | null> {
  if (USE_MOCK) {
    return mockExecutions[executionId] || null;
  }
  const res = await n8nFetch(`/executions/${executionId}`);
  if (!res.ok) return null;
  return res.json();
}

export async function listExecutions(workflowId?: string): Promise<N8nExecution[]> {
  if (USE_MOCK) {
    return Object.values(mockExecutions)
      .filter((e) => !workflowId || e.workflowId === workflowId)
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  }
  const params = workflowId ? `?workflowId=${workflowId}` : "";
  const res = await n8nFetch(`/executions${params}`);
  const data = await res.json();
  return data.data || [];
}

export type { N8nWorkflow, N8nNode, N8nExecution };
