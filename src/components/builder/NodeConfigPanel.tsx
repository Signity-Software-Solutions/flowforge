"use client";

import React, { useEffect, useState } from "react";
import { X, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useWorkflowStore } from "@/stores/workflow-store";
import { NODE_TYPES, CATEGORY_LABELS, type ConfigField } from "@/lib/node-types";

export function NodeConfigPanel() {
  const selectedNode = useWorkflowStore((s) => s.selectedNode);
  const clearSelection = useWorkflowStore((s) => s.clearSelection);
  const updateNodeConfig = useWorkflowStore((s) => s.updateNodeConfig);
  const updateNodeLabel = useWorkflowStore((s) => s.updateNodeLabel);
  const removeNode = useWorkflowStore((s) => s.removeNode);

  const [localLabel, setLocalLabel] = useState("");
  const [localConfig, setLocalConfig] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (selectedNode) {
      setLocalLabel(selectedNode.data.label ?? "");
      setLocalConfig(selectedNode.data.config ?? {});
    }
  }, [selectedNode]);

  if (!selectedNode) return null;

  const nodeType = selectedNode.data.type as string;
  const nodeDef = NODE_TYPES[nodeType];
  const category = (selectedNode.data.category as string) ?? "utilities";
  const configFields: ConfigField[] = nodeDef?.configFields ?? [];

  const handleSave = () => {
    updateNodeLabel(selectedNode.id, localLabel);
    updateNodeConfig(selectedNode.id, localConfig);
  };

  const handleDelete = () => {
    removeNode(selectedNode.id);
  };

  const setField = (name: string, value: unknown) => {
    setLocalConfig((prev) => ({ ...prev, [name]: value }));
  };

  const renderField = (field: ConfigField) => {
    const value = (localConfig[field.name] as string | number | undefined) ?? field.defaultValue ?? "";

    switch (field.type) {
      case "text":
      case "cron":
        return (
          <Input
            value={String(value)}
            onChange={(e) => setField(field.name, e.target.value)}
            placeholder={field.placeholder}
            className="h-8 text-xs"
          />
        );
      case "number":
        return (
          <Input
            type="number"
            value={String(value)}
            onChange={(e) => setField(field.name, Number(e.target.value))}
            placeholder={field.placeholder}
            className="h-8 text-xs"
          />
        );
      case "textarea":
      case "json":
        return (
          <Textarea
            value={String(value)}
            onChange={(e) => setField(field.name, e.target.value)}
            placeholder={field.placeholder}
            rows={field.type === "json" ? 4 : 3}
            className="text-xs font-mono"
          />
        );
      case "select":
        return (
          <Select
            value={String(value)}
            onChange={(e) => setField(field.name, e.target.value)}
            className="h-8 text-xs"
          >
            <option value="">Select...</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        );
      case "boolean":
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => setField(field.name, e.target.checked)}
              className="rounded border-slate-300"
            />
            <span className="text-xs text-slate-600">{field.label}</span>
          </label>
        );
      default:
        return (
          <Input
            value={String(value)}
            onChange={(e) => setField(field.name, e.target.value)}
            placeholder={field.placeholder}
            className="h-8 text-xs"
          />
        );
    }
  };

  return (
    <div className="w-80 border-l border-slate-200 bg-white flex flex-col h-full shadow-lg animate-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">
            Node Configuration
          </h3>
          <Badge
            variant="secondary"
            className="mt-1 text-[10px]"
          >
            {CATEGORY_LABELS[category] ?? category}
          </Badge>
        </div>
        <button
          onClick={clearSelection}
          className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Node Name */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Node Name
          </label>
          <Input
            value={localLabel}
            onChange={(e) => setLocalLabel(e.target.value)}
            className="h-8 text-xs"
          />
        </div>

        {/* Node Type Info */}
        {nodeDef && (
          <div className="rounded-md bg-slate-50 p-3">
            <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider mb-1">
              Type
            </p>
            <p className="text-xs font-semibold text-slate-700">
              {nodeDef.label}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              {nodeDef.description}
            </p>
          </div>
        )}

        {/* Dynamic Config Fields */}
        {configFields.length > 0 && (
          <div>
            <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider mb-3">
              Configuration
            </p>
            <div className="space-y-3">
              {configFields.map((field) => (
                <div key={field.name}>
                  {field.type !== "boolean" && (
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      {field.label}
                      {field.required && (
                        <span className="text-red-400 ml-0.5">*</span>
                      )}
                    </label>
                  )}
                  {renderField(field)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 flex gap-2">
        <Button onClick={handleSave} size="sm" className="flex-1 gap-1.5">
          <Save className="w-3.5 h-3.5" />
          Save
        </Button>
        <Button
          onClick={handleDelete}
          size="sm"
          variant="destructive"
          className="gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete
        </Button>
      </div>
    </div>
  );
}
