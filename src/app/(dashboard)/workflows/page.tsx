"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  LayoutGrid,
  List,
  Play,
  Pause,
  Copy,
  Trash2,
  MoreVertical,
  Clock,
  Zap,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/utils";

interface WorkflowSummary {
  id: string;
  name: string;
  description: string | null;
  status: "DRAFT" | "ACTIVE" | "INACTIVE" | "ERROR";
  lastExecutedAt: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { executions: number };
}

const STATUS_BADGE: Record<string, { variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"; label: string }> = {
  DRAFT: { variant: "secondary", label: "Draft" },
  ACTIVE: { variant: "success", label: "Active" },
  INACTIVE: { variant: "warning", label: "Inactive" },
  ERROR: { variant: "destructive", label: "Error" },
};

export default function WorkflowsPage() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState<WorkflowSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const fetchWorkflows = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`/api/workflows?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setWorkflows(data.workflows ?? []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  const handleToggleStatus = async (
    e: React.MouseEvent,
    workflow: WorkflowSummary
  ) => {
    e.stopPropagation();
    setOpenMenuId(null);
    const newStatus = workflow.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await fetch(`/api/workflows/${workflow.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchWorkflows();
  };

  const handleDuplicate = async (
    e: React.MouseEvent,
    workflow: WorkflowSummary
  ) => {
    e.stopPropagation();
    setOpenMenuId(null);
    const res = await fetch(`/api/workflows/${workflow.id}`);
    if (!res.ok) return;
    const full = await res.json();
    await fetch("/api/workflows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `${full.name} (Copy)`,
        description: full.description,
        nodes: full.nodes,
        edges: full.edges,
      }),
    });
    fetchWorkflows();
  };

  const handleDelete = async (
    e: React.MouseEvent,
    workflowId: string
  ) => {
    e.stopPropagation();
    setOpenMenuId(null);
    await fetch(`/api/workflows/${workflowId}`, { method: "DELETE" });
    fetchWorkflows();
  };

  const filteredWorkflows = workflows.filter((w) =>
    searchQuery
      ? w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (w.description ?? "").toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const filterTabs = [
    { label: "All", value: "all" },
    { label: "Active", value: "ACTIVE" },
    { label: "Inactive", value: "INACTIVE" },
    { label: "Draft", value: "DRAFT" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Workflows</h1>
          <p className="text-sm text-slate-500 mt-1">
            Build and manage your automation workflows
          </p>
        </div>
        <Button
          onClick={() => router.push("/workflows/new")}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          New Workflow
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search workflows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>

        <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                statusFilter === tab.value
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 ml-auto">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "grid"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "list"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-5 w-2/3 bg-slate-200 rounded" />
                <div className="h-3 w-full bg-slate-100 rounded mt-2" />
              </CardHeader>
              <CardContent>
                <div className="h-3 w-1/2 bg-slate-100 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredWorkflows.length === 0 ? (
        <div className="text-center py-20">
          <Zap className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-600">
            No workflows yet
          </h3>
          <p className="text-sm text-slate-400 mt-1 mb-4">
            Create your first automation workflow to get started
          </p>
          <Button onClick={() => router.push("/workflows/new")} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Workflow
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkflows.map((wf) => {
            const badge = STATUS_BADGE[wf.status] ?? STATUS_BADGE.DRAFT;
            const execCount = wf._count?.executions ?? 0;

            return (
              <Card
                key={wf.id}
                className="cursor-pointer hover:shadow-md transition-shadow relative group"
                onClick={() => router.push(`/workflows/${wf.id}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{wf.name}</CardTitle>
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === wf.id ? null : wf.id);
                        }}
                        className="p-1 rounded-md hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="w-4 h-4 text-slate-400" />
                      </button>
                      {openMenuId === wf.id && (
                        <div className="absolute right-0 top-8 z-20 w-40 bg-white border border-slate-200 rounded-lg shadow-lg py-1">
                          <button
                            onClick={(e) => handleToggleStatus(e, wf)}
                            className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 flex items-center gap-2"
                          >
                            {wf.status === "ACTIVE" ? (
                              <>
                                <Pause className="w-3.5 h-3.5" /> Deactivate
                              </>
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5" /> Activate
                              </>
                            )}
                          </button>
                          <button
                            onClick={(e) => handleDuplicate(e, wf)}
                            className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 flex items-center gap-2"
                          >
                            <Copy className="w-3.5 h-3.5" /> Duplicate
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, wf.id)}
                            className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 text-red-600 flex items-center gap-2"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <CardDescription className="line-clamp-2 text-xs">
                    {wf.description || "No description"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      {wf.lastExecutedAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatRelativeTime(wf.lastExecutedAt)}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {execCount} runs
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-2.5 px-4 font-medium text-slate-600">
                  Name
                </th>
                <th className="text-left py-2.5 px-4 font-medium text-slate-600">
                  Status
                </th>
                <th className="text-left py-2.5 px-4 font-medium text-slate-600">
                  Last Run
                </th>
                <th className="text-left py-2.5 px-4 font-medium text-slate-600">
                  Runs
                </th>
                <th className="text-right py-2.5 px-4 font-medium text-slate-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkflows.map((wf) => {
                const badge = STATUS_BADGE[wf.status] ?? STATUS_BADGE.DRAFT;
                return (
                  <tr
                    key={wf.id}
                    className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                    onClick={() => router.push(`/workflows/${wf.id}`)}
                  >
                    <td className="py-2.5 px-4">
                      <div className="font-medium text-slate-800">
                        {wf.name}
                      </div>
                      {wf.description && (
                        <div className="text-xs text-slate-400 truncate max-w-xs">
                          {wf.description}
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-4">
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </td>
                    <td className="py-2.5 px-4 text-xs text-slate-500">
                      {wf.lastExecutedAt
                        ? formatRelativeTime(wf.lastExecutedAt)
                        : "Never"}
                    </td>
                    <td className="py-2.5 px-4 text-xs text-slate-500">
                      {wf._count?.executions ?? 0}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => handleToggleStatus(e, wf)}
                          className="p-1 rounded hover:bg-slate-100"
                          title={
                            wf.status === "ACTIVE" ? "Deactivate" : "Activate"
                          }
                        >
                          {wf.status === "ACTIVE" ? (
                            <Pause className="w-3.5 h-3.5 text-slate-400" />
                          ) : (
                            <Play className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </button>
                        <button
                          onClick={(e) => handleDuplicate(e, wf)}
                          className="p-1 rounded hover:bg-slate-100"
                          title="Duplicate"
                        >
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, wf.id)}
                          className="p-1 rounded hover:bg-slate-100"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
