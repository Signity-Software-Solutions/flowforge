import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getMockExecutions() {
  const now = new Date();
  const statuses = ["SUCCESS", "SUCCESS", "SUCCESS", "ERROR", "RUNNING", "SUCCESS", "SUCCESS", "ERROR", "SUCCESS", "SUCCESS"] as const;
  const workflows = [
    "Customer Onboarding",
    "Invoice Processing",
    "Lead Scoring Pipeline",
    "Slack Notifications",
    "Data Sync — HubSpot",
    "Email Campaign Trigger",
    "Support Ticket Routing",
    "Daily Report Generator",
    "Inventory Alert System",
    "Webhook Relay",
  ];
  const triggers = ["Schedule", "Webhook", "Manual", "Schedule", "Webhook", "Schedule", "Webhook", "Manual", "Schedule", "Webhook"];

  const executions = Array.from({ length: 24 }, (_, i) => ({
    id: `mock-exec-${String(i + 1).padStart(3, "0")}`,
    workflowId: `wf-${(i % 10) + 1}`,
    workflowName: workflows[i % 10],
    status: statuses[i % statuses.length],
    startedAt: new Date(now.getTime() - i * 45 * 60000).toISOString(),
    finishedAt:
      statuses[i % statuses.length] === "RUNNING"
        ? null
        : new Date(now.getTime() - i * 45 * 60000 + (2000 + Math.random() * 15000)).toISOString(),
    durationMs:
      statuses[i % statuses.length] === "RUNNING"
        ? null
        : Math.floor(2000 + Math.random() * 15000),
    triggeredBy: triggers[i % 10],
    errorMessage:
      statuses[i % statuses.length] === "ERROR"
        ? "Connection timeout: upstream service did not respond within 30s"
        : null,
    steps:
      statuses[i % statuses.length] !== "RUNNING"
        ? [
            {
              id: `step-${i}-1`,
              nodeName: "Trigger",
              nodeType: "trigger",
              status: "SUCCESS",
              durationMs: 120,
            },
            {
              id: `step-${i}-2`,
              nodeName: "Process Data",
              nodeType: "function",
              status: statuses[i % statuses.length] === "ERROR" ? "ERROR" : "SUCCESS",
              durationMs: statuses[i % statuses.length] === "ERROR" ? 3100 : 850,
              errorMessage:
                statuses[i % statuses.length] === "ERROR"
                  ? "Connection timeout"
                  : null,
            },
            {
              id: `step-${i}-3`,
              nodeName: "Send Output",
              nodeType: "action",
              status:
                statuses[i % statuses.length] === "ERROR" ? "CANCELLED" : "SUCCESS",
              durationMs:
                statuses[i % statuses.length] === "ERROR" ? null : 430,
            },
          ]
        : [],
  }));

  return executions;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const workflowId = searchParams.get("workflowId");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (status && status !== "ALL") {
      where.status = status;
    }
    if (workflowId) {
      where.workflowId = workflowId;
    }
    if (dateFrom) {
      where.startedAt = { ...(where.startedAt || {}), gte: new Date(dateFrom) };
    }
    if (dateTo) {
      where.startedAt = { ...(where.startedAt || {}), lte: new Date(dateTo) };
    }
    if (search) {
      where.workflow = { name: { contains: search, mode: "insensitive" } };
    }

    const [total, executions] = await Promise.all([
      prisma.execution.count({ where }),
      prisma.execution.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { startedAt: "desc" },
        include: {
          workflow: { select: { name: true } },
          triggeredBy: { select: { name: true } },
          steps: {
            orderBy: { order: "asc" },
          },
        },
      }),
    ]);

    if (total === 0 && !status && !workflowId && !search) {
      // DB empty — return mock data
      let mocks = getMockExecutions();

      if (search) {
        mocks = mocks.filter((m) =>
          m.workflowName.toLowerCase().includes(search.toLowerCase())
        );
      }

      const totalMock = mocks.length;
      const paged = mocks.slice((page - 1) * limit, page * limit);

      return NextResponse.json({
        executions: paged,
        pagination: {
          page,
          limit,
          total: totalMock,
          totalPages: Math.ceil(totalMock / limit),
        },
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapped = executions.map((e: any) => ({
      id: e.id,
      workflowId: e.workflowId,
      workflowName: e.workflow.name,
      status: e.status,
      startedAt: e.startedAt.toISOString(),
      finishedAt: e.finishedAt?.toISOString() || null,
      durationMs: e.durationMs,
      triggeredBy: e.triggeredBy?.name || "System",
      errorMessage: e.errorMessage,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      steps: e.steps.map((s: any) => ({
        id: s.id,
        nodeName: s.nodeName,
        nodeType: s.nodeType,
        status: s.status,
        durationMs: s.durationMs,
        errorMessage: s.errorMessage,
      })),
    }));

    return NextResponse.json({
      executions: mapped,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch {
    // DB not available — return filtered mock data
    let mocks = getMockExecutions();

    if (status && status !== "ALL") {
      mocks = mocks.filter((m) => m.status === status);
    }
    if (search) {
      mocks = mocks.filter((m) =>
        m.workflowName.toLowerCase().includes(search.toLowerCase())
      );
    }

    const totalMock = mocks.length;
    const paged = mocks.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      executions: paged,
      pagination: {
        page,
        limit,
        total: totalMock,
        totalPages: Math.ceil(totalMock / limit),
      },
    });
  }
}
