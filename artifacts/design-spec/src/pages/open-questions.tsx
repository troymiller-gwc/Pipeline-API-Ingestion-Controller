import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, HelpCircle, Lightbulb, CheckCircle2 } from "lucide-react";

interface QuestionProps {
  id: string;
  severity: "critical" | "important" | "minor";
  status: "resolved" | "open";
  title: string;
  description: string;
  recommendation?: string;
  resolution?: string;
  specReference?: string;
}

function QuestionCard({ id, severity, status, title, description, recommendation, resolution, specReference }: QuestionProps) {
  const colors = {
    critical: { card: "border-red-200", badge: "bg-red-100 text-red-700", icon: "text-red-500" },
    important: { card: "border-yellow-200", badge: "bg-yellow-100 text-yellow-700", icon: "text-yellow-500" },
    minor: { card: "border-blue-200", badge: "bg-blue-100 text-blue-700", icon: "text-blue-500" },
  };
  const c = colors[severity];
  const isResolved = status === "resolved";

  return (
    <Card className={isResolved ? "border-green-200 bg-green-50/30" : c.card}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2">
            {isResolved ? (
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-green-500" />
            ) : (
              <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${c.icon}`} />
            )}
            <div>
              <CardTitle className="text-sm">{id}: {title}</CardTitle>
              {specReference && (
                <CardDescription className="text-[10px] mt-0.5">Spec reference: {specReference}</CardDescription>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isResolved && (
              <Badge className="bg-green-100 text-green-700 border-0 text-[10px]">Resolved</Badge>
            )}
            <Badge className={`${c.badge} border-0 text-[10px]`}>
              {severity === "critical" ? "Critical" : severity === "important" ? "Important" : "Minor"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-2">{description}</p>
        {resolution && (
          <div className="flex items-start gap-2 p-2 bg-green-50 rounded border border-green-200 mb-2">
            <CheckCircle2 className="h-3 w-3 text-green-600 mt-0.5 shrink-0" />
            <p className="text-xs text-green-700"><strong>Decision:</strong> {resolution}</p>
          </div>
        )}
        {!isResolved && recommendation && (
          <div className="flex items-start gap-2 p-2 bg-green-50 rounded border border-green-200">
            <Lightbulb className="h-3 w-3 text-green-600 mt-0.5 shrink-0" />
            <p className="text-xs text-green-700"><strong>Recommendation:</strong> {recommendation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function OpenQuestionsPage() {
  const resolvedCount = 4;
  const openCritical = 1;
  const openImportant = 3;
  const openMinor = 1;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Open Questions & Recommendations</h1>
        <p className="text-muted-foreground mt-2">
          Design gaps, ambiguities, and architectural recommendations identified during spec review.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4 text-center border-green-200">
          <p className="text-2xl font-bold text-green-600">{resolvedCount}</p>
          <p className="text-xs text-muted-foreground">Resolved</p>
        </Card>
        <Card className="p-4 text-center border-red-200">
          <p className="text-2xl font-bold text-red-600">{openCritical}</p>
          <p className="text-xs text-muted-foreground">Open Critical</p>
        </Card>
        <Card className="p-4 text-center border-yellow-200">
          <p className="text-2xl font-bold text-yellow-600">{openImportant}</p>
          <p className="text-xs text-muted-foreground">Open Important</p>
        </Card>
        <Card className="p-4 text-center border-blue-200">
          <p className="text-2xl font-bold text-blue-600">{openMinor}</p>
          <p className="text-xs text-muted-foreground">Open Minor</p>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          Resolved Issues
        </h2>
        <div className="space-y-4">
          <QuestionCard
            id="Q1"
            severity="critical"
            status="resolved"
            title="BigQuery as sole OLTP data store"
            description="The spec uses BigQuery as the only data store for all tables including control metadata (source_system, endpoint_definition, endpoint_parameter) that require frequent CRUD operations. BigQuery has significant limitations for transactional workloads: DML rate limits (~1,500 statements/table/day), high query latency (~1-2 seconds minimum), no UPDATE/DELETE in the traditional sense (uses expensive DML operations), and no transactional guarantees."
            resolution="Split storage adopted: Cloud SQL (PostgreSQL) for control.* and ops.* tables. BigQuery reserved exclusively for raw.api_payload. This provides real transactional guarantees, sub-millisecond CRUD, and proper constraint enforcement while keeping BigQuery's analytical strengths for payload storage."
            specReference="Technical Architecture - 'BigQuery is the single data store'"
          />

          <QuestionCard
            id="Q2"
            severity="critical"
            status="resolved"
            title="No primary keys or uniqueness constraints"
            description="The BigQuery DDL defines no PRIMARY KEY, UNIQUE, or NOT NULL constraints on any table. Fields like source_system_id, endpoint_id, run_id, and raw_payload_id all need uniqueness guarantees. Without these, the system is vulnerable to duplicate records from retries, race conditions, and application bugs."
            resolution="Resolved by Q1 decision. PostgreSQL provides real PRIMARY KEY, FOREIGN KEY, UNIQUE, and NOT NULL constraints for all control/ops tables. BigQuery retains payload_hash for application-level deduplication on raw.api_payload."
            specReference="BigQuery DDL - all CREATE TABLE statements"
          />

          <QuestionCard
            id="Q4"
            severity="important"
            status="resolved"
            title="Missing concurrency controls"
            description="There is no design for what happens when two runs for the same endpoint overlap. A scheduled run could fire while a manual run is still executing, leading to duplicate data extraction, conflicting checkpoint updates, or API rate limit exhaustion."
            resolution="Resolved by Q1 decision. PostgreSQL enables row-level locking via SELECT ... FOR UPDATE. Before creating a new run, the system checks for active runs on the same endpoint within a transaction. If one exists, the new run is rejected. This is safe and race-free with PostgreSQL transactions."
            specReference="Product Spec - 'Manual execution', 'Scheduled execution'"
          />

          <QuestionCard
            id="Q9"
            severity="minor"
            status="resolved"
            title="Missing parent_run_id for replay tracking"
            description="The extraction_run table has no field to link a replay run back to its original run. Without this, operators lose the ability to trace replay lineage."
            resolution="parent_run_id (UUID, nullable, self-referencing FK) added to extraction_run. NULL for MANUAL/SCHEDULED runs, populated with the original run_id for REPLAY runs. PostgreSQL FK constraint ensures referential integrity."
            specReference="Technical Architecture - ops.extraction_run schema"
          />
        </div>
      </div>

      <Separator />

      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Open Critical Issues
        </h2>
        <div className="space-y-4">
          <QuestionCard
            id="Q3"
            severity="critical"
            status="open"
            title="Authentication flow underspecified"
            description="The spec defines auth_type values (API_KEY, OAUTH2_CLIENT_CREDENTIALS) and references Secret Manager, but there is no design for: token acquisition flow, token caching/refresh, handling expired tokens mid-run, or what happens if Secret Manager is unavailable. For OAUTH2_CLIENT_CREDENTIALS, the Cloud Run Job needs to acquire and refresh tokens, which adds complexity to the execution layer."
            recommendation="Design a dedicated auth module within the Cloud Run Job that: (1) resolves credentials from Secret Manager at startup, (2) implements a token cache with proactive refresh for OAuth2, (3) handles mid-run token expiration by re-acquiring before the next API call, and (4) logs auth events (AUTH_REFRESHED) to extraction_event for auditability."
            specReference="Technical Architecture - 'auth_type', 'secret_manager_secret_name'"
          />
        </div>
      </div>

      <Separator />

      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          Open Important Issues
        </h2>
        <div className="space-y-4">
          <QuestionCard
            id="Q5"
            severity="important"
            status="open"
            title="Missing rate limiting and throttling"
            description="Third-party APIs like NICE CXone have rate limits. The spec has no design for: respecting API rate limits, implementing backoff strategies, tracking API quota consumption, or what happens when the rate limit is hit mid-pagination."
            recommendation="Add rate_limit_config_json to endpoint_definition (already included in updated schema) with fields like: requests_per_second, requests_per_minute, and backoff_strategy. The Cloud Run Job pagination engine should implement a token bucket or similar rate limiter that respects these settings."
            specReference="NICE CXone spec - no rate limit mentioned"
          />

          <QuestionCard
            id="Q6"
            severity="important"
            status="open"
            title="Replay semantics ambiguity"
            description="When a replayed page succeeds, should its page_status be 'REPLAYED' (preserving audit trail that a retry occurred) or 'SUCCEEDED' (simpler but loses the replay signal)? The NICE CXone spec and the product spec give different impressions."
            recommendation="Use REPLAYED for successfully retried pages (preserves audit history). Each replay run gets its own run_id with run_type=REPLAY, and parent_run_id links back to the original run (now implemented via Q9 resolution)."
            specReference="Product Spec - 'page_status: REPLAYED'; NICE spec - 'Replay Logic'"
          />

          <QuestionCard
            id="Q7"
            severity="important"
            status="open"
            title="Pagination strategy enum inconsistency"
            description="The technical spec lists CURSOR as both a pagination strategy and an incremental strategy, but they serve different purposes. Pagination CURSOR is for page-level navigation within a single run. Incremental CURSOR is for tracking the last-processed record across runs. Using the same term for both is confusing."
            recommendation="Clarify: (1) Pagination strategies: NONE, PAGE_NUMBER, OFFSET_LIMIT, NEXT_TOKEN. Remove CURSOR from pagination since NEXT_TOKEN covers it. (2) Incremental strategies: FULL_REFRESH, DATE_WINDOW, CURSOR. Keep CURSOR here for 'resume from last record' semantics across runs. (Updated schema already reflects this recommendation.)"
            specReference="Technical Architecture - 'pagination_strategy', 'incremental_strategy'"
          />
        </div>
      </div>

      <Separator />

      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-blue-500" />
          Open Minor Issues
        </h2>
        <div className="space-y-4">
          <QuestionCard
            id="Q8"
            severity="minor"
            status="open"
            title="Tech stack mismatch"
            description="The implementation prompt specifies 'Next.js frontend + Python FastAPI backend', but the development workspace uses React + Vite + TypeScript Express. Since the goal is to deploy to GCP independently via GitHub, either stack could work."
            recommendation="Align on the workspace's existing TypeScript/Express + React/Vite stack for faster development. The final GCP deployment uses Docker containers regardless, so the framework choice doesn't affect the deployment architecture."
            specReference="Implementation Prompt - 'Frontend: Next.js, Backend: Python FastAPI'"
          />
        </div>
      </div>

      <Separator />

      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          Decision Log
        </h2>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[
                {
                  date: "2025-03-24",
                  decision: "Adopt split storage: Cloud SQL (PostgreSQL) for control/ops, BigQuery for raw payloads",
                  impact: "Resolves Q1 (OLTP limitations), Q2 (constraints), Q4 (concurrency via row locking), Q9 (parent_run_id FK)",
                  questions: "Q1, Q2, Q4, Q9",
                },
              ].map((d, i) => (
                <div key={i} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold">{d.decision}</p>
                    <Badge variant="outline" className="text-[9px]">{d.date}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{d.impact}</p>
                  <div className="flex gap-1.5 mt-2">
                    {d.questions.split(", ").map((q) => (
                      <Badge key={q} className="bg-green-100 text-green-700 border-0 text-[9px]">{q}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
