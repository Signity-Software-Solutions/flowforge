"use client";

import React, { useState } from "react";
import {
  Globe, Clock, Mail, FileText, Zap, Send, MessageSquare,
  Plus, Pencil, Code, GitBranch, GitFork, Merge, Repeat, Timer,
  Brain, Search, Tags, Sparkles, Variable, Calendar, Braces,
  Filter, BarChart3, Circle, ChevronDown, ChevronRight,
  GripVertical,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  NODE_TYPES,
  CATEGORY_LABELS,
  getAllCategories,
  getNodesByCategory,
} from "@/lib/node-types";

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

const CATEGORY_STYLES: Record<
  string,
  { accent: string; bg: string; iconBg: string }
> = {
  triggers: {
    accent: "text-blue-600",
    bg: "bg-blue-50 hover:bg-blue-100 border-blue-200",
    iconBg: "bg-blue-500",
  },
  actions: {
    accent: "text-green-600",
    bg: "bg-green-50 hover:bg-green-100 border-green-200",
    iconBg: "bg-green-500",
  },
  logic: {
    accent: "text-amber-600",
    bg: "bg-amber-50 hover:bg-amber-100 border-amber-200",
    iconBg: "bg-amber-500",
  },
  ai: {
    accent: "text-purple-600",
    bg: "bg-purple-50 hover:bg-purple-100 border-purple-200",
    iconBg: "bg-purple-500",
  },
  utilities: {
    accent: "text-gray-600",
    bg: "bg-gray-50 hover:bg-gray-100 border-gray-200",
    iconBg: "bg-gray-500",
  },
};

export function NodePalette() {
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleCategory = (cat: string) => {
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const onDragStart = (
    event: React.DragEvent,
    nodeType: string
  ) => {
    event.dataTransfer.setData("application/reactflow-type", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const categories = getAllCategories();

  const filteredCategories = categories
    .map((cat) => {
      const nodes = getNodesByCategory(cat).filter((n) =>
        searchQuery
          ? n.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.description.toLowerCase().includes(searchQuery.toLowerCase())
          : true
      );
      return { category: cat, nodes };
    })
    .filter((c) => c.nodes.length > 0);

  return (
    <div className="w-64 border-r border-slate-200 bg-white flex flex-col h-full">
      <div className="p-3 border-b border-slate-200">
        <h2 className="text-sm font-semibold text-slate-800 mb-2">
          Node Palette
        </h2>
        <Input
          placeholder="Search nodes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-8 text-xs"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredCategories.map(({ category, nodes }) => {
          const isCollapsed = collapsed[category] && !searchQuery;
          const styles = CATEGORY_STYLES[category] ?? CATEGORY_STYLES.utilities;

          return (
            <div key={category}>
              <button
                onClick={() => toggleCategory(category)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-semibold ${styles.accent} hover:bg-slate-100 transition-colors`}
              >
                {isCollapsed ? (
                  <ChevronRight className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
                {CATEGORY_LABELS[category] ?? category}
                <span className="ml-auto text-[10px] text-slate-400 font-normal">
                  {nodes.length}
                </span>
              </button>

              {!isCollapsed && (
                <div className="mt-1 space-y-1 ml-1">
                  {nodes.map((nodeDef) => {
                    const Icon = ICON_MAP[nodeDef.icon] || Circle;
                    return (
                      <div
                        key={nodeDef.type}
                        draggable
                        onDragStart={(e) => onDragStart(e, nodeDef.type)}
                        className={`
                          flex items-center gap-2 px-2 py-1.5 rounded-md border
                          cursor-grab active:cursor-grabbing transition-all
                          ${styles.bg}
                        `}
                        title={nodeDef.description}
                      >
                        <GripVertical className="w-3 h-3 text-slate-300 flex-shrink-0" />
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${styles.iconBg}`}
                        >
                          <Icon className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-xs font-medium text-slate-700 truncate">
                          {nodeDef.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {filteredCategories.length === 0 && (
          <div className="text-center py-8 text-xs text-slate-400">
            No nodes match your search
          </div>
        )}
      </div>
    </div>
  );
}
