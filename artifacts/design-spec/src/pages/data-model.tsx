import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, CheckCircle2, Database as DatabaseIcon } from "lucide-react";

interface ColumnDef {
  name: string;
  type: string;
  purpose: string;
  constraint?: string;
}

function SchemaTable({ columns }: { columns: ColumnDef[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-48">Column</TableHead>
          <TableHead className="w-32">Type</TableHead>
          <TableHead className="w-28">Constraint</TableHead>
          <TableHead>Purpose</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {columns.map((col) => (
          <TableRow key={col.name}>
            <TableCell>
              <code className="text-xs font-mono">{col.name}</code>
            </TableCell>
            <TableCell>
              <Badge variant="secondary" className="text-[10px] font-mono">{col.type}</Badge>
            </TableCell>
            <TableCell>
              {col.constraint && (
                <Badge variant="outline" className="text-[9px] font-mono">{col.constraint}</Badge>
              )}
            </TableCell>
            <TableCell className="text-xs text-muted-foreground">{col.purpose}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function DataModelPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Model</h1>
        <p className="text-muted-foreground mt-2">
          Split-storage architecture: Cloud SQL (PostgreSQL) for control/ops tables, BigQuery for raw payloads.
        </p>
      </div>

      <Card className="border-green-300 bg-green-50">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-green-800">Decision: Split Storage (Q1 Resolved)</p>
              <p className="text-xs text-green-700 mt-1">
                <strong>Cloud SQL (PostgreSQL)</strong> is used for the control.* and ops.* tables that require frequent CRUD 
                operations, transactional guarantees, and foreign key enforcement. <strong>BigQuery</strong> is reserved exclusively 
                for raw.api_payload where its columnar storage, partitioning by DATE(ingested_ts), and clustering by 
                source_system_id/endpoint_id/run_id are ideal for analytical queries over large payload volumes. This also 
                resolves Q2 (primary keys) and simplifies Q4 (concurrency) and Q6/Q9 (replay with parent_run_id).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-4">Storage Split</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-blue-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <DatabaseIcon className="h-4 w-4 text-blue-600" />
                <CardTitle className="text-base">Cloud SQL (PostgreSQL)</CardTitle>
              </div>
              <CardDescription>OLTP — CRUD, transactions, foreign keys, indexes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                  <Badge variant="outline" className="text-[9px] font-mono">control</Badge>
                  <span className="text-muted-foreground">source_system, endpoint_definition, endpoint_parameter</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                  <Badge variant="outline" className="text-[9px] font-mono">ops</Badge>
                  <span className="text-muted-foreground">extraction_run, extraction_event</span>
                </div>
                <Separator className="my-2" />
                <div className="space-y-1 text-muted-foreground">
                  <p>Sub-millisecond query latency</p>
                  <p>Real PRIMARY KEY, FOREIGN KEY, UNIQUE constraints</p>
                  <p>Transactional CRUD (INSERT, UPDATE, DELETE)</p>
                  <p>Row-level locking for concurrency control</p>
                  <p>Managed via Cloud SQL in GCP</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <DatabaseIcon className="h-4 w-4 text-orange-600" />
                <CardTitle className="text-base">BigQuery</CardTitle>
              </div>
              <CardDescription>OLAP — append-only raw payloads, analytical queries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 p-2 bg-orange-50 rounded">
                  <Badge variant="outline" className="text-[9px] font-mono">raw</Badge>
                  <span className="text-muted-foreground">api_payload</span>
                </div>
                <Separator className="my-2" />
                <div className="space-y-1 text-muted-foreground">
                  <p>Partitioned by DATE(ingested_ts)</p>
                  <p>Clustered by source_system_id, endpoint_id, run_id</p>
                  <p>Append-only writes (one row per HTTP response page)</p>
                  <p>payload_hash for application-level deduplication</p>
                  <p>Optimized for large-scale analytical queries</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      <div>
        <h2 className="text-xl font-semibold mb-4">Entity Relationships</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-3 justify-center text-xs">
              <div className="border rounded-lg p-3 bg-blue-50 text-center min-w-[140px]">
                <p className="font-mono font-semibold text-blue-700">source_system</p>
                <p className="text-muted-foreground mt-1">PostgreSQL — PK</p>
              </div>
              <div className="flex flex-col items-center">
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">has many</span>
              </div>
              <div className="border rounded-lg p-3 bg-blue-50 text-center min-w-[140px]">
                <p className="font-mono font-semibold text-blue-700">endpoint_definition</p>
                <p className="text-muted-foreground mt-1">FK → source_system</p>
              </div>
              <div className="flex flex-col items-center">
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">has many</span>
              </div>
              <div className="border rounded-lg p-3 bg-blue-50 text-center min-w-[140px]">
                <p className="font-mono font-semibold text-blue-700">endpoint_parameter</p>
                <p className="text-muted-foreground mt-1">FK → endpoint</p>
              </div>
            </div>

            <div className="flex justify-center my-4">
              <div className="border-l-2 border-dashed border-muted-foreground h-8" />
            </div>

            <div className="flex flex-wrap items-center gap-3 justify-center text-xs">
              <div className="border rounded-lg p-3 bg-green-50 text-center min-w-[170px]">
                <p className="font-mono font-semibold text-green-700">extraction_run</p>
                <p className="text-muted-foreground mt-1">FK → source_system, endpoint</p>
                <p className="text-muted-foreground">FK → parent_run (self, nullable)</p>
              </div>
              <div className="flex flex-col items-center">
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">produces</span>
              </div>
              <div className="border rounded-lg p-3 bg-green-50 text-center min-w-[140px]">
                <p className="font-mono font-semibold text-green-700">extraction_event</p>
                <p className="text-muted-foreground mt-1">FK → extraction_run</p>
              </div>
            </div>

            <div className="flex justify-center my-4">
              <div className="border-l-2 border-dashed border-muted-foreground h-8" />
            </div>

            <div className="flex justify-center text-xs">
              <div className="border rounded-lg p-3 bg-orange-50 text-center min-w-[200px]">
                <p className="font-mono font-semibold text-orange-700">api_payload</p>
                <p className="text-muted-foreground mt-1">BigQuery — run_id links to PostgreSQL</p>
                <p className="text-muted-foreground">1 row per HTTP response page per run</p>
              </div>
            </div>

            <div className="mt-4 p-3 border rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground">
                <strong>Cross-store reference:</strong> raw.api_payload.run_id references ops.extraction_run.run_id 
                across the PostgreSQL → BigQuery boundary. This is an application-level reference, not a database-enforced 
                foreign key. The API layer ensures referential integrity by always creating the extraction_run record in 
                PostgreSQL before writing any api_payload rows to BigQuery.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <Tabs defaultValue="source_system">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="source_system">source_system</TabsTrigger>
          <TabsTrigger value="endpoint_definition">endpoint_definition</TabsTrigger>
          <TabsTrigger value="endpoint_parameter">endpoint_parameter</TabsTrigger>
          <TabsTrigger value="extraction_run">extraction_run</TabsTrigger>
          <TabsTrigger value="extraction_event">extraction_event</TabsTrigger>
          <TabsTrigger value="api_payload">api_payload</TabsTrigger>
        </TabsList>

        <TabsContent value="source_system">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-mono">source_system</CardTitle>
                  <CardDescription>Defines external API systems such as NICE CXone, Gridspace, and Bland</CardDescription>
                </div>
                <Badge className="bg-blue-100 text-blue-700 border-0 text-[10px]">PostgreSQL</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <SchemaTable columns={[
                { name: "source_system_id", type: "TEXT", purpose: "Stable identifier (e.g., 'nice_cxone', 'bland')", constraint: "PRIMARY KEY" },
                { name: "source_system_name", type: "TEXT", purpose: "Human-readable display name", constraint: "NOT NULL" },
                { name: "base_url", type: "TEXT", purpose: "Base API URL for all endpoints under this system", constraint: "NOT NULL" },
                { name: "auth_type", type: "TEXT", purpose: "Authentication mode: API_KEY, OAUTH2_CLIENT_CREDENTIALS", constraint: "NOT NULL" },
                { name: "secret_manager_secret_name", type: "TEXT", purpose: "GCP Secret Manager reference — never the secret value itself" },
                { name: "service_account_email", type: "TEXT", purpose: "Service account used by Cloud Run Jobs for this system" },
                { name: "is_active", type: "BOOLEAN", purpose: "Whether this source system is enabled for extraction", constraint: "DEFAULT true" },
                { name: "created_ts", type: "TIMESTAMPTZ", purpose: "Record creation timestamp", constraint: "DEFAULT now()" },
                { name: "updated_ts", type: "TIMESTAMPTZ", purpose: "Last modification timestamp", constraint: "DEFAULT now()" },
              ]} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoint_definition">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-mono">endpoint_definition</CardTitle>
                  <CardDescription>Configures API endpoints with HTTP method, pagination, incremental strategy, and scheduling</CardDescription>
                </div>
                <Badge className="bg-blue-100 text-blue-700 border-0 text-[10px]">PostgreSQL</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <SchemaTable columns={[
                { name: "endpoint_id", type: "TEXT", purpose: "Stable endpoint identifier (e.g., 'nice_cxone_get_contacts')", constraint: "PRIMARY KEY" },
                { name: "source_system_id", type: "TEXT", purpose: "FK to source_system", constraint: "FK, NOT NULL" },
                { name: "endpoint_name", type: "TEXT", purpose: "Display name (e.g., 'get_contacts')", constraint: "NOT NULL" },
                { name: "http_method", type: "TEXT", purpose: "HTTP verb: GET, POST, etc.", constraint: "NOT NULL" },
                { name: "relative_path", type: "TEXT", purpose: "API path appended to source system base_url", constraint: "NOT NULL" },
                { name: "request_template_json", type: "JSONB", purpose: "Optional base request template for body/headers" },
                { name: "pagination_strategy", type: "TEXT", purpose: "NONE, PAGE_NUMBER, OFFSET_LIMIT, or NEXT_TOKEN", constraint: "NOT NULL" },
                { name: "pagination_config_json", type: "JSONB", purpose: "Strategy-specific config (page size, offset params, etc.)" },
                { name: "incremental_strategy", type: "TEXT", purpose: "FULL_REFRESH, DATE_WINDOW, CURSOR, or UNKNOWN", constraint: "NOT NULL" },
                { name: "incremental_config_json", type: "JSONB", purpose: "Windowing/cursor config (field names, safety lag, etc.)" },
                { name: "rate_limit_config_json", type: "JSONB", purpose: "Rate limiting settings (requests_per_second, backoff_strategy)" },
                { name: "schedule_cron", type: "TEXT", purpose: "Optional Cloud Scheduler cron expression" },
                { name: "is_active", type: "BOOLEAN", purpose: "Whether this endpoint is enabled", constraint: "DEFAULT true" },
                { name: "created_ts", type: "TIMESTAMPTZ", purpose: "Record creation timestamp", constraint: "DEFAULT now()" },
                { name: "updated_ts", type: "TIMESTAMPTZ", purpose: "Last modification timestamp", constraint: "DEFAULT now()" },
              ]} />
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 border rounded-lg">
                  <p className="text-xs font-semibold mb-2">Pagination Strategies</p>
                  <div className="space-y-1">
                    {[
                      { value: "NONE", desc: "Single request, no pagination" },
                      { value: "PAGE_NUMBER", desc: "page=1, page=2, ..." },
                      { value: "OFFSET_LIMIT", desc: "skip/top or offset/limit" },
                      { value: "NEXT_TOKEN", desc: "Cursor/token-based with next_token in response" },
                    ].map((p) => (
                      <div key={p.value} className="flex items-start gap-2">
                        <Badge variant="outline" className="text-[9px] font-mono shrink-0">{p.value}</Badge>
                        <span className="text-xs text-muted-foreground">{p.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="text-xs font-semibold mb-2">Incremental Strategies</p>
                  <div className="space-y-1">
                    {[
                      { value: "FULL_REFRESH", desc: "Extract all data every run" },
                      { value: "DATE_WINDOW", desc: "Extract data within a time window (startDate/endDate)" },
                      { value: "CURSOR", desc: "Resume from last processed cursor value across runs" },
                      { value: "UNKNOWN", desc: "Strategy not yet determined" },
                    ].map((p) => (
                      <div key={p.value} className="flex items-start gap-2">
                        <Badge variant="outline" className="text-[9px] font-mono shrink-0">{p.value}</Badge>
                        <span className="text-xs text-muted-foreground">{p.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoint_parameter">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-mono">endpoint_parameter</CardTitle>
                  <CardDescription>Parameter metadata that drives dynamic manual run forms in the UI</CardDescription>
                </div>
                <Badge className="bg-blue-100 text-blue-700 border-0 text-[10px]">PostgreSQL</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <SchemaTable columns={[
                { name: "endpoint_parameter_id", type: "TEXT", purpose: "Unique parameter identifier", constraint: "PRIMARY KEY" },
                { name: "endpoint_id", type: "TEXT", purpose: "FK to endpoint_definition", constraint: "FK, NOT NULL" },
                { name: "parameter_name", type: "TEXT", purpose: "API parameter name (e.g., 'startDate', 'top')", constraint: "NOT NULL" },
                { name: "parameter_label", type: "TEXT", purpose: "Human-readable label for the form field" },
                { name: "parameter_location", type: "TEXT", purpose: "Where in the request: QUERY, PATH, or BODY", constraint: "NOT NULL" },
                { name: "data_type", type: "TEXT", purpose: "STRING, INTEGER, BOOLEAN, DATE, TIMESTAMP, or JSON", constraint: "NOT NULL" },
                { name: "is_required", type: "BOOLEAN", purpose: "Whether the parameter must be supplied for a manual run", constraint: "DEFAULT false" },
                { name: "default_value", type: "TEXT", purpose: "Pre-filled default value in the form" },
                { name: "allowed_values_json", type: "JSONB", purpose: "Optional list of valid values (renders as dropdown)" },
                { name: "help_text", type: "TEXT", purpose: "Tooltip/help text shown in the form" },
                { name: "omit_if_blank", type: "BOOLEAN", purpose: "If true, exclude from request when user leaves blank", constraint: "DEFAULT true" },
                { name: "display_order", type: "INTEGER", purpose: "Controls ordering of fields in the form", constraint: "DEFAULT 0" },
                { name: "is_active", type: "BOOLEAN", purpose: "Whether this parameter is currently in use", constraint: "DEFAULT true" },
              ]} />
              <div className="mt-4 p-3 border rounded-lg">
                <p className="text-xs font-semibold mb-2">Unique constraint</p>
                <p className="text-xs text-muted-foreground font-mono">UNIQUE (endpoint_id, parameter_name)</p>
                <p className="text-xs text-muted-foreground mt-1">Prevents duplicate parameter names within the same endpoint.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="extraction_run">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-mono">extraction_run</CardTitle>
                  <CardDescription>One record per extraction execution — manual, scheduled, or replay</CardDescription>
                </div>
                <Badge className="bg-blue-100 text-blue-700 border-0 text-[10px]">PostgreSQL</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <SchemaTable columns={[
                { name: "run_id", type: "UUID", purpose: "Unique run identifier", constraint: "PRIMARY KEY" },
                { name: "parent_run_id", type: "UUID", purpose: "Original run this replay is retrying (NULL for non-replay runs)", constraint: "FK → self" },
                { name: "source_system_id", type: "TEXT", purpose: "FK to source_system", constraint: "FK, NOT NULL" },
                { name: "endpoint_id", type: "TEXT", purpose: "FK to endpoint_definition", constraint: "FK, NOT NULL" },
                { name: "run_type", type: "TEXT", purpose: "SCHEDULED, MANUAL, or REPLAY", constraint: "NOT NULL" },
                { name: "requested_by", type: "TEXT", purpose: "User or system that initiated the run" },
                { name: "window_start_ts", type: "TIMESTAMPTZ", purpose: "Start of the extraction time window" },
                { name: "window_end_ts", type: "TIMESTAMPTZ", purpose: "End of the extraction time window" },
                { name: "status", type: "TEXT", purpose: "QUEUED, RUNNING, SUCCEEDED, FAILED, PARTIAL_SUCCESS, CANCELLED", constraint: "NOT NULL" },
                { name: "cloud_run_job_name", type: "TEXT", purpose: "Name of the Cloud Run Job" },
                { name: "cloud_run_execution_id", type: "TEXT", purpose: "Specific execution ID for tracing" },
                { name: "started_ts", type: "TIMESTAMPTZ", purpose: "When the job actually started executing" },
                { name: "ended_ts", type: "TIMESTAMPTZ", purpose: "When the job completed or failed" },
                { name: "api_call_count", type: "INTEGER", purpose: "Total number of API calls made", constraint: "DEFAULT 0" },
                { name: "page_count", type: "INTEGER", purpose: "Total number of pages retrieved", constraint: "DEFAULT 0" },
                { name: "error_count", type: "INTEGER", purpose: "Number of failed pages", constraint: "DEFAULT 0" },
                { name: "last_checkpoint_json", type: "JSONB", purpose: "Saved pagination state for replay and diagnostics" },
                { name: "error_summary", type: "TEXT", purpose: "Human-readable error summary" },
                { name: "created_ts", type: "TIMESTAMPTZ", purpose: "Record creation timestamp", constraint: "DEFAULT now()" },
              ]} />
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 border rounded-lg">
                  <p className="text-xs font-semibold mb-2">Status Values</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: "QUEUED", color: "bg-gray-100 text-gray-700" },
                      { value: "RUNNING", color: "bg-blue-100 text-blue-700" },
                      { value: "SUCCEEDED", color: "bg-green-100 text-green-700" },
                      { value: "FAILED", color: "bg-red-100 text-red-700" },
                      { value: "PARTIAL_SUCCESS", color: "bg-yellow-100 text-yellow-700" },
                      { value: "CANCELLED", color: "bg-gray-100 text-gray-500" },
                    ].map((s) => (
                      <Badge key={s.value} className={`${s.color} border-0 text-[10px] font-mono`}>{s.value}</Badge>
                    ))}
                  </div>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="text-xs font-semibold mb-2">Indexes</p>
                  <div className="space-y-1 text-xs font-mono text-muted-foreground">
                    <p>idx_run_endpoint_status (endpoint_id, status)</p>
                    <p>idx_run_source (source_system_id)</p>
                    <p>idx_run_created (created_ts DESC)</p>
                  </div>
                </div>
              </div>
              <div className="mt-3 p-3 border rounded-lg bg-green-50">
                <p className="text-xs font-semibold text-green-700 mb-1">Concurrency guard (Q4 resolved)</p>
                <p className="text-xs text-green-600">
                  Before inserting a new run, check: <code className="font-mono">SELECT 1 FROM extraction_run WHERE endpoint_id = $1 AND status IN ('QUEUED', 'RUNNING') FOR UPDATE</code>. 
                  If a row exists, reject the new run. PostgreSQL row-level locking makes this safe and race-free.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="extraction_event">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-mono">extraction_event</CardTitle>
                  <CardDescription>Detailed lifecycle events for debugging and operator review</CardDescription>
                </div>
                <Badge className="bg-blue-100 text-blue-700 border-0 text-[10px]">PostgreSQL</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <SchemaTable columns={[
                { name: "event_id", type: "UUID", purpose: "Unique event identifier", constraint: "PRIMARY KEY" },
                { name: "run_id", type: "UUID", purpose: "FK to extraction_run", constraint: "FK, NOT NULL" },
                { name: "event_ts", type: "TIMESTAMPTZ", purpose: "When the event occurred", constraint: "DEFAULT now()" },
                { name: "event_type", type: "TEXT", purpose: "Event category (see below)", constraint: "NOT NULL" },
                { name: "severity", type: "TEXT", purpose: "INFO, WARN, ERROR", constraint: "NOT NULL" },
                { name: "message", type: "TEXT", purpose: "Human-readable event description" },
                { name: "details_json", type: "JSONB", purpose: "Structured payload for debugging" },
              ]} />
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 border rounded-lg">
                  <p className="text-xs font-semibold mb-2">Event Types</p>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "RUN_STARTED", "PAGE_REQUESTED", "PAGE_RECEIVED",
                      "CHECKPOINT_SAVED", "RETRY", "AUTH_REFRESHED",
                      "RUN_FAILED", "RUN_COMPLETED",
                    ].map((e) => (
                      <Badge key={e} variant="outline" className="text-[9px] font-mono">{e}</Badge>
                    ))}
                  </div>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="text-xs font-semibold mb-2">Indexes</p>
                  <div className="space-y-1 text-xs font-mono text-muted-foreground">
                    <p>idx_event_run (run_id, event_ts)</p>
                    <p>idx_event_type (event_type)</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api_payload">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-mono">raw.api_payload</CardTitle>
                  <CardDescription>
                    Immutable raw API response payloads — one row per HTTP response page.
                    Partitioned by DATE(ingested_ts), clustered by source_system_id, endpoint_id, run_id.
                  </CardDescription>
                </div>
                <Badge className="bg-orange-100 text-orange-700 border-0 text-[10px]">BigQuery</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <SchemaTable columns={[
                { name: "raw_payload_id", type: "STRING", purpose: "Unique payload identifier (UUID)", constraint: "Logical PK" },
                { name: "run_id", type: "STRING", purpose: "Links to extraction_run in PostgreSQL (application-level ref)", constraint: "NOT NULL" },
                { name: "source_system_id", type: "STRING", purpose: "Denormalized for clustering", constraint: "NOT NULL" },
                { name: "endpoint_id", type: "STRING", purpose: "Denormalized for clustering", constraint: "NOT NULL" },
                { name: "request_ts", type: "TIMESTAMP", purpose: "When the HTTP request was sent" },
                { name: "response_ts", type: "TIMESTAMP", purpose: "When the HTTP response was received" },
                { name: "http_method", type: "STRING", purpose: "GET, POST, etc." },
                { name: "request_url", type: "STRING", purpose: "Full request URL including query parameters" },
                { name: "http_status_code", type: "INT64", purpose: "HTTP response status code" },
                { name: "page_number", type: "INT64", purpose: "Sequential page number within this run" },
                { name: "page_token", type: "STRING", purpose: "Token used for this page request (NEXT_TOKEN strategy)" },
                { name: "next_page_token", type: "STRING", purpose: "Token for the next page (from response)" },
                { name: "request_params_json", type: "JSON", purpose: "Request query/path parameters sent" },
                { name: "request_body_json", type: "JSON", purpose: "Request body if POST/PUT" },
                { name: "response_body_json", type: "JSON", purpose: "Exact raw JSON returned by the API" },
                { name: "record_count_hint", type: "INT64", purpose: "Optional page-level count from the API response" },
                { name: "payload_hash", type: "STRING", purpose: "SHA-256 hash for duplicate detection and replay audit" },
                { name: "page_status", type: "STRING", purpose: "SUCCEEDED, FAILED, REPLAYED, or SKIPPED" },
                { name: "error_message", type: "STRING", purpose: "Error details if page_status is FAILED" },
                { name: "ingested_ts", type: "TIMESTAMP", purpose: "When the row was written to BigQuery (partition key)" },
              ]} />
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 border rounded-lg">
                  <p className="text-xs font-semibold mb-2">Page Status Values</p>
                  <div className="space-y-1">
                    {[
                      { value: "SUCCEEDED", desc: "Page was successfully retrieved and stored" },
                      { value: "FAILED", desc: "Page request failed (eligible for replay)" },
                      { value: "REPLAYED", desc: "Previously failed page was successfully retried" },
                      { value: "SKIPPED", desc: "Page was skipped (e.g., during partial replay)" },
                    ].map((s) => (
                      <div key={s.value} className="flex items-start gap-2">
                        <Badge variant="outline" className="text-[9px] font-mono shrink-0">{s.value}</Badge>
                        <span className="text-xs text-muted-foreground">{s.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="text-xs font-semibold mb-2">Storage Optimization</p>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p><strong>Partition:</strong> DATE(ingested_ts) — enables time-based pruning</p>
                    <p><strong>Cluster:</strong> source_system_id, endpoint_id, run_id — optimizes filtered queries</p>
                    <p><strong>Grain:</strong> One row per HTTP response page</p>
                    <p><strong>Dedup:</strong> payload_hash for application-level uniqueness</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
