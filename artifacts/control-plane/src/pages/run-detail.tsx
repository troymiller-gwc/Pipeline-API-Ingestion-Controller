import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Ban, RotateCcw, Clock, AlertCircle, CheckCircle2, XCircle, Info } from "lucide-react";

const SEVERITY_ICON: Record<string, any> = {
  INFO: Info,
  WARN: AlertCircle,
  ERROR: XCircle,
};

const SEVERITY_COLOR: Record<string, string> = {
  INFO: "text-blue-500",
  WARN: "text-yellow-500",
  ERROR: "text-red-500",
};

export default function RunDetailPage() {
  const [, params] = useRoute("/runs/:id");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const runId = params?.id ?? "";

  const { data, isLoading } = useQuery({
    queryKey: ["run", runId],
    queryFn: () => api.runs.get(runId),
    enabled: !!runId,
    refetchInterval: 5000,
  });

  const cancelMutation = useMutation({
    mutationFn: () => api.runs.cancel(runId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["run", runId] }); toast({ title: "Run cancelled" }); },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const replayMutation = useMutation({
    mutationFn: () => api.runs.replay(runId),
    onSuccess: (data) => {
      toast({ title: "Replay run created" });
      navigate(`/runs/${data.data.runId}`);
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  if (isLoading || !data) return <div className="p-6 text-muted-foreground">Loading...</div>;

  const run = data.data;
  const events = run.events ?? [];

  return (
    <div className="p-6 max-w-4xl">
      <Button variant="ghost" size="sm" onClick={() => navigate("/runs")} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" />Back to Runs
      </Button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Run Detail</h1>
          <p className="text-xs text-muted-foreground font-mono">{run.runId}</p>
        </div>
        <div className="flex gap-2">
          {["PENDING", "RUNNING"].includes(run.status) && (
            <Button variant="destructive" size="sm" onClick={() => cancelMutation.mutate()} disabled={cancelMutation.isPending}>
              <Ban className="h-4 w-4 mr-1" />Cancel
            </Button>
          )}
          {["FAILED", "COMPLETED"].includes(run.status) && (
            <Button variant="outline" size="sm" onClick={() => replayMutation.mutate()} disabled={replayMutation.isPending}>
              <RotateCcw className="h-4 w-4 mr-1" />Replay
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4">
            <div className="text-xs text-muted-foreground">Status</div>
            <Badge className="mt-1">{run.status}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-xs text-muted-foreground">Run Type</div>
            <div className="font-semibold mt-1">{run.runType}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-xs text-muted-foreground">API Calls</div>
            <div className="font-semibold mt-1">{run.apiCallCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-xs text-muted-foreground">Pages / Errors</div>
            <div className="font-semibold mt-1">{run.pageCount} / <span className={run.errorCount > 0 ? "text-red-500" : ""}>{run.errorCount}</span></div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Endpoint</span><span className="font-mono">{run.endpointId}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Source System</span><span>{run.sourceSystemId}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Requested By</span><span>{run.requestedBy ?? "—"}</span></div>
          {run.parentRunId && <div className="flex justify-between"><span className="text-muted-foreground">Parent Run</span><span className="font-mono text-xs cursor-pointer text-primary" onClick={() => navigate(`/runs/${run.parentRunId}`)}>{run.parentRunId}</span></div>}
          {run.windowStartTs && <div className="flex justify-between"><span className="text-muted-foreground">Window Start</span><span>{new Date(run.windowStartTs).toLocaleString("en-US", { timeZone: "UTC" })} UTC</span></div>}
          {run.windowEndTs && <div className="flex justify-between"><span className="text-muted-foreground">Window End</span><span>{new Date(run.windowEndTs).toLocaleString("en-US", { timeZone: "UTC" })} UTC</span></div>}
          {run.startedTs && <div className="flex justify-between"><span className="text-muted-foreground">Started</span><span>{new Date(run.startedTs).toLocaleString()}</span></div>}
          {run.endedTs && <div className="flex justify-between"><span className="text-muted-foreground">Ended</span><span>{new Date(run.endedTs).toLocaleString()}</span></div>}
          {run.errorSummary && <div className="flex justify-between"><span className="text-muted-foreground">Error</span><span className="text-red-500">{run.errorSummary}</span></div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Events ({events.length})</CardTitle></CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">No events recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {events.map((event: any) => {
                const SevIcon = SEVERITY_ICON[event.severity] ?? Info;
                const sevColor = SEVERITY_COLOR[event.severity] ?? "text-gray-500";
                return (
                  <div key={event.eventId} className="flex items-start gap-3 text-sm">
                    <SevIcon className={`h-4 w-4 mt-0.5 ${sevColor}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{event.eventType}</Badge>
                        <span className="text-xs text-muted-foreground">{new Date(event.eventTs).toLocaleString()}</span>
                      </div>
                      {event.message && <p className="text-muted-foreground mt-1">{event.message}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
