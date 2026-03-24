import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Database, Play, Eye } from "lucide-react";

const PAGINATION_STRATEGIES = ["NONE", "PAGE_NUMBER", "OFFSET_LIMIT", "NEXT_TOKEN"];
const INCREMENTAL_STRATEGIES = ["FULL_REFRESH", "DATE_WINDOW", "CURSOR", "UNKNOWN"];
const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];

function EndpointForm({ initial, sourceSystems, onSubmit, onCancel }: any) {
  const [form, setForm] = useState({
    endpointId: initial?.endpointId ?? "",
    sourceSystemId: initial?.sourceSystemId ?? "",
    endpointName: initial?.endpointName ?? "",
    httpMethod: initial?.httpMethod ?? "GET",
    relativePath: initial?.relativePath ?? "",
    paginationStrategy: initial?.paginationStrategy ?? "NONE",
    incrementalStrategy: initial?.incrementalStrategy ?? "FULL_REFRESH",
    scheduleCron: initial?.scheduleCron ?? "",
    isActive: initial?.isActive ?? true,
  });

  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
      <div className="space-y-2">
        <Label>Endpoint ID</Label>
        <Input value={form.endpointId} onChange={(e) => setForm({ ...form, endpointId: e.target.value })} disabled={!!initial} placeholder="e.g. nice-cxone-get-contacts" />
      </div>
      <div className="space-y-2">
        <Label>Source System</Label>
        <Select value={form.sourceSystemId} onValueChange={(v) => setForm({ ...form, sourceSystemId: v })} disabled={!!initial}>
          <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
          <SelectContent>
            {sourceSystems.map((s: any) => <SelectItem key={s.sourceSystemId} value={s.sourceSystemId}>{s.sourceSystemName}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Name</Label>
        <Input value={form.endpointName} onChange={(e) => setForm({ ...form, endpointName: e.target.value })} placeholder="e.g. Get Contacts" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>HTTP Method</Label>
          <Select value={form.httpMethod} onValueChange={(v) => setForm({ ...form, httpMethod: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{HTTP_METHODS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Relative Path</Label>
          <Input value={form.relativePath} onChange={(e) => setForm({ ...form, relativePath: e.target.value })} placeholder="/api/v1/contacts" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Pagination</Label>
          <Select value={form.paginationStrategy} onValueChange={(v) => setForm({ ...form, paginationStrategy: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{PAGINATION_STRATEGIES.map((p) => <SelectItem key={p} value={p}>{p.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Incremental</Label>
          <Select value={form.incrementalStrategy} onValueChange={(v) => setForm({ ...form, incrementalStrategy: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{INCREMENTAL_STRATEGIES.map((i) => <SelectItem key={i} value={i}>{i.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Schedule (Cron)</Label>
        <Input value={form.scheduleCron} onChange={(e) => setForm({ ...form, scheduleCron: e.target.value })} placeholder="Optional, e.g. 0 */6 * * *" />
      </div>
      <div className="flex gap-2 pt-2">
        <Button onClick={() => onSubmit(form)} className="flex-1">{initial ? "Update" : "Create"}</Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

export default function EndpointsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [filterSource, setFilterSource] = useState<string>("");

  const { data: systemsData } = useQuery({ queryKey: ["source-systems"], queryFn: () => api.sourceSystems.list() });
  const { data, isLoading, error } = useQuery({
    queryKey: ["endpoints", filterSource],
    queryFn: () => api.endpoints.list(filterSource || undefined),
  });

  const createMutation = useMutation({
    mutationFn: (body: any) => api.endpoints.create(body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["endpoints"] }); setDialogOpen(false); toast({ title: "Endpoint created" }); },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: any) => api.endpoints.update(id, body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["endpoints"] }); setEditing(null); toast({ title: "Endpoint updated" }); },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.endpoints.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["endpoints"] }); toast({ title: "Endpoint deactivated" }); },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const systems = systemsData?.data ?? [];
  const endpoints = data?.data ?? [];

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Endpoints</h1>
          <p className="text-muted-foreground text-sm">API endpoint configurations</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Add Endpoint</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Create Endpoint</DialogTitle></DialogHeader>
            <EndpointForm sourceSystems={systems} onSubmit={(d: any) => createMutation.mutate(d)} onCancel={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-4">
        <Select value={filterSource || "__all__"} onValueChange={(v) => setFilterSource(v === "__all__" ? "" : v)}>
          <SelectTrigger className="w-60"><SelectValue placeholder="All source systems" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All source systems</SelectItem>
            {systems.map((s: any) => <SelectItem key={s.sourceSystemId} value={s.sourceSystemId}>{s.sourceSystemName}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center text-muted-foreground py-12">Loading...</div>
      ) : error ? (
        <Card><CardContent className="py-12 text-center text-red-500">Failed to load endpoints: {(error as Error).message}</CardContent></Card>
      ) : endpoints.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No endpoints configured.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {endpoints.map((ep: any) => (
            <Card key={ep.endpointId}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <Database className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{ep.endpointName}</span>
                      <Badge variant="outline">{ep.httpMethod}</Badge>
                      <Badge variant={ep.isActive ? "default" : "secondary"}>{ep.isActive ? "Active" : "Inactive"}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 font-mono">{ep.relativePath}</div>
                    <div className="text-xs text-muted-foreground flex gap-3 mt-1">
                      <span>Pagination: {ep.paginationStrategy.replace(/_/g, " ")}</span>
                      <span>Incremental: {ep.incrementalStrategy.replace(/_/g, " ")}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigate(`/runs/new/${ep.endpointId}`)} title="Run">
                    <Play className="h-3 w-3" />
                  </Button>
                  <Dialog open={editing?.endpointId === ep.endpointId} onOpenChange={(open) => !open && setEditing(null)}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setEditing(ep)}><Pencil className="h-3 w-3" /></Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader><DialogTitle>Edit Endpoint</DialogTitle></DialogHeader>
                      <EndpointForm initial={ep} sourceSystems={systems} onSubmit={(d: any) => updateMutation.mutate({ id: ep.endpointId, body: d })} onCancel={() => setEditing(null)} />
                    </DialogContent>
                  </Dialog>
                  {ep.isActive && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm"><Trash2 className="h-3 w-3" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Deactivate {ep.endpointName}?</AlertDialogTitle>
                          <AlertDialogDescription>This will mark the endpoint as inactive. It can be reactivated later.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteMutation.mutate(ep.endpointId)}>Deactivate</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
