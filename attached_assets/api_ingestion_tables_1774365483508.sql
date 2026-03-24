-- BigQuery Standard SQL DDL for API Ingestion Control Plane

CREATE SCHEMA IF NOT EXISTS control;
CREATE SCHEMA IF NOT EXISTS ops;
CREATE SCHEMA IF NOT EXISTS raw;

CREATE TABLE control.source_system (
  source_system_id STRING,
  source_system_name STRING,
  base_url STRING,
  auth_type STRING,
  secret_manager_secret_name STRING,
  service_account_email STRING,
  is_active BOOL,
  created_ts TIMESTAMP,
  updated_ts TIMESTAMP
);

CREATE TABLE control.endpoint_definition (
  endpoint_id STRING,
  source_system_id STRING,
  endpoint_name STRING,
  http_method STRING,
  relative_path STRING,
  request_template_json JSON,
  pagination_strategy STRING,
  pagination_config_json JSON,
  incremental_strategy STRING,
  incremental_config_json JSON,
  schedule_cron STRING,
  is_active BOOL,
  created_ts TIMESTAMP,
  updated_ts TIMESTAMP
);

CREATE TABLE control.endpoint_parameter (
  endpoint_parameter_id STRING,
  endpoint_id STRING,
  parameter_name STRING,
  parameter_label STRING,
  parameter_location STRING,
  data_type STRING,
  is_required BOOL,
  default_value STRING,
  allowed_values_json JSON,
  help_text STRING,
  omit_if_blank BOOL,
  display_order INT64,
  is_active BOOL
);

CREATE TABLE ops.extraction_run (
  run_id STRING,
  source_system_id STRING,
  endpoint_id STRING,
  run_type STRING,
  requested_by STRING,
  window_start_ts TIMESTAMP,
  window_end_ts TIMESTAMP,
  status STRING,
  cloud_run_job_name STRING,
  cloud_run_execution_id STRING,
  started_ts TIMESTAMP,
  ended_ts TIMESTAMP,
  api_call_count INT64,
  page_count INT64,
  error_count INT64,
  last_checkpoint_json JSON,
  error_summary STRING,
  created_ts TIMESTAMP
);

CREATE TABLE ops.extraction_event (
  event_id STRING,
  run_id STRING,
  event_ts TIMESTAMP,
  event_type STRING,
  severity STRING,
  message STRING,
  details_json JSON
);

CREATE TABLE raw.api_payload (
  raw_payload_id STRING,
  run_id STRING,
  source_system_id STRING,
  endpoint_id STRING,
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
  ingested_ts TIMESTAMP
)
PARTITION BY DATE(ingested_ts)
CLUSTER BY source_system_id, endpoint_id, run_id;