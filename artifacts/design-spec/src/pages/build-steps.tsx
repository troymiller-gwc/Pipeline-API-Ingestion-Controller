import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Circle, ArrowRight, Clock, AlertCircle } from "lucide-react";

type StepStatus = "complete" | "in-progress" | "blocked" | "not-started";

interface BuildStep {
  id: string;
  title: string;
  description: string;
  status: StepStatus;
  tasks: { label: string; done: boolean }[];
  dependsOn?: string[];
  outputs?: string[];
}

function statusConfig(status: StepStatus) {
  switch (status) {
    case "complete":
      return { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50 border-green-200", badge: "bg-green-100 text-green-700", label: "Complete" };
    case "in-progress":
      return { icon: Clock, color: "text-blue-500", bg: "bg-blue-50 border-blue-200", badge: "bg-blue-100 text-blue-700", label: "In Progress" };
    case "blocked":
      return { icon: AlertCircle, color: "text-yellow-500", bg: "bg-yellow-50 border-yellow-200", badge: "bg-yellow-100 text-yellow-700", label: "Blocked" };
    case "not-started":
      return { icon: Circle, color: "text-gray-400", bg: "bg-white border-gray-200", badge: "bg-gray-100 text-gray-500", label: "Not Started" };
  }
}

const phases: { name: string; description: string; steps: BuildStep[] }[] = [
  {
    name: "Phase 1: Foundation",
    description: "Database schema, project structure, and shared packages",
    steps: [
      {
        id: "1.1",
        title: "PostgreSQL Schema & Migrations",
        description: "Create the Cloud SQL schema with all control and ops tables, constraints, indexes, and seed data.",
        status: "complete",
        tasks: [
          { label: "Set up migration tool (drizzle-orm or raw SQL migrations)", done: true },
          { label: "Create control.source_system table with PK, constraints", done: true },
          { label: "Create control.endpoint_definition table with FK to source_system", done: true },
          { label: "Create control.endpoint_parameter table with FK and UNIQUE constraint", done: true },
          { label: "Create ops.extraction_run table with self-referencing parent_run_id FK", done: true },
          { label: "Create ops.extraction_event table with FK to extraction_run", done: true },
          { label: "Add all indexes (idx_run_endpoint_status, idx_run_created, idx_event_run, etc.)", done: true },
          { label: "Seed NICE CXone source_system and get_contacts endpoint_definition", done: true },
        ],
        outputs: ["Migration files", "Database schema", "Seed data script"],
      },
      {
        id: "1.2",
        title: "Shared Types & Validation (api-zod)",
        description: "Define TypeScript types and Zod schemas shared between frontend and backend.",
        status: "complete",
        tasks: [
          { label: "Define enums: PaginationStrategy, IncrementalStrategy, RunType, RunStatus, etc.", done: true },
          { label: "Define Zod schemas for source_system CRUD", done: true },
          { label: "Define Zod schemas for endpoint_definition CRUD", done: true },
          { label: "Define Zod schemas for endpoint_parameter CRUD", done: true },
          { label: "Define Zod schemas for extraction_run (create, status update)", done: true },
          { label: "Define Zod schemas for extraction_event", done: true },
          { label: "Export inferred TypeScript types from all schemas", done: true },
        ],
        outputs: ["@workspace/api-zod package with all shared types"],
      },
      {
        id: "1.3",
        title: "BigQuery Schema Setup",
        description: "Create the BigQuery raw dataset and api_payload table with partitioning and clustering.",
        status: "complete",
        tasks: [
          { label: "Create raw dataset in BigQuery", done: true },
          { label: "Create raw.api_payload table with all columns", done: true },
          { label: "Configure partitioning by DATE(ingested_ts)", done: true },
          { label: "Configure clustering by source_system_id, endpoint_id, run_id", done: true },
          { label: "Set up BigQuery client library and connection config", done: true },
        ],
        outputs: ["BigQuery raw.api_payload DDL", "BigQuery schema reference"],
      },
      {
        id: "1.4",
        title: "Database Client (db package)",
        description: "Configure the database client package for PostgreSQL connections with query helpers.",
        status: "complete",
        dependsOn: ["1.1"],
        tasks: [
          { label: "Configure PostgreSQL connection pool (pg or drizzle)", done: true },
          { label: "Set up environment-based connection config (local vs Cloud SQL)", done: true },
          { label: "Create typed query helpers for each table", done: true },
          { label: "Add transaction support wrapper", done: true },
        ],
        outputs: ["@workspace/db package with typed queries"],
      },
    ],
  },
  {
    name: "Phase 2: Backend API",
    description: "Express API server with CRUD endpoints, request builder, and orchestration",
    steps: [
      {
        id: "2.1",
        title: "Source System CRUD API",
        description: "REST endpoints for managing source systems (NICE CXone, Gridspace, etc.).",
        status: "complete",
        dependsOn: ["1.2", "1.4"],
        tasks: [
          { label: "GET /api/source-systems — list all source systems", done: true },
          { label: "GET /api/source-systems/:id — get single source system", done: true },
          { label: "POST /api/source-systems — create source system", done: true },
          { label: "PUT /api/source-systems/:id — update source system", done: true },
          { label: "DELETE /api/source-systems/:id — soft delete (set is_active=false)", done: true },
          { label: "Input validation with Zod schemas", done: true },
          { label: "Error handling middleware", done: true },
        ],
        outputs: ["Source system API routes"],
      },
      {
        id: "2.2",
        title: "Endpoint Definition CRUD API",
        description: "REST endpoints for managing API endpoint configurations with pagination and incremental settings.",
        status: "complete",
        dependsOn: ["2.1"],
        tasks: [
          { label: "GET /api/endpoints — list endpoints (filterable by source_system_id)", done: true },
          { label: "GET /api/endpoints/:id — get single endpoint with parameters", done: true },
          { label: "POST /api/endpoints — create endpoint definition", done: true },
          { label: "PUT /api/endpoints/:id — update endpoint definition", done: true },
          { label: "DELETE /api/endpoints/:id — soft delete", done: true },
          { label: "Validate pagination_strategy and incremental_strategy enum values", done: true },
        ],
        outputs: ["Endpoint definition API routes"],
      },
      {
        id: "2.3",
        title: "Endpoint Parameter CRUD API",
        description: "REST endpoints for managing parameters that drive dynamic manual run forms.",
        status: "complete",
        dependsOn: ["2.2"],
        tasks: [
          { label: "GET /api/endpoints/:id/parameters — list parameters for endpoint", done: true },
          { label: "POST /api/endpoints/:id/parameters — create parameter", done: true },
          { label: "PUT /api/parameters/:id — update parameter", done: true },
          { label: "DELETE /api/parameters/:id — delete parameter", done: true },
          { label: "Enforce UNIQUE(endpoint_id, parameter_name) constraint", done: true },
          { label: "Support display_order for form field ordering", done: true },
        ],
        outputs: ["Parameter API routes"],
      },
      {
        id: "2.4",
        title: "Extraction Run API & Concurrency Guard",
        description: "Run management endpoints with PostgreSQL-based concurrency control.",
        status: "complete",
        dependsOn: ["2.2"],
        tasks: [
          { label: "POST /api/runs — create and trigger a new extraction run", done: true },
          { label: "GET /api/runs — list runs with filtering and pagination", done: true },
          { label: "GET /api/runs/:id — get run detail with events", done: true },
          { label: "Implement concurrency guard (SELECT...FOR UPDATE, reject if active run exists)", done: true },
          { label: "Request builder: resolve endpoint_definition + parameters into full HTTP request", done: true },
          { label: "GET /api/endpoints/:id/preview — build request preview without executing", done: true },
        ],
        outputs: ["Run management API", "Request builder", "Concurrency guard"],
      },
      {
        id: "2.5",
        title: "Run Monitoring & Event APIs",
        description: "Endpoints for monitoring run status, events, and page-level details.",
        status: "complete",
        dependsOn: ["2.4"],
        tasks: [
          { label: "GET /api/runs/:id/events — list events for a run", done: true },
          { label: "GET /api/runs/:id/pages — list page-level status from BigQuery", done: true },
          { label: "PATCH /api/runs/:id/cancel — cancel a queued/running run", done: true },
          { label: "POST /api/runs/:id/replay — create replay run for failed pages", done: true },
        ],
        outputs: ["Event/monitoring API routes", "Replay trigger endpoint"],
      },
    ],
  },
  {
    name: "Phase 3: Frontend UI",
    description: "React operator control panel with management screens and monitoring",
    steps: [
      {
        id: "3.1",
        title: "Layout & Navigation Shell",
        description: "App shell with sidebar navigation, routing, and shared components.",
        status: "complete",
        dependsOn: ["2.1"],
        tasks: [
          { label: "Create app layout with sidebar navigation", done: true },
          { label: "Set up client-side routing (React Router or wouter)", done: true },
          { label: "Configure API client with base URL and error handling", done: true },
          { label: "Add loading states and error boundary components", done: true },
        ],
        outputs: ["App shell with navigation"],
      },
      {
        id: "3.2",
        title: "Source System Management UI",
        description: "List and CRUD forms for managing source systems.",
        status: "complete",
        dependsOn: ["3.1", "2.1"],
        tasks: [
          { label: "Source system list page with status indicators", done: true },
          { label: "Create/edit source system form (name, base_url, auth_type, secret ref)", done: true },
          { label: "Delete confirmation dialog", done: true },
          { label: "Toast notifications for CRUD operations", done: true },
        ],
        outputs: ["Source system management screens"],
      },
      {
        id: "3.3",
        title: "Endpoint Configuration UI",
        description: "Endpoint list, create/edit forms with pagination and incremental config.",
        status: "complete",
        dependsOn: ["3.1", "2.2"],
        tasks: [
          { label: "Endpoint list page filtered by source system", done: true },
          { label: "Create/edit endpoint form with all fields", done: true },
          { label: "Pagination strategy selector with dynamic config fields", done: true },
          { label: "Incremental strategy selector with config fields", done: true },
          { label: "Parameter management sub-section (inline CRUD, drag-to-reorder)", done: true },
        ],
        outputs: ["Endpoint configuration screens"],
      },
      {
        id: "3.4",
        title: "Manual Run & Request Preview UI",
        description: "Dynamic parameter form driven by endpoint_parameter metadata, request preview, and run trigger.",
        status: "complete",
        dependsOn: ["3.3", "2.4"],
        tasks: [
          { label: "Dynamic form rendered from endpoint_parameter metadata", done: true },
          { label: "Field types: text, number, date, dropdown (from allowed_values_json)", done: true },
          { label: "Request preview panel showing the full HTTP request before execution", done: true },
          { label: "Confirm and trigger button with loading state", done: true },
          { label: "Redirect to run detail page after trigger", done: true },
        ],
        outputs: ["Manual run form", "Request preview"],
      },
      {
        id: "3.5",
        title: "Run Monitor & Event Viewer UI",
        description: "Run history list, run detail with events timeline, page-level status breakdown.",
        status: "complete",
        dependsOn: ["3.1", "2.5"],
        tasks: [
          { label: "Run history list with status badges, filtering, and sorting", done: true },
          { label: "Run detail page with metadata, timing, and counts", done: true },
          { label: "Events timeline with severity-colored entries", done: true },
          { label: "Page-level status breakdown (succeeded/failed/replayed counts)", done: true },
          { label: "Replay button for failed/partial runs", done: true },
          { label: "Cancel button for queued/running runs", done: true },
        ],
        outputs: ["Run monitoring screens"],
      },
    ],
  },
  {
    name: "Phase 4: Execution Engine",
    description: "Cloud Run Job for API extraction, pagination, checkpointing, and auth",
    steps: [
      {
        id: "4.1",
        title: "Auth Module",
        description: "Credential resolution from Secret Manager with token caching and proactive refresh.",
        status: "complete",
        tasks: [
          { label: "Secret Manager client for credential resolution at startup", done: true },
          { label: "API_KEY auth handler (static key in Authorization header)", done: true },
          { label: "OAUTH2_CLIENT_CREDENTIALS handler with token acquisition", done: true },
          { label: "In-memory token cache with proactive refresh (<10% TTL remaining)", done: true },
          { label: "Mid-run token expiration re-acquisition", done: true },
          { label: "AUTH_REFRESHED event logging to extraction_event", done: true },
          { label: "Fatal startup error if Secret Manager unavailable", done: true },
        ],
        outputs: ["Auth module with token lifecycle management"],
      },
      {
        id: "4.2",
        title: "Pagination Engine",
        description: "Generic pagination engine supporting all four strategies with rate limiting.",
        status: "complete",
        dependsOn: ["4.1"],
        tasks: [
          { label: "NONE strategy — single request, no pagination", done: true },
          { label: "PAGE_NUMBER strategy — page=1, page=2, ...", done: true },
          { label: "OFFSET_LIMIT strategy — skip/top or offset/limit", done: true },
          { label: "NEXT_TOKEN strategy — cursor/token-based from response", done: true },
          { label: "Token bucket rate limiter from rate_limit_config_json", done: true },
          { label: "Checkpoint saving after each page", done: true },
          { label: "Page-level event logging (PAGE_REQUESTED, PAGE_RECEIVED)", done: true },
        ],
        outputs: ["Pagination engine with all 4 strategies"],
      },
      {
        id: "4.3",
        title: "BigQuery Payload Writer",
        description: "Write raw API response payloads to BigQuery raw.api_payload table.",
        status: "complete",
        dependsOn: ["1.3"],
        tasks: [
          { label: "BigQuery client setup for raw.api_payload writes", done: true },
          { label: "Construct api_payload row from HTTP response", done: true },
          { label: "Compute payload_hash (SHA-256) for deduplication", done: true },
          { label: "Batch inserts for efficiency", done: true },
          { label: "Error handling for BigQuery write failures", done: true },
        ],
        outputs: ["BigQuery payload writer"],
      },
      {
        id: "4.4",
        title: "Job Orchestrator",
        description: "Main Cloud Run Job entry point that ties auth, pagination, payload writing, and status updates together.",
        status: "complete",
        dependsOn: ["4.1", "4.2", "4.3"],
        tasks: [
          { label: "Job entry point: receive run_id, load run config from PostgreSQL", done: true },
          { label: "Update run status: QUEUED → RUNNING → SUCCEEDED/FAILED/PARTIAL_SUCCESS", done: true },
          { label: "Orchestrate: auth → paginate → write payload → log events → checkpoint", done: true },
          { label: "Failure handling: categorize errors, update counts, save error_summary", done: true },
          { label: "Replay mode: query failed pages from original run, retry only those offsets", done: true },
          { label: "Mark replayed pages as REPLAYED in BigQuery", done: true },
        ],
        outputs: ["Complete extraction job orchestrator"],
      },
    ],
  },
  {
    name: "Phase 5: Scheduling & Deployment",
    description: "Cloud Scheduler integration, Docker containers, GitHub Actions CI/CD, and GCP deployment",
    steps: [
      {
        id: "5.1",
        title: "Cloud Scheduler Integration",
        description: "Cron-based triggers for automated extraction runs from endpoint schedule_cron.",
        status: "not-started",
        dependsOn: ["4.4", "2.4"],
        tasks: [
          { label: "API endpoint to sync schedule_cron → Cloud Scheduler jobs", done: false },
          { label: "Scheduler trigger → creates extraction_run → launches Cloud Run Job", done: false },
          { label: "Handle schedule enable/disable when endpoint is_active changes", done: false },
        ],
        outputs: ["Automated scheduling integration"],
      },
      {
        id: "5.2",
        title: "Dockerfiles & Container Builds",
        description: "Docker images for the API server, frontend, and Cloud Run Job.",
        status: "not-started",
        dependsOn: ["2.5", "3.5", "4.4"],
        tasks: [
          { label: "Dockerfile for API server (Express)", done: false },
          { label: "Dockerfile for frontend (Vite build → nginx/static serve)", done: false },
          { label: "Dockerfile for Cloud Run Job (extraction engine)", done: false },
          { label: "Multi-stage builds for minimal image sizes", done: false },
          { label: "Environment variable configuration for each container", done: false },
        ],
        outputs: ["Production Docker images"],
      },
      {
        id: "5.3",
        title: "GitHub Actions CI/CD",
        description: "Build, test, and deploy pipeline from GitHub to GCP.",
        status: "not-started",
        dependsOn: ["5.2"],
        tasks: [
          { label: "CI workflow: lint, typecheck, test on PR", done: false },
          { label: "CD workflow: build Docker images on merge to main", done: false },
          { label: "Push images to Google Artifact Registry", done: false },
          { label: "Deploy API + Frontend to Cloud Run", done: false },
          { label: "Deploy extraction job to Cloud Run Jobs", done: false },
          { label: "Update Cloud Scheduler jobs", done: false },
          { label: "GCP service account and Workload Identity Federation setup", done: false },
        ],
        outputs: ["Complete CI/CD pipeline"],
      },
      {
        id: "5.4",
        title: "GCP Infrastructure (Production)",
        description: "Provision production Cloud SQL, Secret Manager secrets, and IAM roles. BigQuery raw dataset created in Phase 1.3.",
        status: "not-started",
        tasks: [
          { label: "Cloud SQL PostgreSQL production instance (or Terraform/Pulumi IaC)", done: false },
          { label: "Run migrations against production Cloud SQL", done: false },
          { label: "Secret Manager secrets for API credentials (NICE CXone, etc.)", done: false },
          { label: "IAM service accounts with least-privilege roles", done: false },
          { label: "VPC/networking for Cloud SQL private access from Cloud Run", done: false },
          { label: "Workload Identity Federation for GitHub Actions → GCP", done: false },
        ],
        outputs: ["Production GCP infrastructure"],
      },
    ],
  },
];

export default function BuildStepsPage() {
  const allSteps = phases.flatMap((p) => p.steps);
  const totalTasks = allSteps.reduce((sum, s) => sum + s.tasks.length, 0);
  const completedTasks = allSteps.reduce((sum, s) => sum + s.tasks.filter((t) => t.done).length, 0);
  const completedSteps = allSteps.filter((s) => s.status === "complete").length;
  const inProgressSteps = allSteps.filter((s) => s.status === "in-progress").length;
  const pctComplete = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Build Steps</h1>
        <p className="text-muted-foreground mt-2">
          Implementation roadmap and progress tracker for the API Ingestion Control Plane.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{pctComplete}%</p>
              <p className="text-xs text-muted-foreground">Overall Progress</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{completedSteps}</p>
              <p className="text-xs text-muted-foreground">Steps Complete</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{inProgressSteps}</p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-400">{allSteps.length - completedSteps - inProgressSteps}</p>
              <p className="text-xs text-muted-foreground">Not Started</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{completedTasks}/{totalTasks}</p>
              <p className="text-xs text-muted-foreground">Tasks Done</p>
            </div>
          </div>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-primary h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${pctComplete}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {phases.map((phase, pi) => {
        const phaseTasks = phase.steps.reduce((sum, s) => sum + s.tasks.length, 0);
        const phaseComplete = phase.steps.reduce((sum, s) => sum + s.tasks.filter((t) => t.done).length, 0);
        const phasePct = phaseTasks > 0 ? Math.round((phaseComplete / phaseTasks) * 100) : 0;

        return (
          <div key={pi}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">{phase.name}</h2>
                <p className="text-sm text-muted-foreground">{phase.description}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{phasePct}%</p>
                <p className="text-[10px] text-muted-foreground">{phaseComplete}/{phaseTasks} tasks</p>
              </div>
            </div>

            <div className="space-y-4">
              {phase.steps.map((step) => {
                const sc = statusConfig(step.status);
                const Icon = sc.icon;
                const stepDone = step.tasks.filter((t) => t.done).length;
                const stepTotal = step.tasks.length;

                return (
                  <Card key={step.id} className={sc.bg}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${sc.color}`} />
                          <div>
                            <CardTitle className="text-sm">
                              <span className="text-muted-foreground mr-2">{step.id}</span>
                              {step.title}
                            </CardTitle>
                            <CardDescription className="text-xs mt-0.5">{step.description}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-muted-foreground">{stepDone}/{stepTotal}</span>
                          <Badge className={`${sc.badge} border-0 text-[10px]`}>{sc.label}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 mb-3">
                        {step.tasks.map((task, ti) => (
                          <div key={ti} className="flex items-start gap-2 py-0.5">
                            {task.done ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                            ) : (
                              <Circle className="h-3.5 w-3.5 text-gray-300 shrink-0 mt-0.5" />
                            )}
                            <span className={`text-xs ${task.done ? "line-through text-muted-foreground" : ""}`}>
                              {task.label}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-3 text-[10px]">
                        {step.dependsOn && step.dependsOn.length > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">Depends on:</span>
                            {step.dependsOn.map((d) => (
                              <Badge key={d} variant="outline" className="text-[9px] font-mono">{d}</Badge>
                            ))}
                          </div>
                        )}
                        {step.outputs && (
                          <div className="flex items-center gap-1">
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">Produces:</span>
                            {step.outputs.map((o) => (
                              <Badge key={o} variant="secondary" className="text-[9px]">{o}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {pi < phases.length - 1 && <Separator className="mt-8" />}
          </div>
        );
      })}
    </div>
  );
}
