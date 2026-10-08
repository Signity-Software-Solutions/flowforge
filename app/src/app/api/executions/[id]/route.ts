import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getMockExecution(id: string) {
  return {
    id,
    workflowId: "wf-1",
    workflowName: "Customer Onboarding",
    status: "ERROR",
    startedAt: new Date(Date.now() - 45 * 60000).toISOString(),
    finishedAt: new Date(Date.now() - 44 * 60000).toISOString(),
    durationMs: 3200,
    triggeredBy: "Manual",
    errorMessage: "Connection timeout: upstream service did not respond within 30s",
    steps: [
      {
        id: "step-1",
        nodeName: "Trigger",
        nodeType: "trigger",
        status: "SUCCESS",
        durationMs: 120,
        errorMessage: null,
      },
      {
        id: "step-2",
        nodeName: "Fetch Customer Data",
        nodeType: "httpRequest",
        status: "SUCCESS",
        durationMs: 850,
        errorMessage: null,
      },
      {
        id: "step-3",
        nodeName: "Send to CRM",
        nodeType: "httpRequest",
        status: "ERROR",
        durationMs: 3100,
        errorMessage: "Connection timeout: upstream service did not respond within 30s",
      },
      {
        id: "step-4",
        nodeName: "Notify Team",
        nodeType: "slack",
        status: "CANCELLED",
        durationMs: null,
        errorMessage: null,
      },
    ],
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const execution = await prisma.execution.findUnique({
      where: { id },
      include: {
        workflow: { select: { name: true } },
        triggeredBy: { select: { name: true } },
        steps: { orderBy: { order: "asc" } },
      },
    });

    if (!execution) {
      return NextResponse.json(getMockExecution(id));
    }

    return NextResponse.json({
      id: execution.id,
      workflowId: execution.workflowId,
      workflowName: execution.workflow.name,
      status: execution.status,
      startedAt: execution.startedAt.toISOString(),
      finishedAt: execution.finishedAt?.toISOString() || null,
      durationMs: execution.durationMs,
      triggeredBy: execution.triggeredBy?.name || "System",
      errorMessage: execution.errorMessage,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      steps: execution.steps.map((s: any) => ({
        id: s.id,
        nodeName: s.nodeName,
        nodeType: s.nodeType,
        status: s.status,
        durationMs: s.durationMs,
        errorMessage: s.errorMessage,
      })),
    });
  } catch {
    return NextResponse.json(getMockExecution(id));
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  try {
    const execution = await prisma.execution.update({
      where: { id },
      data: {
        status: body.status || "PENDING",
        errorMessage: null,
        startedAt: new Date(),
        finishedAt: null,
        durationMs: null,
      },
      include: {
        workflow: { select: { name: true } },
      },
    });

    return NextResponse.json({
      id: execution.id,
      status: execution.status,
      workflowName: execution.workflow.name,
      message: "Execution retry initiated",
    });
  } catch {
    // Mock retry response
    return NextResponse.json({
      id,
      status: body.status || "PENDING",
      workflowName: "Mock Workflow",
      message: "Execution retry initiated (mock)",
    });
  }
}
