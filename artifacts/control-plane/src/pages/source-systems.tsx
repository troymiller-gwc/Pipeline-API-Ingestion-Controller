import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Server } from "lucide-react";

const AUTH_TYPES = ["OAUTH2_CLIENT_CREDENTIALS", "API_KEY", "BASIC", "BEARER_TOKEN"];

function SourceSystemForm({ initial, onSubmit, onCancel }: { initial?: any; onSubmit: (data: any) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    sourceSystemId: initial?.sourceSystemId ?? "",
    sourceSystemName: initial?.sourceSystemName ?? "",
    baseUrl: initial?.baseUrl ?? "",
    authType: initial?.authType ?? "OAUTH2_CLIENT_CREDENTIALS",
    secretManagerSecretName: initial?.secretManagerSecretName ?? "",
    serviceAccountEmail: initial?.serviceAccountEmail ?? "",
    isActive: initial?.isActive ?? true,
  });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>System ID</Label>
        <Input value={form.sourceSystemId} onChange={(e) => setForm({ ...form, sourceSystemId: e.target.value })} disabled={!!initial} placeholder="e.g. nice-cxone" />
      </div>
      <div className="space-y-2">
        <Label>Name</Label>
        <Input value={form.sourceSystemName} onChange={(e) => setForm({ ...form, sourceSystemName: e.target.value })} placeholder="e.g. NICE CXone" />
      </div>
      <div className="space-y-2">
        <Label>Base URL</Label>
        <Input value={form.baseUrl} onChange={(e) => setForm({ ...form, baseUrl: e.target.value })} placeholder="https://api.example.com" />
      </div>
      <div className="space-y-2">
        <Label>Auth Type</Label>
        <Select value={form.authType} onValueChange={(v) => setForm({ ...form, authType: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {AUTH_TYPES.map((t) => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Secret Manager Secret Name</Label>
        <Input value={form.secretManagerSecretName} onChange={(e) => setForm({ ...form, secretManagerSecretName: e.target.value })} placeholder="Optional" />
      </div>
      <div className="flex gap-2 pt-2">
        <Button onClick={() => onSubmit(form)} className="flex-1">{initial ? "Update" : "Create"}</Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

export default function SourceSystemsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const { data, isLoading, error } = useQuery({ queryKey: ["source-systems"], queryFn: () => api.sourceSystems.list() });

  const createMutation = useMutation({
    mutationFn: (body: any) => api.sourceSystems.create(body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["source-systems"] }); setDialogOpen(false); toast({ title: "Source system created" }); },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) => api.sourceSystems.update(id, body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["source-systems"] }); setEditing(null); toast({ title: "Source system updated" }); },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.sourceSystems.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["source-systems"] }); toast({ title: "Source system deactivated" }); },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const systems = data?.data ?? [];

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Source Systems</h1>
          <p className="text-muted-foreground text-sm">Manage third-party API source systems</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Add Source System</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Source System</DialogTitle></DialogHeader>
            <SourceSystemForm onSubmit={(d) => createMutation.mutate(d)} onCancel={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center text-muted-foreground py-12">Loading...</div>
      ) : error ? (
        <Card><CardContent className="py-12 text-center text-red-500">Failed to load source systems: {(error as Error).message}</CardContent></Card>
      ) : systems.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No source systems configured yet.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {systems.map((sys: any) => (
            <Card key={sys.sourceSystemId}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <Server className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{sys.sourceSystemName}</span>
                      <Badge variant={sys.isActive ? "default" : "secondary"}>{sys.isActive ? "Active" : "Inactive"}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      <span className="font-mono">{sys.sourceSystemId}</span> &middot; {sys.baseUrl}
                    </div>
                    <div className="text-xs text-muted-foreground">{sys.authType.replace(/_/g, " ")}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Dialog open={editing?.sourceSystemId === sys.sourceSystemId} onOpenChange={(open) => !open && setEditing(null)}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setEditing(sys)}><Pencil className="h-3 w-3" /></Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Edit Source System</DialogTitle></DialogHeader>
                      <SourceSystemForm initial={sys} onSubmit={(d) => updateMutation.mutate({ id: sys.sourceSystemId, body: d })} onCancel={() => setEditing(null)} />
                    </DialogContent>
                  </Dialog>
                  {sys.isActive && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm"><Trash2 className="h-3 w-3" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Deactivate {sys.sourceSystemName}?</AlertDialogTitle>
                          <AlertDialogDescription>This will mark the source system as inactive. It can be reactivated later.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteMutation.mutate(sys.sourceSystemId)}>Deactivate</AlertDialogAction>
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
