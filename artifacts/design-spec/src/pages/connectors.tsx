import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ConnectorsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Connector Specifications</h1>
        <p className="text-muted-foreground mt-2">
          Detailed configuration for each API connector in the system.
        </p>
      </div>

      <Tabs defaultValue="nice_cxone">
        <TabsList>
          <TabsTrigger value="nice_cxone">NICE CXone</TabsTrigger>
          <TabsTrigger value="future" disabled>Future Connectors</TabsTrigger>
        </TabsList>

        <TabsContent value="nice_cxone" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>NICE CXone — get_contacts</CardTitle>
                  <CardDescription>Reporting API endpoint for contact data extraction</CardDescription>
                </div>
                <Badge variant="outline">MVP Connector</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Source System ID", value: "nice_cxone" },
                  { label: "Endpoint ID", value: "nice_cxone_get_contacts" },
                  { label: "HTTP Method", value: "GET" },
                  { label: "Relative Path", value: "/services/v27.0/contacts" },
                ].map((item) => (
                  <div key={item.label} className="p-2 border rounded">
                    <p className="text-[10px] text-muted-foreground">{item.label}</p>
                    <p className="text-xs font-mono font-semibold">{item.value}</p>
                  </div>
                ))}
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold mb-3">Supported Parameters</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Parameter</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Required</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { name: "startDate", type: "ISO 8601", required: true, location: "QUERY", notes: "Start of extraction window" },
                      { name: "endDate", type: "ISO 8601", required: true, location: "QUERY", notes: "End of extraction window" },
                      { name: "fields", type: "STRING", required: false, location: "QUERY", notes: "Comma-separated field list" },
                      { name: "top", type: "INTEGER", required: false, location: "QUERY", notes: "Page size (max 10000, default 5000)" },
                      { name: "skip", type: "INTEGER", required: false, location: "QUERY", notes: "Offset for pagination" },
                      { name: "orderBy", type: "STRING", required: false, location: "QUERY", notes: "Default: contactStartDate ASC" },
                    ].map((p) => (
                      <TableRow key={p.name}>
                        <TableCell className="font-mono text-xs">{p.name}</TableCell>
                        <TableCell><Badge variant="secondary" className="text-[10px]">{p.type}</Badge></TableCell>
                        <TableCell>
                          {p.required ? (
                            <Badge className="bg-red-100 text-red-700 border-0 text-[10px]">Required</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px]">Optional</Badge>
                          )}
                        </TableCell>
                        <TableCell><Badge variant="outline" className="text-[10px] font-mono">{p.location}</Badge></TableCell>
                        <TableCell className="text-xs text-muted-foreground">{p.notes}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Pagination Strategy</CardTitle>
                    <CardDescription className="text-xs">OFFSET_LIMIT</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs text-muted-foreground">
                    <p><strong>Page size param:</strong> <code className="font-mono">top</code></p>
                    <p><strong>Offset param:</strong> <code className="font-mono">skip</code></p>
                    <p><strong>Default page size:</strong> 5000</p>
                    <p><strong>Max page size:</strong> 10000</p>
                    <p><strong>Stop condition:</strong> returned records {"<"} top</p>
                    <div className="p-2 bg-muted rounded font-mono text-[11px] mt-2">
                      {`pagination_config_json: {
  "page_size_param": "top",
  "offset_param": "skip",
  "default_page_size": 5000,
  "max_page_size": 10000
}`}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Incremental Strategy</CardTitle>
                    <CardDescription className="text-xs">DATE_WINDOW</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs text-muted-foreground">
                    <p><strong>Start param:</strong> <code className="font-mono">startDate</code></p>
                    <p><strong>End param:</strong> <code className="font-mono">endDate</code></p>
                    <p><strong>Safety lag:</strong> 15 minutes</p>
                    <p><strong>Order:</strong> contactStartDate ASC</p>
                    <div className="p-2 bg-muted rounded font-mono text-[11px] mt-2">
                      {`incremental_config_json: {
  "start_param": "startDate",
  "end_param": "endDate",
  "safety_lag_minutes": 15,
  "order_by": "contactStartDate ASC"
}`}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold mb-3">Execution Logic</h3>
                <div className="p-4 bg-muted rounded-lg">
                  <pre className="text-xs font-mono whitespace-pre-wrap">
{`function extract_contacts(startDate, endDate, top = 5000) {
  let skip = 0
  let page_number = 1

  while (true) {
    // Build request
    const url = \`{base_url}/services/v27.0/contacts\`
    const params = {
      startDate,
      endDate,
      top,
      skip,
      orderBy: "contactStartDate ASC"
    }

    // Call API
    const request_ts = now()
    const response = http_get(url, params)
    const response_ts = now()

    // Store page
    write_to_api_payload({
      run_id, source_system_id, endpoint_id,
      request_ts, response_ts,
      http_method: "GET",
      request_url: url + "?" + encode(params),
      http_status_code: response.status,
      page_number,
      request_params_json: params,
      response_body_json: response.body,
      payload_hash: sha256(response.body),
      page_status: response.ok ? "SUCCEEDED" : "FAILED",
      ingested_ts: now()
    })

    // Save checkpoint
    update_checkpoint({
      last_successful_skip: skip,
      top, startDate, endDate
    })

    // Check stop condition
    if (response.body.contacts.length < top) break

    skip += top
    page_number++
  }
}`}
                  </pre>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold mb-3">Replay Query</h3>
                <div className="p-3 bg-muted rounded-lg">
                  <pre className="text-xs font-mono">
{`SELECT skip, page_number
FROM raw.api_payload
WHERE run_id = @original_run_id
  AND page_status = 'FAILED'
ORDER BY page_number`}
                  </pre>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold mb-3">Raw Data Storage Fields</h3>
                <div className="p-3 border rounded-lg text-xs text-muted-foreground space-y-1">
                  <p>Each HTTP response page stored with:</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {[
                      "run_id", "request_ts", "response_ts", "request_url",
                      "http_status_code", "skip", "top", "response_body_json",
                      "payload_hash", "page_status",
                    ].map((f) => (
                      <Badge key={f} variant="outline" className="text-[9px] font-mono">{f}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold mb-3">Operational Requirements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { rule: "Use orderBy = contactStartDate ASC", reason: "Ensures deterministic pagination ordering" },
                    { rule: "Default top = 5000", reason: "Balance between throughput and memory" },
                    { rule: "Use CorrelationId for tracing", reason: "End-to-end request tracing across systems" },
                    { rule: "Avoid last 15 minutes of data", reason: "Prevents ingesting in-flight/incomplete records" },
                  ].map((r) => (
                    <div key={r.rule} className="p-2 border rounded">
                      <p className="text-xs font-medium">{r.rule}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{r.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
