import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, Circle, AlertCircle } from "lucide-react";

export default function FeaturesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Feature Matrix</h1>
        <p className="text-muted-foreground mt-2">
          MVP features, UI screens, and API endpoints required for the control plane.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">MVP Feature Map</h2>
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-48">Feature</TableHead>
                  <TableHead>UI Screens</TableHead>
                  <TableHead>API Endpoints</TableHead>
                  <TableHead className="w-24">Priority</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  {
                    feature: "Source System Management",
                    screens: ["Source system list", "Create/edit source system form"],
                    apis: ["GET /source-systems", "POST /source-systems", "PUT /source-systems/:id", "DELETE /source-systems/:id"],
                    priority: "P0",
                  },
                  {
                    feature: "Endpoint Management",
                    screens: ["Endpoint list (filtered by source)", "Create/edit endpoint form", "Pagination & incremental config"],
                    apis: ["GET /endpoints", "POST /endpoints", "PUT /endpoints/:id", "DELETE /endpoints/:id"],
                    priority: "P0",
                  },
                  {
                    feature: "Parameter Management",
                    screens: ["Parameter list for endpoint", "Create/edit parameter form", "Parameter ordering interface"],
                    apis: ["GET /endpoints/:id/parameters", "POST /endpoints/:id/parameters", "PUT /parameters/:id", "DELETE /parameters/:id"],
                    priority: "P0",
                  },
                  {
                    feature: "Manual Execution",
                    screens: ["Dynamic parameter form", "Request preview dialog", "Run confirmation"],
                    apis: ["POST /runs (create & trigger)", "GET /endpoints/:id/preview (build request)"],
                    priority: "P0",
                  },
                  {
                    feature: "Run Monitoring",
                    screens: ["Run history list", "Run detail view", "Page-level status breakdown"],
                    apis: ["GET /runs", "GET /runs/:id", "GET /runs/:id/pages"],
                    priority: "P0",
                  },
                  {
                    feature: "Payload Inspection",
                    screens: ["Page-level payload viewer", "JSON response browser", "Request metadata panel"],
                    apis: ["GET /runs/:id/pages/:pageId"],
                    priority: "P1",
                  },
                  {
                    feature: "Replay",
                    screens: ["Failed pages list", "Replay confirmation", "Replay progress"],
                    apis: ["POST /runs/:id/replay", "GET /runs/:id/failed-pages"],
                    priority: "P1",
                  },
                  {
                    feature: "Scheduled Execution",
                    screens: ["Schedule config in endpoint form", "Schedule status indicator"],
                    apis: ["PUT /endpoints/:id/schedule", "Cloud Scheduler integration"],
                    priority: "P1",
                  },
                ].map((f) => (
                  <TableRow key={f.feature}>
                    <TableCell className="font-medium text-sm">{f.feature}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {f.screens.map((s) => (
                          <div key={s} className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Circle className="h-2 w-2 shrink-0" />
                            {s}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {f.apis.map((a) => (
                          <div key={a} className="text-xs font-mono text-muted-foreground">{a}</div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={f.priority === "P0" ? "default" : "secondary"}
                        className="text-[10px]"
                      >
                        {f.priority}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div>
        <h2 className="text-xl font-semibold mb-4">UI Screen Inventory</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              screen: "Dashboard",
              description: "Overview of recent runs, active endpoints, and system health",
              components: ["Run status summary cards", "Recent runs table", "Error rate sparkline"],
            },
            {
              screen: "Source Systems",
              description: "List and manage source system connections",
              components: ["Source system cards/table", "Create/edit dialog", "Active/inactive toggle"],
            },
            {
              screen: "Endpoints",
              description: "Configure API endpoints under a source system",
              components: ["Endpoint list with filters", "Endpoint form with tabs", "Pagination config panel", "Incremental config panel"],
            },
            {
              screen: "Parameters",
              description: "Define form fields for manual run execution",
              components: ["Sortable parameter list", "Parameter edit form", "Data type selector", "Allowed values editor"],
            },
            {
              screen: "Manual Run",
              description: "Execute an endpoint with user-provided parameters",
              components: ["Dynamic form from metadata", "Required/optional field indicators", "Request preview modal", "Submit confirmation"],
            },
            {
              screen: "Run History",
              description: "Monitor extraction runs across all endpoints",
              components: ["Filterable run table", "Status badges", "Duration display", "Page/error counts"],
            },
            {
              screen: "Run Detail",
              description: "Deep-dive into a specific extraction run",
              components: ["Run summary card", "Page status breakdown", "Event timeline", "Checkpoint viewer"],
            },
            {
              screen: "Payload Viewer",
              description: "Inspect raw API responses at the page level",
              components: ["Page selector", "JSON viewer", "Request metadata panel", "HTTP status display"],
            },
            {
              screen: "Replay",
              description: "Retry failed pages from a previous run",
              components: ["Failed pages list", "Replay scope selector", "Confirmation dialog", "Progress indicator"],
            },
          ].map((s) => (
            <Card key={s.screen}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{s.screen}</CardTitle>
                <CardDescription className="text-xs">{s.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {s.components.map((c) => (
                    <div key={c} className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary/40 shrink-0" />
                      {c}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h2 className="text-xl font-semibold mb-4">Request Builder Rules</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Must Do
                </h3>
                <div className="space-y-2">
                  {[
                    "Always include required parameters",
                    "Include optional parameters only when user provides a value",
                    "Support parameter locations: QUERY, PATH, BODY",
                    "Show request preview before executing manual run",
                    "Validate required fields before submission",
                    "Use display_order for form field ordering",
                    "Render allowed_values as dropdown selections",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-muted-foreground">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  Must Not
                </h3>
                <div className="space-y-2">
                  {[
                    "Do not send empty strings for blank optional parameters",
                    "Do not send null values for omit_if_blank parameters",
                    "Do not include blank optional parameters unless endpoint requires it",
                    "Do not build arbitrary nested request-body editors (out of MVP scope)",
                    "Do not store or display credential values in the request preview",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <AlertCircle className="h-3 w-3 text-red-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-muted-foreground">{item}</p>
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
        <h2 className="text-xl font-semibold mb-4">Status Model</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Run Status</CardTitle>
              <CardDescription>Lifecycle states for extraction_run records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { status: "QUEUED", desc: "Run created, waiting for Cloud Run Job to start", color: "bg-gray-100 text-gray-700", next: ["RUNNING", "CANCELLED"] },
                  { status: "RUNNING", desc: "Cloud Run Job is executing API calls", color: "bg-blue-100 text-blue-700", next: ["SUCCEEDED", "FAILED", "PARTIAL_SUCCESS"] },
                  { status: "SUCCEEDED", desc: "All pages completed successfully", color: "bg-green-100 text-green-700", next: [] },
                  { status: "FAILED", desc: "Run terminated with unrecoverable errors", color: "bg-red-100 text-red-700", next: [] },
                  { status: "PARTIAL_SUCCESS", desc: "Some pages succeeded, others failed", color: "bg-yellow-100 text-yellow-700", next: [] },
                  { status: "CANCELLED", desc: "Run was cancelled by user or system", color: "bg-gray-100 text-gray-500", next: [] },
                ].map((s) => (
                  <div key={s.status} className="flex items-start gap-3">
                    <Badge className={`${s.color} border-0 text-[10px] font-mono w-32 justify-center shrink-0`}>{s.status}</Badge>
                    <div>
                      <p className="text-xs text-muted-foreground">{s.desc}</p>
                      {s.next.length > 0 && (
                        <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                          Transitions to: {s.next.join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Page Status</CardTitle>
              <CardDescription>Lifecycle states for api_payload records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { status: "SUCCEEDED", desc: "HTTP response received and stored successfully", color: "bg-green-100 text-green-700" },
                  { status: "FAILED", desc: "Request failed after all retries exhausted", color: "bg-red-100 text-red-700" },
                  { status: "REPLAYED", desc: "Previously failed page was successfully retried in a replay run", color: "bg-blue-100 text-blue-700" },
                  { status: "SKIPPED", desc: "Page was intentionally skipped (e.g., during partial operations)", color: "bg-gray-100 text-gray-500" },
                ].map((s) => (
                  <div key={s.status} className="flex items-start gap-3">
                    <Badge className={`${s.color} border-0 text-[10px] font-mono w-32 justify-center shrink-0`}>{s.status}</Badge>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
