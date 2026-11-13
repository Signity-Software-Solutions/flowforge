import type { DemoWorkflow, DemoExecution } from './types';
export interface AssistantAnswer { title:string; text:string; columns?:string[]; rows?:unknown[][]; links?:{label:string;href:string}[]; prepareId?:string }
export function workflowAnswer(workflows:DemoWorkflow[],executions:DemoExecution[],disconnected:string[],id:string,query:string):AssistantAnswer {
 const workflow=workflows.find(w=>w.id===id);
 if(id!=='all'&&!workflow)return {title:'Workflow unavailable',text:'Select an existing workflow.'};
 const scope=workflow?[workflow]:workflows;
 const runs=executions.filter(r=>!workflow||r.workflowId===workflow.id);
 const links=workflow?[{label:'Open workflow canvas',href:`/workflows/${workflow.id}`}]:[{label:'Workflow library',href:'/workflows'}];
 if(/prepare|test|retry|execute/i.test(query))return workflow?{title:'Review a test run',text:`Open the test dialog for ${workflow.name} to review its sample input and choose success or failure. Nothing has run yet. Provider actions will be simulated.`,prepareId:workflow.id,links}:{title:'Select a workflow',text:'Choose a workflow above before preparing a test run.'};
 if(/connect|provider|ready|readiness/i.test(query))return {title:'Connection readiness',text:'Current virtual-provider availability. Connections do not access real accounts.',columns:['Workflow','Provider','Status'],rows:scope.flatMap(w=>w.providers.map(p=>[w.name,p,disconnected.includes(p)?'Disconnected':'Virtual connection ready'])),links:[{label:'Review connections',href:'/integrations'}]};
 if(/fail|error|diagnos/i.test(query)) {
  const failed=runs.filter(r=>r.status==='ERROR');
  return {title:'Failure diagnostics',text:`${failed.length} failed runs in scope. Inspect the recorded error, review input mappings and provider connections, then prepare a new test.`,columns:['Run','Workflow','Failed step','Recorded error'],rows:failed.map(r=>{const step=r.steps.find(s=>s.status==='ERROR');return [r.id,r.workflowName,step?.nodeName,step?.errorMessage||'Inspect run trace'];}),links:[...links,{label:'Inspect run traces',href:'/history'}]};
 }
 if(/mapping|input|field/i.test(query))return workflow?{title:'Input and mapping reference',text:'These are saved workflow inputs and node configurations. The canvas is the source of truth for edits; chat does not change mappings.',columns:['Node','Configuration'],rows:[['Sample input',JSON.stringify(workflow.input)],...workflow.nodes.map(n=>[n.data.label,JSON.stringify(n.data.config)])],links}:{title:'Select a workflow',text:'Choose a workflow to inspect its input and mapping configuration.'};
 if(/explain|step|how|outcome/i.test(query))return {title:'Workflow walkthrough',text:workflow?`${workflow.problem}\n\n${workflow.description}\n\nExpected business outcome: ${workflow.outcome}\n\n${workflow.manualMinutes} assumed manual minutes per successful run; this is a demo estimate.`:'Select a workflow for its complete walkthrough.',columns:workflow?['Step','Provider']:undefined,rows:workflow?.nodes.map(n=>[n.data.label,String(n.data.config.provider||'Internal')]),links};
 if(/report|saved|saving|history|run/i.test(query)) {
  const succeeded=runs.filter(r=>r.status==='SUCCESS');
  return {title:'Run performance report',text:`${runs.length} recorded runs; ${succeeded.length} successful; ${runs.length-succeeded.length} failed. ${succeeded.reduce((n,r)=>n+r.minutesSaved,0)} estimated manual minutes avoided. Sample history is labeled separately; these are not measured client outcomes.`,columns:['Run','Workflow','Status','Started','Estimated minutes','Origin'],rows:runs.map(r=>[r.id,r.workflowName,r.status,r.startedAt,r.status==='SUCCESS'?r.minutesSaved:0,r.seeded?'Seeded sample':'Browser demo run']),links:[{label:'Run history',href:'/history'}]};
 }
 const words=query.toLowerCase().split(/\W+/).filter(x=>x.length>2&&!['the','and','for','with','want','need','find','automate','workflow'].includes(x));
 const matches=workflows.map(w=>({w,score:words.reduce((n,x)=>n+(JSON.stringify([w.name,w.description,w.problem,w.providers,w.category]).toLowerCase().includes(x)?1:0),0)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,4);
 return {title:matches.length?'Matching workflow templates':'Available automation tasks',text:matches.length?'These existing templates match words in your request. Review their steps and sample inputs before testing.':'Ask to explain a workflow, inspect mappings, diagnose failures, check connections, prepare a test, or report results. Describe a business process to find a template.',links:matches.map(({w})=>({label:w.name,href:`/workflows/${w.id}`}))};
}
