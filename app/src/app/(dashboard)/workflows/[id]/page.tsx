"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Save,
  Play,
  Undo2,
  Redo2,
  Sparkles,
  Loader2,
  ChevronLeft,
  Check,
} from "lucide-react";
import { ReactFlowProvider } from "@xyflow/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { WorkflowCanvas } from "@/components/builder/WorkflowCanvas";
import { NodePalette } from "@/components/builder/NodePalette";
import { NodeConfigPanel } from "@/components/builder/NodeConfigPanel";
import { useWorkflowStore } from "@/stores/workflow-store";

export default function WorkflowBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const isNew = id === "new";

  const workflowName = useWorkflowStore((s) => s.workflowName);
  const setWorkflowName = useWorkflowStore((s) => s.setWorkflowName);
  const workflowId = useWorkflowStore((s) => s.workflowId);
  const setWorkflowId = useWorkflowStore((s) => s.setWorkflowId);
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const isDirty = useWorkflowStore((s) => s.isDirty);
  const setDirty = useWorkflowStore((s) => s.setDirty);
  const loadWorkflow = useWorkflowStore((s) => s.loadWorkflow);
  const reset = useWorkflowStore((s) => s.reset);
  const selectedNode = useWorkflowStore((s) => s.selectedNode);

  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loading, setLoading] = useState(!isNew);

  // Load existing workflow
  useEffect(() => {
    if (isNew) {
      reset();
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/workflows/${id}`);
        if (!res.ok) {
          router.push("/workflows");
          return;
        }
        const data = await res.json();
        if (!cancelled) {
          loadWorkflow({
            id: data.id,
            name: data.name,
            nodes: data.nodes ?? [],
            edges: data.edges ?? [],
          });
        }
      } catch {
        if (!cancelled) router.push("/workflows");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isNew]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const body = {
        name: workflowName,
        nodes,
        edges,
      };

      let res: Response;
      if (workflowId) {
        res = await fetch(`/api/workflows/${workflowId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch("/api/workflows", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      if (res.ok) {
        const data = await res.json();
        setDirty(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);

        if (!workflowId && data.id) {
          setWorkflowId(data.id);
          window.history.replaceState(null, "", `/workflows/${data.id}`);
        }
      }
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  }, [workflowName, nodes, edges, workflowId, setDirty, setWorkflowId]);

  const handleRun = useCallback(async () => {
    const targetId = workflowId;
    if (!targetId) return;
    setRunning(true);
    try {
      await fetch(`/api/workflows/${targetId}/execute`, {
        method: "POST",
      });
    } catch {
      // silent
    } finally {
      setRunning(false);
    }
  }, [workflowId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <div className="flex flex-col h-screen bg-white">
        {/* Top Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-white z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/workflows")}
              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <Input
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="h-8 w-64 text-sm font-semibold border-transparent hover:border-slate-200 focus:border-blue-300"
            />

            {isDirty && (
              <Badge variant="warning" className="text-[10px]">
                Unsaved
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center border border-slate-200 rounded-lg mr-2">
              <button
                className="p-1.5 hover:bg-slate-50 rounded-l-lg text-slate-400 hover:text-slate-600 disabled:opacity-30"
                title="Undo"
                disabled
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                className="p-1.5 hover:bg-slate-50 rounded-r-lg text-slate-400 hover:text-slate-600 disabled:opacity-30"
                title="Redo"
                disabled
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>

            <Button variant="outline" size="sm" className="gap-1.5" disabled>
              <Sparkles className="w-3.5 h-3.5" />
              AI Generate
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={handleRun}
              disabled={running || !workflowId}
            >
              {running ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5" />
              )}
              Run
            </Button>

            <Button
              size="sm"
              className="gap-1.5"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : saveSuccess ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              {saveSuccess ? "Saved" : "Save"}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          <NodePalette />
          <WorkflowCanvas />
          {selectedNode && <NodeConfigPanel />}
        </div>
      </div>
    </ReactFlowProvider>
  );
}
