"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, ArrowRight, Clock3, Play, Search, Zap, CheckCircle2, Workflow, BarChart3 } from "lucide-react";
import { useDemoStore } from "@/lib/demo/store";
import { PROVIDERS } from "@/lib/demo/catalog";
import { executionStats } from "@/lib/demo/engine";
import type { DemoWorkflow } from "@/lib/demo/types";

export function ProviderMark({ id, small = false }: { id: string; small?: boolean }) {
  const provider = PROVIDERS.find(p => p.id === id);
  return <span title={provider?.name ?? id} className={`inline-flex shrink-0 items-center justify-center rounded-lg text-white font-bold ${small ? "h-7 w-7 text-[10px]" : "h-9 w-9 text-xs"}`} style={{ background: provider?.color ?? "#64748b" }}>{(provider?.name ?? id).split(" ").map(w => w[0]).join("").slice(0, 2)}</span>;
}

export function WorkflowCard({ workflow, onRun }: { workflow: DemoWorkflow; onRun: (w: DemoWorkflow) => void }) {
  return <article className="group rounded-2xl border border-slate-200 bg-white p-5 flex flex-col shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
    <div className="flex items-center justify-between mb-5"><div className="flex -space-x-1">{workflow.providers.slice(0, 4).map(id => <span className="ring-2 ring-white rounded-lg" key={id}><ProviderMark id={id} /></span>)}{workflow.providers.length > 4 && <span className="h-9 w-9 rounded-lg bg-slate-100 ring-2 ring-white flex items-center justify-center text-xs text-slate-500">+{workflow.providers.length - 4}</span>}</div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] text-slate-500 font-medium">{workflow.category}</span></div>
    <Link href={`/workflows/${workflow.id}`} className="font-semibold text-[17px] leading-snug tracking-tight text-slate-900 hover:text-blue-600">{workflow.name}</Link>
    <p className="text-sm leading-6 text-slate-500 mt-2 flex-1">{workflow.description}</p>
    <div className="flex items-center gap-2 mt-5 text-xs text-emerald-700"><Clock3 size={13} /> Est. {workflow.manualMinutes} min saved per run<span className="text-slate-300 ml-auto">{workflow.nodes.length} steps</span></div>
    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100"><button onClick={() => onRun(workflow)} className="flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-xs font-semibold"><Play size={13} /> Run sample</button><Link href={`/workflows/${workflow.id}`} className="ml-auto text-xs font-medium text-slate-500 hover:text-blue-600 flex items-center gap-1">Explore workflow <ArrowUpRight size={14} /></Link></div>
  </article>;
}

export function WorkflowGallery({ onRun, templates = false }: { onRun: (w: DemoWorkflow) => void; templates?: boolean }) {
  const workflows = useDemoStore(s => s.workflows);
  const [category, setCategory] = useState("All workflows");
  const [query, setQuery] = useState("");
  const filtered = workflows.filter(w => (category === "All workflows" || w.category === category) && `${w.name} ${w.description} ${w.providers.join(" ")}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="space-y-7"><div><p className="demo-eyebrow">{templates ? "Start with a proven process" : "The automation library"}</p><h1 className="demo-heading">{templates ? "Make a workflow your own." : "Less busywork. More possibility."}</h1><p className="demo-subtitle">{templates ? "Open a workflow, duplicate it, and customize the mapped sample data for your next client." : "Eight ready-to-run business stories. Realistic data. A clear result at every step."}</p></div>
    <div className="flex flex-col lg:flex-row gap-4 justify-between"><div className="flex flex-wrap gap-2">{["All workflows", "Agencies", "Ecommerce", "Service businesses"].map(c => <button key={c} onClick={() => setCategory(c)} className={`px-3 py-2 text-xs font-medium rounded-lg ${category === c ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"}`}>{c}</button>)}</div><div className="relative"><Search size={15} className="absolute left-3 top-3 text-slate-400" /><input aria-label="Search workflows" placeholder="Search by process or app…" value={query} onChange={e => setQuery(e.target.value)} className="pl-9 pr-3 py-2.5 bg-white border rounded-lg text-xs w-full lg:w-64 outline-none focus:ring-2 focus:ring-blue-300" /></div></div>
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">{filtered.map(w => <WorkflowCard key={w.id} workflow={w} onRun={onRun} />)}</div>{!filtered.length && <p className="py-12 text-center text-slate-500">No matching workflows. Try another process or app name.</p>}
  </div>;
}

export function DemoDashboard({ onRun }: { onRun: (w: DemoWorkflow) => void }) {
  const { workflows, executions } = useDemoStore();
  const stats = executionStats(executions);
  const [volume, setVolume] = useState(50);
  const [rate, setRate] = useState(30);
  const featured = ["lead-qualification", "order-fulfillment", "invoice-processing"].map(id => workflows.find(w => w.id === id)).filter((w): w is DemoWorkflow => Boolean(w));
  return <div className="space-y-7">
    <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-8 md:px-9 md:py-10 text-white">
      <div className="absolute -right-16 -top-24 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
      <div className="relative grid xl:grid-cols-[1.3fr_1fr] gap-8 items-center"><div><p className="text-[10px] font-semibold uppercase tracking-[.24em] text-blue-300 mb-4">From repetitive work to remarkable results</p><h1 className="text-3xl md:text-4xl font-semibold leading-[1.15] tracking-tight max-w-xl">Your next hire could<br className="hidden sm:block" /> be a workflow.</h1><p className="mt-4 text-sm leading-7 text-slate-400 max-w-lg">See how connected systems turn enquiries into clients, orders into deliveries, and hours of admin into a few seconds.</p><div className="mt-6 flex flex-wrap gap-3"><button onClick={() => onRun(featured[0])} disabled={!featured[0]} className="bg-blue-500 hover:bg-blue-400 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2"><Play size={14} /> Try the lead-to-client demo</button><Link href="/workflows" className="px-4 py-3 rounded-xl border border-white/15 text-xs font-medium flex items-center gap-2 hover:bg-white/5">Explore all workflows <ArrowRight size={14} /></Link></div></div>
      <div className="rounded-2xl border border-white/10 bg-white/[.04] p-5"><div className="flex items-center justify-between mb-5"><p className="text-xs font-medium text-slate-200">A better handoff, every time</p><span className="text-[9px] uppercase tracking-wider text-blue-300 bg-blue-400/10 px-2 py-1 rounded-full">Sample journey</span></div>{[{ n: "01", title: "An enquiry arrives", detail: "Maya at Northstar · $8,500 budget", provider: "typeform" }, { n: "02", title: "The right systems get to work", detail: "Score 92/100 · CRM contact created", provider: "hubspot" }, { n: "03", title: "Your team gets a clear next step", detail: "Sales alert with context, owner, and priority", provider: "slack" }].map((s, i) => <div key={s.n} className={`flex items-center gap-3 py-3 ${i !== 2 ? "border-b border-white/5" : ""}`}><ProviderMark id={s.provider} /><div><p className="text-xs font-medium">{s.title}</p><p className="text-[11px] mt-1 text-slate-400">{s.detail}</p></div><CheckCircle2 size={15} className="ml-auto text-emerald-400 shrink-0" /></div>)}</div></div>
    </section>
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">{[
      { label: "Ready-to-run workflows", value: workflows.length, detail: "Across three business types", icon: Workflow },
      { label: "Sample runs", value: stats.runs, detail: "Includes labeled example history", icon: Zap },
      { label: "Sample success rate", value: `${stats.successRate}%`, detail: "Calculated from demo history", icon: CheckCircle2 },
      { label: "Estimated hours saved", value: `${stats.hoursSaved} h`, detail: "Illustrative successful-run estimate", icon: Clock3 },
    ].map(s => <div className="rounded-2xl border bg-white p-5" key={s.label}><div className="flex justify-between items-center"><p className="text-xs text-slate-500">{s.label}</p><s.icon size={16} className="text-blue-500" /></div><p className="text-3xl font-semibold tracking-tight mt-3">{s.value}</p><p className="text-[10px] text-slate-400 mt-2">{s.detail}</p></div>)}</div>
    <section><div className="flex items-end justify-between mb-4"><div><p className="demo-eyebrow">Start with a business problem</p><h2 className="text-xl font-semibold tracking-tight">Three ways to see the difference</h2></div><Link href="/workflows" className="text-xs text-blue-600 flex gap-1 items-center">View all <ArrowRight size={13} /></Link></div><div className="grid lg:grid-cols-3 gap-5">{featured.map(w => <WorkflowCard key={w.id} workflow={w} onRun={onRun} />)}</div></section>
    <section className="grid lg:grid-cols-2 gap-5">
      <div className="rounded-2xl border bg-white p-6"><div className="flex gap-2 items-center"><BarChart3 size={18} className="text-blue-600" /><h2 className="font-semibold">What could this save your team?</h2></div><p className="text-xs text-slate-500 leading-6 mt-2">Explore the lead qualification example: 18 minutes of manual work per enquiry. Change the assumptions for your client.</p><div className="mt-5 space-y-5"><label className="text-xs block">Enquiries per month <strong className="float-right">{volume}</strong><input aria-label="Enquiries per month" type="range" min="10" max="500" step="10" value={volume} onChange={e => setVolume(Number(e.target.value))} className="w-full accent-blue-600 mt-3" /></label><label className="text-xs flex items-center justify-between">Hourly cost (USD)<input aria-label="Hourly cost in USD" type="number" min="0" max="1000" value={rate} onChange={e => setRate(Math.max(0, Math.min(1000, Number(e.target.value))))} className="w-20 rounded-lg border px-3 py-2 text-right" /></label></div><div className="grid grid-cols-2 gap-4 bg-blue-50 rounded-xl p-4 mt-5"><div className="text-2xl font-semibold text-blue-900">{(volume * 18 / 60).toFixed(0)} h<span className="block text-[10px] mt-1 text-blue-600 font-normal">Potential time saved / month</span></div><div className="text-2xl font-semibold text-blue-900">${(volume * 18 / 60 * rate).toLocaleString("en-US", { maximumFractionDigits: 0 })}<span className="block text-[10px] mt-1 text-blue-600 font-normal">Illustrative capacity value / month</span></div></div><p className="mt-3 text-[10px] text-slate-400">Estimates exclude setup, provider costs, and human review. Results depend on your process.</p></div>
      <div className="rounded-2xl border bg-white p-6"><h2 className="font-semibold">Recent activity</h2><p className="text-xs text-slate-500 mt-2">The same runs you can inspect in execution history.</p><div className="mt-4 divide-y divide-slate-100">{executions.slice(0, 5).map(e => <Link href={`/history?run=${e.id}`} key={e.id} className="py-3 flex items-center gap-3 hover:bg-slate-50"><span className={`h-2 w-2 rounded-full shrink-0 ${e.status === "SUCCESS" ? "bg-emerald-500" : "bg-amber-500"}`} /><div className="min-w-0"><p className="text-xs font-medium truncate">{e.workflowName}</p><p className="text-[10px] text-slate-400 mt-1">{e.seeded ? "Example history" : "Your sample run"} · {(e.durationMs / 1000).toFixed(1)} s</p></div><ArrowUpRight size={14} className="ml-auto text-slate-400 shrink-0" /></Link>)}</div></div>
    </section>
  </div>;
}
