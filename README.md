# API Ingestion Control Plane

  Metadata-driven internal app for managing extraction of third-party API data into Google BigQuery.

  ## Architecture

  - **API Server** - Express backend with Cloud Run
  - **Control Plane** - React + Vite frontend with nginx
  - **Extraction Engine** - Cloud Run Job for data extraction
  - **Infrastructure** - Terraform-managed GCP resources
  