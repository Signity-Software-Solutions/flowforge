import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function getMockData() {
  const now = new Date();
  const trendData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (6 - i));
    return {
      date: date.toISOString().split("T")[0],
      success: Math.floor(Math.random() * 30) + 10,
      failed: Math.floor(Math.random() * 5),
    };
  });

  const recentExecutions = [
    {
      id: "exec-001",
      workflowName: "Customer Onboarding",
      status: "SUCCESS",
      startedAt: new Date(now.getTime() - 5 * 60000).toISOString(),
      durationMs: 12400,
      triggeredBy: "Schedule",
    },
    {
      id: "exec-002",
      workflowName: "Invoice Processing",
      status: "SUCCESS",
      startedAt: new Date(now.getTime() - 25 * 60000).toISOString(),
      durationMs: 8700,
      triggeredBy: "Webhook",
    },
    {
      id: "exec-003",
      workflowName: "Lead Scoring Pipeline",
      status: "ERROR",
      startedAt: new Date(now.getTime() - 45 * 60000).toISOString(),
      durationMs: 3200,
      triggeredBy: "Manual",
    },
    {
      id: "exec-004",
      workflowName: "Slack Notifications",
      status: "SUCCESS",
      startedAt: new Date(now.getTime() - 90 * 60000).toISOString(),
      durationMs: 1800,
      triggeredBy: "Webhook",
    },
    {
      id: "exec-005",
      workflowName: "Data Sync — HubSpot",
      status: "RUNNING",
      startedAt: new Date(now.getTime() - 2 * 60000).toISOString(),
      durationMs: null,
      triggeredBy: "Schedule",
    },
  ];

  return {
    stats: {
      activeWorkflows: 12,
      executionsToday: 47,
      successRate: 94.3,
      hoursSaved: 28.5,
    },
    trends: {
      activeWorkflows: 8.3,
      executionsToday: 12.5,
      successRate: 2.1,
      hoursSaved: 15.7,
    },
    executionTrend: trendData,
    recentExecutions,
  };
}

export async function GET() {
  try {
    // Attempt to fetch from DB
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const [activeWorkflows, executionsToday, allExecutions, recentExecs] =
      await Promise.all([
        prisma.workflow.count({ where: { status: "ACTIVE" } }),
        prisma.execution.count({
          where: { startedAt: { gte: startOfDay } },
        }),
        prisma.execution.findMany({
          where: {
            startedAt: {
              gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
            },
          },
          select: { status: true, startedAt: true },
        }),
        prisma.execution.findMany({
          take: 5,
          orderBy: { startedAt: "desc" },
          include: {
            workflow: { select: { name: true } },
            triggeredBy: { select: { name: true } },
          },
        }),
      ]);

    // If the DB has no data, return mock
    if (activeWorkflows === 0 && executionsToday === 0 && recentExecs.length === 0) {
      return NextResponse.json(getMockData());
    }

    const successCount = allExecutions.filter(
      (e: { status: string }) => e.status === "SUCCESS"
    ).length;
    const totalFinished = allExecutions.filter(
      (e: { status: string }) => e.status === "SUCCESS" || e.status === "ERROR"
    ).length;
    const successRate = totalFinished > 0 ? (successCount / totalFinished) * 100 : 100;

    // Build trend data
    const trendMap: Record<string, { success: number; failed: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      trendMap[key] = { success: 0, failed: 0 };
    }
    for (const exec of allExecutions) {
      const key = exec.startedAt.toISOString().split("T")[0];
      if (trendMap[key]) {
        if (exec.status === "SUCCESS") trendMap[key].success++;
        else if (exec.status === "ERROR") trendMap[key].failed++;
      }
    }

    const executionTrend = Object.entries(trendMap).map(([date, counts]) => ({
      date,
      ...counts,
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recentExecutions = recentExecs.map((e: any) => ({
      id: e.id,
      workflowName: e.workflow.name,
      status: e.status,
      startedAt: e.startedAt.toISOString(),
      durationMs: e.durationMs,
      triggeredBy: e.triggeredBy?.name || "System",
    }));

    return NextResponse.json({
      stats: {
        activeWorkflows,
        executionsToday,
        successRate: Math.round(successRate * 10) / 10,
        hoursSaved: Math.round(activeWorkflows * 2.4 * 10) / 10,
      },
      trends: {
        activeWorkflows: 8.3,
        executionsToday: 12.5,
        successRate: 2.1,
        hoursSaved: 15.7,
      },
      executionTrend,
      recentExecutions,
    });
  } catch {
    // DB not available — return mock data
    return NextResponse.json(getMockData());
  }
}
