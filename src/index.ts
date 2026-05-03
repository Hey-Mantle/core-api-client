// Main client export
export { MantleCoreClient } from './client';

// All type exports
export * from './types';

// Error exports
export {
  MantleAPIError,
  MantleAuthenticationError,
  MantlePermissionError,
  MantleNotFoundError,
  MantleValidationError,
  MantleRateLimitError,
} from './utils/errors';

// Middleware exports
export {
  createRateLimitMiddleware,
  type RateLimitOptions,
} from './middleware';

// Re-export openapi-fetch Middleware type for consumers
export type { Middleware } from 'openapi-fetch';

// Resource class exports (for advanced usage)
export {
  BaseResource,
  CustomersResource,
  ContactsResource,
  SubscriptionsResource,
  UsageEventsResource,
  AppsResource,
  DealsResource,
  DealFlowsResource,
  DealActivitiesResource,
  TicketsResource,
  ChannelsResource,
  FlowsResource,
  TasksResource,
  WebhooksResource,
  CompaniesResource,
  CustomerSegmentsResource,
  AffiliatesResource,
  AffiliateProgramsResource,
  AffiliateCommissionsResource,
  AffiliatePayoutsResource,
  AffiliateReferralsResource,
  ChargesResource,
  TransactionsResource,
  MetricsResource,
  UsersResource,
  MeResource,
  OrganizationResource,
  AgentsResource,
  AttachmentsResource,
  DocsResource,
  EntitiesResource,
  CustomDataResource,
  TimelineCommentsResource,
  ListsResource,
  JournalEntriesResource,
  EmailUnsubscribeGroupsResource,
  FlowExtensionsResource,
  AiAgentRunsResource,
  MeetingsResource,
  SyncedEmailsResource,
} from './resources';
