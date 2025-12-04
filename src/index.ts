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
  DocsResource,
  EntitiesResource,
} from './resources';
