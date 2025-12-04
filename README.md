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

## Resources

### Customers

```typescript
// List customers with filters
const { customers } = await client.customers.list({
  take: 25,
  search: 'acme',
  appIds: ['app_123'],
});

// Create a customer
const { customer } = await client.customers.create({
  name: 'Acme Inc',
  email: 'contact@acme.com',
  tags: ['enterprise'],
});

// Update a customer
const { customer } = await client.customers.update('cust_123', {
  name: 'Acme Corporation',
});

// Add/remove tags
await client.customers.addTags('cust_123', ['premium']);
await client.customers.removeTags('cust_123', ['trial']);

// Get customer timeline
const { events } = await client.customers.getTimeline('cust_123');
```

### Contacts

```typescript
const { contacts } = await client.contacts.list();
const { contact } = await client.contacts.create({
  name: 'John Doe',
  email: 'john@example.com',
});
```

### Subscriptions

```typescript
const { subscriptions } = await client.subscriptions.list({
  appId: 'app_123',
  active: true,
});
const { subscription } = await client.subscriptions.retrieve('sub_123');
```

### Apps & Plans

```typescript
// List apps
const { apps } = await client.apps.list();

// List plans for an app
const { plans } = await client.apps.listPlans('app_123');

// Create a plan
const { plan } = await client.apps.createPlan('app_123', {
  name: 'Pro Plan',
  amount: 2900,
  currencyCode: 'USD',
  interval: 'month',
});

// Manage features
const { features } = await client.apps.listFeatures('app_123');
const { feature } = await client.apps.createFeature('app_123', {
  name: 'API Access',
  type: 'boolean',
});
```

### Deals

```typescript
const { deals } = await client.deals.list({
  customerId: 'cust_123',
  stage: 'negotiation',
});

const { deal } = await client.deals.create({
  name: 'Enterprise Deal',
  amount: 50000,
  customerId: 'cust_123',
});
```

### Tickets

```typescript
const { tickets } = await client.tickets.list({
  status: 'open',
  priority: 'high',
});

const { ticket } = await client.tickets.create({
  subject: 'Need help with integration',
  customerId: 'cust_123',
});

// Add a message
const { message } = await client.tickets.createMessage('ticket_123', {
  body: 'Here is the solution...',
  from: 'agent',
});
```

### Metrics

```typescript
// Get MRR
const mrr = await client.metrics.mrr({
  appId: 'app_123',
  dateRange: 'last_30_days',
});

// Get ARR
const arr = await client.metrics.arr({ appId: 'app_123' });

// Other metrics
const arpu = await client.metrics.arpu({ appId: 'app_123' });
const churn = await client.metrics.revenueChurn({ appId: 'app_123' });
const ltv = await client.metrics.ltv({ appId: 'app_123' });
const nrr = await client.metrics.netRevenueRetention({ appId: 'app_123' });

// Custom metric query
const data = await client.metrics.fetch({
  metric: 'PlatformApp.activeInstalls',
  appId: 'app_123',
  dateRange: 'last_90_days',
});
```

### Usage Events

```typescript
// Track a single event
await client.usageEvents.create({
  eventName: 'api_call',
  customerId: 'cust_123',
  appId: 'app_123',
  properties: { endpoint: '/users', method: 'GET' },
});

// Track multiple events
await client.usageEvents.create({
  events: [
    { eventName: 'api_call', customerId: 'cust_123', appId: 'app_123' },
    { eventName: 'api_call', customerId: 'cust_456', appId: 'app_123' },
  ],
});
```

### Webhooks

```typescript
const { webhooks } = await client.webhooks.list();

const { webhook } = await client.webhooks.create({
  topic: 'customer.created',
  address: 'https://your-app.com/webhooks',
});
```

### Affiliates

```typescript
const { affiliates } = await client.affiliates.list({
  status: 'active',
});

const { affiliatePrograms } = await client.affiliatePrograms.list();
const { commissions } = await client.affiliateCommissions.list();
const { payouts } = await client.affiliatePayouts.list();
const { referrals } = await client.affiliateReferrals.list();
```

### Other Resources

```typescript
// Current user & organization
const { user, organization } = await client.me.retrieve();
const { organization } = await client.organization.retrieve();

// Users
const { users } = await client.users.list();

// Companies
const { companies } = await client.companies.list();

// Customer segments
const { customerSegments } = await client.customerSegments.list();

// Tasks
const { tasks } = await client.tasks.list({ status: 'pending' });

// Flows (automation)
const { flows } = await client.flows.list();

// Transactions & Charges
const { transactions } = await client.transactions.list();
const { charges } = await client.charges.list();

// Documentation
const { collections } = await client.docs.listCollections();
const { pages } = await client.docs.listPages();
```

## Pagination

All list methods return pagination metadata:

```typescript
const { customers, hasNextPage, hasPreviousPage, cursor, total } =
  await client.customers.list({ take: 25 });

// Fetch next page
if (hasNextPage) {
  const nextPage = await client.customers.list({ take: 25, cursor });
}
```

## Error Handling

```typescript
import {
  MantleAPIError,
  MantleAuthenticationError,
  MantlePermissionError,
  MantleValidationError,
  MantleRateLimitError,
} from '@heymantle/core-api-client';

try {
  await client.customers.retrieve('invalid_id');
} catch (error) {
  if (error instanceof MantleAuthenticationError) {
    // Handle authentication error (401)
  } else if (error instanceof MantlePermissionError) {
    // Handle permission error (403)
  } else if (error instanceof MantleValidationError) {
    // Handle validation error (422)
    console.log(error.details);
  } else if (error instanceof MantleRateLimitError) {
    // Handle rate limit (429)
    console.log(`Retry after: ${error.retryAfter}s`);
  } else if (error instanceof MantleAPIError) {
    // Handle other API errors
    console.log(error.statusCode, error.message);
  }
}
```

## TypeScript Support

All types are exported for use in your application:

```typescript
import type {
  Customer,
  CustomerCreateParams,
  Deal,
  Subscription,
  MetricsResponse,
  // ... and many more
} from '@heymantle/core-api-client';
```

## Configuration Options

```typescript
const client = new MantleCoreClient({
  // Required: one of apiKey or accessToken
  apiKey: 'your-api-key',

  // Optional: custom base URL (defaults to https://api.heymantle.com/v1)
  baseURL: 'https://api.heymantle.com/v1',

  // Optional: request timeout in ms (defaults to 30000)
  timeout: 30000,
});
```

## License

MIT
