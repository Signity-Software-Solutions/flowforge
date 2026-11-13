const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');

// Exercise the actual TypeScript engine with Node's built-in runner; no test runtime dependency.
require.extensions['.ts'] = (module, filename) => {
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } });
  module._compile(outputText, filename);
};
const { WORKFLOWS, PROVIDERS } = require('../src/lib/demo/catalog.ts');
const { simulateWorkflow, resolveMapping, executionStats } = require('../src/lib/demo/engine.ts');
const get = id => structuredClone(WORKFLOWS.find(w => w.id === id));

for (const workflow of WORKFLOWS) {
  test(`${workflow.id}: full sample reaches a useful business output`, () => {
    const run = simulateWorkflow(workflow, workflow.input);
    assert.equal(run.status, 'SUCCESS');
    assert.ok(run.steps.some(s => s.outputData.message || s.outputData.billStatus));
    assert.ok(run.minutesSaved > 0);
    for (const node of workflow.nodes) assert.ok(PROVIDERS.some(p => p.id === node.data.config.provider));
    assert.ok(!JSON.stringify(run.steps).includes('{{'));
  });
}

test('qualified leads notify sales and skip nurture', () => {
  const w = get('lead-qualification');
  const run = simulateWorkflow(w, w.input);
  assert.equal(run.steps.find(s => s.provider === 'slack').status, 'SUCCESS');
  assert.equal(run.steps.find(s => s.provider === 'gmail').status, 'CANCELLED');
  assert.equal(run.steps.find(s => s.nodeName === 'Score lead intent').outputData.leadScore, 92);
});
test('small-budget leads take the nurture branch and skip sales', () => {
  const w = get('lead-qualification');
  const run = simulateWorkflow(w, w.alternateInput);
  assert.equal(run.steps.find(s => s.provider === 'slack').status, 'CANCELLED');
  assert.equal(run.steps.find(s => s.provider === 'gmail').outputData.to, w.alternateInput.email);
});
test('edited trigger values carry through all provider mappings', () => {
  const w = get('order-fulfillment');
  const run = simulateWorkflow(w, { ...w.input, name: 'Demo Buyer', email: 'buyer@example.com', total: 420, quantity: 7 });
  assert.equal(run.steps.find(s => s.provider === 'stripe').outputData.chargedAmount, 420);
  const email = run.steps.find(s => s.provider === 'gmail').outputData;
  assert.equal(email.to, 'buyer@example.com');
  assert.match(email.message, /Demo Buyer.*420/);
});
test('provider failure stops downstream actions, retry succeeds as a new run', () => {
  const w = get('order-fulfillment');
  const failed = simulateWorkflow(w, w.input, { fail: true, id: 'failure' });
  assert.equal(failed.status, 'ERROR');
  assert.equal(failed.minutesSaved, 0);
  assert.equal(failed.steps.find(s => s.provider === 'gmail').status, 'CANCELLED');
  const retry = simulateWorkflow(w, failed.input, { retryOf: failed.id, id: 'retry' });
  assert.equal(retry.status, 'SUCCESS');
  assert.equal(retry.retryOf, 'failure');
  assert.notEqual(retry.id, failed.id);
});
test('paused virtual connections block relevant steps', () => {
  const w = get('invoice-processing');
  const run = simulateWorkflow(w, w.input, { disconnected: ['quickbooks'] });
  assert.equal(run.status, 'ERROR');
  assert.match(run.steps.find(s => s.status === 'ERROR').errorMessage, /paused/);
});
test('invalid invoice totals stop bill creation', () => {
  const w = get('invoice-processing');
  const run = simulateWorkflow(w, { ...w.input, total: 5000 });
  assert.equal(run.status, 'ERROR');
  assert.equal(run.steps.find(s => s.provider === 'quickbooks').status, 'CANCELLED');
});
test('missing mapped data produces an actionable error', () => {
  assert.throws(() => resolveMapping('{{missing}}', {}), /Missing mapped field/);
  assert.equal(resolveMapping('{{amount}}', { amount: 123 }), 123);
  assert.equal(resolveMapping('Hello {{customer.name}}', { customer: { name: 'Demo' } }), 'Hello Demo');
  assert.throws(() => resolveMapping('{{constructor.name}}', {}), /Missing/);
});
test('edited mapping is used by the engine', () => {
  const w = get('appointment-followup');
  w.nodes[2].data.config.fields.subject = 'See you soon, {{name}}';
  const run = simulateWorkflow(w, w.input);
  assert.equal(run.steps.find(s => s.provider === 'gmail').outputData.subject, 'See you soon, Taylor Morgan');
});
test('graph order comes from edges, not array order', () => {
  const w = get('order-fulfillment');
  w.nodes.reverse();
  assert.equal(simulateWorkflow(w, w.input).status, 'SUCCESS');
});
test('invalid roots and cycles fail safely', () => {
  const w = get('order-fulfillment');
  w.edges = [];
  assert.equal(simulateWorkflow(w, w.input).status, 'ERROR');
  const cycle = get('order-fulfillment');
  cycle.edges.push({ id: 'cycle', source: cycle.nodes.at(-1).id, target: cycle.nodes[0].id });
  assert.equal(simulateWorkflow(cycle, cycle.input).status, 'ERROR');
});
test('campaign metrics are computed from sample amounts', () => {
  const w = get('campaign-report');
  const run = simulateWorkflow(w, w.input);
  const metrics = run.steps.find(s => s.provider === 'sheets').outputData;
  assert.equal(metrics.costPerLead, 15);
  assert.equal(metrics.roas, 4.5);
});
test('routine support questions get normal priority', () => {
  const w = get('support-triage');
  const run = simulateWorkflow(w, w.alternateInput);
  assert.equal(run.steps.find(s => s.provider === 'zendesk').outputData.ticketPriority, 'normal');
});
test('dashboard aggregates match actual history, excluding failed-run savings', () => {
  const w = get('client-onboarding');
  const stats = executionStats([simulateWorkflow(w, w.input), simulateWorkflow(w, w.input, { fail: true })]);
  assert.equal(stats.runs, 2);
  assert.equal(stats.successRate, 50);
  assert.equal(stats.hoursSaved, 0.6);
  assert.deepEqual(executionStats([]), { runs: 0, successRate: 0, hoursSaved: 0 });
});
