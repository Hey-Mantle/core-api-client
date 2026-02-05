# @heymantle/core-api-client

A TypeScript SDK for the Mantle Core API. Built with a resource-based architecture similar to the Stripe SDK.

## Installation

```bash
npm install @heymantle/core-api-client
```

## Quick Start

```typescript
import { MantleCoreClient } from '@heymantle/core-api-client';

const client = new MantleCoreClient({
  apiKey: 'your-api-key',
});

// List customers
const { customers, hasNextPage } = await client.customers.list({ take: 25 });

// Get a specific customer
const { customer } = await client.customers.retrieve('cust_123');
```

## Authentication

The client supports two authentication methods:

```typescript
// API Key (for server-side use)
const client = new MantleCoreClient({
  apiKey: 'your-api-key',
});

// OAuth Access Token
const client = new MantleCoreClient({
  accessToken: 'your-oauth-token',
});
```

## Middleware

The client supports Koa-style middleware for intercepting requests and responses. Middleware can be used for logging, authentication refresh, retry logic, and more.

### Creating Custom Middleware

```typescript
import { MantleCoreClient, type Middleware } from '@heymantle/core-api-client';

// Logging middleware
const loggingMiddleware: Middleware = async (ctx, next) => {
  const start = Date.now();
  console.log(`[Request] ${ctx.request.method} ${ctx.request.url}`);

  await next();

  const duration = Date.now() - start;
  console.log(`[Response] ${ctx.response?.status} (${duration}ms)`);
};

// Register middleware
const client = new MantleCoreClient({ apiKey: 'your-api-key' });
client.use(loggingMiddleware, { name: 'logging', priority: 10 });
```

### Auth Refresh Middleware

Automatically refresh expired access tokens:

```typescript
import { MantleCoreClient, createAuthRefreshMiddleware } from '@heymantle/core-api-client';

const client = new MantleCoreClient({
  accessToken: 'initial-token',
});

client.use(
  createAuthRefreshMiddleware({
    refreshToken: async () => {
      // Call your token refresh endpoint
      const response = await fetch('/api/refresh', { method: 'POST' });
      const data = await response.json();
      return data.accessToken;
    },
    onRefreshSuccess: (newToken) => {
      // Persist the new token
      localStorage.setItem('accessToken', newToken);
    },
    onRefreshFailed: (error) => {
      // Redirect to login
      window.location.href = '/login';
    },
    maxRefreshAttempts: 1,
  }),
  { name: 'auth-refresh' }
);
```

### Middleware at Construction

```typescript
const client = new MantleCoreClient({
  apiKey: 'your-api-key',
  middleware: [
    loggingMiddleware,
    [retryMiddleware, { name: 'retry', priority: 5 }],
  ],
});
```

### Middleware Context

```typescript
interface MiddlewareContext<T = unknown> {
  request: {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers: Record<string, string>;
    body?: string;
    endpoint: string;
  };
  response?: {
    data: T;
    status: number;
    headers: Headers;
  };
  error?: Error;
  retry: boolean;           // Set to true to retry the request
  retryCount: number;
  maxRetries: number;
  updateAuth: (credentials: { apiKey?: string; accessToken?: string }) => void;
}
```

## Resources

### Customers

```typescript
// List customers with filters
const { customers, hasNextPage, total } = await client.customers.list({
  take: 25,
  search: 'acme',
  appIds: ['app_123'],
  shopifyShopDomain: 'store.myshopify.com',
  shopifyShopId: '12345',
  includeUsageMetrics: true,
  includeContactCount: true,
  sort: 'createdAt',
  sortDirection: 'desc',
});

// Retrieve a customer
const { customer } = await client.customers.retrieve('cust_123', {
  includeContactCount: true,
  includeCurrentInvoice: true,
});

// Create a customer
const { customer } = await client.customers.create({
  name: 'Acme Inc',
  email: 'contact@acme.com',
  domain: 'acme.com',
  shopifyDomain: 'acme.myshopify.com',
  shopifyShopId: '12345',
  countryCode: 'US',
  preferredCurrency: 'USD',
  description: 'Enterprise customer',
  tags: ['enterprise', 'priority'],
  customFields: { industry: 'Technology', employees: 500 },
  companyId: 'company_123',
  appInstallations: [
    { appId: 'app_123', installedAt: '2024-01-15T00:00:00Z', test: false },
  ],
});

// Update a customer
const { customer } = await client.customers.update('cust_123', {
  name: 'Acme Corporation',
  tags: ['enterprise', 'vip'],
});

// Add/remove tags
await client.customers.addTags('cust_123', ['premium', 'partner']);
await client.customers.removeTags('cust_123', ['trial']);

// Timeline events
const { events, hasNextPage } = await client.customers.getTimeline('cust_123', {
  appId: 'app_123',
  type: 'subscription.created',
  limit: 50,
  cursor: 'cursor_abc',
});

// Account owners
const { accountOwners } = await client.customers.listAccountOwners('cust_123');
const { accountOwner } = await client.customers.addAccountOwner('cust_123', {
  email: 'owner@acme.com',
  name: 'John Owner',
});
await client.customers.removeAccountOwner('cust_123', 'owner_123');

// Custom fields
const { customFields } = await client.customers.listCustomFields({ appId: 'app_123' });
const { customField } = await client.customers.createCustomField({
  appId: 'app_123',
  name: 'Industry',
  type: 'select', // 'string' | 'number' | 'boolean' | 'date' | 'select'
  options: ['Technology', 'Healthcare', 'Finance', 'Retail'],
  defaultValue: 'Technology',
  showOnCustomerDetail: true,
  filterable: true,
  private: false,
});
const { customField } = await client.customers.retrieveCustomField('field_123');
const { customField } = await client.customers.updateCustomField('field_123', {
  name: 'Industry Type',
  options: ['Technology', 'Healthcare', 'Finance', 'Retail', 'Other'],
});
await client.customers.deleteCustomField('field_123');
```

### Contacts

```typescript
// List contacts
const { contacts, hasNextPage } = await client.contacts.list({
  take: 25,
  search: 'john',
  socialProfileType: 'linkedin', // 'linkedin' | 'x' | 'facebook' | 'instagram' | 'website'
  socialProfileUrl: 'https://linkedin.com/in/johndoe',
});

// Create or update a contact (upsert by email)
// If a contact with the same email exists, it will be updated
const { contact, created } = await client.contacts.create({
  name: 'John Doe',
  email: 'john@acme.com',
  phone: '+1-555-123-4567',
  jobTitle: 'CTO',
  notes: 'Primary technical contact',
  tags: ['decision-maker', 'technical'],
  customers: ['cust_123', 'cust_456'],
  socialProfiles: [
    { key: 'linkedin', value: 'https://linkedin.com/in/johndoe' },
    { key: 'x', value: 'https://x.com/johndoe' },
    { key: 'website', value: 'https://johndoe.com' },
  ],
});
console.log(created ? 'New contact created' : 'Existing contact updated');

// Update a contact
const { contact } = await client.contacts.update('contact_123', {
  jobTitle: 'VP of Engineering',
  socialProfiles: [
    { key: 'linkedin', value: 'https://linkedin.com/in/johndoe-updated' },
  ],
});

// Retrieve a contact
const { contact } = await client.contacts.retrieve('contact_123');

// Delete a contact
await client.contacts.del('contact_123');

// Add/remove tags
await client.contacts.addTags('contact_123', ['vip', 'decision-maker']);
await client.contacts.removeTags('contact_123', ['trial']);
```

### Subscriptions

```typescript
// List subscriptions
const { subscriptions, hasNextPage } = await client.subscriptions.list({
  appId: 'app_123',
  customerId: 'cust_123',
  active: true,
  ids: ['sub_123', 'sub_456'],
  startDate: '2024-01-01',
  endDate: '2024-12-31',
});

// Retrieve a subscription
const { subscription } = await client.subscriptions.retrieve('sub_123');
```

### Deals

Deals support multiple ways to link customers and contacts:

```typescript
// List deals with filters
const { deals, hasNextPage, total } = await client.deals.list({
  customerId: 'cust_123',
  appId: 'app_123',
  planId: 'plan_123',
  dealStageId: 'stage_123',
  dealFlowId: 'flow_123',
  affiliateId: 'aff_123',
  partnershipId: 'partner_123',
  acquirerId: 'user_123',
  ownerId: 'user_456',
  contactId: 'contact_123',
  stage: 'negotiation',
  minAmount: 1000,
  maxAmount: 50000,
  acquisitionChannel: 'inbound',
  acquisitionSource: 'website',
  includeArchived: false,
});

// Create a deal - Option 1: Link existing customer
const { deal } = await client.deals.create({
  name: 'Enterprise Deal',
  amount: 50000,
  amountCurrencyCode: 'USD',
  customerId: 'cust_123',
  contactIds: ['contact_123', 'contact_456'],
  dealFlowId: 'flow_123',
  dealStageId: 'stage_123',
  appId: 'app_123',
  planId: 'plan_456',
  ownerIds: ['user_123'],
  acquisitionChannel: 'outbound',
  acquisitionSource: 'sales_call',
  firstInteractionAt: '2024-01-15T10:00:00Z',
  closingAt: '2024-03-01T00:00:00Z',
  notes: 'High priority enterprise deal',
});

// Create a deal - Option 2: Create/update customer inline
const { deal } = await client.deals.create({
  name: 'New Prospect Deal',
  amount: 25000,
  // Customer will be matched by domain or created if not found
  customer: {
    name: 'Acme Corp',
    email: 'info@acme.com',
    domain: 'acme.com',
    shopifyDomain: 'acme.myshopify.com',
    shopifyShopId: '12345',
    tags: ['prospect'],
    countryCode: 'US',
    preferredCurrency: 'USD',
  },
  // Contacts will be matched by email or created if not found
  contacts: [
    {
      email: 'john@acme.com',
      name: 'John Doe',
      phone: '+1-555-123-4567',
      jobTitle: 'CEO',
      label: 'primary',
      notes: 'Decision maker',
      tags: ['executive'],
    },
    {
      email: 'jane@acme.com',
      name: 'Jane Smith',
      jobTitle: 'CTO',
      label: 'technical',
    },
  ],
  dealFlowId: 'flow_123',
  dealStageId: 'stage_123',
});

// Create a deal - Option 3: Find/create customer by domain
const { deal } = await client.deals.create({
  name: 'Domain-based Deal',
  shopifyDomain: 'newstore.myshopify.com',
  dealFlowId: 'flow_123',
  dealStageId: 'stage_123',
});

// Update a deal
const { deal } = await client.deals.update('deal_123', {
  amount: 75000,
  dealStageId: 'stage_456',
  closedAt: '2024-02-15T00:00:00Z',
  notes: 'Deal closed successfully!',
});

// Archive a deal
await client.deals.del('deal_123');

// Get deal timeline
const { events } = await client.deals.timeline('deal_123');

// Get deal events
const { events } = await client.deals.listEvents('deal_123');

// Create a deal event
const { event } = await client.deals.createEvent('deal_123', {
  type: 'note',
  description: 'Called the customer to discuss pricing',
});
```

### Deal Flows

Manage deal pipelines and stages:

```typescript
// List deal flows
const { dealFlows } = await client.dealFlows.list();

// Retrieve a deal flow with stages
const { dealFlow } = await client.dealFlows.retrieve('flow_123');
// dealFlow.stages contains the ordered stages

// Create a deal flow
const { dealFlow } = await client.dealFlows.create({
  name: 'Enterprise Sales Pipeline',
  description: 'For deals over $10k',
});

// Update a deal flow
const { dealFlow } = await client.dealFlows.update('flow_123', {
  name: 'Enterprise Sales Pipeline v2',
});

// Delete a deal flow
await client.dealFlows.del('flow_123');
```

### Deal Activities

Track activities within deal flows:

```typescript
// List deal activities
const { dealActivities } = await client.dealActivities.list();

// Retrieve a deal activity
const { dealActivity } = await client.dealActivities.retrieve('activity_123');

// Create a deal activity
const { dealActivity } = await client.dealActivities.create({
  name: 'Initial Call',
  dealFlowId: 'flow_123',
  description: 'First discovery call with prospect',
  order: 1,
});

// Update a deal activity
const { dealActivity } = await client.dealActivities.update('activity_123', {
  name: 'Discovery Call',
  description: 'Updated description',
});

// Delete a deal activity
await client.dealActivities.del('activity_123');
```

### Apps

```typescript
// List apps
const { apps } = await client.apps.list({
  minUpdatedAt: '2024-01-01T00:00:00Z',
  maxUpdatedAt: '2024-12-31T23:59:59Z',
});

// Retrieve an app
const { app } = await client.apps.retrieve('app_123');
```

### Plans

```typescript
// List plans for an app
const { plans, total, hasMore } = await client.apps.listPlans('app_123', {
  public: true,
  page: 0,
  perPage: 25,
  search: 'pro',
});

// Retrieve a plan
const { plan } = await client.apps.retrievePlan('app_123', 'plan_123');

// Create a plan with usage charges and features
const { plan } = await client.apps.createPlan('app_123', {
  name: 'Pro Plan',
  description: 'For growing businesses',
  amount: 4900, // $49.00
  currencyCode: 'USD',
  interval: 'month', // 'month' | 'year' | 'one_time'
  trialDays: 14,
  public: true,
  visible: true,
  customerTags: ['premium'],
  customerExcludeTags: ['churned'],
  shopifyPlans: ['shopify', 'advanced'],
  flexBilling: true,
  flexBillingTerms: 'Charged at end of billing period',
  // Usage-based pricing
  planUsageCharges: [
    {
      usageMetricId: 'metric_123',
      cappedAmount: 10000, // $100 cap
      terms: '$0.01 per API call',
      interval: 'month',
    },
  ],
  // Feature flags
  features: [
    { featureId: 'feature_api', value: true },
    { featureId: 'feature_seats', value: 10 },
  ],
  customFields: { tier: 'mid' },
});

// Update a plan
const { plan } = await client.apps.updatePlan('app_123', 'plan_123', {
  amount: 5900,
  description: 'Updated description',
});

// Archive/unarchive a plan
await client.apps.archivePlan('app_123', 'plan_123');
await client.apps.unarchivePlan('app_123', 'plan_123');
```

### Features

```typescript
// List features
const { features } = await client.apps.listFeatures('app_123');

// Retrieve a feature
const { feature } = await client.apps.retrieveFeature('app_123', 'feature_123');

// Create a feature
const { feature } = await client.apps.createFeature('app_123', {
  name: 'API Access',
  type: 'boolean', // 'boolean' | 'limit' | 'unlimited'
  description: 'Access to REST API',
  usageMetricId: 'metric_123', // Link to usage tracking
});

// Update a feature
const { feature } = await client.apps.updateFeature('app_123', 'feature_123', {
  name: 'API Access v2',
  description: 'Updated description',
});

// Delete a feature
await client.apps.deleteFeature('app_123', 'feature_123');
```

### Usage Metrics

```typescript
// List usage metrics
const { usageMetrics } = await client.apps.listUsageMetrics('app_123');

// Retrieve a usage metric
const { usageMetric } = await client.apps.retrieveUsageMetric('app_123', 'metric_123');

// Create a usage metric
const { usageMetric } = await client.apps.createUsageMetric('app_123', {
  name: 'API Calls',
  description: 'Number of API requests',
  eventName: 'api_call',
  aggregationType: 'count',
});

// Update a usage metric
const { usageMetric } = await client.apps.updateUsageMetric('app_123', 'metric_123', {
  name: 'API Requests',
});

// Delete a usage metric
await client.apps.deleteUsageMetric('app_123', 'metric_123');

// Get event names for an app
const { eventNames } = await client.apps.listEventNames('app_123');

// Get property keys for an event
const { propertyKeys } = await client.apps.listPropertyKeys('app_123', 'api_call');
```

### App Events

```typescript
// List app events
const { appEvents, hasNextPage } = await client.apps.listAppEvents('app_123', {
  customerId: 'cust_123',
  take: 50,
});
```

### Reviews

```typescript
// List reviews
const { reviews } = await client.apps.listReviews('app_123');

// Retrieve a review
const { review } = await client.apps.retrieveReview('app_123', 'review_123');

// Create a review
const { review } = await client.apps.createReview('app_123', {
  rating: 5,
  title: 'Excellent app!',
  body: 'This app transformed our workflow.',
});

// Update a review
const { review } = await client.apps.updateReview('app_123', 'review_123', {
  rating: 4,
  body: 'Updated review text',
});

// Delete a review
await client.apps.deleteReview('app_123', 'review_123');
```

### Tickets

```typescript
// List tickets with filters
const { tickets, hasNextPage, total } = await client.tickets.list({
  status: 'open', // 'open' | 'pending' | 'resolved' | 'closed'
  priority: 'high', // 'low' | 'medium' | 'high' | 'urgent'
  assignedToId: 'user_123',
  appId: 'app_123',
  customerId: 'cust_123',
  contactId: 'contact_123',
  channelId: 'channel_123',
  tags: ['billing', 'urgent'],
  take: 25,
});

// Retrieve a ticket
const { ticket } = await client.tickets.retrieve('ticket_123');

// Create a ticket - Option 1: Link existing contact
const { ticket } = await client.tickets.create({
  subject: 'Need help with integration',
  status: 'open',
  priority: 'medium',
  customerId: 'cust_123',
  contactId: 'contact_123',
  appId: 'app_123',
  channelId: 'channel_123',
  assignedToId: 'user_123',
  tags: ['integration', 'api'],
});

// Create a ticket - Option 2: Create contact inline
const { ticket } = await client.tickets.create({
  subject: 'Billing question',
  priority: 'high',
  customerId: 'cust_123',
  contact: {
    email: 'support-requester@acme.com',
    name: 'Support User',
  },
});

// Update a ticket
const { ticket } = await client.tickets.update('ticket_123', {
  status: 'pending',
  priority: 'urgent',
  assignedToId: 'user_456',
  tags: ['escalated'],
});

// Delete a ticket
await client.tickets.del('ticket_123');

// List messages for a ticket
const { messages } = await client.tickets.listMessages('ticket_123');

// Retrieve a message
const { message } = await client.tickets.retrieveMessage('ticket_123', 'message_123');

// Create a message with attachments
const { message } = await client.tickets.createMessage('ticket_123', {
  body: 'Here is the solution to your problem...',
  from: 'agent', // 'customer' | 'agent'
  attachments: [
    {
      filename: 'solution.pdf',
      url: 'https://storage.example.com/solution.pdf',
      contentType: 'application/pdf',
      size: 102400,
    },
  ],
});

// Update a message
const { message } = await client.tickets.updateMessage('ticket_123', 'message_123', {
  body: 'Updated message content',
});

// Delete a message
await client.tickets.deleteMessage('ticket_123', 'message_123');
```

### Channels

Manage CX channels for tickets:

```typescript
// List channels
const { channels } = await client.channels.list({
  type: 'email', // 'email' | 'chat'
});

// Create a channel
const { channel } = await client.channels.create({
  type: 'email',
  name: 'Support Email',
});
```

### Agents

Manage support agents:

```typescript
// List agents
const { agents } = await client.agents.list();

// Retrieve an agent
const { agent } = await client.agents.retrieve('agent_123');

// Create an agent
const { agent } = await client.agents.create({
  email: 'agent@company.com',
  name: 'Support Agent',
});

// Find or create an agent (upsert by email)
const { agent } = await client.agents.findOrCreate({
  email: 'agent@company.com',
  name: 'Support Agent',
});
```

### Metrics

Retrieve analytics and business metrics:

```typescript
import type { DateRangeType } from '@heymantle/core-api-client';

// Date range options:
// 'last_30_minutes' | 'last_60_minutes' | 'last_12_hours' | 'last_24_hours'
// 'last_7_days' | 'last_14_days' | 'last_30_days' | 'last_90_days'
// 'last_12_months' | 'last_24_months'
// 'today' | 'yesterday' | 'last_month'
// 'month_to_date' | 'quarter_to_date' | 'year_to_date'
// 'all_time' | 'custom'

// Monthly Recurring Revenue
const mrr = await client.metrics.mrr({
  appId: 'app_123',
  dateRange: 'last_30_days',
});
console.log(mrr.total, mrr.formattedTotal); // 50000, "$500.00"
console.log(mrr.change, mrr.changePercentage); // 5000, 10

// Annual Recurring Revenue
const arr = await client.metrics.arr({ appId: 'app_123' });

// Average Revenue Per User
const arpu = await client.metrics.arpu({ appId: 'app_123' });

// Customer Lifetime Value
const ltv = await client.metrics.ltv({ appId: 'app_123' });

// Predicted LTV
const predictedLtv = await client.metrics.predictedLtv({ appId: 'app_123' });

// Revenue Churn
const revenueChurn = await client.metrics.revenueChurn({ appId: 'app_123' });

// Logo (Customer) Churn
const logoChurn = await client.metrics.logoChurn({ appId: 'app_123' });

// Revenue Retention
const revenueRetention = await client.metrics.revenueRetention({ appId: 'app_123' });

// Net Revenue Retention
const nrr = await client.metrics.netRevenueRetention({ appId: 'app_123' });

// Net Revenue
const netRevenue = await client.metrics.netRevenue({ appId: 'app_123' });

// Active Subscriptions
const activeSubs = await client.metrics.activeSubscriptions({ appId: 'app_123' });

// Active Installs
const activeInstalls = await client.metrics.activeInstalls({ appId: 'app_123' });

// Net Installs
const netInstalls = await client.metrics.netInstalls({ appId: 'app_123' });

// Charges
const charges = await client.metrics.charges({ appId: 'app_123' });

// Payout
const payout = await client.metrics.payout({ appId: 'app_123' });

// Usage event metrics
const usageMetrics = await client.metrics.usageEvent({
  appId: 'app_123',
  eventName: 'api_call',
  propertyKey: 'endpoint',
  aggregation: 'count', // 'count' | 'sum' | 'avg' | 'min' | 'max'
  dateRange: 'last_7_days',
});

// Usage metric by ID
const metricData = await client.metrics.usageMetric({
  appId: 'app_123',
  metricId: 'metric_123',
  dateRange: 'last_30_days',
});

// Sales metrics
const salesData = await client.metrics.sales({
  appId: 'app_123',
  dateRange: 'last_30_days',
});

// Custom metric query
const data = await client.metrics.fetch({
  metric: 'PlatformApp.activeInstalls',
  appId: 'app_123',
  dateRange: 'last_90_days',
  startDate: '2024-01-01',
  endDate: '2024-03-31',
  includes: ['includeTotal'],
  appEventsForMrr: true,
});
```

### Usage Events

Track customer usage for billing:

```typescript
// List usage events
const { usageEvents, hasNextPage } = await client.usageEvents.list({
  appId: 'app_123',
  customerId: 'cust_123',
  eventName: 'api_call',
  billingStatus: 'unbilled',
  countryCode: 'US',
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  propertiesFilters: { endpoint: '/users' },
});

// Track a single event
await client.usageEvents.create({
  eventName: 'api_call',
  customerId: 'cust_123',
  appId: 'app_123',
  timestamp: new Date().toISOString(),
  eventId: 'unique-event-id', // For deduplication
  properties: { endpoint: '/users', method: 'GET', responseTime: 150 },
  private: false,
});

// Track multiple events
await client.usageEvents.create({
  events: [
    { eventName: 'api_call', customerId: 'cust_123', appId: 'app_123' },
    { eventName: 'api_call', customerId: 'cust_456', appId: 'app_123' },
    { eventName: 'file_upload', customerId: 'cust_123', appId: 'app_123', properties: { size: 1024 } },
  ],
});
```

### Webhooks

```typescript
// List webhooks
const { webhooks } = await client.webhooks.list();

// Retrieve a webhook
const { webhook } = await client.webhooks.retrieve('webhook_123');

// Create a webhook
const { webhook } = await client.webhooks.create({
  topic: 'customer.created',
  address: 'https://your-app.com/webhooks',
});

// Update a webhook
const { webhook } = await client.webhooks.update('webhook_123', {
  address: 'https://your-app.com/webhooks/v2',
});

// Delete a webhook
await client.webhooks.del('webhook_123');
```

### Affiliates

```typescript
// List affiliates
const { affiliates, hasNextPage } = await client.affiliates.list({
  affiliateProgramId: 'program_123',
  status: 'active', // 'pending' | 'active' | 'rejected' | 'suspended'
  appId: 'app_123',
  email: 'affiliate@example.com',
});

// Retrieve an affiliate
const { affiliate } = await client.affiliates.retrieve('affiliate_123');

// Update an affiliate
const { affiliate } = await client.affiliates.update('affiliate_123', {
  status: 'active',
  commissionRate: 0.25, // 25%
});
```

### Affiliate Programs

```typescript
// List affiliate programs
const { affiliatePrograms } = await client.affiliatePrograms.list();

// Retrieve an affiliate program
const { affiliateProgram } = await client.affiliatePrograms.retrieve('program_123');

// Create an affiliate program
const { affiliateProgram } = await client.affiliatePrograms.create({
  name: 'Partner Program',
  description: 'Earn 20% commission on referrals',
  commissionType: 'percentage', // 'percentage' | 'fixed'
  commissionValue: 20,
  commissionDurationMonths: 12,
  cookieDurationDays: 30,
  minimumPayoutAmount: 5000, // $50.00
  payoutCurrency: 'USD',
  active: true,
});

// Update an affiliate program
const { affiliateProgram } = await client.affiliatePrograms.update('program_123', {
  commissionValue: 25,
});

// Delete an affiliate program
await client.affiliatePrograms.del('program_123');
```

### Affiliate Commissions

```typescript
// List commissions
const { commissions, hasNextPage } = await client.affiliateCommissions.list({
  affiliateId: 'affiliate_123',
  status: 'pending', // 'pending' | 'approved' | 'paid' | 'rejected'
});

// Retrieve a commission
const { commission } = await client.affiliateCommissions.retrieve('commission_123');
```

### Affiliate Payouts

```typescript
// List payouts
const { payouts, hasNextPage } = await client.affiliatePayouts.list({
  affiliateId: 'affiliate_123',
  status: 'completed', // 'pending' | 'processing' | 'completed' | 'failed'
});

// Retrieve a payout
const { payout } = await client.affiliatePayouts.retrieve('payout_123');
```

### Affiliate Referrals

```typescript
// List referrals
const { referrals, hasNextPage } = await client.affiliateReferrals.list({
  affiliateId: 'affiliate_123',
  status: 'converted', // 'pending' | 'converted' | 'expired'
});

// Retrieve a referral
const { referral } = await client.affiliateReferrals.retrieve('referral_123');
```

### Companies

```typescript
// List companies
const { companies, hasNextPage } = await client.companies.list({
  take: 25,
  search: 'acme',
});

// Retrieve a company
const { company } = await client.companies.retrieve('company_123');

// Create a company
const { company } = await client.companies.create({
  name: 'Acme Holdings',
  domain: 'acme.com',
});

// Update a company
const { company } = await client.companies.update('company_123', {
  name: 'Acme Holdings Inc',
});

// Delete a company
await client.companies.del('company_123');
```

### Customer Segments

```typescript
// List customer segments
const { customerSegments } = await client.customerSegments.list();

// Retrieve a segment
const { customerSegment } = await client.customerSegments.retrieve('segment_123');
```

### Tasks

Tasks support todo items as a nested sub-resource. Updating a task's status can trigger deal progression if the task is linked to a deal activity.

```typescript
// List tasks
const { tasks, hasNextPage } = await client.tasks.list({
  status: 'new', // 'new' | 'in_progress' | 'complete'
  priority: 'high', // 'low' | 'medium' | 'high'
  assigneeId: 'user_123',
  customerId: 'cust_123',
  dealId: 'deal_123',
});

// Retrieve a task
const { task } = await client.tasks.retrieve('task_123');

// Create a task with todo items
const task = await client.tasks.create({
  title: 'Follow up with customer',
  description: 'Discuss renewal options',
  priority: 'high',
  dueDate: '2024-02-15',
  assigneeId: 'user_123',
  customerId: 'cust_123',
  dealId: 'deal_123',
  dealActivityId: 'activity_123',
  tags: ['follow-up'],
  todoItems: [
    { content: 'Prepare pricing proposal', completed: false },
    { content: 'Review contract terms', completed: false },
  ],
});

// Update a task (may trigger deal progression)
const { task, dealProgressed, dealProgression } = await client.tasks.update('task_123', {
  status: 'complete',
});
if (dealProgressed) {
  console.log(`Deal "${dealProgression.dealName}" moved to stage "${dealProgression.nextStage.name}"`);
}

// Delete a task
await client.tasks.del('task_123');

// --- Todo Items ---

// List todo items for a task
const { items, total } = await client.tasks.listTodoItems('task_123');

// Retrieve a todo item
const { item } = await client.tasks.retrieveTodoItem('task_123', 'item_123');

// Create a todo item
const { item } = await client.tasks.createTodoItem('task_123', {
  content: 'Send follow-up email',
  completed: false,
  displayOrder: 3,
});

// Update a todo item
const { item } = await client.tasks.updateTodoItem('task_123', 'item_123', {
  completed: true,
});

// Delete a todo item
await client.tasks.deleteTodoItem('task_123', 'item_123');
```

### Flows (Automation)

```typescript
// List flows
const { flows } = await client.flows.list();

// Retrieve a flow
const { flow } = await client.flows.retrieve('flow_123');

// Create a flow
const { flow } = await client.flows.create({
  name: 'Onboarding Flow',
  trigger: 'customer.created',
  actions: [
    { type: 'email', template: 'welcome' },
  ],
});

// Update a flow
const { flow } = await client.flows.update('flow_123', {
  name: 'Updated Onboarding Flow',
  enabled: true,
});

// Delete a flow
await client.flows.del('flow_123');
```

### Transactions & Charges

```typescript
// List transactions
const { transactions, hasNextPage } = await client.transactions.list({
  customerId: 'cust_123',
  appId: 'app_123',
});

// Retrieve a transaction
const { transaction } = await client.transactions.retrieve('txn_123');

// List charges
const { charges, hasNextPage } = await client.charges.list({
  customerId: 'cust_123',
  appId: 'app_123',
});
```

### Users

```typescript
// List users in the organization
const { users } = await client.users.list();

// Retrieve a user
const { user } = await client.users.retrieve('user_123');
```

### Me & Organization

```typescript
// Get current user and organization
const { user, organization } = await client.me.retrieve();

// Get organization details
const { organization } = await client.organization.retrieve();
```

### Documentation

Manage documentation collections, groups, pages, repositories, and the doc tree:

```typescript
// --- Collections ---
const { collections } = await client.docs.listCollections();
const { collection } = await client.docs.retrieveCollection('collection_123');
const { collection } = await client.docs.createCollection({
  name: 'API Docs',
  slug: 'api-docs',
  description: 'API documentation',
});
const { collection } = await client.docs.updateCollection('collection_123', {
  name: 'Updated API Docs',
});
await client.docs.deleteCollection('collection_123');

// --- Groups ---
const { groups } = await client.docs.listGroups();
const { group } = await client.docs.retrieveGroup('group_123');
const { group } = await client.docs.createGroup({ name: 'Guides' });
const { group } = await client.docs.updateGroup('group_123', { name: 'Updated Guides' });
await client.docs.deleteGroup('group_123');

// --- Pages ---
const { pages } = await client.docs.listPages({
  collectionId: 'collection_123',
});
const { page } = await client.docs.retrievePage('page_123');
const { page } = await client.docs.createPage({
  title: 'Getting Started',
  content: '# Getting Started\n\nWelcome to our docs...',
  collectionId: 'collection_123',
});
const { page } = await client.docs.updatePage('page_123', {
  content: 'Updated content',
});
const { page } = await client.docs.publishPage('page_123');
const { page } = await client.docs.archivePage('page_123');
await client.docs.deletePage('page_123');

// --- Tree ---
const { tree } = await client.docs.getTree();

// --- Repositories ---
const { repositories } = await client.docs.listRepositories();
const { repository } = await client.docs.retrieveRepository('repo_123');
```

### Entities

Unified search across contacts and customers:

```typescript
// Search entities (returns contacts and customers in a single result set)
const { entities, hasNextPage } = await client.entities.search({
  search: 'acme',
  take: 25,
});

// Each entity has a _type discriminator
entities.forEach((entity) => {
  if (entity._type === 'customer') {
    console.log('Customer:', entity.name, entity.domain);
  } else if (entity._type === 'contact') {
    console.log('Contact:', entity.name, entity.email);
  }
});
```

### Meetings

Record, transcribe, and analyze meetings with AI enrichment:

```typescript
// List meetings
const { meetings, hasNextPage } = await client.meetings.list({
  dealId: 'deal_123',
  customerId: 'cust_123',
  platform: 'google_meet', // 'google_meet' | 'zoom' | 'teams'
  startTimeFrom: '2024-01-01T00:00:00Z',
  startTimeTo: '2024-12-31T23:59:59Z',
  search: 'quarterly review',
  includeArchived: false,
});

// Retrieve a meeting (includes attendees, transcript, AI insights)
const meeting = await client.meetings.retrieve('meeting_123');

// Create a meeting with attendees and transcript
const meeting = await client.meetings.create({
  meetingData: {
    title: 'Q1 Review',
    platform: 'zoom',
    startTime: '2024-01-15T14:00:00Z',
    endTime: '2024-01-15T15:00:00Z',
    duration: 3600,
    dealId: 'deal_123',
    customerId: 'cust_123',
  },
  attendees: [
    { name: 'John Doe', email: 'john@acme.com', externalId: 'A' },
    { name: 'Jane Smith', email: 'jane@company.com', externalId: 'B' },
  ],
  transcript: {
    language: 'en',
    utterances: [
      { attendeeId: 'A', text: 'Welcome to the review.', startTime: 0, endTime: 3000, sequence: 1 },
      { attendeeId: 'B', text: 'Thanks for having me.', startTime: 3500, endTime: 6000, sequence: 2 },
    ],
  },
});

// Update a meeting
const meeting = await client.meetings.update('meeting_123', {
  title: 'Q1 Business Review',
  dealId: 'deal_456',
});

// Delete a meeting
await client.meetings.del('meeting_123');

// --- Recording Upload & Transcription Workflow ---

// Step 1: Get a signed upload URL
const { uploadUrl, recordingKey, expiresIn } = await client.meetings.getUploadUrl('meeting_123', 'recording.webm');

// Step 2: Upload the file to the signed URL (use fetch/axios)
await fetch(uploadUrl, { method: 'PUT', body: recordingFile });

// Step 3: Start transcription
const meeting = await client.meetings.startTranscription('meeting_123', { recordingKey });

// Step 4: Check transcription status
const status = await client.meetings.getTranscriptionStatus('meeting_123');
console.log(status.recordingStatus); // 'pending' | 'processing' | 'ready' | 'failed'

// Get a signed recording playback URL
const { recordingUrl, expiresIn } = await client.meetings.getRecordingUrl('meeting_123');

// --- Attendee Management ---

// Update an attendee (link to a contact, etc.)
const { attendee } = await client.meetings.updateAttendee('meeting_123', 'attendee_123', {
  name: 'John Doe',
  email: 'john@acme.com',
  contactId: 'contact_123',
});

// Update by external ID instead of attendee ID
const { attendee } = await client.meetings.updateAttendee('meeting_123', 'A', {
  contactId: 'contact_123',
}, { useExternalId: true });

// --- AI Task Suggestions ---

// Accept an AI-generated task suggestion (with optional overrides)
const { task, suggestion } = await client.meetings.acceptTaskSuggestion('meeting_123', 'suggestion_123', {
  title: 'Custom task title',
  assigneeId: 'user_123',
  priority: 'high',
});

// Dismiss a task suggestion
await client.meetings.dismissTaskSuggestion('meeting_123', 'suggestion_123');
```

### AI Agent Runs

Execute AI agents and poll for results:

```typescript
// Create an agent run (returns immediately with 202 Accepted)
const { run } = await client.aiAgentRuns.create('agent_123', {
  input: { customerId: 'cust_123' },
  context: 'Analyze this customer for churn risk',
  variables: { tone: 'professional' },
});
console.log(run.status); // 'pending'

// Check the run status
const { run } = await client.aiAgentRuns.retrieve('agent_123', run.id);
console.log(run.status); // 'pending' | 'running' | 'completed' | 'error'

// Convenience: create and wait for completion (polls automatically)
const completedRun = await client.aiAgentRuns.createAndWait('agent_123', {
  input: { query: 'Summarize recent activity' },
}, {
  timeout: 60000,    // Max wait time in ms (default: 30000)
  pollInterval: 2000, // Polling interval in ms (default: 1000)
});
console.log(completedRun.response);
console.log(completedRun.structuredResponse);
console.log(completedRun.tokenUsage);
```

### Custom Data

Set and retrieve custom data fields on resources:

```typescript
// Supported resource types: 'ticket' | 'customer' | 'contact' | 'deal' | 'conversation'

// Set a custom data value
await client.customData.set({
  resourceId: 'cust_123',
  resourceType: 'customer',
  key: 'industry',
  value: 'Technology',
});

// Get a custom data value
const data = await client.customData.getValue({
  resourceId: 'cust_123',
  resourceType: 'customer',
  key: 'industry',
});
console.log(data.value); // 'Technology'

// Delete a custom data value
await client.customData.del({
  resourceId: 'cust_123',
  resourceType: 'customer',
  key: 'industry',
});
```

### Lists

Organize customers and contacts into lists:

```typescript
// List all lists
const { lists, hasNextPage } = await client.lists.list({
  all: true, // Include all lists without pagination
});

// Retrieve a list with its entities
const { list, entities, hasNextPage } = await client.lists.retrieve('list_123', {
  page: 0,
  take: 25,
  type: 'customer', // Filter by entity type: 'customer' | 'contact'
  search: 'acme',
  sort: 'name',
  sortDirection: 'asc',
});

// Create a list
const { list } = await client.lists.create({
  name: 'Enterprise Accounts',
  description: 'Top-tier enterprise customers',
});

// Update a list
const { list } = await client.lists.update('list_123', {
  name: 'Updated Name',
});

// Delete a list
await client.lists.del('list_123');

// Add entities to a list
const { added, skipped } = await client.lists.addEntities('list_123', {
  customerIds: ['cust_123', 'cust_456'],
  contactIds: ['contact_123'],
});

// Remove entities from a list
const { removed } = await client.lists.removeEntities('list_123', {
  customerIds: ['cust_456'],
});
```

### Timeline Comments

Add comments to customer and contact timelines:

```typescript
// List timeline comments
const { timelineComments, hasNextPage } = await client.timelineComments.list({
  customerId: 'cust_123',
  // or contactId: 'contact_123',
});

// Retrieve a comment
const { timelineComment } = await client.timelineComments.retrieve('comment_123');

// Create a comment with attachments and tagged users
const { timelineComment } = await client.timelineComments.create({
  customerId: 'cust_123',
  body: 'Discussed renewal terms with @John',
  attachments: [
    { filename: 'notes.pdf', url: 'https://storage.example.com/notes.pdf' },
  ],
  taggedUsers: [
    { userId: 'user_123' },
  ],
});

// Update a comment
const { timelineComment } = await client.timelineComments.update('comment_123', {
  body: 'Updated comment text',
});

// Delete a comment
await client.timelineComments.del('comment_123');
```

### Journal Entries

Track journal entries for apps:

```typescript
// List journal entries
const { journalEntries, hasNextPage } = await client.journalEntries.list({
  appId: 'app_123',
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  tags: ['release', 'update'],
});

// Retrieve a journal entry
const { journalEntry } = await client.journalEntries.retrieve('entry_123');

// Create a journal entry
const { journalEntry } = await client.journalEntries.create({
  date: '2024-01-15',
  title: 'v2.0 Release',
  description: 'Major release with new billing features',
  appId: 'app_123',
  tags: ['release'],
  url: 'https://changelog.example.com/v2',
  emoji: '🚀',
});

// Update a journal entry
const { journalEntry } = await client.journalEntries.update('entry_123', {
  description: 'Updated description',
});

// Delete a journal entry
await client.journalEntries.del('entry_123');
```

### Email Unsubscribe Groups

Manage email unsubscribe groups and their members:

```typescript
// List unsubscribe groups
const { unsubscribeGroups } = await client.emailUnsubscribeGroups.list();

// Retrieve an unsubscribe group
const { unsubscribeGroup } = await client.emailUnsubscribeGroups.retrieve('group_123');

// List members of a group
const { members, hasNextPage } = await client.emailUnsubscribeGroups.listMembers('group_123');

// Add members to a group
const result = await client.emailUnsubscribeGroups.addMembers('group_123', {
  emails: ['user1@example.com', 'user2@example.com'],
});

// Remove multiple members
await client.emailUnsubscribeGroups.removeMembers('group_123', {
  emails: ['user1@example.com'],
});

// Remove a single member by ID
await client.emailUnsubscribeGroups.removeMember('group_123', 'member_123');
```

### Flow Extensions

Extend automation flows with custom actions:

```typescript
// List flow extension actions
const { actions, hasNextPage } = await client.flowExtensions.listActions({
  enabled: true,
});

// Retrieve an action
const { action } = await client.flowExtensions.retrieveAction('action_123');

// Create a custom action
const { action } = await client.flowExtensions.createAction({
  name: 'Send Slack Notification',
  description: 'Posts a message to a Slack channel',
  key: 'send_slack_notification',
  schema: {
    channel: { type: 'string', required: true },
    message: { type: 'string', required: true },
  },
  callbackUrl: 'https://your-app.com/flow-actions/slack',
  enabled: true,
});

// Update an action
const { action } = await client.flowExtensions.updateAction('action_123', {
  description: 'Updated description',
  enabled: false,
});

// Delete an action
await client.flowExtensions.deleteAction('action_123');

// Update a flow action run status (called from your callback handler)
const { run } = await client.flowExtensions.updateActionRun('run_123', {
  status: 'completed', // 'pending' | 'running' | 'completed' | 'failed'
  output: { messageId: 'slack_msg_123' },
});
```

## Pagination

All list methods return pagination metadata:

```typescript
const { customers, hasNextPage, hasPreviousPage, cursor, total } =
  await client.customers.list({ take: 25 });

// Cursor-based pagination (recommended)
if (hasNextPage) {
  const nextPage = await client.customers.list({ take: 25, cursor });
}

// Offset-based pagination
const page2 = await client.customers.list({ take: 25, page: 1 });
```

## Error Handling

```typescript
import {
  MantleAPIError,
  MantleAuthenticationError,
  MantlePermissionError,
  MantleNotFoundError,
  MantleValidationError,
  MantleRateLimitError,
} from '@heymantle/core-api-client';

try {
  await client.customers.retrieve('invalid_id');
} catch (error) {
  if (error instanceof MantleAuthenticationError) {
    // Handle authentication error (401)
    console.log('Please re-authenticate');
  } else if (error instanceof MantlePermissionError) {
    // Handle permission error (403)
    console.log('Access denied');
  } else if (error instanceof MantleNotFoundError) {
    // Handle not found error (404)
    console.log('Resource not found');
  } else if (error instanceof MantleValidationError) {
    // Handle validation error (422)
    console.log('Validation failed:', error.details);
  } else if (error instanceof MantleRateLimitError) {
    // Handle rate limit (429)
    console.log(`Rate limited. Retry after: ${error.retryAfter}s`);
  } else if (error instanceof MantleAPIError) {
    // Handle other API errors
    console.log(`Error ${error.statusCode}: ${error.message}`);
  }
}
```

## TypeScript Support

All types are exported for use in your application:

```typescript
import type {
  // Client config
  MantleCoreClientConfig,
  PaginatedResponse,
  ListParams,
  DeleteResponse,

  // Customers
  Customer,
  CustomerListParams,
  CustomerListResponse,
  CustomerCreateParams,
  CustomerUpdateParams,
  AccountOwner,
  CustomField,

  // Contacts
  Contact,
  ContactCreateParams,
  ContactCreateResponse,
  SocialProfile,
  SocialProfileType,

  // Deals
  Deal,
  DealListParams,
  DealListResponse,
  DealCreateParams,
  DealUpdateParams,
  DealCustomerInput,
  DealContactInput,
  DealFlow,
  DealStage,
  DealActivity,
  DealEvent,
  DealEventCreateParams,

  // Subscriptions
  Subscription,

  // Tickets
  Ticket,
  TicketMessage,
  TicketCreateParams,
  Channel,

  // Apps
  App,
  Plan,
  PlanCreateParams,
  Feature,
  UsageMetric,
  Review,
  AppEvent,

  // Affiliates
  Affiliate,
  AffiliateProgram,
  AffiliateCommission,
  AffiliatePayout,
  AffiliateReferral,

  // Meetings
  Meeting,
  MeetingAttendee,
  MeetingTranscript,
  MeetingUtterance,
  MeetingCreateParams,
  MeetingUpdateParams,
  MeetingUploadUrlResponse,
  MeetingTranscriptionStatusResponse,
  MeetingKeyPoint,
  MeetingDecision,
  MeetingOpenQuestion,
  MeetingTopic,
  SentimentDataPoint,
  MeetingDealInsights,
  MeetingTaskSuggestion,
  AcceptTaskSuggestionParams,
  AcceptTaskSuggestionResponse,

  // AI Agents
  AgentRun,
  AgentRunStatus,
  AgentRunTokenUsage,
  AgentRunCreateParams,

  // Tasks
  Task,
  TaskStatus,
  TaskPriority,
  TaskCreateParams,
  TaskUpdateResponse,
  DealProgression,
  TodoItem,
  TodoItemCreateParams,
  TodoItemUpdateParams,

  // Lists
  List,
  ListEntity,
  ListCreateParams,
  ListAddEntitiesParams,
  ListRemoveEntitiesParams,

  // Timeline Comments
  TimelineComment,
  TimelineCommentCreateParams,
  TimelineCommentAttachmentInput,
  TimelineCommentTaggedUserInput,

  // Journal Entries
  JournalEntry,
  JournalEntryCreateParams,

  // Documentation
  DocCollection,
  DocGroup,
  DocPage,
  DocPageStatus,
  DocTreeNode,
  DocTreeResponse,
  DocRepository,

  // Entities (unified search)
  Entity,
  EntityType,
  ContactEntity,
  CustomerEntity,
  EntitiesSearchParams,

  // Custom Data
  CustomDataResourceType,
  CustomDataSetParams,
  CustomDataResponse,

  // Email
  EmailUnsubscribeGroup,
  EmailUnsubscribeGroupMember,

  // Flow Extensions
  FlowExtensionAction,
  FlowActionRun,
  FlowActionRunStatus,

  // Flows
  Flow,
  FlowStatus,

  // Metrics
  DateRangeType,
  MetricType,
  MetricsResponse,
  SalesMetrics,
  SalesMetricsResponse,

  // Organizations & Users
  Organization,
  User,
  Agent,

  // Companies
  Company,

  // Customer Segments
  CustomerSegment,

  // Webhooks
  Webhook,
  WebhookTopic,

  // Usage Events
  UsageEvent,
  UsageEventCreateParams,

  // Transactions & Charges
  Transaction,
  Charge,

  // Middleware
  Middleware,
  MiddlewareContext,
  MiddlewareOptions,
} from '@heymantle/core-api-client';
```

## Configuration Options

```typescript
import { MantleCoreClient, type Middleware } from '@heymantle/core-api-client';

const client = new MantleCoreClient({
  // Required: one of apiKey or accessToken
  apiKey: 'your-api-key',
  // OR
  accessToken: 'your-oauth-token',

  // Optional: custom base URL (defaults to https://api.heymantle.com/v1)
  baseURL: 'https://api.heymantle.com/v1',

  // Optional: request timeout in ms (defaults to 30000)
  timeout: 30000,

  // Optional: middleware to register on instantiation
  middleware: [
    loggingMiddleware,
    [authRefreshMiddleware, { name: 'auth', priority: 1 }],
  ],
});

// Update authentication at runtime
client.updateAuth({ accessToken: 'new-token' });

// Add middleware at runtime
client.use(newMiddleware, { name: 'custom', priority: 50 });

// Remove middleware by name
client.removeMiddleware('custom');
```

## License

MIT
