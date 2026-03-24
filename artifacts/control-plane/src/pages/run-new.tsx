import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Play, Eye, ArrowLeft } from "lucide-react";

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

  const { data: paramsData } = useQuery({
    queryKey: ["parameters", endpointId],
    queryFn: () => api.parameters.list(endpointId),
    enabled: !!endpointId,
  });

  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<any>(null);

  const previewMutation = useMutation({
    mutationFn: () => api.endpoints.preview(endpointId, paramValues),
    onSuccess: (data) => setPreview(data.data),
    onError: (err: Error) => toast({ title: "Preview error", description: err.message, variant: "destructive" }),
  });

  const runMutation = useMutation({
    mutationFn: () => {
      const endpoint = endpointData?.data;
      return api.runs.create({
        sourceSystemId: endpoint?.sourceSystemId,
        endpointId,
        runType: "MANUAL",
        requestedBy: "operator",
        windowStartTs: paramValues.startDate ? new Date(paramValues.startDate).toISOString() : undefined,
        windowEndTs: paramValues.endDate ? new Date(paramValues.endDate).toISOString() : undefined,
      });
    },
    onSuccess: (data) => {
      toast({ title: "Run created" });
      navigate(`/runs/${data.data.runId}`);
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const endpoint = endpointData?.data;
  const parameters = paramsData?.data ?? [];

  if (!endpoint) return <div className="p-6 text-muted-foreground">Loading...</div>;

  return (
    <div className="p-6 max-w-3xl">
      <Button variant="ghost" size="sm" onClick={() => navigate("/endpoints")} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" />Back to Endpoints
      </Button>

      <h1 className="text-2xl font-bold mb-1">Manual Run</h1>
      <p className="text-muted-foreground text-sm mb-6">{endpoint.endpointName} &middot; {endpoint.sourceSystemId}</p>

      <Card className="mb-6">
        <CardHeader><CardTitle className="text-base">Parameters</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {parameters.length === 0 ? (
            <p className="text-sm text-muted-foreground">No parameters configured for this endpoint.</p>
          ) : (
            parameters.map((p: any) => {
              const allowedValues = p.allowedValuesJson ? (typeof p.allowedValuesJson === "string" ? JSON.parse(p.allowedValuesJson) : p.allowedValuesJson) : null;
              return (
                <div key={p.endpointParameterId} className="space-y-1">
                  <Label className="flex items-center gap-2">
                    {p.parameterLabel || p.parameterName}
                    {p.isRequired && <Badge variant="destructive" className="text-[10px] px-1 py-0">Required</Badge>}
                    <span className="text-xs text-muted-foreground font-normal">{p.parameterLocation} &middot; {p.dataType}</span>
                  </Label>
                  {Array.isArray(allowedValues) && allowedValues.length > 0 ? (
                    <Select value={paramValues[p.parameterName] ?? ""} onValueChange={(v) => setParamValues({ ...paramValues, [p.parameterName]: v })}>
                      <SelectTrigger><SelectValue placeholder={`Select ${p.parameterLabel || p.parameterName}...`} /></SelectTrigger>
                      <SelectContent>
                        {allowedValues.map((v: string) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      type={p.dataType === "DATE" || p.dataType === "DATETIME" ? "datetime-local" : p.dataType === "NUMBER" || p.dataType === "INTEGER" ? "number" : "text"}
                      value={paramValues[p.parameterName] ?? ""}
                      onChange={(e) => setParamValues({ ...paramValues, [p.parameterName]: e.target.value })}
                      placeholder={p.helpText || p.defaultValue || ""}
                      required={p.isRequired}
                    />
                  )}
                  {p.helpText && <p className="text-xs text-muted-foreground">{p.helpText}</p>}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3 mb-6">
        <Button variant="outline" onClick={() => previewMutation.mutate()} disabled={previewMutation.isPending}>
          <Eye className="h-4 w-4 mr-2" />{previewMutation.isPending ? "Loading..." : "Preview Request"}
        </Button>
        <Button onClick={() => runMutation.mutate()} disabled={runMutation.isPending}>
          <Play className="h-4 w-4 mr-2" />{runMutation.isPending ? "Creating..." : "Trigger Run"}
        </Button>
      </div>

      {preview && (
        <Card>
          <CardHeader><CardTitle className="text-base">Request Preview</CardTitle></CardHeader>
          <CardContent>
            <div className="bg-muted rounded-lg p-4 font-mono text-sm space-y-2 overflow-x-auto">
              <div><Badge variant="outline">{preview.method}</Badge> <span className="ml-2 break-all">{preview.url}</span></div>
              {preview.headers && Object.keys(preview.headers).length > 0 && (
                <div className="text-muted-foreground">Headers: {JSON.stringify(preview.headers)}</div>
              )}
              {preview.body && <div className="text-muted-foreground">Body: {JSON.stringify(preview.body, null, 2)}</div>}
              <Separator />
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Pagination: {preview.paginationStrategy}</div>
                <div>Incremental: {preview.incrementalStrategy}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
