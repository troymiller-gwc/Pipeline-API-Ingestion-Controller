import { createHash } from "crypto";
import { BigQuery } from "@google-cloud/bigquery";

export interface ApiPayloadRow {
  runId: string;
  sourceSystemId: string;
  endpointId: string;
  pageNumber: number;
  httpStatusCode: number;
  requestUrl: string;
  responsePayload: string;
  payloadHash: string;
  pageStatus: string;
  recordCount: number;
  skip?: number | null;
  pageToken?: string | null;
  nextPageToken?: string | null;
  ingestedTs: string;
}

export function buildPayloadRow(params: {
  runId: string;
  sourceSystemId: string;
  endpointId: string;
  pageNumber: number;
  httpStatusCode: number;
  requestUrl: string;
  responseBody: unknown;
  pageStatus: string;
  recordCount: number;
  skip?: number;
  pageToken?: string;
  nextPageToken?: string;
}): ApiPayloadRow {
  const responsePayload = typeof params.responseBody === "string"
    ? params.responseBody
    : JSON.stringify(params.responseBody);

  const payloadHash = createHash("sha256").update(responsePayload).digest("hex");

  return {
    runId: params.runId,
    sourceSystemId: params.sourceSystemId,
    endpointId: params.endpointId,
    pageNumber: params.pageNumber,
    httpStatusCode: params.httpStatusCode,
    requestUrl: params.requestUrl,
    responsePayload,
    payloadHash,
    pageStatus: params.pageStatus,
    recordCount: params.recordCount,
    skip: params.skip ?? null,
    pageToken: params.pageToken ?? null,
    nextPageToken: params.nextPageToken ?? null,
    ingestedTs: new Date().toISOString(),
  };
}

export class BigQueryWriter {
  private buffer: ApiPayloadRow[] = [];
  private batchSize: number;
  private client: BigQuery | null = null;
  private tableRef: any = null;
  private maxRetries = 2;

  constructor(batchSize = 2) {
    this.batchSize = batchSize;
  }

  async init(): Promise<void> {
    if (process.env.NODE_ENV === "development") {
      console.log("[BQ Writer] Running in dev mode - writes will be logged but not sent to BigQuery");
      return;
    }

    try {
      this.client = new BigQuery();
      this.tableRef = this.client.dataset("raw").table("api_payload");
    } catch {
      console.warn("[BQ Writer] BigQuery client not available. Writes will be logged only.");
    }
  }

  async writeRow(row: ApiPayloadRow): Promise<void> {
    this.buffer.push(row);
    if (this.buffer.length >= this.batchSize) {
      await this.flush();
    }
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const rows = [...this.buffer];

    if (this.tableRef) {
      for (const row of rows) {
        let lastErr: Error | null = null;
        for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
          try {
            await this.tableRef.insert([row]);
            break;
          } catch (err: any) {
            lastErr = err;
            if (err.name === "PartialFailureError") {
              console.error(`[BQ Writer] Partial failure for page ${row.pageNumber} (attempt ${attempt + 1})`);
            }
            if (attempt < this.maxRetries) {
              await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
            } else {
              throw lastErr ?? new Error(`BigQuery insert failed for page ${row.pageNumber} after retries`);
            }
          }
        }
      }
      this.buffer = [];
    } else {
      this.buffer = [];
      console.log(`[BQ Writer] Would write ${rows.length} rows to raw.api_payload`);
      for (const row of rows) {
        console.log(`  page=${row.pageNumber} status=${row.pageStatus} records=${row.recordCount} hash=${row.payloadHash.slice(0, 12)}...`);
      }
    }
  }
}
