import type { WorkflowNode, WorkflowEdge } from "../../stores/workflow-store";

export type Payload = Record<string, unknown>;
export type RunStatus = "SUCCESS" | "ERROR";
export type StepStatus = RunStatus | "CANCELLED";
export interface DemoWorkflow {
  id: string;
  name: string;
  category: "Agencies" | "Ecommerce" | "Service businesses";
  description: string;
  problem: string;
  outcome: string;
  manualMinutes: number;
  providers: string[];
  input: Payload;
  alternateInput?: Payload;
  alternateLabel?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  failureNodeId: string;
  status: "ACTIVE" | "DRAFT";
}
export interface DemoStep {
  nodeId: string;
  nodeName: string;
  provider: string;
  status: StepStatus;
  inputData: Payload;
  outputData: Payload;
  durationMs: number;
  errorMessage?: string;
}
export interface DemoExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  status: RunStatus;
  startedAt: string;
  durationMs: number;
  steps: DemoStep[];
  input: Payload;
  minutesSaved: number;
  retryOf?: string;
  seeded?: boolean;
}
export interface DemoProvider {
  id: string;
  name: string;
  color: string;
  category: string;
  sample: Payload;
}
