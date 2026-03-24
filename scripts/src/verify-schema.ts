import { db, pool } from "@workspace/db";
import {
  sourceSystemTable,
  endpointDefinitionTable,
  endpointParameterTable,
  extractionRunTable,
  extractionEventTable,
} from "@workspace/db/schema";

async function verify() {
  const systems = await db.select().from(sourceSystemTable);
  console.log("Source systems:", systems.length, "-", systems.map((s) => s.sourceSystemId));

  const endpoints = await db.select().from(endpointDefinitionTable);
  console.log("Endpoints:", endpoints.length, "-", endpoints.map((e) => e.endpointId));

  const params = await db.select().from(endpointParameterTable);
  console.log("Parameters:", params.length, "-", params.map((p) => p.parameterName));

  const runs = await db.select().from(extractionRunTable);
  console.log("Extraction runs:", runs.length);

  const events = await db.select().from(extractionEventTable);
  console.log("Extraction events:", events.length);

  console.log("\nSample source system:");
  console.log(JSON.stringify(systems[0], null, 2));

  console.log("\nSample endpoint:");
  console.log(JSON.stringify(endpoints[0], null, 2));

  await pool.end();
}

verify().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
