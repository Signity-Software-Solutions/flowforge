"use client";

import { useState } from "react";
import {
  Sparkles,
  Send,
  Loader2,
  CheckCircle2,
  Wand2,
  ArrowRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useWorkflowStore } from "@/stores/workflow-store";
import type { WorkflowNode, WorkflowEdge } from "@/stores/workflow-store";

interface AiGenerateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface GeneratedResult {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  n8nWorkflow: Record<string, unknown>;
  explanation: string;
}

const EXAMPLE_PROMPTS = [
  "When a form is submitted, validate the data, save to database, and send a confirmation email",
  "Monitor a Slack channel for keywords, summarize with AI, and post to a dashboard",
  "Every morning, fetch sales data from HubSpot, generate a report, and send via email",
  "When a new order comes in from Shopify, update inventory and notify the warehouse team",
];

const nodeColorMap: Record<string, { color: string; icon: string; category: string }> = {
  trigger: { color: "#3b82f6", icon: "Zap", category: "triggers" },
  action: { color: "#8b5cf6", icon: "Play", category: "actions" },
  condition: { color: "#f59e0b", icon: "GitBranch", category: "logic" },
};

export function AiGenerateDialog({ open, onOpenChange }: AiGenerateDialogProps) {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  const { setNodes, setEdges, setWorkflowName } = useWorkflowStore();

  const handleGenerate = async () => {
    if (!description.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setApplied(false);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate workflow");
      }

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!result) return;

    // Transform nodes to have proper WorkflowNode structure
    const transformedNodes: WorkflowNode[] = result.nodes.map((node) => {
      const nodeType = (node.type || "action") as string;
      const defaults = nodeColorMap[nodeType] || nodeColorMap.action;

      return {
        id: node.id,
        type: nodeType,
        position: node.position,
        data: {
          label: node.data?.label || "Node",
          type: node.data?.type || nodeType,
          category: defaults.category,
          icon: defaults.icon,
          color: defaults.color,
          config: node.data?.config || {},
          status: "idle" as const,
        },
      };
    });

    const transformedEdges: WorkflowEdge[] = result.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle || undefined,
      targetHandle: edge.targetHandle || undefined,
      type: "smoothstep",
      animated: edge.animated || false,
      label: edge.label,
      style: { stroke: "#94a3b8", strokeWidth: 2 },
    }));

    setNodes(transformedNodes);
    setEdges(transformedEdges);

    // Set a name based on the description
    const name = description.slice(0, 60).replace(/[^a-zA-Z0-9\s-]/g, "").trim();
    setWorkflowName(name || "AI Generated Workflow");

    setApplied(true);
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after animation
    setTimeout(() => {
      setDescription("");
      setResult(null);
      setError(null);
      setApplied(false);
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Workflow Generator
          </DialogTitle>
          <DialogDescription>
            Describe your workflow in plain English and let AI build it for you.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Input Area */}
          <div className="space-y-2">
            <Textarea
              placeholder="Describe your workflow... e.g. 'When a new lead comes in from HubSpot, score them with AI, and route to the right sales rep via Slack'"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              disabled={loading}
              className="resize-none"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Be specific about triggers, actions, and conditions.
              </p>
              <Button
                onClick={handleGenerate}
                disabled={loading || !description.trim()}
                size="sm"
                className="gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Example Prompts */}
          {!result && !loading && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Try an example:
              </p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setDescription(prompt)}
                    className="text-left text-xs px-3 py-2 rounded-lg border border-border bg-muted/50 hover:bg-muted transition-colors max-w-full"
                  >
                    <span className="line-clamp-2">{prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                <Sparkles className="relative h-8 w-8 text-primary animate-pulse" />
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Analyzing your description and generating workflow...
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                This may take a few seconds
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerate}
                className="mt-2 text-xs"
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-4">
              {/* Explanation */}
              <div className="p-4 bg-muted/50 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <p className="text-sm font-medium">Workflow Generated</p>
                </div>
                <div className="text-sm text-muted-foreground whitespace-pre-line">
                  {result.explanation.split("**").map((part, i) =>
                    i % 2 === 1 ? (
                      <strong key={i} className="text-foreground">
                        {part}
                      </strong>
                    ) : (
                      <span key={i}>{part}</span>
                    )
                  )}
                </div>
              </div>

              {/* Node Summary */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">
                  {result.nodes.length} nodes
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {result.edges.length} connections
                </Badge>
                {result.nodes.map((node) => (
                  <Badge
                    key={node.id}
                    variant="outline"
                    className="text-xs"
                  >
                    {node.data?.label || node.id}
                  </Badge>
                ))}
              </div>

              {/* Apply Button */}
              <div className="flex items-center gap-3">
                {applied ? (
                  <Button disabled className="gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Applied to Canvas
                  </Button>
                ) : (
                  <Button onClick={handleApply} className="gap-2">
                    <ArrowRight className="h-4 w-4" />
                    Apply to Canvas
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    setResult(null);
                    setDescription("");
                  }}
                >
                  Generate Another
                </Button>
              </div>

              {applied && (
                <p className="text-xs text-emerald-600">
                  Workflow loaded into the canvas. Close this dialog and switch
                  to the workflow builder to see it.
                </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
