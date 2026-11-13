"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { WORKFLOWS } from "./catalog";
import { simulateWorkflow } from "./engine";
import type { DemoWorkflow, DemoExecution, Payload } from "./types";

function startingState() {
  const workflows = structuredClone(WORKFLOWS);
  const executions = workflows.flatMap((workflow, index) => [0, 1, 2].map(day => ({
    ...simulateWorkflow(workflow, workflow.input, { id: `sample-${workflow.id}-${day}`, startedAt: new Date(Date.now() - (day * 24 + index + 1) * 3600000).toISOString(), fail: day === 2 && index === 4 }), seeded: true,
  }))).sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  return { workflows, executions, disconnected: [] as string[] };
}

interface DemoState {
  workflows: DemoWorkflow[];
  executions: DemoExecution[];
  disconnected: string[];
  initialized: boolean;
  activeRun: DemoExecution | null;
  activeStep: number;
  running: boolean;
  storageError: string | null;
  initialize: () => void;
  reset: () => void;
  saveWorkflow: (workflow: DemoWorkflow) => void;
  setConnection: (id: string, connected: boolean) => void;
  run: (workflow: DemoWorkflow, input: Payload, fail?: boolean, retryOf?: string) => Promise<void>;
}

let storageWarningShown = false;
const safeStorage = {
  getItem(name: string) { try { return localStorage.getItem(name); } catch { return null; } },
  setItem(name: string, value: string) { try { localStorage.setItem(name, value); } catch { if (!storageWarningShown) { storageWarningShown = true; queueMicrotask(() => useDemoStore.setState({ storageError: "Browser storage is unavailable. This session works, but changes may be lost on refresh." })); } } },
  removeItem(name: string) { try { localStorage.removeItem(name); } catch { /* session-only mode */ } },
};

export const useDemoStore = create<DemoState>()(persist((set, get) => ({
  workflows: [], executions: [], disconnected: [], initialized: false,
  activeRun: null, activeStep: -1, running: false, storageError: null,
  initialize: () => { if (!get().initialized) set({ ...startingState(), initialized: true }); },
  reset: () => { if (!get().running) set({ ...startingState(), activeRun: null, activeStep: -1, initialized: true }); },
  saveWorkflow: workflow => set(state => ({ workflows: state.workflows.some(w => w.id === workflow.id) ? state.workflows.map(w => w.id === workflow.id ? workflow : w) : [...state.workflows, workflow] })),
  setConnection: (id, connected) => set(state => ({ disconnected: connected ? state.disconnected.filter(p => p !== id) : Array.from(new Set([...state.disconnected, id])) })),
  run: async (workflow, input, fail = false, retryOf) => {
    if (get().running) return;
    const execution = simulateWorkflow(workflow, input, { fail, retryOf, disconnected: get().disconnected, id: `demo-${crypto.randomUUID()}` });
    set({ running: true, activeRun: execution, activeStep: -1 });
    for (let i = 0; i < execution.steps.length; i++) {
      set({ activeStep: i });
      if (execution.steps[i].status !== "CANCELLED") await new Promise(resolve => setTimeout(resolve, execution.steps[i].durationMs));
    }
    set(state => ({ running: false, activeStep: execution.steps.length, executions: [execution, ...state.executions].slice(0, 200) }));
  },
}), {
  name: "flowforge-client-demo-v1", version: 1, skipHydration: true,
  storage: createJSONStorage(() => safeStorage),
  partialize: state => ({ workflows: state.workflows, executions: state.executions, disconnected: state.disconnected, initialized: state.initialized }),
  // Invalid/old browser data should never prevent a client presentation from loading.
  merge: (saved, current) => {
    const data = saved as Partial<DemoState> | undefined;
    if (!data || !Array.isArray(data.workflows) || !Array.isArray(data.executions) || !Array.isArray(data.disconnected)) return current;
    if (!data.workflows.every(w => w && typeof w.id === "string" && Array.isArray(w.nodes) && Array.isArray(w.edges))) return current;
    return { ...current, workflows: data.workflows, executions: data.executions, disconnected: data.disconnected, initialized: true };
  },
}));
