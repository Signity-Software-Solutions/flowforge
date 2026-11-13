"use client";

import React, { useCallback, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  type NodeTypes,
} from "@xyflow/react";
import { useWorkflowStore, type WorkflowNode } from "@/stores/workflow-store";
import { CustomNode } from "./CustomNode";
import { NODE_TYPES, CATEGORY_COLORS } from "@/lib/node-types";

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

let nodeIdCounter = 0;

export function WorkflowCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reactFlowInstance = useRef<any>(null);

  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const onNodesChange = useWorkflowStore((s) => s.onNodesChange);
  const onEdgesChange = useWorkflowStore((s) => s.onEdgesChange);
  const onConnect = useWorkflowStore((s) => s.onConnect);
  const addNode = useWorkflowStore((s) => s.addNode);
  const selectNode = useWorkflowStore((s) => s.selectNode);
  const clearSelection = useWorkflowStore((s) => s.clearSelection);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onInit = useCallback((instance: any) => {
    reactFlowInstance.current = instance;
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const nodeType = event.dataTransfer.getData("application/reactflow-type");
      if (!nodeType || !NODE_TYPES[nodeType]) return;

      const def = NODE_TYPES[nodeType];

      if (!reactFlowInstance.current || !reactFlowWrapper.current) return;

      const position = reactFlowInstance.current.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      nodeIdCounter++;
      const newNode: WorkflowNode = {
        id: `node_${Date.now()}_${nodeIdCounter}`,
        type: "custom",
        position,
        data: {
          label: def.label,
          type: def.type,
          category: def.category,
          icon: def.icon,
          color: def.color,
          config: {},
          status: "idle",
        },
      };

      addNode(newNode);
    },
    [addNode]
  );

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: WorkflowNode) => {
      selectNode(node);
    },
    [selectNode]
  );

  const onPaneClick = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  return (
    <div ref={reactFlowWrapper} className="flex-1 h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={onInit}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={{
          type: "smoothstep",
          style: { stroke: "#94a3b8", strokeWidth: 2 },
        }}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        deleteKeyCode={["Backspace", "Delete"]}
        snapToGrid
        snapGrid={[16, 16]}
        className="bg-slate-50"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1}
          color="#cbd5e1"
        />
        <MiniMap
          nodeColor={(node) => {
            const cat = (node.data as Record<string, unknown>)?.category as string | undefined;
            return CATEGORY_COLORS[cat ?? ""] ?? "#6b7280";
          }}
          maskColor="rgba(0,0,0,0.08)"
          className="!bg-white !border !border-slate-200 !rounded-lg !shadow-sm"
        />
        <Controls
          className="!bg-white !border !border-slate-200 !rounded-lg !shadow-sm"
          showInteractive={false}
        />
      </ReactFlow>
    </div>
  );
}
