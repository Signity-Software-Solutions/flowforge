import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ id: string }>;
}

interface WorkflowNode {
  id: string;
  data: {
    label: string;
    type: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

// POST /api/workflows/[id]/execute — execute a workflow
export async function POST(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const workflow = await prisma.workflow.findUnique({
      where: { id },
    });

    if (!workflow) {
      return NextResponse.json(
        { error: "Workflow not found" },
        { status: 404 }
      );
    }

    const nodes = (workflow.nodes as WorkflowNode[]) ?? [];

    // Create execution record
    const execution = await prisma.execution.create({
      data: {
        workflowId: id,
        status: "RUNNING",
        startedAt: new Date(),
      },
    });

    // Simulate execution of each node as steps
    const steps = [];
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const durationMs = Math.floor(Math.random() * 800) + 200; // 200-1000ms simulated
      const success = Math.random() > 0.05; // 95% success rate

      steps.push({
        executionId: execution.id,
        nodeName: node.data?.label ?? `Node ${i + 1}`,
        nodeType: node.data?.type ?? "unknown",
        status: success ? ("SUCCESS" as const) : ("ERROR" as const),
        inputData: { nodeId: node.id },
        outputData: success
          ? { result: `Processed by ${node.data?.label ?? "node"}` }
          : Prisma.JsonNull,
        durationMs,
        errorMessage: success ? null : `Simulated error in ${node.data?.label ?? "node"}`,
        order: i,
      });
    }

    // Create all execution steps
    if (steps.length > 0) {
      await prisma.executionStep.createMany({ data: steps });
    }

    // Determine overall status
    const hasError = steps.some((s) => s.status === "ERROR");
    const totalDuration = steps.reduce((sum, s) => sum + (s.durationMs ?? 0), 0);

    // Update execution with final status
    const updatedExecution = await prisma.execution.update({
      where: { id: execution.id },
      data: {
        status: hasError ? "ERROR" : "SUCCESS",
        finishedAt: new Date(),
        durationMs: totalDuration,
        errorMessage: hasError ? "One or more steps failed" : null,
      },
      include: {
        steps: {
          orderBy: { order: "asc" },
        },
      },
    });

    // Update workflow lastExecutedAt
    await prisma.workflow.update({
      where: { id },
      data: { lastExecutedAt: new Date() },
    });

    return NextResponse.json({
      executionId: updatedExecution.id,
      status: updatedExecution.status,
      durationMs: updatedExecution.durationMs,
      steps: updatedExecution.steps,
    });
  } catch (error) {
    console.error("Failed to execute workflow:", error);
    return NextResponse.json(
      { error: "Failed to execute workflow" },
      { status: 500 }
    );
  }
}
