import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowDown, ArrowRight, Monitor, Server, Cloud, Database, Shield, Clock, GitBranch } from "lucide-react";

export default function ArchitecturePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Architecture</h1>
        <p className="text-muted-foreground mt-2">
          System layers, deployment topology, and data flow through the API Ingestion Control Plane.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">System Layers</h2>
        <div className="space-y-3">
          {[
            {
              layer: "Presentation Layer",
              tech: "React + Vite",
              color: "bg-blue-500",
              purpose: "Operator control panel — source/endpoint management, manual run forms, monitoring dashboards, payload viewer",
              components: ["Source System CRUD", "Endpoint Config", "Manual Run Forms", "Run Monitor", "Payload Viewer"],
            },
            {
              layer: "API Layer",
              tech: "TypeScript / Express",
              color: "bg-green-500",
              purpose: "Metadata CRUD APIs (PostgreSQL), request builder, orchestration triggers, replay logic, BigQuery writes for raw payloads",
              components: ["Metadata APIs", "Request Builder", "Orchestration", "Replay Engine", "PostgreSQL Client", "BigQuery Client"],
            },
            {
              layer: "Execution Layer",
              tech: "Cloud Run Jobs",
              color: "bg-orange-500",
              purpose: "Batch API extraction — runs inside GCP with service account credentials, resolves secrets at runtime",
              components: ["API Caller", "Pagination Engine", "Checkpoint Writer", "Event Logger"],
            },
            {
              layer: "Scheduling Layer",
              tech: "Cloud Scheduler",
              color: "bg-purple-500",
              purpose: "Cron-based triggers for automated extraction runs",
              components: ["Cron Triggers", "Job Launch"],
            },
            {
              layer: "Storage Layer",
              tech: "Cloud SQL (PostgreSQL) + BigQuery",
              color: "bg-red-500",
              purpose: "PostgreSQL for control metadata and operational audit (OLTP). BigQuery for immutable raw API response payloads (OLAP).",
              components: ["PostgreSQL: control.*, ops.*", "BigQuery: raw.api_payload"],
            },
            {
              layer: "Security Layer",
              tech: "Google Secret Manager",
              color: "bg-gray-500",
              purpose: "Credential storage and runtime secret resolution — never stored in BigQuery or application config",
              components: ["API Keys", "OAuth Credentials", "Service Account Keys"],
            },
          ].map((l, i) => (
            <div key={l.layer}>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex items-center gap-3 md:w-64 shrink-0">
                      <div className={`h-3 w-3 rounded-full ${l.color}`} />
                      <div>
                        <p className="text-sm font-semibold">{l.layer}</p>
                        <p className="text-xs text-muted-foreground">{l.tech}</p>
                      </div>
                    </div>
                    <Separator orientation="vertical" className="hidden md:block h-12" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-2">{l.purpose}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {l.components.map((c) => (
                          <Badge key={c} variant="outline" className="text-[10px]">{c}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {i < 5 && (
                <div className="flex justify-center py-1">
                  <ArrowDown className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h2 className="text-xl font-semibold mb-4">Deployment Topology</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-blue-600">
                  <GitBranch className="h-5 w-5" />
                  <h3 className="font-semibold text-sm">Development (Replit)</h3>
                </div>
                <div className="space-y-2 pl-7">
                  <p className="text-xs text-muted-foreground">Code authoring and version control only. No PHI-bearing execution.</p>
                  <div className="space-y-1">
                    {["React frontend dev server", "Express API dev server", "GitHub push on commit"].map((item) => (
                      <div key={item} className="text-xs flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600">
                  <Cloud className="h-5 w-5" />
                  <h3 className="font-semibold text-sm">CI/CD (GitHub Actions)</h3>
                </div>
                <div className="space-y-2 pl-7">
                  <p className="text-xs text-muted-foreground">Build, test, and deploy pipeline to GCP.</p>
                  <div className="space-y-1">
                    {["Build Docker images", "Run tests", "Deploy to Cloud Run", "Update Cloud Scheduler"].map((item) => (
                      <div key={item} className="text-xs flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-orange-600">
                  <Server className="h-5 w-5" />
                  <h3 className="font-semibold text-sm">Production (GCP)</h3>
                </div>
                <div className="space-y-2 pl-7">
                  <p className="text-xs text-muted-foreground">Fully managed GCP services with IAM security.</p>
                  <div className="space-y-1">
                    {[
                      "Cloud Run (API + Frontend)",
                      "Cloud Run Jobs (Extraction)",
                      "Cloud Scheduler (Cron)",
                      "Cloud SQL PostgreSQL (Control/Ops)",
                      "BigQuery (Raw Payloads)",
                      "Secret Manager (Credentials)",
                      "IAM (Service Accounts)",
                    ].map((item) => (
                      <div key={item} className="text-xs flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div>
        <h2 className="text-xl font-semibold mb-4">Data Flow</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold mb-3">Manual Run Flow</h3>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {[
                    { label: "User fills form", color: "bg-blue-100 text-blue-800" },
                    { label: "Request preview shown", color: "bg-blue-100 text-blue-800" },
                    { label: "User confirms", color: "bg-blue-100 text-blue-800" },
                    { label: "extraction_run created", color: "bg-green-100 text-green-800" },
                    { label: "Cloud Run Job triggered", color: "bg-orange-100 text-orange-800" },
                    { label: "Secrets resolved", color: "bg-gray-100 text-gray-800" },
                    { label: "API calls paginated", color: "bg-orange-100 text-orange-800" },
                    { label: "Pages written to raw.api_payload", color: "bg-red-100 text-red-800" },
                    { label: "Events logged", color: "bg-purple-100 text-purple-800" },
                    { label: "Run status updated", color: "bg-green-100 text-green-800" },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Badge className={`${step.color} border-0 text-[10px]`}>{step.label}</Badge>
                      {i < 9 && <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />}
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold mb-3">Scheduled Run Flow</h3>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {[
                    { label: "Cloud Scheduler fires", color: "bg-purple-100 text-purple-800" },
                    { label: "extraction_run created", color: "bg-green-100 text-green-800" },
                    { label: "Cloud Run Job triggered", color: "bg-orange-100 text-orange-800" },
                    { label: "Secrets resolved", color: "bg-gray-100 text-gray-800" },
                    { label: "API calls paginated", color: "bg-orange-100 text-orange-800" },
                    { label: "Pages written", color: "bg-red-100 text-red-800" },
                    { label: "Run finalized", color: "bg-green-100 text-green-800" },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Badge className={`${step.color} border-0 text-[10px]`}>{step.label}</Badge>
                      {i < 6 && <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />}
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold mb-3">Replay Flow</h3>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {[
                    { label: "Query failed pages", color: "bg-red-100 text-red-800" },
                    { label: "New REPLAY run created", color: "bg-green-100 text-green-800" },
                    { label: "Cloud Run Job triggered", color: "bg-orange-100 text-orange-800" },
                    { label: "Only failed offsets retried", color: "bg-orange-100 text-orange-800" },
                    { label: "Successful pages marked REPLAYED", color: "bg-blue-100 text-blue-800" },
                    { label: "Run finalized", color: "bg-green-100 text-green-800" },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Badge className={`${step.color} border-0 text-[10px]`}>{step.label}</Badge>
                      {i < 5 && <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div>
        <h2 className="text-xl font-semibold mb-4">Security Boundary</h2>
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-red-600 mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  PHI Boundary Rules
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">All API execution involving PHI occurs exclusively inside GCP:</p>
                  <ul className="space-y-1.5 pl-4">
                    {[
                      "Cloud Run Jobs execute with GCP service accounts",
                      "Secrets resolved at runtime from Secret Manager",
                      "No credentials stored in BigQuery or app config",
                      "No PHI-bearing requests from development environment",
                      "Authorization headers never persisted in audit tables",
                    ].map((item) => (
                      <li key={item} className="text-xs text-muted-foreground list-disc">{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  Authentication Modes
                </h3>
                <div className="space-y-2">
                  {[
                    { mode: "API_KEY", desc: "Static API key stored in Secret Manager" },
                    { mode: "OAUTH2_CLIENT_CREDENTIALS", desc: "Client credentials grant with token refresh" },
                  ].map((auth) => (
                    <div key={auth.mode} className="p-2 rounded border">
                      <p className="text-xs font-mono font-semibold">{auth.mode}</p>
                      <p className="text-xs text-muted-foreground">{auth.desc}</p>
                    </div>
                  ))}
                  <div className="p-2 rounded border border-dashed border-yellow-400 bg-yellow-50">
                    <p className="text-xs font-semibold text-yellow-700">Open Question</p>
                    <p className="text-xs text-yellow-600">
                      Token refresh, caching, and mid-run expiration handling are not yet specified.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div>
        <h2 className="text-xl font-semibold mb-4">Storage Layout</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-blue-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-600" />
                <CardTitle className="text-base">Cloud SQL (PostgreSQL)</CardTitle>
              </div>
              <CardDescription>OLTP — CRUD, transactions, constraints, indexes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="p-2 bg-blue-50 rounded">
                  <p className="text-xs font-semibold text-blue-700">control schema</p>
                  <div className="space-y-1 mt-1">
                    {["source_system", "endpoint_definition", "endpoint_parameter"].map((t) => (
                      <div key={t} className="flex items-center gap-2">
                        <Database className="h-3 w-3 text-muted-foreground" />
                        <code className="text-xs">{t}</code>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-2 bg-green-50 rounded">
                  <p className="text-xs font-semibold text-green-700">ops schema</p>
                  <div className="space-y-1 mt-1">
                    {["extraction_run", "extraction_event"].map((t) => (
                      <div key={t} className="flex items-center gap-2">
                        <Database className="h-3 w-3 text-muted-foreground" />
                        <code className="text-xs">{t}</code>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-orange-600" />
                <CardTitle className="text-base">BigQuery</CardTitle>
              </div>
              <CardDescription>OLAP — append-only raw payloads, analytical queries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-2 bg-orange-50 rounded">
                <p className="text-xs font-semibold text-orange-700">raw dataset</p>
                <div className="space-y-1 mt-1">
                  <div className="flex items-center gap-2">
                    <Database className="h-3 w-3 text-muted-foreground" />
                    <code className="text-xs">api_payload</code>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">
                  Partitioned by DATE(ingested_ts), clustered by source_system_id, endpoint_id, run_id
                </p>
              </div>
              <div className="mt-3 p-2 border rounded border-dashed">
                <p className="text-[10px] text-muted-foreground">
                  <strong>Cross-store link:</strong> api_payload.run_id references extraction_run.run_id in PostgreSQL (application-level, not DB-enforced)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
