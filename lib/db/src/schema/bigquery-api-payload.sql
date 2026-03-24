-- BigQuery DDL for raw.api_payload
-- This table lives in BigQuery (not PostgreSQL) and stores immutable raw API response payloads.
-- One row per HTTP response page per extraction run.
--
-- Deployment: Run this DDL in BigQuery console or via Terraform/gcloud CLI.
-- The application writes to this table using the BigQuery Storage Write API.

CREATE TABLE IF NOT EXISTS `raw.api_payload` (
  raw_payload_id STRING NOT NULL,
  run_id STRING NOT NULL,
  source_system_id STRING NOT NULL,
  endpoint_id STRING NOT NULL,
  request_ts TIMESTAMP,
  response_ts TIMESTAMP,
  http_method STRING,
  request_url STRING,
  http_status_code INT64,
  page_number INT64,
  page_token STRING,
  next_page_token STRING,
  request_params_json JSON,
  request_body_json JSON,
  response_body_json JSON,
  record_count_hint INT64,
  payload_hash STRING,
  page_status STRING,
  error_message STRING,
  ingested_ts TIMESTAMP NOT NULL
)
PARTITION BY DATE(ingested_ts)
CLUSTER BY source_system_id, endpoint_id, run_id
OPTIONS (
  description = 'Immutable raw API response payloads. One row per HTTP response page per extraction run.',
  require_partition_filter = false
);
