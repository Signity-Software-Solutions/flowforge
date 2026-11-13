"use client";

import { useEffect, useState } from "react";
import { Check, Play, Loader2, AlertCircle, ArrowRight, RotateCcw, Mail, MessageSquare, Braces } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDemoStore } from "@/lib/demo/store";
import { PROVIDERS } from "@/lib/demo/catalog";
import type { DemoWorkflow, DemoExecution, Payload } from "@/lib/demo/types";

export function JsonView({ value }: { value: unknown }) {
  return <pre className="max-h-60 overflow-auto rounded-xl bg-slate-950 p-4 text-[11px] leading-6 text-slate-200 whitespace-pre-wrap break-words">{JSON.stringify(value, null, 2)}</pre>;
}

export function OutputCards({ execution }: { execution: DemoExecution }) {
  const outputs = execution.steps.filter(s => s.status === "SUCCESS" && (s.outputData.message || s.outputData.draft || s.outputData.responseDraft || s.outputData.billStatus || s.outputData.projectStatus));
  return <div className="space-y-3">{outputs.map(step => <div key={step.nodeId} className="rounded-xl border border-slate-200 bg-white p-4">
    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-3">{step.provider === "gmail" ? <Mail size={15} /> : <MessageSquare size={15} />}{PROVIDERS.find(p => p.id === step.provider)?.name ?? step.provider}<span className="ml-auto text-[10px] font-normal">SAMPLE OUTPUT</span></div>
    {step.outputData.to != null && <p className="text-xs text-slate-500 mb-1">To: {String(step.outputData.to)}</p>}
    {step.outputData.channel != null && <p className="text-xs text-blue-600 mb-1">{String(step.outputData.channel)}</p>}
    {step.outputData.subject != null && <p className="font-semibold text-sm mb-2">{String(step.outputData.subject)}</p>}
    <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">{String(step.outputData.message ?? step.outputData.draft ?? step.outputData.responseDraft ?? step.outputData.billStatus ?? step.outputData.projectStatus)}</p>
    {Array.isArray(step.outputData.tasks) && <ul className="mt-3 space-y-1 text-xs text-slate-500">{step.outputData.tasks.map((task, i) => <li key={i}>✓ {String(task)}</li>)}</ul>}
  </div>)}</div>;
}

export function RunDialog({ workflow, open, onClose }: { workflow: DemoWorkflow; open: boolean; onClose: () => void }) {
  const { run, activeRun, activeStep, running } = useDemoStore();
  const [input, setInput] = useState(JSON.stringify(workflow.input, null, 2));
  const [scenario, setScenario] = useState("normal");
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<number | null>(null);
  const [started, setStarted] = useState(false);
  const [tab, setTab] = useState<"trace" | "outputs">("trace");
  useEffect(() => { setInput(JSON.stringify(workflow.input, null, 2)); setStarted(false); setError(""); setScenario("normal"); setSelected(null); }, [workflow.id, workflow.input, open]);
  const execution = started && activeRun?.workflowId === workflow.id ? activeRun : null;
  const lastCompleted = execution?.steps.reduce((last, step, i) => step.status !== "CANCELLED" ? i : last, 0) ?? 0;
  const selectedIndex = selected ?? (running ? Math.min(Math.max(activeStep, 0), (execution?.steps.length ?? 1) - 1) : lastCompleted);
  const step = execution?.steps[selectedIndex];
  const start = async (retry = false) => {
    try {
      const payload: unknown = JSON.parse(input);
      if (!payload || Array.isArray(payload) || typeof payload !== "object") throw new Error("Sample event must be a JSON object.");
      if (input.length > 20000) throw new Error("Keep sample events under 20 KB.");
      setError(""); setStarted(true); setSelected(null); setTab("trace");
      await run(workflow, payload as Payload, retry ? false : scenario === "failure", retry ? execution?.id : undefined);
    } catch (err) { setError(err instanceof Error ? err.message : "Could not run sample."); }
  };
  return <Dialog open={open} onOpenChange={value => { if (!value) onClose(); }}><DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto rounded-2xl p-0 gap-0" role="dialog" aria-label="Run sample workflow">
    <div className="px-6 pt-6 pb-4 border-b"><div className="text-[10px] uppercase tracking-[.2em] font-bold text-blue-600 mb-2">Interactive walkthrough</div><DialogTitle className="leading-snug pr-6">{workflow.name}</DialogTitle><DialogDescription className="mt-2">Virtual providers · editable sample data · no external messages or payments</DialogDescription></div>
    <div className="grid md:grid-cols-[300px_1fr]">
      <div className="bg-slate-50 p-5 border-r space-y-4">
        <label className="block text-xs font-semibold" htmlFor="demo-scenario">Choose a scenario</label>
        <select id="demo-scenario" value={scenario} disabled={running} className="w-full rounded-lg border bg-white p-2 text-xs" onChange={e => { setScenario(e.target.value); setInput(JSON.stringify(e.target.value === "alternate" ? workflow.alternateInput : workflow.input, null, 2)); setStarted(false); }}>
          <option value="normal">Successful handoff</option>{workflow.alternateInput && <option value="alternate">{workflow.alternateLabel}</option>}<option value="failure">Provider rate limit → recover with retry</option>
        </select>
        <label className="block text-xs font-semibold" htmlFor="sample-event">Sample trigger event</label>
        <textarea id="sample-event" value={input} onChange={e => setInput(e.target.value)} disabled={running} spellCheck={false} className="w-full h-64 rounded-xl border p-3 text-[11px] leading-5 font-mono bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
        <p className="text-[11px] leading-5 text-slate-500">Try changing a name, budget, or amount. The mapped outputs will change too. Use fictional data only.</p>
        {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
        <Button onClick={() => start()} disabled={running} className="w-full gap-2">{running ? <Loader2 className="animate-spin" size={15} /> : <Play size={15} />}{running ? "Running sample…" : "Run sample"}</Button>
        <div className="rounded-xl bg-blue-50 text-blue-800 p-3 text-xs leading-5"><strong>{workflow.manualMinutes} minutes</strong> of estimated manual work per successful run. This is an illustrative estimate, not measured savings.</div>
      </div>
      <div className="p-5 min-w-0">
        {!execution ? <div className="flex flex-col justify-center items-center text-center h-full min-h-64 py-10"><div className="bg-blue-50 rounded-2xl p-4 mb-4"><ArrowRight className="text-blue-600" /></div><h3 className="font-semibold">Watch the handoff happen</h3><p className="text-sm text-slate-500 max-w-sm mt-2 leading-6">Run the sample to follow each step, inspect the mapped fields, and see what your client would receive.</p></div> : <>
          <div aria-live="polite" className={`rounded-xl px-4 py-3 mb-4 flex items-center gap-2 text-sm ${running ? "bg-blue-50 text-blue-800" : execution.status === "SUCCESS" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"}`}>
            {running ? <Loader2 size={17} className="animate-spin" /> : execution.status === "SUCCESS" ? <Check size={17} /> : <AlertCircle size={17} />}
            {running ? "Sample event moving through the workflow…" : execution.status === "SUCCESS" ? "Complete. Your sample outputs are ready." : "Run stopped safely. Review the failed step."}
          </div>
          <div className="flex gap-4 border-b mb-4 text-xs"><button className={`pb-2 ${tab === "trace" ? "border-b-2 border-blue-600 text-blue-600 font-semibold" : "text-slate-500"}`} onClick={() => setTab("trace")}>Step-by-step trace</button><button disabled={running} className={`pb-2 disabled:opacity-40 ${tab === "outputs" ? "border-b-2 border-blue-600 text-blue-600 font-semibold" : "text-slate-500"}`} onClick={() => setTab("outputs")}>Business outputs</button></div>
          {tab === "trace" ? <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">{execution.steps.map((s, i) => {
              const pending = running && i > activeStep;
              const current = running && i === activeStep;
              return <button disabled={pending || current} key={`${s.nodeId}-${i}`} onClick={() => setSelected(i)} className={`text-left rounded-lg border p-3 text-xs flex gap-2 items-center ${selectedIndex === i ? "border-blue-400 bg-blue-50" : "border-slate-200"} disabled:opacity-50`}>
                {current ? <Loader2 size={14} className="animate-spin text-blue-600 shrink-0" /> : pending ? <span className="w-3 h-3 rounded-full border shrink-0" /> : s.status === "SUCCESS" ? <Check size={14} className="text-emerald-600 shrink-0" /> : s.status === "ERROR" ? <AlertCircle size={14} className="text-red-500 shrink-0" /> : <span className="text-slate-400">—</span>}
                <span>{s.nodeName}<span className="block mt-1 text-[10px] text-slate-400">{pending ? "Waiting" : current ? "Processing sample" : s.status === "CANCELLED" ? "Skipped" : `${s.provider} · ${s.durationMs} ms`}</span></span>
              </button>;
            })}</div>
            {step && (!running || selectedIndex < activeStep) && <div className="space-y-3">
              {step.errorMessage && <p className="text-xs text-red-700 rounded-lg bg-red-50 p-3" role="alert">{step.errorMessage}</p>}
              {step.status === "CANCELLED" ? <p className="text-xs text-slate-500">This step was not on the selected path, or an earlier step stopped the run.</p> : <><p className="text-xs font-semibold flex gap-2"><Braces size={14} /> Input to {step.nodeName}</p><JsonView value={step.inputData} /><p className="text-xs font-semibold">Mapped output</p><JsonView value={step.outputData} /></>}
            </div>}
          </> : <OutputCards execution={execution} />}
          {!running && execution.status === "ERROR" && <Button className="mt-4 gap-2" onClick={() => start(true)}><RotateCcw size={14} /> Retry sample</Button>}
          {!running && execution.status === "SUCCESS" && tab === "trace" && <Button variant="outline" className="mt-4 gap-2" onClick={() => setTab("outputs")}>See business outputs <ArrowRight size={14} /></Button>}
        </>}
      </div>
    </div>
  </DialogContent></Dialog>;
}
