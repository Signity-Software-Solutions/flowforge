"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Workflow,
  Zap,
  CheckCircle2,
  Clock,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Plus,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatDuration, formatRelativeTime } from "@/lib/utils";

interface DashboardData {
  stats: {
    activeWorkflows: number;
    executionsToday: number;
    successRate: number;
    hoursSaved: number;
  };
  trends: {
    activeWorkflows: number;
    executionsToday: number;
    successRate: number;
    hoursSaved: number;
  };
  executionTrend: Array<{ date: string; success: number; failed: number }>;
  recentExecutions: Array<{
    id: string;
    workflowName: string;
    status: string;
    startedAt: string;
    durationMs: number | null;
    triggeredBy: string;
  }>;
}

const statCards = [
  {
    key: "activeWorkflows" as const,
    label: "Active Workflows",
    icon: Workflow,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    key: "executionsToday" as const,
    label: "Executions Today",
    icon: Zap,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    key: "successRate" as const,
    label: "Success Rate",
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    suffix: "%",
  },
  {
    key: "hoursSaved" as const,
    label: "Hours Saved",
    icon: Clock,
    color: "text-violet-600",
    bg: "bg-violet-50",
    suffix: "h",
  },
];

const statusVariant: Record<string, "success" | "destructive" | "warning" | "secondary"> = {
  SUCCESS: "success",
  ERROR: "destructive",
  RUNNING: "warning",
  PENDING: "secondary",
  CANCELLED: "secondary",
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Failed to load dashboard data.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          const value = data.stats[card.key];
          const trend = data.trends[card.key];
          const isPositive = trend >= 0;

          return (
            <Card key={card.key}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg",
                      card.bg
                    )}
                  >
                    <Icon className={cn("h-5 w-5", card.color)} />
                  </div>
                  <div
                    className={cn(
                      "flex items-center gap-1 text-xs font-medium",
                      isPositive ? "text-emerald-600" : "text-red-600"
                    )}
                  >
                    {isPositive ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {Math.abs(trend)}%
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold">
                    {value}
                    {card.suffix || ""}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {card.label}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Execution Trend Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Execution Trend</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.executionTrend}>
                  <defs>
                    <linearGradient
                      id="successGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="hsl(142, 71%, 45%)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(142, 71%, 45%)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                    <linearGradient
                      id="failedGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="hsl(0, 84%, 60%)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(0, 84%, 60%)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(v) => {
                      const d = new Date(v);
                      return d.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                    }}
                    tick={{ fontSize: 12 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    labelFormatter={(v: unknown) => {
                      const d = new Date(String(v));
                      return d.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      });
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="success"
                    stroke="hsl(142, 71%, 45%)"
                    fill="url(#successGradient)"
                    strokeWidth={2}
                    name="Successful"
                  />
                  <Area
                    type="monotone"
                    dataKey="failed"
                    stroke="hsl(0, 84%, 60%)"
                    fill="url(#failedGradient)"
                    strokeWidth={2}
                    name="Failed"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/workflows">
              <Button className="w-full justify-start gap-2" variant="outline">
                <Plus className="h-4 w-4" />
                Create Workflow
              </Button>
            </Link>
            <Link href="/workflows">
              <Button
                className="w-full justify-start gap-2 mt-2"
                variant="outline"
              >
                <Workflow className="h-4 w-4" />
                View All Workflows
              </Button>
            </Link>
            <Link href="/history">
              <Button
                className="w-full justify-start gap-2 mt-2"
                variant="outline"
              >
                <Zap className="h-4 w-4" />
                Execution History
              </Button>
            </Link>
            <Link href="/integrations">
              <Button
                className="w-full justify-start gap-2 mt-2"
                variant="outline"
              >
                <CheckCircle2 className="h-4 w-4" />
                Manage Integrations
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Executions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base">Recent Executions</CardTitle>
            <CardDescription>Latest workflow runs</CardDescription>
          </div>
          <Link href="/history">
            <Button variant="ghost" size="sm" className="gap-1">
              View all
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">Workflow</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 pr-4 font-medium">Started</th>
                  <th className="pb-3 pr-4 font-medium">Duration</th>
                  <th className="pb-3 font-medium">Triggered By</th>
                </tr>
              </thead>
              <tbody>
                {data.recentExecutions.map((exec) => (
                  <tr
                    key={exec.id}
                    className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-3 pr-4 font-medium">
                      {exec.workflowName}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant={statusVariant[exec.status] || "secondary"}>
                        {exec.status}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {formatRelativeTime(exec.startedAt)}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {exec.durationMs ? formatDuration(exec.durationMs) : "—"}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {exec.triggeredBy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-4 w-12" />
              </div>
              <div className="mt-3 space-y-2">
                <Skeleton className="h-7 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-20 mt-1" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[280px] w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-3 w-20 mt-1" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full mb-2" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
