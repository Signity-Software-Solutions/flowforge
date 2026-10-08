"use client";

import React, { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import {
  Globe, Clock, Mail, FileText, Zap, Send, MessageSquare,
  Plus, Pencil, Code, GitBranch, GitFork, Merge, Repeat, Timer,
  Brain, Search, Tags, Sparkles, Variable, Calendar, Braces,
  Filter, BarChart3, Circle,
} from "lucide-react";
import type { WorkflowNodeData } from "@/stores/workflow-store";
import { NODE_TYPES } from "@/lib/node-types";

const ICON_MAP: Record<string, React.ElementType> = {
  Globe,
  Clock,
  Mail,
  FileText,
  Zap,
  Send,
  MessageSquare,
  Plus,
  Pencil,
  Code,
  GitBranch,
  GitFork,
  Merge,
  Repeat,
  Timer,
  Brain,
  Search,
  Tags,
  Sparkles,
  Variable,
  Calendar,
  Braces,
  Filter,
  BarChart3,
  Circle,
};

const STATUS_STYLES: Record<string, string> = {
  idle: "bg-gray-300",
  running: "bg-blue-400 animate-pulse",
  success: "bg-emerald-400",
  error: "bg-red-400",
};

const CATEGORY_BG: Record<string, string> = {
  triggers: "bg-blue-50 border-blue-200 hover:shadow-blue-100",
  actions: "bg-green-50 border-green-200 hover:shadow-green-100",
  logic: "bg-amber-50 border-amber-200 hover:shadow-amber-100",
  ai: "bg-purple-50 border-purple-200 hover:shadow-purple-100",
  utilities: "bg-gray-50 border-gray-200 hover:shadow-gray-100",
};

const CATEGORY_ICON_BG: Record<string, string> = {
  triggers: "bg-blue-500",
  actions: "bg-green-500",
  logic: "bg-amber-500",
  ai: "bg-purple-500",
  utilities: "bg-gray-500",
};

const CATEGORY_BADGE: Record<string, string> = {
  triggers: "bg-blue-100 text-blue-700",
  actions: "bg-green-100 text-green-700",
  logic: "bg-amber-100 text-amber-700",
  ai: "bg-purple-100 text-purple-700",
  utilities: "bg-gray-100 text-gray-700",
};

function CustomNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as unknown as WorkflowNodeData;
  const { label, type, category, icon, status = "idle" } = nodeData;

  const nodeDef = NODE_TYPES[type];
  const inputCount = nodeDef?.inputs ?? 1;
  const outputCount = nodeDef?.outputs ?? 1;

  const IconComponent = ICON_MAP[icon] || Circle;
  const bgClass = CATEGORY_BG[category] ?? CATEGORY_BG.utilities;
  const iconBgClass = CATEGORY_ICON_BG[category] ?? CATEGORY_ICON_BG.utilities;
  const badgeClass = CATEGORY_BADGE[category] ?? CATEGORY_BADGE.utilities;
  const statusClass = STATUS_STYLES[status] ?? STATUS_STYLES.idle;

  return (
    <div
      className={`
        relative rounded-lg border-2 px-4 py-3 min-w-[180px] max-w-[220px]
        shadow-sm transition-all duration-200 hover:shadow-md
        ${bgClass}
        ${selected ? "ring-2 ring-blue-500 ring-offset-2 shadow-md" : ""}
      `}
    >
      {/* Input handles */}
      {inputCount > 0 && (
        <Handle
          type="target"
          position={Position.Top}
          className="!w-3 !h-3 !bg-slate-400 !border-2 !border-white"
        />
      )}

      {/* Node content */}
      <div className="flex items-start gap-3">
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-lg ${iconBgClass} flex items-center justify-center`}
        >
          <IconComponent className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-gray-800 truncate">
              {label}
            </span>
            <span
              className={`w-2 h-2 rounded-full flex-shrink-0 ${statusClass}`}
            />
          </div>
          <span
            className={`inline-block mt-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${badgeClass}`}
          >
            {category}
          </span>
        </div>
      </div>

      {/* Output handles */}
      {outputCount === 1 && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-3 !h-3 !bg-slate-400 !border-2 !border-white"
        />
      )}
      {outputCount === 2 && (
        <>
          <Handle
            type="source"
            position={Position.Bottom}
            id="true"
            className="!w-3 !h-3 !bg-emerald-400 !border-2 !border-white"
            style={{ left: "30%" }}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id="false"
            className="!w-3 !h-3 !bg-red-400 !border-2 !border-white"
            style={{ left: "70%" }}
          />
        </>
      )}
      {outputCount >= 3 && (
        <>
          {Array.from({ length: outputCount }).map((_, i) => (
            <Handle
              key={i}
              type="source"
              position={Position.Bottom}
              id={`output-${i}`}
              className="!w-3 !h-3 !bg-slate-400 !border-2 !border-white"
              style={{
                left: `${((i + 1) / (outputCount + 1)) * 100}%`,
              }}
            />
          ))}
        </>
      )}
    </div>
  );
}

export const CustomNode = memo(CustomNodeComponent);
