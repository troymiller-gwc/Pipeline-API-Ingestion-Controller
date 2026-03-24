import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";
import { Play, Clock, CheckCircle2, XCircle, AlertCircle, RotateCcw, Ban } from "lucide-react";

const STATUS_CONFIG: Record<string, { icon: any; color: string }> = {
  PENDING: { icon: Clock, color: "bg-yellow-100 text-yellow-800" },
  RUNNING: { icon: Play, color: "bg-blue-100 text-blue-800" },
  COMPLETED: { icon: CheckCircle2, color: "bg-green-100 text-green-800" },
  FAILED: { icon: XCircle, color: "bg-red-100 text-red-800" },
  CANCELLED: { icon: Ban, color: "bg-gray-100 text-gray-800" },
  REPLAYED: { icon: RotateCcw, color: "bg-purple-100 text-purple-800" },
};

export default function RunsPage() {
  const [, navigate] = useLocation();
  const [statusFilter, setStatusFilter] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["runs", statusFilter],
    queryFn: () => api.runs.list(statusFilter ? { status: statusFilter } : undefined),
    refetchInterval: 5000,
  });

  const runs = data?.data ?? [];

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Extraction Runs</h1>
          <p className="text-muted-foreground text-sm">Monitor and manage extraction runs</p>
        </div>
        <Select value={statusFilter || "__all__"} onValueChange={(v) => setStatusFilter(v === "__all__" ? "" : v)}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All statuses</SelectItem>
            {Object.keys(STATUS_CONFIG).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center text-muted-foreground py-12">Loading...</div>
      ) : error ? (
        <Card><CardContent className="py-12 text-center text-red-500">Failed to load runs: {(error as Error).message}</CardContent></Card>
      ) : runs.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No extraction runs yet.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {runs.map((run: any) => {
            const cfg = STATUS_CONFIG[run.status] ?? STATUS_CONFIG.PENDING;
            const Icon = cfg.icon;
            return (
              <Card key={run.runId} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate(`/runs/${run.runId}`)}>
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-4">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{run.endpointId}</span>
                        <Badge className={cfg.color}>{run.status}</Badge>
                        <Badge variant="outline">{run.runType}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {run.createdTs && formatDistanceToNow(new Date(run.createdTs), { addSuffix: true })}
                        {run.requestedBy && ` by ${run.requestedBy}`}
                        {run.parentRunId && " (replay)"}
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <div>{run.apiCallCount} calls &middot; {run.pageCount} pages</div>
                    {run.errorCount > 0 && <div className="text-red-500">{run.errorCount} errors</div>}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
