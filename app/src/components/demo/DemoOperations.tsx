"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, ChevronDown, ChevronUp, Search, RotateCcw, Plug, Clock3 } from "lucide-react";
import { useDemoStore } from "@/lib/demo/store";
import { PROVIDERS } from "@/lib/demo/catalog";
import type { DemoWorkflow } from "@/lib/demo/types";
import { ProviderMark } from "./WorkflowGallery";
import { JsonView, OutputCards } from "./RunDialog";
import { Button } from "@/components/ui/button";

export function DemoConnections() {
  const { disconnected, setConnection, workflows, running } = useDemoStore();
  const [selected, setSelected] = useState<string | null>(null);
  return <div className="space-y-6"><div><p className="demo-eyebrow">A connected business</p><h1 className="demo-heading">Your tools, working together.</h1><p className="demo-subtitle">Virtual connections are ready to use. Inspect the sample records, or pause a connection to demonstrate safe error handling.</p></div>
    <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-xs leading-6 text-blue-900 flex gap-3"><Plug size={18} className="shrink-0 mt-1" /><p><strong>{PROVIDERS.length - disconnected.length} virtual connections active.</strong> These are simulated provider adapters. No login, API key, or real account access is needed. No information is sent to these companies.</p></div>
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">{PROVIDERS.map(p => {
      const connected = !disconnected.includes(p.id);
      const used = workflows.filter(w => w.providers.includes(p.id));
      return <article key={p.id} className="rounded-2xl border bg-white p-5"><div className="flex items-center gap-3"><ProviderMark id={p.id} /><div><h2 className="font-semibold text-sm">{p.name}</h2><p className="text-[10px] text-slate-400 mt-1">{p.category}</p></div><span className={`ml-auto text-[10px] rounded-full px-2 py-1 ${connected ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{connected ? "Virtual · ready" : "Paused"}</span></div><p className="mt-5 text-xs text-slate-500">Used in {used.length} workflow{used.length !== 1 ? "s" : ""}</p><div className="flex justify-between mt-4"><button onClick={() => setSelected(selected === p.id ? null : p.id)} className="text-xs text-blue-600">{selected === p.id ? "Hide sample record" : "Inspect sample record"}</button><button disabled={running} className="text-xs text-slate-500 disabled:opacity-40" onClick={() => setConnection(p.id, !connected)}>{connected ? "Pause" : "Reconnect"}</button></div>{selected === p.id && <div className="mt-4"><JsonView value={p.sample} /><p className="text-[10px] text-slate-400 mt-3 leading-5">Illustrative provider record. Run a workflow to inspect the exact mapped fields used in that scenario.</p></div>}</article>;
    })}</div>
  </div>;
}

export function DemoHistory({ onRun }: { onRun: (w: DemoWorkflow) => void }) {
  const { executions, workflows, run, running } = useDemoStore();
  const params = useSearchParams();
  const [expanded, setExpanded] = useState<string | null>(params.get("run"));
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [retrying, setRetrying] = useState<string | null>(null);
  const filtered = executions.filter(e => (filter === "all" || e.status === filter) && e.workflowName.toLowerCase().includes(query.toLowerCase()));
  const rows = filtered.slice((page - 1) * 10, page * 10);
  return <div className="space-y-6"><div><p className="demo-eyebrow">Every handoff, accounted for</p><h1 className="demo-heading">See exactly what happened.</h1><p className="demo-subtitle">Inspect inputs, mapped outputs, skipped branches, and recovery. Example history is labeled separately from your runs.</p></div>
    <div className="flex gap-3"><div className="relative flex-1"><Search size={15} className="absolute top-3 left-3 text-slate-400" /><input aria-label="Search run history" value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} placeholder="Search workflows…" className="demo-input pl-9" /></div><select aria-label="Filter run status" value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }} className="rounded-lg border px-3 bg-white text-xs"><option value="all">All statuses</option><option value="SUCCESS">Successful</option><option value="ERROR">Needs attention</option></select></div>
    <div className="rounded-2xl border bg-white overflow-hidden"><div className="px-5 py-4 border-b text-xs font-medium text-slate-500">{filtered.length} sample executions · {executions.filter(e => !e.seeded).length} run in this browser</div>{rows.length === 0 && <p className="p-10 text-center text-sm text-slate-500">No runs match your filters.</p>}{rows.map(e => {
      const open = expanded === e.id;
      const workflow = workflows.find(w => w.id === e.workflowId);
      return <div key={e.id} className="border-b last:border-b-0"><button onClick={() => setExpanded(open ? null : e.id)} className="w-full p-5 text-left hover:bg-slate-50 flex items-center gap-3"><span className={`p-2 rounded-full ${e.status === "SUCCESS" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>{e.status === "SUCCESS" ? <Check size={14} /> : <RotateCcw size={14} />}</span><div className="min-w-0"><p className="text-sm font-medium truncate">{e.workflowName}</p><p className="text-[10px] text-slate-400 mt-1">{e.seeded ? "Example history" : "Your sample run"}{e.retryOf ? " · Retry of an earlier run" : ""} · {new Date(e.startedAt).toLocaleString()}</p></div><span className="ml-auto text-xs text-slate-500 shrink-0 hidden sm:block">{(e.durationMs / 1000).toFixed(1)} s</span><span className={`text-[10px] hidden sm:block shrink-0 ${e.status === "SUCCESS" ? "text-emerald-600" : "text-amber-700"}`}>{e.status === "SUCCESS" ? "Complete" : "Needs attention"}</span>{open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</button>
      {open && <div className="px-5 pb-5 bg-slate-50/50"><div className="grid lg:grid-cols-2 gap-5"><div><h3 className="text-xs font-semibold mb-3">Step trace</h3><div className="space-y-2">{e.steps.map((step, i) => <details key={`${step.nodeId}-${i}`} className="rounded-lg border bg-white p-3"><summary className="cursor-pointer text-xs font-medium">{step.nodeName}<span className={`float-right text-[10px] ${step.status === "SUCCESS" ? "text-emerald-600" : step.status === "ERROR" ? "text-red-500" : "text-slate-400"}`}>{step.status === "CANCELLED" ? "SKIPPED" : step.status}</span></summary>{step.errorMessage && <p className="text-xs text-red-600 mt-3">{step.errorMessage}</p>}<p className="text-[10px] text-slate-500 mt-3 mb-2">Input</p><JsonView value={step.inputData} /><p className="text-[10px] text-slate-500 mt-3 mb-2">Output</p><JsonView value={step.outputData} /></details>)}</div></div><div><h3 className="text-xs font-semibold mb-3">Business outputs</h3><OutputCards execution={e} />{e.status === "SUCCESS" && <p className="flex items-center gap-2 text-xs text-emerald-700 mt-3"><Clock3 size={14} /> Estimated manual effort avoided: {e.minutesSaved} min</p>}</div></div>
        {workflow && <div className="mt-4 flex gap-3"><Button size="sm" variant="outline" disabled={running} onClick={() => onRun(workflow)}>Run another scenario</Button>{e.status === "ERROR" && <Button size="sm" disabled={running} onClick={async () => { setRetrying(e.id); await run(workflow, e.input, false, e.id); setRetrying(null); setFilter("all"); setExpanded(useDemoStore.getState().executions[0]?.id ?? null); setPage(1); }}><RotateCcw size={13} className={retrying === e.id ? "animate-spin" : ""} />{retrying === e.id ? "Retrying sample…" : "Retry same sample"}</Button>}</div>}
      </div>}</div>;
    })}<div className="flex justify-between items-center px-5 py-4 text-xs text-slate-500"><button disabled={page === 1} className="disabled:opacity-30" onClick={() => setPage(p => p - 1)}>← Previous</button><span>Page {page} of {Math.max(1, Math.ceil(filtered.length / 10))}</span><button disabled={page * 10 >= filtered.length} className="disabled:opacity-30" onClick={() => setPage(p => p + 1)}>Next →</button></div></div>
  </div>;
}

export function DemoGuide() {
  return <div className="max-w-3xl space-y-6"><div><p className="demo-eyebrow">Built for a great first conversation</p><h1 className="demo-heading">Your five-minute client walkthrough.</h1><p className="demo-subtitle">Start with the client’s problem, then let them see the result.</p></div>{[
    ["01", "Choose their world", "For agencies, start with lead qualification or client onboarding. For ecommerce, use order fulfillment or support triage. For service businesses, try invoices or appointments."],
    ["02", "Make the sample feel familiar", "Open a workflow and explain the before-and-after cards. Run the sample with a fictional company name and a realistic amount. Show how those details appear in the email, CRM record, or Slack message."],
    ["03", "Show the decisions", "Try the small-budget lead scenario to demonstrate the nurture branch. Then try a provider rate limit and retry it. This shows how an automation can handle exceptions, not just the happy path."],
    ["04", "Connect the value to their business", "Use the dashboard calculator with their approximate monthly volume and hourly cost. Treat it as a conversation about assumptions, not a promised return."],
    ["05", "Define the real engagement", "Agree on the trigger, provider accounts, approvals, exception rules, expected volume, and success criteria. A real implementation needs authenticated connectors, durable storage, monitoring, and acceptance testing."],
  ].map(([n, title, detail]) => <div className="rounded-2xl border bg-white p-6 flex gap-5" key={n}><span className="text-blue-600 font-mono text-lg">{n}</span><div><h2 className="font-semibold text-sm">{title}</h2><p className="text-sm text-slate-500 leading-7 mt-2">{detail}</p></div></div>)}<p className="text-xs leading-6 text-slate-500">This portfolio runs entirely with virtual providers and fictional sample records. AI steps use deterministic sample logic, and content drafts require human review. All edits and runs are isolated to this browser. Use Reset demo before a new presentation.</p></div>;
}
