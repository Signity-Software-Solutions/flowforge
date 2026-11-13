"use client";

import Link from "next/link";
import { ContextAssistant } from "./ContextAssistant";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, Workflow, History, Plug, BookOpen, Search, RotateCcw, ArrowRight, Command, Loader2, ShieldCheck } from "lucide-react";
import { useDemoStore } from "@/lib/demo/store";
import type { DemoWorkflow } from "@/lib/demo/types";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DemoDashboard, WorkflowGallery } from "./WorkflowGallery";
import { RunDialog } from "./RunDialog";
import { DemoBuilder } from "./DemoBuilder";
import { DemoConnections, DemoHistory, DemoGuide } from "./DemoOperations";

const navigation = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/workflows", label: "Workflow library", icon: Workflow },
  { href: "/history", label: "Run history", icon: History },
  { href: "/integrations", label: "Connections", icon: Plug },
  { href: "/settings", label: "Demo guide", icon: BookOpen },
];

export function DemoWorkspace() {
  const pathname = usePathname();
  const { initialize, reset, workflows, running, storageError } = useDemoStore();
  const [ready, setReady] = useState(false);
  const [runWorkflow, setRunWorkflow] = useState<DemoWorkflow | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [finderOpen, setFinderOpen] = useState(false);
  const [query, setQuery] = useState("");
  useEffect(() => {
    let live = true;
    Promise.resolve(useDemoStore.persist.rehydrate()).finally(() => { initialize(); if (live) setReady(true); });
    return () => { live = false; };
  }, [initialize]);
  const title = navigation.find(n => pathname.startsWith(n.href))?.label ?? "Overview";
  const terms = query.toLowerCase().split(/\W+/).filter(t => t.length > 2 && !["the", "and", "with", "want", "need", "for", "our", "automate"].includes(t));
  const matches = workflows.map(w => ({ w, score: terms.reduce((s, term) => s + (`${w.name} ${w.description} ${w.category} ${w.providers.join(" ")} ${w.problem}`.toLowerCase().includes(term) ? 1 : 0), 0) })).filter(m => !terms.length || m.score > 0).sort((a, b) => b.score - a.score).slice(0, 5);
  return <div className="min-h-screen bg-[#f7f9fc] text-slate-900 font-sans">
    <aside className="fixed left-0 top-0 bottom-0 w-16 lg:w-56 bg-[#10192b] text-slate-400 flex flex-col z-30 border-r border-white/5">
      <Link href="/dashboard" className="flex items-center gap-2.5 h-20 px-3 lg:px-5"><span className="bg-blue-500 rounded-xl w-9 h-9 flex items-center justify-center text-white shrink-0"><Workflow size={20} /></span><span className="hidden lg:block text-white text-lg font-semibold tracking-tight">FlowForge<span className="text-blue-400">.</span></span></Link>
      <p className="hidden lg:block text-[9px] font-semibold uppercase tracking-[.2em] px-6 mb-4 mt-5 text-slate-600">Automation studio</p>
      <nav className="space-y-1.5 px-2 lg:px-3">{navigation.map(n => <Link key={n.href} href={n.href} title={n.label} aria-label={n.label} className={`flex items-center gap-3 py-3 px-3 rounded-xl text-xs font-medium transition-colors ${pathname.startsWith(n.href) ? "bg-blue-500/15 text-blue-300" : "hover:bg-white/5 hover:text-white"}`}><n.icon size={17} className="shrink-0" /><span className="hidden lg:block">{n.label}</span>{n.href === "/workflows" && <span className="hidden lg:block ml-auto text-[9px] bg-white/10 px-1.5 py-0.5 rounded">{workflows.length || 8}</span>}</Link>)}</nav>
      <div className="mt-auto p-3 lg:p-5"><div className="hidden lg:block rounded-xl border border-white/10 p-4 mb-5"><ShieldCheck size={18} className="text-emerald-400 mb-3" /><p className="text-xs font-medium text-slate-200">A safe place to explore</p><p className="text-[10px] leading-5 text-slate-500 mt-2">Virtual connections. Fictional records. Nothing sent to real accounts.</p></div><div className="flex gap-3 items-center"><span className="bg-slate-700 rounded-full w-8 h-8 flex items-center justify-center text-[10px] font-semibold text-white shrink-0">FF</span><div className="hidden lg:block"><p className="text-xs text-slate-200">Client demo workspace</p><p className="text-[10px] text-slate-500 mt-1">Explore · customize · present</p></div></div></div>
    </aside>
    <div className="ml-16 lg:ml-56"><header className="h-20 bg-white/90 border-b border-slate-200/70 px-4 md:px-8 flex items-center justify-between gap-3"><div><p className="text-[10px] text-slate-400 mb-1">Workspace / <span className="text-slate-600">{title}</span></p><p className="text-sm font-semibold hidden sm:block">Make work flow.</p></div><div className="flex gap-2 items-center"><button aria-label="Find a workflow" className="flex items-center gap-2 text-xs text-slate-500 px-3 py-2 rounded-lg border bg-white hover:bg-slate-50" onClick={() => setFinderOpen(true)}><Search size={14} /><span className="hidden sm:inline">Find a workflow</span><Command size={12} className="hidden md:block text-slate-300" /></button><button disabled={running} className="flex items-center gap-2 text-xs text-slate-500 px-3 py-2 rounded-lg hover:bg-slate-100 disabled:opacity-40" onClick={() => setResetOpen(true)}><RotateCcw size={13} /><span className="hidden sm:inline">Reset demo</span></button></div></header>
      <div className="px-4 md:px-8 py-2.5 bg-blue-50/70 border-b border-blue-100 flex flex-wrap gap-2 items-center text-[10px] text-blue-800"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" /><strong>Interactive demo</strong><span className="text-blue-600/80">Sample data and simulated providers. Your changes stay in this browser.</span>{running && <span className="ml-auto flex gap-1.5 items-center"><Loader2 size={11} className="animate-spin" /> Sample running</span>}</div>
      {storageError && <p role="alert" className="mx-8 mt-4 bg-amber-50 p-3 rounded-lg text-xs text-amber-800">{storageError}</p>}
      <main className="px-4 md:px-8 py-7 max-w-[1600px] mx-auto">{!ready ? <div className="flex items-center justify-center gap-2 min-h-96 text-sm text-slate-500"><Loader2 className="animate-spin" size={18} /> Preparing your demo workspace…</div> : pathname === "/dashboard" ? <DemoDashboard onRun={setRunWorkflow} /> : pathname === "/workflows" || pathname === "/workflows/new" ? <WorkflowGallery onRun={setRunWorkflow} templates={pathname.endsWith("/new")} /> : pathname.startsWith("/workflows/") ? <DemoBuilder key={pathname} id={decodeURIComponent(pathname.split("/").pop()!)} onRun={setRunWorkflow} /> : pathname === "/history" ? <DemoHistory onRun={setRunWorkflow} /> : pathname === "/integrations" ? <DemoConnections /> : <DemoGuide />}</main>
      <footer className="px-8 py-6 flex flex-wrap justify-between gap-2 text-[10px] text-slate-400"><span>FlowForge · An automation portfolio for agencies, ecommerce, and service businesses</span><span>All provider actions are simulated</span></footer>
    </div>
    {ready && <ContextAssistant onPrepare={setRunWorkflow} />}
    {runWorkflow && <RunDialog workflow={runWorkflow} open onClose={() => setRunWorkflow(null)} />}
    <Dialog open={resetOpen} onOpenChange={setResetOpen}><DialogContent className="rounded-2xl"><DialogTitle>Ready for a fresh presentation?</DialogTitle><DialogDescription>This restores the eight original workflows, reconnects the virtual providers, and replaces this browser’s custom edits and run history with sample history.</DialogDescription><div className="flex justify-end gap-2 mt-3"><Button variant="outline" onClick={() => setResetOpen(false)}>Keep my changes</Button><Button disabled={running} onClick={() => { reset(); setResetOpen(false); }}>Reset demo workspace</Button></div></DialogContent></Dialog>
    <Dialog open={finderOpen} onOpenChange={setFinderOpen}><DialogContent className="rounded-2xl max-w-xl"><DialogTitle>What would your client like to automate?</DialogTitle><DialogDescription>Search the curated templates by process, business type, or app. This is a template matcher, not a live AI generator.</DialogDescription><input aria-label="Describe a process" value={query} onChange={e => setQuery(e.target.value)} placeholder="e.g. qualify leads from a form and alert sales" className="demo-input" /><div className="space-y-2">{matches.map(({ w }) => <Link key={w.id} href={`/workflows/${w.id}`} onClick={() => setFinderOpen(false)} className="block p-3 rounded-xl border hover:bg-blue-50 hover:border-blue-200"><div className="text-sm font-medium flex justify-between gap-3">{w.name}<ArrowRight size={14} className="shrink-0" /></div><p className="text-xs text-slate-500 mt-1">{w.description}</p></Link>)}{!matches.length && <p className="text-sm text-slate-500 py-5">No close match yet. Try “lead”, “invoice”, “support”, or “report”.</p>}</div></DialogContent></Dialog>
  </div>;
}
