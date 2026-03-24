import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Database, Server, Cloud, Shield, Clock, Eye, RotateCcw, Settings } from "lucide-react";

export default function OverviewPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">API Ingestion Control Plane</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          A metadata-driven internal application for managing extraction of data from third-party APIs into Google BigQuery.
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">Project Purpose</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">
            This control plane provides a unified interface for defining source systems and API endpoints, 
            triggering manual or scheduled extraction runs, monitoring execution progress, inspecting raw 
            payloads, and replaying failed work — all without transforming the data at ingestion time. 
            Raw API responses are preserved exactly as returned and landed in BigQuery for downstream consumers.
          </p>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-4">Primary Users</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="h-4 w-4 text-blue-500" />
                Operations Analysts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Need visibility into extraction status, failures, and raw payload inspection. 
                Primary consumers of the monitoring and payload viewer features.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="h-4 w-4 text-green-500" />
                Data Engineers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Define connectors, schedules, and endpoint behavior. Configure pagination strategies, 
                incremental modes, and parameter metadata for the system.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      <div>
        <h2 className="text-xl font-semibold mb-4">Core Capabilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: <Database className="h-5 w-5" />,
              title: "Source & Endpoint Management",
              description: "CRUD for source systems, endpoint definitions, and parameter metadata",
              badge: "Configuration",
            },
            {
              icon: <Server className="h-5 w-5" />,
              title: "Run Orchestration",
              description: "Manual runs with dynamic forms, scheduled runs via Cloud Scheduler + Cloud Run Jobs",
              badge: "Execution",
            },
            {
              icon: <Eye className="h-5 w-5" />,
              title: "Monitoring & Inspection",
              description: "Run history, page-level status, raw JSON payload viewer with request metadata",
              badge: "Observability",
            },
            {
              icon: <RotateCcw className="h-5 w-5" />,
              title: "Replay & Recovery",
              description: "Replay failed pages selectively, with full rerun as fallback",
              badge: "Resilience",
            },
          ].map((cap) => (
            <Card key={cap.title}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="text-primary">{cap.icon}</div>
                  <Badge variant="outline" className="text-xs">{cap.badge}</Badge>
                </div>
                <CardTitle className="text-sm mt-2">{cap.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">{cap.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h2 className="text-xl font-semibold mb-4">Key Design Principles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { label: "Metadata-Driven", desc: "All connector behavior is configured through metadata tables, not code changes" },
            { label: "Immutable Raw Landing", desc: "API responses are stored exactly as returned — no transformation at ingestion" },
            { label: "Auditable", desc: "Every run, page, and event is tracked with timestamps and correlation IDs" },
            { label: "Replayable", desc: "Failed pages can be retried without re-running the entire extraction window" },
            { label: "Schema Flexible", desc: "Raw JSON payloads accommodate any API response shape without DDL changes" },
            { label: "Security Boundary", desc: "PHI-bearing API execution happens only inside GCP, never in the development environment" },
          ].map((p) => (
            <div key={p.label} className="flex gap-3 p-3 rounded-lg border">
              <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">{p.label}</p>
                <p className="text-xs text-muted-foreground">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h2 className="text-xl font-semibold mb-4">Technology Stack</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { layer: "Frontend", tech: "React + Vite", icon: <Server className="h-4 w-4" /> },
            { layer: "Backend API", tech: "TypeScript / Express", icon: <Server className="h-4 w-4" /> },
            { layer: "Execution", tech: "Cloud Run Jobs", icon: <Cloud className="h-4 w-4" /> },
            { layer: "Scheduling", tech: "Cloud Scheduler", icon: <Clock className="h-4 w-4" /> },
            { layer: "Storage", tech: "Cloud SQL + BigQuery", icon: <Database className="h-4 w-4" /> },
            { layer: "Secrets", tech: "Google Secret Manager", icon: <Shield className="h-4 w-4" /> },
          ].map((s) => (
            <Card key={s.layer} className="p-4">
              <div className="flex items-center gap-2">
                <div className="text-muted-foreground">{s.icon}</div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.layer}</p>
                  <p className="text-sm font-medium">{s.tech}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h2 className="text-xl font-semibold mb-4">Scope Boundaries</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-green-600">In Scope (MVP)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                "Source system CRUD",
                "Endpoint definition CRUD with pagination and incremental config",
                "Parameter metadata for dynamic manual run forms",
                "Manual execution with request preview",
                "Scheduled execution via Cloud Scheduler + Cloud Run Jobs",
                "Run monitoring with page-level detail",
                "Raw JSON payload inspection",
                "Replay of failed pages",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <Badge variant="outline" className="text-green-600 border-green-200 mt-0.5 shrink-0 text-[10px]">IN</Badge>
                  <p className="text-sm">{item}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-red-600">Out of Scope</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                "Business-rule transformations beyond raw ingestion",
                "Autonomous AI agents making production changes",
                "Arbitrary nested request-body editor",
                "PHI-bearing API execution from development runtime",
                "Downstream curated/reporting tables",
                "Complex transformation logic at ingestion time",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <Badge variant="outline" className="text-red-600 border-red-200 mt-0.5 shrink-0 text-[10px]">OUT</Badge>
                  <p className="text-sm">{item}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      <div>
        <h2 className="text-xl font-semibold mb-4">Definition of Done</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                "A user can define a source system and endpoint",
                "A user can define endpoint parameters for the manual run form",
                "A user can execute a manual run with request preview",
                "A scheduled run can trigger a Cloud Run Job",
                "Each HTTP response page is written to raw.api_payload in BigQuery",
                "Operators can view run history, inspect payloads, and replay failed pages",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-2">
                  <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-sm">{item}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
