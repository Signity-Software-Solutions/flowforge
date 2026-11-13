"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ReactFlowProvider } from "@xyflow/react";
import { ArrowLeft, Play, Save, Copy, Check, X, Trash2 } from "lucide-react";
import { WorkflowCanvas } from "@/components/builder/WorkflowCanvas";
import { NodePalette } from "@/components/builder/NodePalette";
import { useWorkflowStore } from "@/stores/workflow-store";
import { useDemoStore } from "@/lib/demo/store";
import { PROVIDERS } from "@/lib/demo/catalog";
import type { DemoWorkflow, Payload } from "@/lib/demo/types";
import { Button } from "@/components/ui/button";

function MappingEditor() {
  const { selectedNode, nodes, updateNodeConfig, updateNodeLabel, clearSelection, removeNode } = useWorkflowStore();
  const node = nodes.find(n => n.id === selectedNode?.id);
  const [label, setLabel] = useState("");
  const [provider, setProvider] = useState("sheets");
  const [operation, setOperation] = useState("map");
  const [fields, setFields] = useState("{}");
  const [error, setError] = useState("");
  useEffect(() => {
    if (!node) return;
    setLabel(node.data.label); setProvider(String(node.data.config.provider ?? "sheets"));
    setOperation(String(node.data.config.operation ?? (node.data.category === "triggers" ? "trigger" : "map")));
    setFields(JSON.stringify(node.data.config.fields ?? {}, null, 2)); setError("");
    // Reload the editor only when the selection changes; keep unsaved field text while editing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node?.id]);
  if (!node) return null;
  const apply = () => {
    try {
      const parsed: unknown = JSON.parse(fields);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Mappings must be a JSON object.");
      updateNodeLabel(node.id, label); updateNodeConfig(node.id, { provider, operation, fields: parsed as Payload }); setError(""); clearSelection();
    } catch (err) { setError(err instanceof Error ? err.message : "Invalid mappings."); }
  };
  return <aside className="w-80 shrink-0 bg-white border-l p-5 overflow-y-auto space-y-4"><div className="flex justify-between"><h3 className="text-sm font-semibold">Sample data mapping</h3><button aria-label="Close node editor" onClick={clearSelection}><X size={15} /></button></div><p className="text-xs text-slate-500 leading-5">Map fields from an earlier step with <code>{"{{email}}"}</code>, or enter a fixed sample value. No provider requests are made.</p>
    <label className="block text-xs">Step name<input className="demo-input mt-2" value={label} onChange={e => setLabel(e.target.value)} /></label>
    <label className="block text-xs">Virtual provider<select className="demo-input mt-2" value={provider} onChange={e => setProvider(e.target.value)}>{PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
    <label className="block text-xs">Sample operation<select className="demo-input mt-2" value={operation} onChange={e => setOperation(e.target.value)}><option value="trigger">Read trigger event</option><option value="map">Map fields to output</option><option value="score">Score budget and team size</option><option value="condition">Compare field to threshold</option><option value="invoice">Validate invoice totals</option><option value="report">Calculate CPL and ROAS</option><option value="classify">Classify support request</option></select></label>
    <label className="block text-xs">{operation === "condition" ? "Branch field and threshold" : "Output fields / mappings"}<textarea spellCheck={false} value={fields} onChange={e => setFields(e.target.value)} className="demo-input mt-2 h-48 font-mono text-[11px] leading-5" /></label>
    {operation === "condition" && <p className="text-[11px] text-slate-500">Use an IF/Else node with true and false handles. Example: {`{"field":"leadScore","threshold":70}`}</p>}
    {error && <p className="text-xs text-red-600" role="alert">{error}</p>}<Button className="w-full text-xs" onClick={apply}>Apply node changes</Button><button className="text-xs text-red-500 flex items-center gap-2" onClick={() => removeNode(node.id)}><Trash2 size={13} /> Remove step</button>
  </aside>;
}

export function DemoBuilder({ id, onRun }: { id: string; onRun: (workflow: DemoWorkflow) => void }) {
  const workflow = useDemoStore(s => s.workflows.find(w => w.id === id));
  const saveWorkflow = useDemoStore(s => s.saveWorkflow);
  const { loadWorkflow, nodes, edges, workflowName, setWorkflowName, isDirty, setDirty } = useWorkflowStore();
  const [saved, setSaved] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const router = useRouter();
  useEffect(() => { if (workflow) loadWorkflow(workflow); }, [workflow, loadWorkflow]);
  useEffect(() => {
    const guard = (event: BeforeUnloadEvent) => { if (isDirty) { event.preventDefault(); event.returnValue = ""; } };
    window.addEventListener("beforeunload", guard); return () => window.removeEventListener("beforeunload", guard);
  }, [isDirty]);
  if (!workflow) return <div className="py-16 text-center"><h1 className="text-xl font-semibold">Workflow not found</h1><Link className="text-blue-600 text-sm" href="/workflows">Return to the library</Link></div>;
  const snapshot = (): DemoWorkflow => ({ ...workflow, name: workflowName.trim() || workflow.name, nodes, edges });
  const save = () => { const current = snapshot(); saveWorkflow(current); setDirty(false); setSaved(true); return current; };
  const duplicate = () => { const copy = { ...snapshot(), id: `${workflow.id}-copy-${Date.now()}`, name: `${workflowName} (Copy)`, status: "DRAFT" as const }; saveWorkflow(copy); router.push(`/workflows/${copy.id}`); };
  return <div className="space-y-5">
    <Link href="/workflows" className="text-xs text-slate-500 flex items-center gap-2"><ArrowLeft size={14} /> Workflow library</Link>
    <div className="flex flex-wrap items-center justify-between gap-4"><div className="flex-1 min-w-60"><p className="demo-eyebrow">{workflow.category} · {workflow.nodes.length} connected steps</p><input aria-label="Workflow name" value={workflowName} onChange={e => { setWorkflowName(e.target.value); setSaved(false); }} className="bg-transparent text-xl md:text-2xl font-semibold tracking-tight w-full outline-none border-b border-transparent focus:border-blue-300 pb-1" /><p className="text-xs text-slate-500 mt-2">{workflow.description}</p></div><div className="flex gap-2"><Button variant="outline" size="sm" onClick={duplicate}><Copy size={13} /> Duplicate</Button><Button variant="outline" size="sm" onClick={save}>{saved && !isDirty ? <Check size={13} /> : <Save size={13} />}{isDirty ? "Save changes" : saved ? "Saved" : "Save"}</Button><Button size="sm" onClick={() => onRun(save())}><Play size={13} /> Run sample</Button></div></div>
    <div className="grid md:grid-cols-2 gap-4"><div className="rounded-xl border bg-white p-4"><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Before automation</p><p className="text-xs text-slate-600 leading-6">{workflow.problem}</p></div><div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4"><p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 mb-2">After automation</p><p className="text-xs text-emerald-900 leading-6">{workflow.outcome}</p></div></div>
    <div className="rounded-2xl border bg-white overflow-hidden"><div className="flex justify-between px-4 py-3 border-b text-xs text-slate-500"><span>Click any step to inspect or edit its mappings.</span><button className="text-blue-600 font-medium" onClick={() => setShowPalette(!showPalette)}>{showPalette ? "Hide node palette" : "+ Add a step"}</button></div><ReactFlowProvider><div className="flex h-[620px] relative">{showPalette && <NodePalette />}<WorkflowCanvas /><MappingEditor /></div></ReactFlowProvider></div>
    <p className="text-[10px] text-slate-400">Changes are saved in this browser. Reset demo restores the original templates. Run sample uses your current graph and mapped fields.</p>
  </div>;
}
