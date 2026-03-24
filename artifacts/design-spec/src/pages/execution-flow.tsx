import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDown, AlertTriangle, CheckCircle2, XCircle, RotateCcw, Pause } from "lucide-react";

function FlowStep({ step, description, details, variant = "default" }: {
  step: string;
  description: string;
  details?: string;
  variant?: "default" | "success" | "error" | "warning" | "decision";
}) {
  const colors = {
    default: "border-l-blue-400",
    success: "border-l-green-400",
    error: "border-l-red-400",
    warning: "border-l-yellow-400",
    decision: "border-l-purple-400",
  };
  return (
    <div className={`border-l-4 ${colors[variant]} pl-4 py-2`}>
      <p className="text-sm font-semibold">{step}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
      {details && <p className="text-xs text-muted-foreground/70 mt-1 italic">{details}</p>}
    </div>
  );
}

export default function ExecutionFlowPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Execution Flow</h1>
        <p className="text-muted-foreground mt-2">
          How extraction runs are initiated, paginated, checkpointed, and replayed.
        </p>
      </div>

      <Tabs defaultValue="manual">
        <TabsList>
          <TabsTrigger value="manual">Manual Run</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Run</TabsTrigger>
          <TabsTrigger value="pagination">Pagination</TabsTrigger>
          <TabsTrigger value="replay">Replay</TabsTrigger>
          <TabsTrigger value="checkpointing">Checkpointing</TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Manual Run Execution</CardTitle>
              <CardDescription>User-initiated extraction with dynamic form and request preview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <FlowStep
                step="1. User selects endpoint"
                description="UI loads endpoint_definition and associated endpoint_parameter records from the control schema."
              />
              <FlowStep
                step="2. Dynamic form rendered"
                description="Form fields generated from parameter metadata: required fields marked, optional fields shown with omit_if_blank behavior."
                details="Fields ordered by display_order. Data types drive input controls (date picker, number input, dropdown for allowed_values)."
              />
              <FlowStep
                step="3. User fills parameters"
                description="Required parameters must be populated. Optional parameters included only when the user provides a value."
                details="Empty optional parameters are excluded from the request — not sent as empty strings or nulls."
              />
              <FlowStep
                step="4. Request preview"
                description="Full HTTP request shown to user before submission: URL, method, headers, query params, body."
                variant="warning"
              />
              <FlowStep
                step="5. User confirms execution"
                description="An extraction_run record is created with status=QUEUED and run_type=MANUAL."
              />
              <FlowStep
                step="6. Cloud Run Job triggered"
                description="Backend creates and triggers a Cloud Run Job with the run configuration."
                details="Job name and execution ID written to the extraction_run record."
              />
              <FlowStep
                step="7. Secrets resolved at runtime"
                description="Cloud Run Job resolves API credentials from Google Secret Manager at startup."
                variant="success"
              />
              <FlowStep
                step="8. API calls executed with pagination"
                description="Job follows the endpoint's pagination strategy, writing one api_payload row per HTTP response page."
              />
              <FlowStep
                step="9. Events logged throughout"
                description="RUN_STARTED, PAGE_REQUESTED, PAGE_RECEIVED, CHECKPOINT_SAVED, and completion events written to extraction_event."
              />
              <FlowStep
                step="10. Run finalized"
                description="Status updated to SUCCEEDED, FAILED, or PARTIAL_SUCCESS based on page outcomes."
                variant="success"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Run Execution</CardTitle>
              <CardDescription>Automated extraction triggered by Cloud Scheduler cron expressions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <FlowStep
                step="1. Cloud Scheduler fires"
                description="Cron expression from endpoint_definition.schedule_cron triggers the job."
                details="Example: '0 */6 * * *' runs every 6 hours"
              />
              <FlowStep
                step="2. Time window calculated"
                description="System determines the extraction window based on the incremental strategy."
                details="For DATE_WINDOW: window_start = last successful run end time, window_end = now minus safety lag (default 15 min)"
              />
              <FlowStep
                step="3. extraction_run created"
                description="Run record created with run_type=SCHEDULED and status=QUEUED."
              />
              <FlowStep
                step="4-10. Same as manual run"
                description="Cloud Run Job triggered, secrets resolved, API calls paginated, pages stored, events logged, run finalized."
                variant="success"
              />
            </CardContent>
          </Card>

          <Card className="border-yellow-300 bg-yellow-50">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-yellow-800">Safety Lag</p>
                  <p className="text-xs text-yellow-700">
                    By default, scheduled runs avoid the most recent 15 minutes of data. This prevents ingesting 
                    incomplete or in-flight records from the source system. Configurable per endpoint via incremental_config_json.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pagination" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Pagination Engine</CardTitle>
              <CardDescription>Strategy-specific pagination loops for each endpoint</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-blue-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-mono">OFFSET_LIMIT</CardTitle>
                    <CardDescription className="text-xs">Used by NICE CXone get_contacts</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <FlowStep step="Initialize" description="skip = 0, top = configured page size (default 5000)" />
                    <FlowStep step="Request" description="Call API with skip and top parameters" />
                    <FlowStep step="Store" description="Write response to api_payload with page_number" />
                    <FlowStep step="Check" description="If returned records < top → stop (last page)" variant="decision" />
                    <FlowStep step="Continue" description="skip += top, increment page_number, repeat" />
                    <div className="p-2 bg-muted rounded text-xs font-mono">
                      {`while (true) {
  response = call_api(skip, top)
  store_page(response)
  if (response.count < top) break
  skip += top
}`}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-green-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-mono">NEXT_TOKEN</CardTitle>
                    <CardDescription className="text-xs">Token-based cursor from response body</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <FlowStep step="Initialize" description="next_token = null (first request)" />
                    <FlowStep step="Request" description="Call API with page_token if present" />
                    <FlowStep step="Store" description="Write response with page_token and next_page_token" />
                    <FlowStep step="Check" description="If no next_token in response → stop" variant="decision" />
                    <FlowStep step="Continue" description="Set page_token = next_page_token, repeat" />
                    <div className="p-2 bg-muted rounded text-xs font-mono">
                      {`let token = null
while (true) {
  response = call_api(token)
  store_page(response, token)
  token = response.next_token
  if (!token) break
}`}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-purple-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-mono">PAGE_NUMBER</CardTitle>
                    <CardDescription className="text-xs">Simple page number increment</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <FlowStep step="Initialize" description="page = 1" />
                    <FlowStep step="Request" description="Call API with page parameter" />
                    <FlowStep step="Store" description="Write response with page_number" />
                    <FlowStep step="Check" description="If response empty or < page_size → stop" variant="decision" />
                    <FlowStep step="Continue" description="page++, repeat" />
                  </CardContent>
                </Card>

                <Card className="border-gray-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-mono">NONE</CardTitle>
                    <CardDescription className="text-xs">Single request, no pagination</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <FlowStep step="Request" description="Single API call with configured parameters" />
                    <FlowStep step="Store" description="Write single response as page_number = 1" variant="success" />
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="replay" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Replay Logic</CardTitle>
              <CardDescription>Selective retry of failed pages with full rerun fallback</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold mb-3">Page-Level Replay (Primary)</h3>
                <div className="space-y-2">
                  <FlowStep
                    step="1. Identify failed pages"
                    description="Query: SELECT skip, page_number FROM raw.api_payload WHERE run_id = ? AND page_status = 'FAILED'"
                  />
                  <FlowStep
                    step="2. Create replay run"
                    description="New extraction_run with run_type=REPLAY, referencing the original run's window parameters."
                  />
                  <FlowStep
                    step="3. Retry only failed offsets"
                    description="Cloud Run Job receives the list of failed skip/page values and retries only those."
                  />
                  <FlowStep
                    step="4. Mark replayed pages"
                    description="Successfully retried pages are stored with page_status=REPLAYED in the new run's payload rows."
                    variant="success"
                  />
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold mb-3">Full Rerun (Fallback)</h3>
                <div className="space-y-2">
                  <FlowStep
                    step="Used when page-level replay is not safe"
                    description="Some failures (e.g., corrupted window parameters, changed API contract) require a complete re-extraction."
                    variant="warning"
                  />
                  <FlowStep
                    step="Creates a new MANUAL run"
                    description="Fresh extraction_run with the same window parameters, re-executes all pages from scratch."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-300 bg-yellow-50">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-yellow-800">Open Question: Replay Semantics</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    When a replayed page succeeds, the spec is ambiguous about whether page_status should be REPLAYED 
                    (preserving audit trail) or SUCCEEDED (simpler but loses the replay signal). The current design 
                    uses REPLAYED to preserve the audit history that a retry occurred.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checkpointing" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Checkpointing</CardTitle>
              <CardDescription>Pagination state saved for replay and diagnostics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/30">
                <p className="text-xs font-semibold mb-2">Checkpoint Format (OFFSET_LIMIT example)</p>
                <pre className="text-xs font-mono bg-muted p-3 rounded overflow-x-auto">
{`{
  "last_successful_skip": 15000,
  "top": 5000,
  "startDate": "2025-01-01T00:00:00Z",
  "endDate": "2025-01-02T00:00:00Z"
}`}
                </pre>
              </div>

              <div className="p-4 border rounded-lg bg-muted/30">
                <p className="text-xs font-semibold mb-2">Checkpoint Format (NEXT_TOKEN example)</p>
                <pre className="text-xs font-mono bg-muted p-3 rounded overflow-x-auto">
{`{
  "last_page_token": "abc123xyz",
  "pages_completed": 12,
  "startDate": "2025-01-01T00:00:00Z",
  "endDate": "2025-01-02T00:00:00Z"
}`}
                </pre>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 border rounded-lg">
                  <p className="text-xs font-semibold mb-2">When checkpoints are saved</p>
                  <div className="space-y-1">
                    {[
                      "After each successful page write",
                      "On transient error before retry",
                      "On run completion (final state)",
                      "On run failure (last known good state)",
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Pause className="h-3 w-3 shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="text-xs font-semibold mb-2">What checkpoints enable</p>
                  <div className="space-y-1">
                    {[
                      "Resume from last successful page on retry",
                      "Identify exactly which pages failed",
                      "Diagnostic visibility into run progress",
                      "Replay with original window parameters",
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3 w-3 shrink-0 text-green-500" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator />

      <div>
        <h2 className="text-xl font-semibold mb-4">Failure Handling</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-blue-500" />
                Transient Errors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>HTTP 429, 500, 502, 503, 504</p>
                <p>Automatic retry with exponential backoff</p>
                <p>Configurable max retry count</p>
                <p>Each retry logged as extraction_event</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                Permanent Errors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>HTTP 400, 401, 403, 404</p>
                <p>Page marked as FAILED immediately</p>
                <p>Error message captured in api_payload</p>
                <p>Run continues to next page</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                Run-Level Failures
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>Auth failure, network partition</p>
                <p>Checkpoint saved before termination</p>
                <p>Run status set to FAILED</p>
                <p>Eligible for full replay</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
