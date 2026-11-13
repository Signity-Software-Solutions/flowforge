import { create } from "zustand";
import {
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Connection,
} from "@xyflow/react";

export interface WorkflowNodeData {
  label: string;
  type: string;
  category: string;
  icon: string;
  color: string;
  config: Record<string, unknown>;
  status: "idle" | "running" | "success" | "error";
  [key: string]: unknown;
}

export type WorkflowNode = Node<WorkflowNodeData>;
export type WorkflowEdge = Edge;

interface WorkflowState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNode: WorkflowNode | null;
  workflowName: string;
  workflowId: string | null;
  isDirty: boolean;

  // Actions
  setNodes: (nodes: WorkflowNode[]) => void;
  setEdges: (edges: WorkflowEdge[]) => void;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (node: WorkflowNode) => void;
  removeNode: (nodeId: string) => void;
  selectNode: (node: WorkflowNode | null) => void;
  clearSelection: () => void;
  setWorkflowName: (name: string) => void;
  setWorkflowId: (id: string | null) => void;
  loadWorkflow: (data: {
    id: string;
    name: string;
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
  }) => void;
  reset: () => void;
  setDirty: (dirty: boolean) => void;
  updateNodeConfig: (nodeId: string, config: Record<string, unknown>) => void;
  updateNodeLabel: (nodeId: string, label: string) => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  workflowName: "Untitled Workflow",
  workflowId: null,
  isDirty: false,

  setNodes: (nodes) => set({ nodes, isDirty: true }),

  setEdges: (edges) => set({ edges, isDirty: true }),

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes) as WorkflowNode[],
      isDirty: get().isDirty || changes.some(change => change.type !== "select" && change.type !== "dimensions"),
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
      isDirty: true,
    });
  },

  onConnect: (connection: Connection) => {
    set({
      edges: addEdge(
        {
          ...connection,
          type: "smoothstep",
          animated: false,
          style: { stroke: "#94a3b8", strokeWidth: 2 },
        },
        get().edges
      ),
      isDirty: true,
    });
  },

  addNode: (node) => {
    set({
      nodes: [...get().nodes, node],
      isDirty: true,
    });
  },

  removeNode: (nodeId) => {
    set({
      nodes: get().nodes.filter((n) => n.id !== nodeId),
      edges: get().edges.filter(
        (e) => e.source !== nodeId && e.target !== nodeId
      ),
      selectedNode:
        get().selectedNode?.id === nodeId ? null : get().selectedNode,
      isDirty: true,
    });
  },

  selectNode: (node) => set({ selectedNode: node }),

  clearSelection: () => set({ selectedNode: null }),

  setWorkflowName: (name) => set({ workflowName: name, isDirty: true }),

  setWorkflowId: (id) => set({ workflowId: id }),

  loadWorkflow: (data) => {
    set({
      workflowId: data.id,
      workflowName: data.name,
      nodes: data.nodes,
      edges: data.edges,
      selectedNode: null,
      isDirty: false,
    });
  },

  reset: () => {
    set({
      nodes: [],
      edges: [],
      selectedNode: null,
      workflowName: "Untitled Workflow",
      workflowId: null,
      isDirty: false,
    });
  },

  setDirty: (dirty) => set({ isDirty: dirty }),

  updateNodeConfig: (nodeId, config) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, config: { ...n.data.config, ...config } } }
          : n
      ),
      isDirty: true,
    });
  },

  updateNodeLabel: (nodeId, label) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, label } } : n
      ),
      isDirty: true,
    });
  },
}));
