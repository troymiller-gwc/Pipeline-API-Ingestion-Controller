import { z } from "zod/v4";
import {
  AuthType,
  HttpMethod,
  PaginationStrategy,
  IncrementalStrategy,
  RunType,
  RunStatus,
  PageStatus,
  EventType,
  EventSeverity,
  ParameterLocation,
  ParameterDataType,
  BackoffStrategy,
} from "./enums";

export const RateLimitConfigSchema = z.object({
  requestsPerSecond: z.number().positive().optional(),
  requestsPerMinute: z.number().positive().optional(),
  backoffStrategy: BackoffStrategy.default("EXPONENTIAL"),
  initialBackoffMs: z.number().positive().default(1000),
  maxBackoffMs: z.number().positive().default(60000),
  maxRetries: z.number().int().nonnegative().default(3),
});
export type RateLimitConfig = z.infer<typeof RateLimitConfigSchema>;

export const PaginationConfigSchema = z.object({
  pageSize: z.number().int().positive().optional(),
  pageSizeParam: z.string().optional(),
  pageNumberParam: z.string().optional(),
  offsetParam: z.string().optional(),
  limitParam: z.string().optional(),
  nextTokenParam: z.string().optional(),
  nextTokenResponsePath: z.string().optional(),
  maxPages: z.number().int().positive().optional(),
});
export type PaginationConfig = z.infer<typeof PaginationConfigSchema>;

export const IncrementalConfigSchema = z.object({
  startDateParam: z.string().optional(),
  endDateParam: z.string().optional(),
  cursorParam: z.string().optional(),
  cursorResponsePath: z.string().optional(),
  dateFormat: z.string().optional(),
  safetyLagMinutes: z.number().int().nonnegative().default(15),
});
export type IncrementalConfig = z.infer<typeof IncrementalConfigSchema>;

export const CreateSourceSystemSchema = z.object({
  sourceSystemId: z.string().min(1),
  sourceSystemName: z.string().min(1),
  baseUrl: z.url(),
  authType: AuthType,
  secretManagerSecretName: z.string().nullable().optional(),
  serviceAccountEmail: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
});
export type CreateSourceSystem = z.infer<typeof CreateSourceSystemSchema>;

export const UpdateSourceSystemSchema = CreateSourceSystemSchema.partial().omit({
  sourceSystemId: true,
});
export type UpdateSourceSystem = z.infer<typeof UpdateSourceSystemSchema>;

export const CreateEndpointDefinitionSchema = z.object({
  endpointId: z.string().min(1),
  sourceSystemId: z.string().min(1),
  endpointName: z.string().min(1),
  httpMethod: HttpMethod,
  relativePath: z.string().min(1),
  requestTemplateJson: z.record(z.string(), z.unknown()).nullable().optional(),
  paginationStrategy: PaginationStrategy,
  paginationConfigJson: PaginationConfigSchema.nullable().optional(),
  incrementalStrategy: IncrementalStrategy,
  incrementalConfigJson: IncrementalConfigSchema.nullable().optional(),
  rateLimitConfigJson: RateLimitConfigSchema.nullable().optional(),
  scheduleCron: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
});
export type CreateEndpointDefinition = z.infer<typeof CreateEndpointDefinitionSchema>;

export const UpdateEndpointDefinitionSchema = CreateEndpointDefinitionSchema.partial().omit({
  endpointId: true,
  sourceSystemId: true,
});
export type UpdateEndpointDefinition = z.infer<typeof UpdateEndpointDefinitionSchema>;

export const CreateEndpointParameterSchema = z.object({
  endpointParameterId: z.string().min(1),
  endpointId: z.string().min(1),
  parameterName: z.string().min(1),
  parameterLabel: z.string().nullable().optional(),
  parameterLocation: ParameterLocation,
  dataType: ParameterDataType,
  isRequired: z.boolean().default(false),
  defaultValue: z.string().nullable().optional(),
  allowedValuesJson: z.array(z.string()).nullable().optional(),
  helpText: z.string().nullable().optional(),
  omitIfBlank: z.boolean().default(true),
  displayOrder: z.number().int().nonnegative().default(0),
  isActive: z.boolean().default(true),
});
export type CreateEndpointParameter = z.infer<typeof CreateEndpointParameterSchema>;

export const UpdateEndpointParameterSchema = CreateEndpointParameterSchema.partial().omit({
  endpointParameterId: true,
  endpointId: true,
});
export type UpdateEndpointParameter = z.infer<typeof UpdateEndpointParameterSchema>;

export const TriggerRunSchema = z.object({
  sourceSystemId: z.string().min(1),
  endpointId: z.string().min(1),
  runType: RunType.default("MANUAL"),
  requestedBy: z.string().nullable().optional(),
  windowStartTs: z.string().datetime().nullable().optional(),
  windowEndTs: z.string().datetime().nullable().optional(),
  parentRunId: z.string().uuid().nullable().optional(),
});
export type TriggerRun = z.infer<typeof TriggerRunSchema>;

export const SourceSystemResponseSchema = z.object({
  sourceSystemId: z.string(),
  sourceSystemName: z.string(),
  baseUrl: z.string(),
  authType: z.string(),
  secretManagerSecretName: z.string().nullable(),
  serviceAccountEmail: z.string().nullable(),
  isActive: z.boolean(),
  createdTs: z.string(),
  updatedTs: z.string(),
});
export type SourceSystemResponse = z.infer<typeof SourceSystemResponseSchema>;

export const EndpointDefinitionResponseSchema = z.object({
  endpointId: z.string(),
  sourceSystemId: z.string(),
  endpointName: z.string(),
  httpMethod: z.string(),
  relativePath: z.string(),
  requestTemplateJson: z.unknown().nullable(),
  paginationStrategy: z.string(),
  paginationConfigJson: z.unknown().nullable(),
  incrementalStrategy: z.string(),
  incrementalConfigJson: z.unknown().nullable(),
  rateLimitConfigJson: z.unknown().nullable(),
  scheduleCron: z.string().nullable(),
  isActive: z.boolean(),
  createdTs: z.string(),
  updatedTs: z.string(),
});
export type EndpointDefinitionResponse = z.infer<typeof EndpointDefinitionResponseSchema>;

export const EndpointParameterResponseSchema = z.object({
  endpointParameterId: z.string(),
  endpointId: z.string(),
  parameterName: z.string(),
  parameterLabel: z.string().nullable(),
  parameterLocation: z.string(),
  dataType: z.string(),
  isRequired: z.boolean(),
  defaultValue: z.string().nullable(),
  allowedValuesJson: z.unknown().nullable(),
  helpText: z.string().nullable(),
  omitIfBlank: z.boolean(),
  displayOrder: z.number(),
  isActive: z.boolean(),
});
export type EndpointParameterResponse = z.infer<typeof EndpointParameterResponseSchema>;

export const ExtractionRunResponseSchema = z.object({
  runId: z.string(),
  parentRunId: z.string().nullable(),
  sourceSystemId: z.string(),
  endpointId: z.string(),
  runType: z.string(),
  requestedBy: z.string().nullable(),
  windowStartTs: z.string().nullable(),
  windowEndTs: z.string().nullable(),
  status: z.string(),
  cloudRunJobName: z.string().nullable(),
  cloudRunExecutionId: z.string().nullable(),
  startedTs: z.string().nullable(),
  endedTs: z.string().nullable(),
  apiCallCount: z.number(),
  pageCount: z.number(),
  errorCount: z.number(),
  lastCheckpointJson: z.unknown().nullable(),
  errorSummary: z.string().nullable(),
  createdTs: z.string(),
});
export type ExtractionRunResponse = z.infer<typeof ExtractionRunResponseSchema>;

export const ExtractionEventResponseSchema = z.object({
  eventId: z.string(),
  runId: z.string(),
  eventTs: z.string(),
  eventType: z.string(),
  severity: z.string(),
  message: z.string().nullable(),
  detailsJson: z.unknown().nullable(),
});
export type ExtractionEventResponse = z.infer<typeof ExtractionEventResponseSchema>;

export const ListResponseMetaSchema = z.object({
  total: z.number().int().nonnegative(),
  limit: z.number().int().positive(),
  offset: z.number().int().nonnegative(),
});
export type ListResponseMeta = z.infer<typeof ListResponseMetaSchema>;
