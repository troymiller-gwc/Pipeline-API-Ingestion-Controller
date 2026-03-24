import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, AlertTriangle } from "lucide-react";

interface ColumnDef {
  name: string;
  type: string;
  purpose: string;
  required?: boolean;
}

function SchemaTable({ columns }: { columns: ColumnDef[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-48">Column</TableHead>
          <TableHead className="w-32">Type</TableHead>
          <TableHead>Purpose</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {columns.map((col) => (
          <TableRow key={col.name}>
            <TableCell>
              <code className="text-xs font-mono">{col.name}</code>
              {col.required && <Badge variant="outline" className="ml-2 text-[9px]">PK</Badge>}
            </TableCell>
            <TableCell>
              <Badge variant="secondary" className="text-[10px] font-mono">{col.type}</Badge>
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
          BigQuery table schemas across control, ops, and raw datasets.
        </p>
      </div>

      <Card className="border-yellow-300 bg-yellow-50">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-yellow-800">Design Recommendation</p>
              <p className="text-xs text-yellow-700 mt-1">
                The original spec uses BigQuery as the sole data store for all tables. BigQuery excels at analytical workloads 
                but has significant limitations for OLTP operations: DML rate limits (~1,500/table/day), high latency (~1-2s minimum), 
                and no transactional guarantees. <strong>Recommendation:</strong> Use Cloud SQL (PostgreSQL) for the control.* and ops.* 
                tables that require frequent CRUD operations, and reserve BigQuery for raw.api_payload where its columnar storage, 
                partitioning, and clustering strengths are ideal.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-4">Entity Relationships</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-3 justify-center text-xs">
              <div className="border rounded-lg p-3 bg-blue-50 text-center min-w-[140px]">
                <p className="font-mono font-semibold text-blue-700">source_system</p>
                <p className="text-muted-foreground mt-1">1</p>
              </div>
              <div className="flex flex-col items-center">
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">has many</span>
              </div>
              <div className="border rounded-lg p-3 bg-blue-50 text-center min-w-[140px]">
                <p className="font-mono font-semibold text-blue-700">endpoint_definition</p>
                <p className="text-muted-foreground mt-1">N</p>
              </div>
              <div className="flex flex-col items-center">
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">has many</span>
              </div>
              <div className="border rounded-lg p-3 bg-blue-50 text-center min-w-[140px]">
                <p className="font-mono font-semibold text-blue-700">endpoint_parameter</p>
                <p className="text-muted-foreground mt-1">N</p>
              </div>
            </div>

            <div className="flex justify-center my-4">
              <div className="border-l-2 border-dashed border-muted-foreground h-8" />
            </div>

            <div className="flex flex-wrap items-center gap-3 justify-center text-xs">
              <div className="border rounded-lg p-3 bg-green-50 text-center min-w-[140px]">
                <p className="font-mono font-semibold text-green-700">extraction_run</p>
                <p className="text-muted-foreground mt-1">References source_system + endpoint</p>
              </div>
              <div className="flex flex-col items-center">
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">produces</span>
              </div>
              <div className="border rounded-lg p-3 bg-green-50 text-center min-w-[140px]">
                <p className="font-mono font-semibold text-green-700">extraction_event</p>
                <p className="text-muted-foreground mt-1">N events per run</p>
              </div>
            </div>

            <div className="flex justify-center my-4">
              <div className="border-l-2 border-dashed border-muted-foreground h-8" />
            </div>

            <div className="flex justify-center text-xs">
              <div className="border rounded-lg p-3 bg-orange-50 text-center min-w-[140px]">
                <p className="font-mono font-semibold text-orange-700">api_payload</p>
                <p className="text-muted-foreground mt-1">1 row per HTTP response page per run</p>
              </div>
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
              <CardTitle className="font-mono">control.source_system</CardTitle>
              <CardDescription>Defines external API systems such as NICE CXone, Gridspace, and Bland</CardDescription>
            </CardHeader>
            <CardContent>
              <SchemaTable columns={[
                { name: "source_system_id", type: "STRING", purpose: "Stable identifier (e.g., 'nice_cxone', 'bland')", required: true },
                { name: "source_system_name", type: "STRING", purpose: "Human-readable display name" },
                { name: "base_url", type: "STRING", purpose: "Base API URL for all endpoints under this system" },
                { name: "auth_type", type: "STRING", purpose: "Authentication mode: API_KEY, OAUTH2_CLIENT_CREDENTIALS" },
                { name: "secret_manager_secret_name", type: "STRING", purpose: "GCP Secret Manager reference — never the secret value itself" },
                { name: "service_account_email", type: "STRING", purpose: "Service account used by Cloud Run Jobs for this system" },
                { name: "is_active", type: "BOOL", purpose: "Whether this source system is enabled for extraction" },
                { name: "created_ts", type: "TIMESTAMP", purpose: "Record creation timestamp" },
                { name: "updated_ts", type: "TIMESTAMP", purpose: "Last modification timestamp" },
              ]} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoint_definition">
          <Card>
            <CardHeader>
              <CardTitle className="font-mono">control.endpoint_definition</CardTitle>
              <CardDescription>Configures API endpoints with HTTP method, pagination, incremental strategy, and scheduling</CardDescription>
            </CardHeader>
            <CardContent>
              <SchemaTable columns={[
                { name: "endpoint_id", type: "STRING", purpose: "Stable endpoint identifier (e.g., 'nice_cxone_get_contacts')", required: true },
                { name: "source_system_id", type: "STRING", purpose: "FK to control.source_system" },
                { name: "endpoint_name", type: "STRING", purpose: "Display name (e.g., 'get_contacts')" },
                { name: "http_method", type: "STRING", purpose: "HTTP verb: GET, POST, etc." },
                { name: "relative_path", type: "STRING", purpose: "API path appended to source system base_url" },
                { name: "request_template_json", type: "JSON", purpose: "Optional base request template for body/headers" },
                { name: "pagination_strategy", type: "STRING", purpose: "NONE, PAGE_NUMBER, OFFSET_LIMIT, NEXT_TOKEN, or CURSOR" },
                { name: "pagination_config_json", type: "JSON", purpose: "Strategy-specific config (page size, offset params, etc.)" },
                { name: "incremental_strategy", type: "STRING", purpose: "FULL_REFRESH, DATE_WINDOW, CURSOR, or UNKNOWN" },
                { name: "incremental_config_json", type: "JSON", purpose: "Windowing/cursor config (field names, safety lag, etc.)" },
                { name: "schedule_cron", type: "STRING", purpose: "Optional Cloud Scheduler cron expression" },
                { name: "is_active", type: "BOOL", purpose: "Whether this endpoint is enabled" },
                { name: "created_ts", type: "TIMESTAMP", purpose: "Record creation timestamp" },
                { name: "updated_ts", type: "TIMESTAMP", purpose: "Last modification timestamp" },
              ]} />
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 border rounded-lg">
                  <p className="text-xs font-semibold mb-2">Pagination Strategies</p>
                  <div className="space-y-1">
                    {[
                      { value: "NONE", desc: "Single request, no pagination" },
                      { value: "PAGE_NUMBER", desc: "page=1, page=2, ..." },
                      { value: "OFFSET_LIMIT", desc: "skip/top or offset/limit" },
                      { value: "NEXT_TOKEN", desc: "Cursor-based with next_token in response" },
                      { value: "CURSOR", desc: "Opaque cursor from previous response" },
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
                      { value: "CURSOR", desc: "Resume from last processed cursor value" },
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
              <CardTitle className="font-mono">control.endpoint_parameter</CardTitle>
              <CardDescription>Parameter metadata that drives dynamic manual run forms in the UI</CardDescription>
            </CardHeader>
            <CardContent>
              <SchemaTable columns={[
                { name: "endpoint_parameter_id", type: "STRING", purpose: "Unique parameter identifier", required: true },
                { name: "endpoint_id", type: "STRING", purpose: "FK to control.endpoint_definition" },
                { name: "parameter_name", type: "STRING", purpose: "API parameter name (e.g., 'startDate', 'top')" },
                { name: "parameter_label", type: "STRING", purpose: "Human-readable label for the form field" },
                { name: "parameter_location", type: "STRING", purpose: "Where in the request: QUERY, PATH, or BODY" },
                { name: "data_type", type: "STRING", purpose: "STRING, INTEGER, BOOLEAN, DATE, TIMESTAMP, or JSON" },
                { name: "is_required", type: "BOOL", purpose: "Whether the parameter must be supplied for a manual run" },
                { name: "default_value", type: "STRING", purpose: "Pre-filled default value in the form" },
                { name: "allowed_values_json", type: "JSON", purpose: "Optional list of valid values (renders as dropdown)" },
                { name: "help_text", type: "STRING", purpose: "Tooltip/help text shown in the form" },
                { name: "omit_if_blank", type: "BOOL", purpose: "If true, exclude from request when user leaves blank" },
                { name: "display_order", type: "INT64", purpose: "Controls ordering of fields in the form" },
                { name: "is_active", type: "BOOL", purpose: "Whether this parameter is currently in use" },
              ]} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="extraction_run">
          <Card>
            <CardHeader>
              <CardTitle className="font-mono">ops.extraction_run</CardTitle>
              <CardDescription>One record per extraction execution — manual, scheduled, or replay</CardDescription>
            </CardHeader>
            <CardContent>
              <SchemaTable columns={[
                { name: "run_id", type: "STRING", purpose: "Unique run identifier (UUID)", required: true },
                { name: "source_system_id", type: "STRING", purpose: "FK to control.source_system" },
                { name: "endpoint_id", type: "STRING", purpose: "FK to control.endpoint_definition" },
                { name: "run_type", type: "STRING", purpose: "SCHEDULED, MANUAL, or REPLAY" },
                { name: "requested_by", type: "STRING", purpose: "User or system that initiated the run" },
                { name: "window_start_ts", type: "TIMESTAMP", purpose: "Start of the extraction time window" },
                { name: "window_end_ts", type: "TIMESTAMP", purpose: "End of the extraction time window" },
                { name: "status", type: "STRING", purpose: "QUEUED, RUNNING, SUCCEEDED, FAILED, PARTIAL_SUCCESS, CANCELLED" },
                { name: "cloud_run_job_name", type: "STRING", purpose: "Name of the Cloud Run Job" },
                { name: "cloud_run_execution_id", type: "STRING", purpose: "Specific execution ID for tracing" },
                { name: "started_ts", type: "TIMESTAMP", purpose: "When the job actually started executing" },
                { name: "ended_ts", type: "TIMESTAMP", purpose: "When the job completed or failed" },
                { name: "api_call_count", type: "INT64", purpose: "Total number of API calls made" },
                { name: "page_count", type: "INT64", purpose: "Total number of pages retrieved" },
                { name: "error_count", type: "INT64", purpose: "Number of failed pages" },
                { name: "last_checkpoint_json", type: "JSON", purpose: "Saved pagination state for replay and diagnostics" },
                { name: "error_summary", type: "STRING", purpose: "Human-readable error summary" },
                { name: "created_ts", type: "TIMESTAMP", purpose: "Record creation timestamp" },
              ]} />
              <div className="mt-4 p-3 border rounded-lg">
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="extraction_event">
          <Card>
            <CardHeader>
              <CardTitle className="font-mono">ops.extraction_event</CardTitle>
              <CardDescription>Detailed lifecycle events for debugging and operator review</CardDescription>
            </CardHeader>
            <CardContent>
              <SchemaTable columns={[
                { name: "event_id", type: "STRING", purpose: "Unique event identifier", required: true },
                { name: "run_id", type: "STRING", purpose: "FK to ops.extraction_run" },
                { name: "event_ts", type: "TIMESTAMP", purpose: "When the event occurred" },
                { name: "event_type", type: "STRING", purpose: "Event category (see below)" },
                { name: "severity", type: "STRING", purpose: "INFO, WARN, ERROR" },
                { name: "message", type: "STRING", purpose: "Human-readable event description" },
                { name: "details_json", type: "JSON", purpose: "Structured payload for debugging" },
              ]} />
              <div className="mt-4 p-3 border rounded-lg">
                <p className="text-xs font-semibold mb-2">Event Types</p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "RUN_STARTED", "PAGE_REQUESTED", "PAGE_RECEIVED",
                    "CHECKPOINT_SAVED", "RETRY", "RUN_FAILED", "RUN_COMPLETED",
                  ].map((e) => (
                    <Badge key={e} variant="outline" className="text-[9px] font-mono">{e}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api_payload">
          <Card>
            <CardHeader>
              <CardTitle className="font-mono">raw.api_payload</CardTitle>
              <CardDescription>
                Immutable raw API response payloads — one row per HTTP response page.
                Partitioned by DATE(ingested_ts), clustered by source_system_id, endpoint_id, run_id.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SchemaTable columns={[
                { name: "raw_payload_id", type: "STRING", purpose: "Unique payload identifier", required: true },
                { name: "run_id", type: "STRING", purpose: "FK to ops.extraction_run" },
                { name: "source_system_id", type: "STRING", purpose: "Denormalized for clustering — FK to source_system" },
                { name: "endpoint_id", type: "STRING", purpose: "Denormalized for clustering — FK to endpoint_definition" },
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
