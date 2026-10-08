import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/workflows — list workflows with optional pagination and status filter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "50", 10);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status && ["DRAFT", "ACTIVE", "INACTIVE", "ERROR"].includes(status)) {
      where.status = status;
    }

    const [workflows, total] = await Promise.all([
      prisma.workflow.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          lastExecutedAt: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { executions: true },
          },
        },
      }),
      prisma.workflow.count({ where }),
    ]);

    return NextResponse.json({
      workflows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Failed to list workflows:", error);
    return NextResponse.json(
      { error: "Failed to fetch workflows" },
      { status: 500 }
    );
  }
}

// POST /api/workflows — create a new workflow
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, nodes, edges } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // For now, use the first user as the creator (replace with auth later)
    let user = await prisma.user.findFirst();
    if (!user) {
      // Create a default system user if none exists
      user = await prisma.user.create({
        data: {
          email: "system@flowforge.local",
          name: "System",
          password: "not-a-real-password",
        },
      });
    }

    const workflow = await prisma.workflow.create({
      data: {
        name,
        description: description ?? null,
        nodes: nodes ?? [],
        edges: edges ?? [],
        status: "DRAFT",
        createdById: user.id,
      },
    });

    return NextResponse.json(workflow, { status: 201 });
  } catch (error) {
    console.error("Failed to create workflow:", error);
    return NextResponse.json(
      { error: "Failed to create workflow" },
      { status: 500 }
    );
  }
}
