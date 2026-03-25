import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Play, ArrowLeft, Calendar } from "lucide-react";

export default function RunNewPage() {
  const [, params] = useRoute("/runs/new/:endpointId");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const endpointId = params?.endpointId ?? "";

  const { data: endpointData } = useQuery({
    queryKey: ["endpoint", endpointId],
    queryFn: () => api.endpoints.get(endpointId),
    enabled: !!endpointId,
  });

  const [windowStart, setWindowStart] = useState("");
  const [windowEnd, setWindowEnd] = useState("");

  const runMutation = useMutation({
    mutationFn: () => {
      const endpoint = endpointData?.data;
      if (!endpoint) throw new Error("Endpoint not loaded");
      if (!windowStart || !windowEnd) throw new Error("Both start and end dates are required");

      return api.runs.create({
        sourceSystemId: endpoint.sourceSystemId,
        endpointId,
        runType: "MANUAL",
        requestedBy: "operator",
        windowStartTs: new Date(windowStart).toISOString(),
        windowEndTs: new Date(windowEnd).toISOString(),
      });
    },
    onSuccess: (data) => {
      toast({ title: "Run triggered", description: "The extraction job has been started." });
      navigate(`/runs/${data.data.runId}`);
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const endpoint = endpointData?.data;

  if (!endpoint) return <div className="p-6 text-muted-foreground">Loading...</div>;

  const paginationConfig = endpoint.paginationConfigJson
    ? (typeof endpoint.paginationConfigJson === "string" ? JSON.parse(endpoint.paginationConfigJson) : endpoint.paginationConfigJson)
    : {};

  return (
    <div className="p-6 max-w-2xl">
      <Button variant="ghost" size="sm" onClick={() => navigate("/endpoints")} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" />Back to Endpoints
      </Button>

      <h1 className="text-2xl font-bold mb-1">Trigger Extraction</h1>
      <p className="text-muted-foreground text-sm mb-6">{endpoint.endpointName} &middot; {endpoint.sourceSystemId}</p>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Date Window
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Select the date range to extract. All timestamps are in UTC.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="windowStart">Start Date/Time (UTC)</Label>
              <Input
                id="windowStart"
                type="datetime-local"
                value={windowStart}
                onChange={(e) => setWindowStart(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="windowEnd">End Date/Time (UTC)</Label>
              <Input
                id="windowEnd"
                type="datetime-local"
                value={windowEnd}
                onChange={(e) => setWindowEnd(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Endpoint Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-1 text-muted-foreground">
            <div><span className="font-medium text-foreground">Method:</span> {endpoint.httpMethod}</div>
            <div><span className="font-medium text-foreground">Path:</span> {endpoint.relativePath}</div>
            <div><span className="font-medium text-foreground">Pagination:</span> {endpoint.paginationStrategy} (page size: {paginationConfig.pageSize ?? "default"})</div>
            <div><span className="font-medium text-foreground">Incremental:</span> {endpoint.incrementalStrategy || "NONE"}</div>
          </div>
        </CardContent>
      </Card>

      <Button
        size="lg"
        onClick={() => runMutation.mutate()}
        disabled={runMutation.isPending || !windowStart || !windowEnd}
      >
        <Play className="h-4 w-4 mr-2" />
        {runMutation.isPending ? "Triggering..." : "Trigger Run"}
      </Button>
    </div>
  );
}
