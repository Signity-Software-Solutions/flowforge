import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/workflows/[id] — fetch a single workflow
export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const workflow = await prisma.workflow.findUnique({
      where: { id },
      include: {
        _count: { select: { executions: true } },
      },
    });

    if (!workflow) {
      return NextResponse.json(
        { error: "Workflow not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(workflow);
  } catch (error) {
    console.error("Failed to fetch workflow:", error);
    return NextResponse.json(
      { error: "Failed to fetch workflow" },
      { status: 500 }
    );
  }
}

// PATCH /api/workflows/[id] — update a workflow
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const existing = await prisma.workflow.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Workflow not found" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.nodes !== undefined) updateData.nodes = body.nodes;
    if (body.edges !== undefined) updateData.edges = body.edges;
    if (body.status !== undefined) updateData.status = body.status;

    // Increment version when nodes/edges change
    if (body.nodes !== undefined || body.edges !== undefined) {
      updateData.currentVersion = existing.currentVersion + 1;

      // Save a version snapshot
      await prisma.workflowVersion.create({
        data: {
          workflowId: id,
          versionNumber: existing.currentVersion + 1,
          nodes: body.nodes ?? existing.nodes,
          edges: body.edges ?? existing.edges,
          notes: body.versionNotes ?? null,
        },
      });
    }

    const workflow = await prisma.workflow.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(workflow);
  } catch (error) {
    console.error("Failed to update workflow:", error);
    return NextResponse.json(
      { error: "Failed to update workflow" },
      { status: 500 }
    );
  }
}

// DELETE /api/workflows/[id] — delete a workflow
export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const existing = await prisma.workflow.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Workflow not found" },
        { status: 404 }
      );
    }

    await prisma.workflow.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete workflow:", error);
    return NextResponse.json(
      { error: "Failed to delete workflow" },
      { status: 500 }
    );
  }
}
