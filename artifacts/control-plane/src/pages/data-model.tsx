import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Column {
  name: string;
  type: string;
  pk?: boolean;
  fk?: string;
  nullable?: boolean;
  defaultVal?: string;
}

interface Table {
  name: string;
  schema: string;
  columns: Column[];
}

interface Relationship {
  from: string;
  fromCol: string;
  to: string;
  toCol: string;
  label: string;
}

const cloudSqlTables: Table[] = [
  {
    name: "source_system",
    schema: "public",
    columns: [
      { name: "source_system_id", type: "text", pk: true },
      { name: "source_system_name", type: "text" },
      { name: "base_url", type: "text" },
      { name: "auth_type", type: "text" },
      { name: "secret_manager_secret_name", type: "text", nullable: true },
      { name: "service_account_email", type: "text", nullable: true },
      { name: "is_active", type: "boolean", defaultVal: "true" },
      { name: "created_ts", type: "timestamptz", defaultVal: "now()" },
      { name: "updated_ts", type: "timestamptz", defaultVal: "now()" },
    ],
  },
  {
    name: "endpoint_definition",
    schema: "public",
    columns: [
      { name: "endpoint_id", type: "text", pk: true },
      { name: "source_system_id", type: "text", fk: "source_system.source_system_id" },
      { name: "endpoint_name", type: "text" },
      { name: "http_method", type: "text" },
      { name: "relative_path", type: "text" },
      { name: "request_template_json", type: "jsonb", nullable: true },
      { name: "pagination_strategy", type: "text" },
      { name: "pagination_config_json", type: "jsonb", nullable: true },
      { name: "incremental_strategy", type: "text" },
      { name: "incremental_config_json", type: "jsonb", nullable: true },
      { name: "rate_limit_config_json", type: "jsonb", nullable: true },
      { name: "schedule_cron", type: "text", nullable: true },
      { name: "is_active", type: "boolean", defaultVal: "true" },
      { name: "created_ts", type: "timestamptz", defaultVal: "now()" },
      { name: "updated_ts", type: "timestamptz", defaultVal: "now()" },
    ],
  },
  {
    name: "endpoint_parameter",
    schema: "public",
    columns: [
      { name: "endpoint_parameter_id", type: "text", pk: true },
      { name: "endpoint_id", type: "text", fk: "endpoint_definition.endpoint_id" },
      { name: "parameter_name", type: "text" },
      { name: "parameter_label", type: "text", nullable: true },
      { name: "parameter_location", type: "text" },
      { name: "data_type", type: "text" },
      { name: "is_required", type: "boolean", defaultVal: "false" },
      { name: "default_value", type: "text", nullable: true },
      { name: "allowed_values_json", type: "jsonb", nullable: true },
      { name: "help_text", type: "text", nullable: true },
      { name: "omit_if_blank", type: "boolean", defaultVal: "true" },
      { name: "display_order", type: "integer", defaultVal: "0" },
      { name: "is_active", type: "boolean", defaultVal: "true" },
    ],
  },
  {
    name: "extraction_run",
    schema: "public",
    columns: [
      { name: "run_id", type: "uuid", pk: true, defaultVal: "gen_random_uuid()" },
      { name: "parent_run_id", type: "uuid", nullable: true, fk: "extraction_run.run_id" },
      { name: "source_system_id", type: "text", fk: "source_system.source_system_id" },
      { name: "endpoint_id", type: "text", fk: "endpoint_definition.endpoint_id" },
      { name: "run_type", type: "text" },
      { name: "requested_by", type: "text", nullable: true },
      { name: "window_start_ts", type: "timestamptz", nullable: true },
      { name: "window_end_ts", type: "timestamptz", nullable: true },
      { name: "status", type: "text" },
      { name: "cloud_run_job_name", type: "text", nullable: true },
      { name: "cloud_run_execution_id", type: "text", nullable: true },
      { name: "started_ts", type: "timestamptz", nullable: true },
      { name: "ended_ts", type: "timestamptz", nullable: true },
      { name: "api_call_count", type: "integer", defaultVal: "0" },
      { name: "page_count", type: "integer", defaultVal: "0" },
      { name: "error_count", type: "integer", defaultVal: "0" },
      { name: "last_checkpoint_json", type: "jsonb", nullable: true },
      { name: "error_summary", type: "text", nullable: true },
      { name: "created_ts", type: "timestamptz", defaultVal: "now()" },
    ],
  },
  {
    name: "extraction_event",
    schema: "public",
    columns: [
      { name: "event_id", type: "uuid", pk: true, defaultVal: "gen_random_uuid()" },
      { name: "run_id", type: "uuid", fk: "extraction_run.run_id" },
      { name: "event_ts", type: "timestamptz", defaultVal: "now()" },
      { name: "event_type", type: "text" },
      { name: "severity", type: "text" },
      { name: "message", type: "text", nullable: true },
      { name: "details_json", type: "jsonb", nullable: true },
    ],
  },
];

const cloudSqlRelationships: Relationship[] = [
  { from: "endpoint_definition", fromCol: "source_system_id", to: "source_system", toCol: "source_system_id", label: "belongs to" },
  { from: "endpoint_parameter", fromCol: "endpoint_id", to: "endpoint_definition", toCol: "endpoint_id", label: "belongs to" },
  { from: "extraction_run", fromCol: "source_system_id", to: "source_system", toCol: "source_system_id", label: "extracts from" },
  { from: "extraction_run", fromCol: "endpoint_id", to: "endpoint_definition", toCol: "endpoint_id", label: "uses" },
  { from: "extraction_run", fromCol: "parent_run_id", to: "extraction_run", toCol: "run_id", label: "replayed from" },
  { from: "extraction_event", fromCol: "run_id", to: "extraction_run", toCol: "run_id", label: "logged by" },
];

const bigQueryTables: Table[] = [
  {
    name: "raw.api_payload",
    schema: "raw",
    columns: [
      { name: "raw_payload_id", type: "STRING", pk: true },
      { name: "run_id", type: "STRING" },
      { name: "source_system_id", type: "STRING" },
      { name: "endpoint_id", type: "STRING" },
      { name: "request_ts", type: "TIMESTAMP" },
      { name: "response_ts", type: "TIMESTAMP" },
      { name: "http_method", type: "STRING" },
      { name: "request_url", type: "STRING" },
      { name: "http_status_code", type: "INT64" },
      { name: "page_number", type: "INT64" },
      { name: "page_token", type: "STRING", nullable: true },
      { name: "next_page_token", type: "STRING", nullable: true },
      { name: "request_params_json", type: "STRING", nullable: true },
      { name: "request_body_json", type: "STRING", nullable: true },
      { name: "response_body_json", type: "STRING" },
      { name: "record_count_hint", type: "INT64" },
      { name: "payload_hash", type: "STRING" },
      { name: "page_status", type: "STRING" },
      { name: "error_message", type: "STRING", nullable: true },
      { name: "ingested_ts", type: "TIMESTAMP" },
    ],
  },
  {
    name: "incontact.dispositions",
    schema: "incontact",
    columns: [
      { name: "disposition_id", type: "INT64", pk: true },
      { name: "disposition_name", type: "STRING" },
      { name: "is_preview_disposition", type: "BOOL", nullable: true },
      { name: "is_active", type: "BOOL", nullable: true },
      { name: "classification", type: "STRING", nullable: true },
      { name: "reporting_group", type: "STRING", nullable: true },
    ],
  },
  {
    name: "incontact.calls",
    schema: "incontact",
    columns: [
      { name: "contact_id", type: "INT64", pk: true },
      { name: "master_contact_id", type: "INT64" },
      { name: "contact_start_date", type: "TIMESTAMP" },
      { name: "agent_start_date", type: "TIMESTAMP", nullable: true },
      { name: "last_update_time", type: "TIMESTAMP", nullable: true },
      { name: "agent_id", type: "INT64" },
      { name: "first_name", type: "STRING", nullable: true },
      { name: "last_name", type: "STRING", nullable: true },
      { name: "campaign_id", type: "INT64" },
      { name: "campaign_name", type: "STRING", nullable: true },
      { name: "skill_id", type: "INT64" },
      { name: "skill_name", type: "STRING", nullable: true },
      { name: "team_id", type: "INT64" },
      { name: "team_name", type: "STRING", nullable: true },
      { name: "media_type_id", type: "INT64" },
      { name: "media_type_name", type: "STRING", nullable: true },
      { name: "from_address", type: "STRING", nullable: true },
      { name: "to_address", type: "STRING", nullable: true },
      { name: "state_id", type: "INT64" },
      { name: "state_name", type: "STRING", nullable: true },
      { name: "end_reason", type: "STRING", nullable: true },
      { name: "disposition_notes", type: "STRING", nullable: true },
      { name: "primary_disposition_id", type: "INT64", nullable: true },
      { name: "secondary_disposition_id", type: "INT64", nullable: true },
      { name: "primary_disposition_name", type: "STRING", nullable: true },
      { name: "secondary_disposition_name", type: "STRING", nullable: true },
      { name: "abandon_seconds", type: "FLOAT64", nullable: true },
      { name: "abandoned", type: "BOOL", nullable: true },
      { name: "acw_seconds", type: "FLOAT64", nullable: true },
      { name: "agent_seconds", type: "FLOAT64", nullable: true },
      { name: "hold_count", type: "INT64", nullable: true },
      { name: "hold_seconds", type: "FLOAT64", nullable: true },
      { name: "in_queue_seconds", type: "FLOAT64", nullable: true },
      { name: "total_duration_seconds", type: "FLOAT64", nullable: true },
      { name: "service_level_flag", type: "INT64", nullable: true },
      { name: "is_outbound", type: "BOOL", nullable: true },
      { name: "is_abandoned", type: "BOOL", nullable: true },
      { name: "is_refused", type: "BOOL", nullable: true },
      { name: "run_id", type: "STRING" },
      { name: "ingested_ts", type: "TIMESTAMP" },
    ],
  },
];

const bigQueryRelationships: Relationship[] = [
  { from: "incontact.calls", fromCol: "primary_disposition_id", to: "incontact.dispositions", toCol: "disposition_id", label: "primary disposition" },
  { from: "incontact.calls", fromCol: "secondary_disposition_id", to: "incontact.dispositions", toCol: "disposition_id", label: "secondary disposition" },
  { from: "incontact.calls", fromCol: "run_id", to: "raw.api_payload", toCol: "run_id", label: "extracted from" },
];

const crossPlatformRelationships: Relationship[] = [
  { from: "raw.api_payload (BQ)", fromCol: "run_id", to: "extraction_run (Cloud SQL)", toCol: "run_id", label: "payload for run" },
  { from: "raw.api_payload (BQ)", fromCol: "source_system_id", to: "source_system (Cloud SQL)", toCol: "source_system_id", label: "from source" },
  { from: "raw.api_payload (BQ)", fromCol: "endpoint_id", to: "endpoint_definition (Cloud SQL)", toCol: "endpoint_id", label: "from endpoint" },
];

function ColumnRow({ col }: { col: Column }) {
  return (
    <tr className="border-b border-muted last:border-b-0 hover:bg-muted/30">
      <td className="py-1.5 px-3 text-xs font-mono flex items-center gap-1.5">
        {col.pk && <Badge className="text-[10px] px-1 py-0 bg-amber-500/20 text-amber-700 border-amber-300">PK</Badge>}
        {col.fk && <Badge className="text-[10px] px-1 py-0 bg-blue-500/20 text-blue-700 border-blue-300">FK</Badge>}
        {col.name}
      </td>
      <td className="py-1.5 px-3 text-xs text-muted-foreground font-mono">{col.type}</td>
      <td className="py-1.5 px-3 text-xs text-muted-foreground">
        {col.nullable ? "NULL" : "NOT NULL"}
      </td>
      <td className="py-1.5 px-3 text-xs text-muted-foreground font-mono">
        {col.fk && <span className="text-blue-600">{col.fk}</span>}
        {col.defaultVal && !col.fk && <span>{col.defaultVal}</span>}
      </td>
    </tr>
  );
}

function TableCard({ table }: { table: Table }) {
  const [expanded, setExpanded] = useState(true);
  return (
    <Card className="overflow-hidden">
      <CardHeader
        className="py-3 px-4 cursor-pointer hover:bg-muted/50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-mono">{table.name}</CardTitle>
          <Badge variant="outline" className="text-xs">
            {table.columns.length} cols
          </Badge>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left py-1.5 px-3 text-xs font-medium text-muted-foreground">Column</th>
                <th className="text-left py-1.5 px-3 text-xs font-medium text-muted-foreground">Type</th>
                <th className="text-left py-1.5 px-3 text-xs font-medium text-muted-foreground">Nullable</th>
                <th className="text-left py-1.5 px-3 text-xs font-medium text-muted-foreground">FK / Default</th>
              </tr>
            </thead>
            <tbody>
              {table.columns.map((col) => (
                <ColumnRow key={col.name} col={col} />
              ))}
            </tbody>
          </table>
        </CardContent>
      )}
    </Card>
  );
}

function RelationshipList({ relationships }: { relationships: Relationship[] }) {
  return (
    <div className="space-y-2">
      {relationships.map((rel, i) => (
        <div key={i} className="flex items-center gap-2 text-xs bg-muted/30 rounded-lg p-2.5">
          <span className="font-mono font-medium">{rel.from}</span>
          <span className="text-muted-foreground">.{rel.fromCol}</span>
          <svg className="h-3 w-6 text-muted-foreground" viewBox="0 0 24 12">
            <line x1="0" y1="6" x2="20" y2="6" stroke="currentColor" strokeWidth="1.5" />
            <polygon points="20,2 24,6 20,10" fill="currentColor" />
          </svg>
          <span className="font-mono font-medium">{rel.to}</span>
          <span className="text-muted-foreground">.{rel.toCol}</span>
          <Badge variant="secondary" className="ml-auto text-[10px]">{rel.label}</Badge>
        </div>
      ))}
    </div>
  );
}

export default function DataModelPage() {
  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-2xl font-bold mb-1">Data Model</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Relational schema for Cloud SQL (control plane metadata) and BigQuery (raw + transformed data).
      </p>

      <Tabs defaultValue="cloudsql" className="space-y-6">
        <TabsList>
          <TabsTrigger value="cloudsql">Cloud SQL (PostgreSQL)</TabsTrigger>
          <TabsTrigger value="bigquery">BigQuery</TabsTrigger>
          <TabsTrigger value="cross">Cross-Platform Links</TabsTrigger>
        </TabsList>

        <TabsContent value="cloudsql" className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-1">Cloud SQL Tables</h2>
            <p className="text-sm text-muted-foreground mb-4">
              PostgreSQL database <code className="text-xs bg-muted px-1 py-0.5 rounded">control_plane</code> on Cloud SQL — stores metadata for source systems, endpoints, extraction runs, and events.
            </p>
            <div className="grid gap-4">
              {cloudSqlTables.map((t) => (
                <TableCard key={t.name} table={t} />
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-3">Relationships</h3>
            <RelationshipList relationships={cloudSqlRelationships} />
          </div>
        </TabsContent>

        <TabsContent value="bigquery" className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-1">BigQuery Tables</h2>
            <p className="text-sm text-muted-foreground mb-4">
              GCP project <code className="text-xs bg-muted px-1 py-0.5 rounded">gwc-poc-487320</code>, location <code className="text-xs bg-muted px-1 py-0.5 rounded">us-central1</code> — stores raw API payloads and transformed/enriched data.
            </p>
            <div className="grid gap-4">
              {bigQueryTables.map((t) => (
                <TableCard key={t.name} table={t} />
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-3">Relationships</h3>
            <RelationshipList relationships={bigQueryRelationships} />
          </div>
        </TabsContent>

        <TabsContent value="cross" className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-1">Cross-Platform Relationships</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Logical links between Cloud SQL control metadata and BigQuery data. These are not enforced foreign keys — they represent the data lineage across platforms.
            </p>
            <RelationshipList relationships={crossPlatformRelationships} />
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Data Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 flex-wrap text-xs">
                <div className="bg-blue-500/10 border border-blue-300 rounded-lg px-3 py-2 text-center">
                  <div className="font-semibold text-blue-700">Cloud SQL</div>
                  <div className="text-muted-foreground">source_system</div>
                  <div className="text-muted-foreground">endpoint_definition</div>
                </div>
                <svg className="h-3 w-8 text-muted-foreground shrink-0" viewBox="0 0 32 12">
                  <line x1="0" y1="6" x2="28" y2="6" stroke="currentColor" strokeWidth="1.5" />
                  <polygon points="28,2 32,6 28,10" fill="currentColor" />
                </svg>
                <div className="bg-green-500/10 border border-green-300 rounded-lg px-3 py-2 text-center">
                  <div className="font-semibold text-green-700">Cloud SQL</div>
                  <div className="text-muted-foreground">extraction_run</div>
                  <div className="text-muted-foreground">extraction_event</div>
                </div>
                <svg className="h-3 w-8 text-muted-foreground shrink-0" viewBox="0 0 32 12">
                  <line x1="0" y1="6" x2="28" y2="6" stroke="currentColor" strokeWidth="1.5" />
                  <polygon points="28,2 32,6 28,10" fill="currentColor" />
                </svg>
                <div className="bg-orange-500/10 border border-orange-300 rounded-lg px-3 py-2 text-center">
                  <div className="font-semibold text-orange-700">BigQuery</div>
                  <div className="text-muted-foreground">raw.api_payload</div>
                </div>
                <svg className="h-3 w-8 text-muted-foreground shrink-0" viewBox="0 0 32 12">
                  <line x1="0" y1="6" x2="28" y2="6" stroke="currentColor" strokeWidth="1.5" />
                  <polygon points="28,2 32,6 28,10" fill="currentColor" />
                </svg>
                <div className="bg-purple-500/10 border border-purple-300 rounded-lg px-3 py-2 text-center">
                  <div className="font-semibold text-purple-700">BigQuery</div>
                  <div className="text-muted-foreground">incontact.calls</div>
                  <div className="text-muted-foreground">incontact.dispositions</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
