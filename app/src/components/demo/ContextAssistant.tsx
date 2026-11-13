"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDemoStore } from '@/lib/demo/store';
import type { DemoWorkflow } from '@/lib/demo/types';
import { workflowAnswer, type AssistantAnswer } from '@/lib/demo/assistant';
import './assistant.css';
interface Message extends AssistantAnswer {query:string;at:string;scope:string}
export function ContextAssistant({onPrepare}:{onPrepare:(w:DemoWorkflow)=>void}) {
 const path=usePathname();
 return <Session key={path} path={path} onPrepare={onPrepare}/>;
}
function Session({path,onPrepare}:{path:string;onPrepare:(w:DemoWorkflow)=>void}) {
 const {workflows,executions,disconnected}=useDemoStore();
 const route=decodeURIComponent(path.split('/')[2]||'');
 const [selected,setSelected]=useState(workflows.some(w=>w.id===route)?route:'all');
 const [open,setOpen]=useState(false),[query,setQuery]=useState(''),[messages,setMessages]=useState<Message[]>([]);
 const input=useRef<HTMLInputElement>(null),button=useRef<HTMLButtonElement>(null),end=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(open)input.current?.focus();},[open]);
 useEffect(()=>{end.current?.scrollIntoView({block:'nearest'});},[messages]);
 const label=workflows.find(w=>w.id===selected)?.name||'All workflows';
 function close(){setOpen(false);button.current?.focus();}
 function ask(q:string){if(!q.trim())return;setMessages(old=>[...old.slice(-7),{...workflowAnswer(workflows,executions,disconnected,selected,q),query:q,at:new Date().toISOString(),scope:label}]);setQuery('');}
 function download(m:Message){const cell=(v:unknown)=>{let s=String(v??'');if(/^\s*[=+@-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};const csv=[['Report',m.title],['Scope',m.scope],['Snapshot',m.at],['Answer',m.text],[],...(m.columns?[m.columns,...(m.rows||[])]:[])].map(r=>r.map(cell).join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='FlowForge-assistant-report.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 return <><button className="ca-launch" ref={button} aria-expanded={open} aria-controls="context-assistant" onClick={()=>setOpen(!open)}>✦ Ask FlowForge</button>{open&&<section className="ca-panel" id="context-assistant" aria-label="FlowForge contextual assistant" onKeyDown={e=>{if(e.key==='Escape'){e.stopPropagation();close();}}}>
 <header className="ca-header"><div><strong>FlowForge assistant</strong><small>Explain · diagnose · prepare</small></div><button aria-label="Close assistant" onClick={close}>✕</button></header>
 <div className="ca-context"><label htmlFor="ca-scope">Workflow context</label><select id="ca-scope" value={selected} onChange={e=>{setSelected(e.target.value);setMessages([]);}}><option value="all">All workflows</option>{workflows.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}</select><div className="ca-scope">{label} · Current browser records · Virtual providers</div></div>
 <div className="ca-body"><div className="ca-prompts">{['Explain workflow','Inspect mappings','Diagnose failures','Connection readiness','Prepare test run','Run performance report','Find lead qualification'].map(p=><button key={p} onClick={()=>ask(p)}>{p}</button>)}</div>{!messages.length&&<p className="ca-scope">Select a workflow or describe a business process. Answers use saved workflows and actual demo run traces.</p>}<div aria-live="polite">{messages.map((m,i)=><article key={i} className="ca-message"><div className="ca-question">You · {m.query}</div><h3>{m.title}</h3><p>{m.text}</p><small>{m.scope} · Snapshot {new Date(m.at).toLocaleString()}</small>{!!m.rows?.length&&<div className="ca-table"><table><thead><tr>{m.columns?.map(c=><th key={c}>{c}</th>)}</tr></thead><tbody>{m.rows.slice(0,12).map((r,j)=><tr key={j}>{r.map((v,k)=><td key={k}>{String(v??'')}</td>)}</tr>)}</tbody></table>{m.rows.length>12&&<small>Showing 12 of {m.rows.length}; export includes all rows.</small>}</div>}<div className="ca-links">{m.links?.map(l=><Link href={l.href} key={l.href} className="ca-link">{l.label}</Link>)}{m.prepareId&&<button className="ca-link" onClick={()=>{const w=workflows.find(w=>w.id===m.prepareId);if(w){setOpen(false);onPrepare(w);}}}>Review test inputs</button>}<button className="ca-link" onClick={()=>download(m)}>Download report</button></div></article>)}</div><div ref={end}/></div>
 <footer className="ca-footer"><form onSubmit={e=>{e.preventDefault();ask(query);}}><input ref={input} value={query} maxLength={1000} aria-label="Ask FlowForge assistant" onChange={e=>setQuery(e.target.value)} placeholder="Ask about this workflow…"/><button disabled={!query.trim()}>Ask</button></form><small>Rule-based demo · Tests require review · No real provider actions</small></footer></section>}</>;
}
