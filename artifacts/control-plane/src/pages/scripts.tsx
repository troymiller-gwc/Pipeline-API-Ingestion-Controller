import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, ChevronDown, ChevronRight, Database } from "lucide-react";

interface Script {
  id: string;
  name: string;
  description: string;
  target: string;
  dependencies: string[];
  sql: string;
}

const scripts: Script[] = [
  {
    id: "contacts-extract-enrich",
    name: "Contacts Extract & Enrich",
    description:
      "Extracts contact records from the raw API payload JSON, deduplicates by contact_id (keeping the latest ingestion), and enriches with primary and secondary disposition names from the dispositions lookup table.",
    target: "incontact.calls",
    dependencies: ["raw.api_payload", "incontact.dispositions"],
    sql: `CREATE OR REPLACE TABLE \`gwc-poc-487320.incontact.calls\` AS
WITH extracted AS (
  SELECT
    CAST(JSON_VALUE(contact, '$.contactId') AS INT64) AS contact_id,
    CAST(JSON_VALUE(contact, '$.masterContactId') AS INT64) AS master_contact_id,
    CAST(JSON_VALUE(contact, '$.contactStartDate') AS TIMESTAMP) AS contact_start_date,
    CAST(JSON_VALUE(contact, '$.agentStartDate') AS TIMESTAMP) AS agent_start_date,
    CAST(JSON_VALUE(contact, '$.lastUpdateTime') AS TIMESTAMP) AS last_update_time,
    CAST(JSON_VALUE(contact, '$.dateACWWarehoused') AS TIMESTAMP) AS date_acw_warehoused,
    CAST(JSON_VALUE(contact, '$.dateContactWarehoused') AS TIMESTAMP) AS date_contact_warehoused,
    CAST(JSON_VALUE(contact, '$.analyticsProcessedDate') AS TIMESTAMP) AS analytics_processed_date,
    CAST(JSON_VALUE(contact, '$.agentId') AS INT64) AS agent_id,
    JSON_VALUE(contact, '$.firstName') AS first_name,
    JSON_VALUE(contact, '$.lastName') AS last_name,
    CAST(JSON_VALUE(contact, '$.campaignId') AS INT64) AS campaign_id,
    JSON_VALUE(contact, '$.campaignName') AS campaign_name,
    CAST(JSON_VALUE(contact, '$.skillId') AS INT64) AS skill_id,
    JSON_VALUE(contact, '$.skillName') AS skill_name,
    CAST(JSON_VALUE(contact, '$.teamId') AS INT64) AS team_id,
    JSON_VALUE(contact, '$.teamName') AS team_name,
    CAST(JSON_VALUE(contact, '$.mediaTypeId') AS INT64) AS media_type_id,
    JSON_VALUE(contact, '$.mediaTypeName') AS media_type_name,
    JSON_VALUE(contact, '$.mediaSubTypeId') AS media_sub_type_id,
    JSON_VALUE(contact, '$.mediaSubTypeName') AS media_sub_type_name,
    CAST(JSON_VALUE(contact, '$.pointOfContactId') AS INT64) AS point_of_contact_id,
    JSON_VALUE(contact, '$.pointOfContactName') AS point_of_contact_name,
    JSON_VALUE(contact, '$.fromAddress') AS from_address,
    JSON_VALUE(contact, '$.toAddress') AS to_address,
    CAST(JSON_VALUE(contact, '$.stateId') AS INT64) AS state_id,
    JSON_VALUE(contact, '$.stateName') AS state_name,
    JSON_VALUE(contact, '$.contactStateCategory') AS contact_state_category,
    JSON_VALUE(contact, '$.digitalContactStateId') AS digital_contact_state_id,
    JSON_VALUE(contact, '$.digitalContactStateName') AS digital_contact_state_name,
    JSON_VALUE(contact, '$.endReason') AS end_reason,
    JSON_VALUE(contact, '$.dispositionNotes') AS disposition_notes,
    CAST(JSON_VALUE(contact, '$.primaryDispositionId') AS INT64) AS primary_disposition_id,
    CAST(JSON_VALUE(contact, '$.secondaryDispositionId') AS INT64) AS secondary_disposition_id,
    CAST(JSON_VALUE(contact, '$.abandonSeconds') AS FLOAT64) AS abandon_seconds,
    CAST(JSON_VALUE(contact, '$.abandoned') AS BOOL) AS abandoned,
    CAST(JSON_VALUE(contact, '$.acwSeconds') AS FLOAT64) AS acw_seconds,
    CAST(JSON_VALUE(contact, '$.agentSeconds') AS FLOAT64) AS agent_seconds,
    CAST(JSON_VALUE(contact, '$.callbackTime') AS FLOAT64) AS callback_time,
    CAST(JSON_VALUE(contact, '$.conferenceSeconds') AS FLOAT64) AS conference_seconds,
    CAST(JSON_VALUE(contact, '$.holdCount') AS INT64) AS hold_count,
    CAST(JSON_VALUE(contact, '$.holdSeconds') AS FLOAT64) AS hold_seconds,
    CAST(JSON_VALUE(contact, '$.inQueueSeconds') AS FLOAT64) AS in_queue_seconds,
    CAST(JSON_VALUE(contact, '$.preQueueSeconds') AS FLOAT64) AS pre_queue_seconds,
    CAST(JSON_VALUE(contact, '$.postQueueSeconds') AS FLOAT64) AS post_queue_seconds,
    CAST(JSON_VALUE(contact, '$.releaseSeconds') AS FLOAT64) AS release_seconds,
    CAST(JSON_VALUE(contact, '$.totalDurationSeconds') AS FLOAT64) AS total_duration_seconds,
    CAST(JSON_VALUE(contact, '$.routingTime') AS FLOAT64) AS routing_time,
    CAST(JSON_VALUE(contact, '$.routingAttribute') AS INT64) AS routing_attribute,
    CAST(JSON_VALUE(contact, '$.highProficiency') AS INT64) AS high_proficiency,
    CAST(JSON_VALUE(contact, '$.lowProficiency') AS INT64) AS low_proficiency,
    CAST(JSON_VALUE(contact, '$.serviceLevelFlag') AS INT64) AS service_level_flag,
    CAST(JSON_VALUE(contact, '$.targetAgentId') AS INT64) AS target_agent_id,
    CAST(JSON_VALUE(contact, '$.transferIndicatorId') AS INT64) AS transfer_indicator_id,
    JSON_VALUE(contact, '$.transferIndicatorName') AS transfer_indicator_name,
    CAST(JSON_VALUE(contact, '$.isActive') AS BOOL) AS is_active,
    CAST(JSON_VALUE(contact, '$.isAnalyticsProcessed') AS BOOL) AS is_analytics_processed,
    CAST(JSON_VALUE(contact, '$.isLogged') AS BOOL) AS is_logged,
    CAST(JSON_VALUE(contact, '$.isOutbound') AS BOOL) AS is_outbound,
    CAST(JSON_VALUE(contact, '$.isRefused') AS BOOL) AS is_refused,
    CAST(JSON_VALUE(contact, '$.isShortAbandon') AS BOOL) AS is_short_abandon,
    CAST(JSON_VALUE(contact, '$.isTakeover') AS BOOL) AS is_takeover,
    CAST(JSON_VALUE(contact, '$.isWarehoused') AS BOOL) AS is_warehoused,
    JSON_VALUE(contact, '$.refuseReason') AS refuse_reason,
    JSON_VALUE(contact, '$.refuseTime') AS refuse_time,
    JSON_VALUE(contact, '$.fileName') AS file_name,
    p.run_id,
    p.ingested_ts,
    ROW_NUMBER() OVER (PARTITION BY CAST(JSON_VALUE(contact, '$.contactId') AS INT64) ORDER BY p.ingested_ts DESC) AS rn
  FROM \`gwc-poc-487320.raw.api_payload\` p,
  UNNEST(JSON_QUERY_ARRAY(p.response_body_json, '$.contacts')) AS contact
  WHERE p.page_status = 'SUCCESS'
)
SELECT
  e.* EXCEPT(rn),
  pd.disposition_name AS primary_disposition_name,
  sd.disposition_name AS secondary_disposition_name
FROM extracted e
LEFT JOIN \`gwc-poc-487320.incontact.dispositions\` pd
  ON e.primary_disposition_id = pd.disposition_id
LEFT JOIN \`gwc-poc-487320.incontact.dispositions\` sd
  ON e.secondary_disposition_id = sd.disposition_id
WHERE e.rn = 1;`,
  },
];

function ScriptCard({ script }: { script: Script }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(script.sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            <div>
              <CardTitle className="text-base">{script.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{script.description}</p>
            </div>
          </div>
          <Badge variant="outline" className="shrink-0">
            <Database className="h-3 w-3 mr-1" />
            {script.target}
          </Badge>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Reads from:</span>
              {script.dependencies.map((dep) => (
                <Badge key={dep} variant="secondary" className="text-xs">
                  {dep}
                </Badge>
              ))}
            </div>
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy();
                }}
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 mr-1" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" /> Copy SQL
                  </>
                )}
              </Button>
              <pre className="bg-muted rounded-lg p-4 pr-24 text-xs font-mono overflow-x-auto max-h-96 overflow-y-auto whitespace-pre-wrap">
                {script.sql}
              </pre>
            </div>
            <p className="text-xs text-muted-foreground">
              Run in BigQuery console with processing location set to <strong>us-central1</strong>.
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default function ScriptsPage() {
  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-1">BigQuery Scripts</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Transform and enrichment scripts for BigQuery. Copy and run in the BigQuery console.
      </p>
      <div className="space-y-4">
        {scripts.map((script) => (
          <ScriptCard key={script.id} script={script} />
        ))}
      </div>
    </div>
  );
}
