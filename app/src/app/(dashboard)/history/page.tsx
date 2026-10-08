"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Loader2,
  XCircle,
  MinusCircle,
  Calendar,
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
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatDuration, formatRelativeTime } from "@/lib/utils";

interface ExecutionStep {
  id: string;
  nodeName: string;
  nodeType: string;
  status: string;
  durationMs: number | null;
  errorMessage: string | null;
}

interface Execution {
  id: string;
  workflowId: string;
  workflowName: string;
  status: string;
  startedAt: string;
  finishedAt: string | null;
  durationMs: number | null;
  triggeredBy: string;
  errorMessage: string | null;
  steps: ExecutionStep[];
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const statusVariant: Record<string, "success" | "destructive" | "warning" | "secondary"> = {
  SUCCESS: "success",
  ERROR: "destructive",
  RUNNING: "warning",
  PENDING: "secondary",
  CANCELLED: "secondary",
};

const statusIcon: Record<string, typeof CheckCircle2> = {
  SUCCESS: CheckCircle2,
  ERROR: XCircle,
  RUNNING: Loader2,
  PENDING: MinusCircle,
  CANCELLED: MinusCircle,
};

export default function HistoryPage() {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const fetchExecutions = useCallback(
    async (page = 1) => {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "10");
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (search) params.set("search", search);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);

      try {
        const res = await fetch(`/api/executions?${params}`);
        const data = await res.json();
        setExecutions(data.executions || []);
        setPagination(data.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 });
      } catch {
        setExecutions([]);
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, search, dateFrom, dateTo]
  );

  useEffect(() => {
    fetchExecutions(1);
  }, [fetchExecutions]);

  const handleRetry = async (execId: string) => {
    setRetryingId(execId);
    try {
      await fetch(`/api/executions/${execId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PENDING" }),
      });
      await fetchExecutions(pagination.page);
    } catch {
      // silently fail
    } finally {
      setRetryingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search workflows..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-[130px]"
                >
                  <option value="ALL">All Status</option>
                  <option value="RUNNING">Running</option>
                  <option value="SUCCESS">Success</option>
                  <option value="ERROR">Failed</option>
                  <option value="PENDING">Pending</option>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-[140px]"
                  placeholder="From"
                />
                <span className="text-muted-foreground text-sm">to</span>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-[140px]"
                  placeholder="To"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Executions Table */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Execution History</CardTitle>
              <CardDescription>
                {pagination.total} total execution{pagination.total !== 1 ? "s" : ""}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : executions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No executions found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 pr-2 font-medium w-8"></th>
                    <th className="pb-3 pr-4 font-medium">Workflow</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 pr-4 font-medium">Started</th>
                    <th className="pb-3 pr-4 font-medium">Duration</th>
                    <th className="pb-3 pr-4 font-medium">Triggered By</th>
                    <th className="pb-3 font-medium w-20">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {executions.map((exec) => {
                    const isExpanded = expandedId === exec.id;
                    return (
                      <ExecutionRow
                        key={exec.id}
                        exec={exec}
                        isExpanded={isExpanded}
                        onToggle={() =>
                          setExpandedId(isExpanded ? null : exec.id)
                        }
                        onRetry={() => handleRetry(exec.id)}
                        isRetrying={retryingId === exec.id}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => fetchExecutions(pagination.page - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchExecutions(pagination.page + 1)}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ExecutionRow({
  exec,
  isExpanded,
  onToggle,
  onRetry,
  isRetrying,
}: {
  exec: Execution;
  isExpanded: boolean;
  onToggle: () => void;
  onRetry: () => void;
  isRetrying: boolean;
}) {
  return (
    <>
      <tr
        className={cn(
          "border-b hover:bg-muted/50 transition-colors cursor-pointer",
          isExpanded && "bg-muted/30"
        )}
        onClick={onToggle}
      >
        <td className="py-3 pr-2">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </td>
        <td className="py-3 pr-4 font-medium">{exec.workflowName}</td>
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
        <td className="py-3 pr-4 text-muted-foreground">{exec.triggeredBy}</td>
        <td className="py-3">
          {exec.status === "ERROR" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onRetry();
              }}
              disabled={isRetrying}
              className="gap-1 text-xs"
            >
              {isRetrying ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RotateCcw className="h-3 w-3" />
              )}
              Retry
            </Button>
          )}
        </td>
      </tr>
      {isExpanded && exec.steps && exec.steps.length > 0 && (
        <tr>
          <td colSpan={7} className="p-0">
            <div className="bg-muted/20 px-8 py-4 border-b">
              <p className="text-xs font-medium text-muted-foreground mb-3">
                Execution Steps
              </p>
              <div className="space-y-2">
                {exec.steps.map((step) => {
                  const StepIcon =
                    statusIcon[step.status] || MinusCircle;
                  return (
                    <div
                      key={step.id}
                      className="flex items-center gap-3 text-sm"
                    >
                      <StepIcon
                        className={cn(
                          "h-4 w-4 flex-shrink-0",
                          step.status === "SUCCESS" && "text-emerald-500",
                          step.status === "ERROR" && "text-red-500",
                          step.status === "RUNNING" && "text-amber-500 animate-spin",
                          step.status === "CANCELLED" && "text-muted-foreground",
                          step.status === "PENDING" && "text-muted-foreground"
                        )}
                      />
                      <span className="font-medium min-w-[140px]">
                        {step.nodeName}
                      </span>
                      <Badge
                        variant={statusVariant[step.status] || "secondary"}
                        className="text-[10px]"
                      >
                        {step.status}
                      </Badge>
                      <span className="text-muted-foreground text-xs">
                        {step.durationMs
                          ? formatDuration(step.durationMs)
                          : "—"}
                      </span>
                      {step.errorMessage && (
                        <span className="text-xs text-red-500 truncate max-w-[300px]">
                          {step.errorMessage}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              {exec.errorMessage && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-xs text-red-700">{exec.errorMessage}</p>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
