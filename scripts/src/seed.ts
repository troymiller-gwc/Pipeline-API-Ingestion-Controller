import { db, pool } from "@workspace/db";
import {
  sourceSystemTable,
  endpointDefinitionTable,
  endpointParameterTable,
} from "@workspace/db/schema";

async function seed() {
  console.log("Seeding NICE CXone source system and get_contacts endpoint...");

  await db.insert(sourceSystemTable).values({
    sourceSystemId: "nice-cxone",
    sourceSystemName: "NICE CXone",
    baseUrl: "https://api-na1.niceincontact.com",
    authType: "OAUTH2_CLIENT_CREDENTIALS",
    secretManagerSecretName: "nice-cxone-api-credentials",
    isActive: true,
  }).onConflictDoNothing();

  await db.insert(endpointDefinitionTable).values({
    endpointId: "nice-cxone-get-contacts",
    sourceSystemId: "nice-cxone",
    endpointName: "Get Contacts",
    httpMethod: "GET",
    relativePath: "/incontactapi/services/v30.0/contacts",
    paginationStrategy: "OFFSET_LIMIT",
    paginationConfigJson: {
      pageSize: 5000,
      offsetParam: "skip",
      limitParam: "top",
    },
    incrementalStrategy: "DATE_WINDOW",
    incrementalConfigJson: {
      startDateParam: "startDate",
      endDateParam: "endDate",
      dateFormat: "YYYY-MM-DDTHH:mm:ss.SSSZ",
      safetyLagMinutes: 15,
    },
    rateLimitConfigJson: {
      requestsPerSecond: 5,
      requestsPerMinute: 200,
      backoffStrategy: "EXPONENTIAL",
      initialBackoffMs: 1000,
      maxBackoffMs: 60000,
      maxRetries: 3,
    },
    isActive: true,
  }).onConflictDoNothing();

  const params = [
    {
      endpointParameterId: "nice-cxone-get-contacts-start-date",
      endpointId: "nice-cxone-get-contacts",
      parameterName: "startDate",
      parameterLabel: "Start Date",
      parameterLocation: "QUERY" as const,
      dataType: "DATETIME" as const,
      isRequired: true,
      helpText: "Start of the date range for contact retrieval (ISO 8601).",
      omitIfBlank: false,
      displayOrder: 1,
      isActive: true,
    },
    {
      endpointParameterId: "nice-cxone-get-contacts-end-date",
      endpointId: "nice-cxone-get-contacts",
      parameterName: "endDate",
      parameterLabel: "End Date",
      parameterLocation: "QUERY" as const,
      dataType: "DATETIME" as const,
      isRequired: true,
      helpText: "End of the date range for contact retrieval (ISO 8601).",
      omitIfBlank: false,
      displayOrder: 2,
      isActive: true,
    },
    {
      endpointParameterId: "nice-cxone-get-contacts-updated-since",
      endpointId: "nice-cxone-get-contacts",
      parameterName: "updatedSince",
      parameterLabel: "Updated Since",
      parameterLocation: "QUERY" as const,
      dataType: "DATETIME" as const,
      isRequired: false,
      helpText: "Only return contacts updated after this timestamp.",
      omitIfBlank: true,
      displayOrder: 3,
      isActive: true,
    },
    {
      endpointParameterId: "nice-cxone-get-contacts-fields",
      endpointId: "nice-cxone-get-contacts",
      parameterName: "fields",
      parameterLabel: "Fields",
      parameterLocation: "QUERY" as const,
      dataType: "STRING" as const,
      isRequired: false,
      helpText: "Comma-separated list of fields to include in the response.",
      omitIfBlank: true,
      displayOrder: 4,
      isActive: true,
    },
  ];

  for (const param of params) {
    await db.insert(endpointParameterTable).values(param).onConflictDoNothing();
  }

  console.log("Seed data inserted successfully.");
  await pool.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
