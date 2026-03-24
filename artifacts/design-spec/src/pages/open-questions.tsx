import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, HelpCircle, Lightbulb, CheckCircle2 } from "lucide-react";
import { CardTitle, CardDescription } from "@/components/ui/card";

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
      <div className="px-6 pt-4 pb-2">
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
      </div>
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
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Open Questions & Recommendations</h1>
        <p className="text-muted-foreground mt-2">
          Design gaps, ambiguities, and architectural recommendations identified during spec review. All questions have been resolved.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 text-center border-green-200 bg-green-50/30">
          <p className="text-3xl font-bold text-green-600">9</p>
          <p className="text-xs text-muted-foreground">All Resolved</p>
        </Card>
        <Card className="p-4 text-center border-gray-200">
          <p className="text-3xl font-bold text-gray-400">0</p>
          <p className="text-xs text-muted-foreground">Open</p>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          All Resolved Issues
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
            id="Q3"
            severity="critical"
            status="resolved"
            title="Authentication flow underspecified"
            description="The spec defines auth_type values (API_KEY, OAUTH2_CLIENT_CREDENTIALS) and references Secret Manager, but there is no design for: token acquisition flow, token caching/refresh, handling expired tokens mid-run, or what happens if Secret Manager is unavailable. For OAUTH2_CLIENT_CREDENTIALS, the Cloud Run Job needs to acquire and refresh tokens, which adds complexity to the execution layer."
            resolution="Dedicated auth module designed for the Cloud Run Job execution layer: (1) resolves credentials from Secret Manager at job startup, (2) implements an in-memory token cache with proactive refresh for OAuth2 (re-acquire when <10% TTL remaining), (3) handles mid-run token expiration by re-acquiring before the next API call, and (4) logs AUTH_REFRESHED events to extraction_event for auditability. Secret Manager unavailability is a fatal startup error that fails the run immediately."
            specReference="Technical Architecture - 'auth_type', 'secret_manager_secret_name'"
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
            id="Q5"
            severity="important"
            status="resolved"
            title="Missing rate limiting and throttling"
            description="Third-party APIs like NICE CXone have rate limits. The spec has no design for: respecting API rate limits, implementing backoff strategies, tracking API quota consumption, or what happens when the rate limit is hit mid-pagination."
            resolution="rate_limit_config_json added to endpoint_definition with fields: requests_per_second, requests_per_minute, and backoff_strategy (EXPONENTIAL, LINEAR, FIXED). The Cloud Run Job pagination engine implements a token bucket rate limiter that checks available tokens before each API call. When rate-limited mid-pagination, the engine waits with exponential backoff and logs RATE_LIMITED events."
            specReference="NICE CXone spec - no rate limit mentioned"
          />

          <QuestionCard
            id="Q6"
            severity="important"
            status="resolved"
            title="Replay semantics ambiguity"
            description="When a replayed page succeeds, should its page_status be 'REPLAYED' (preserving audit trail that a retry occurred) or 'SUCCEEDED' (simpler but loses the replay signal)? The NICE CXone spec and the product spec give different impressions."
            resolution="REPLAYED status adopted for successfully retried pages (preserves full audit history). Each replay run gets its own run_id with run_type=REPLAY, and parent_run_id (implemented via Q9) links back to the original run. This provides clear lineage: operators can trace original run → failed pages → replay run → replayed pages."
            specReference="Product Spec - 'page_status: REPLAYED'; NICE spec - 'Replay Logic'"
          />

          <QuestionCard
            id="Q7"
            severity="important"
            status="resolved"
            title="Pagination strategy enum inconsistency"
            description="The technical spec lists CURSOR as both a pagination strategy and an incremental strategy, but they serve different purposes. Pagination CURSOR is for page-level navigation within a single run. Incremental CURSOR is for tracking the last-processed record across runs. Using the same term for both is confusing."
            resolution="CURSOR removed from pagination strategies. Final pagination enum: NONE, PAGE_NUMBER, OFFSET_LIMIT, NEXT_TOKEN. NEXT_TOKEN covers all cursor/token-based page navigation. Final incremental enum: FULL_REFRESH, DATE_WINDOW, CURSOR. CURSOR retained here for 'resume from last record' semantics across runs. Schema already reflects this."
            specReference="Technical Architecture - 'pagination_strategy', 'incremental_strategy'"
          />

          <QuestionCard
            id="Q8"
            severity="minor"
            status="resolved"
            title="Tech stack mismatch"
            description="The implementation prompt specifies 'Next.js frontend + Python FastAPI backend', but the development workspace uses React + Vite + TypeScript Express. Since the goal is to deploy to GCP independently via GitHub, either stack could work."
            resolution="Aligned on TypeScript/Express + React/Vite stack. This matches the existing workspace, enables code sharing between frontend and backend (shared types, validation schemas), and simplifies the build pipeline. GCP deployment uses Docker containers regardless, so the framework choice doesn't affect deployment architecture."
            specReference="Implementation Prompt - 'Frontend: Next.js, Backend: Python FastAPI'"
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
                {
                  date: "2025-03-24",
                  decision: "Auth module design: Secret Manager at startup, token cache with proactive refresh, AUTH_REFRESHED events",
                  impact: "Resolves Q3 (auth flow). Defines token lifecycle for both API_KEY and OAUTH2_CLIENT_CREDENTIALS modes",
                  questions: "Q3",
                },
                {
                  date: "2025-03-24",
                  decision: "Rate limiting via token bucket: rate_limit_config_json on endpoint_definition, backoff strategies",
                  impact: "Resolves Q5. Pagination engine respects per-endpoint rate limits with configurable backoff",
                  questions: "Q5",
                },
                {
                  date: "2025-03-24",
                  decision: "Replay semantics: REPLAYED status + own run_id with parent_run_id linkage",
                  impact: "Resolves Q6. Full audit trail preserved: original run → failed pages → replay run → replayed pages",
                  questions: "Q6",
                },
                {
                  date: "2025-03-24",
                  decision: "Pagination enum cleanup: remove CURSOR from pagination, keep in incremental only",
                  impact: "Resolves Q7. NEXT_TOKEN covers all cursor-based pagination; CURSOR reserved for cross-run incremental semantics",
                  questions: "Q7",
                },
                {
                  date: "2025-03-24",
                  decision: "Tech stack: TypeScript/Express + React/Vite (align with workspace)",
                  impact: "Resolves Q8. Shared TypeScript types, single build toolchain, Docker deployment unchanged",
                  questions: "Q8",
                },
              ].map((d, i) => (
                <div key={i} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold">{d.decision}</p>
                    <Badge variant="outline" className="text-[9px] shrink-0">{d.date}</Badge>
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
