# CLAUDE.md - @heymantle/core-api-client

## Project Overview

TypeScript SDK for the Mantle Core API. Provides a resource-based architecture similar to the Stripe SDK, with full TypeScript support, middleware capabilities, and comprehensive error handling.

## Architecture

```
src/
├── client.ts          # Main MantleCoreClient class
├── index.ts           # Public exports
├── resources/         # 37 resource classes
│   ├── base.ts        # BaseResource with HTTP methods
│   ├── customers.ts   # CustomersResource
│   ├── contacts.ts    # ContactsResource
│   ├── deals.ts       # DealsResource
│   ├── deal-flows.ts  # DealFlowsResource
│   ├── deal-activities.ts # DealActivitiesResource
│   ├── subscriptions.ts   # SubscriptionsResource
│   ├── apps.ts        # AppsResource (plans, features, reviews, usage metrics, events)
│   ├── tickets.ts     # TicketsResource (with messages)
│   ├── channels.ts    # ChannelsResource
│   ├── agents.ts      # AgentsResource
│   ├── meetings.ts    # MeetingsResource (recording, transcription, AI enrichment)
│   ├── ai-agent-runs.ts  # AiAgentRunsResource
│   ├── tasks.ts       # TasksResource (with todo items)
│   ├── docs.ts        # DocsResource (collections, groups, pages, repositories, tree)
│   ├── flows.ts       # FlowsResource
│   ├── flow-extensions.ts # FlowExtensionsResource
│   ├── lists.ts       # ListsResource
│   ├── entities.ts    # EntitiesResource (unified search)
│   ├── custom-data.ts # CustomDataResource
│   ├── timelineComments.ts # TimelineCommentsResource
│   ├── journal-entries.ts  # JournalEntriesResource
│   ├── email-unsubscribe-groups.ts # EmailUnsubscribeGroupsResource
│   ├── metrics.ts     # MetricsResource
│   ├── usage-events.ts    # UsageEventsResource
│   ├── webhooks.ts    # WebhooksResource
│   ├── affiliates.ts  # AffiliatesResource
│   ├── affiliate-programs.ts  # AffiliateProgramsResource
│   ├── affiliate-commissions.ts # AffiliateCommissionsResource
│   ├── affiliate-payouts.ts    # AffiliatePayoutsResource
│   ├── affiliate-referrals.ts  # AffiliateReferralsResource
│   ├── companies.ts   # CompaniesResource
│   ├── customer-segments.ts   # CustomerSegmentsResource
│   ├── transactions.ts    # TransactionsResource
│   ├── charges.ts     # ChargesResource
│   ├── users.ts       # UsersResource
│   ├── me.ts          # MeResource
│   └── organization.ts   # OrganizationResource
├── types/             # TypeScript interfaces
│   ├── common.ts      # Shared types (ListParams, PaginatedResponse)
│   ├── customers.ts   # Customer types
│   └── ...            # 31 type files total
├── middleware/        # Koa-style middleware system
│   ├── types.ts       # Middleware interfaces
│   ├── manager.ts     # MiddlewareManager class
│   ├── auth-refresh.ts # Token refresh middleware
│   └── rate-limit.ts  # Rate limit retry/throttle middleware
└── utils/
    ├── errors.ts      # Custom error classes
    └── sanitize.ts    # Request sanitization
```

## Key Patterns

### Resource-Based API
```typescript
// All resources follow this pattern:
client.customers.list(params?)     // GET with pagination
client.customers.retrieve(id)      // GET single
client.customers.create(data)      // POST
client.customers.update(id, data)  // PUT
client.customers.del(id)           // DELETE (named 'del' to avoid reserved word)
```

### Paginated Responses
```typescript
interface PaginatedResponse {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  total?: number;
  cursor?: string;
}
```

### List Parameters
```typescript
interface ListParams {
  page?: number;           // Offset pagination
  take?: number;           // Items per page
  cursor?: string;         // Cursor pagination
  sort?: string;
  sortDirection?: 'asc' | 'desc';
  search?: string;
  minUpdatedAt?: string;
  maxUpdatedAt?: string;
}
```

### Middleware (Koa-style)
```typescript
client.use(async (ctx, next) => {
  // Before request
  await next();
  // After response (ctx.response available)
});
```

### Rate Limit Handling
The API enforces rate limits: 1,000 requests/minute and 5,000 requests/5 minutes. Use the built-in middleware:

```typescript
import { createRateLimitMiddleware } from '@heymantle/core-api-client';

// Auto-retry on 429 responses
client.use(createRateLimitMiddleware({ enableRetry: true }));

// Preemptive throttling to avoid hitting limits
client.use(createRateLimitMiddleware({ enableThrottle: true }));

// Both features with custom options
client.use(createRateLimitMiddleware({
  enableRetry: true,
  enableThrottle: true,
  maxRetries: 5,
  requestsPerMinute: 500,
  throttleThreshold: 0.8,
}));
```

## Resources by Category

### CRM & Sales
- **Customers** - Full CRUD, custom fields, account owners, timeline, tags
- **Contacts** - CRUD, tags, social profiles, upsert by email
- **Companies** - CRUD for grouping customers
- **Customer Segments** - List and retrieve only (read-only)
- **Deals** - CRUD, inline customer/contact creation, timeline (`timeline()`), events (`listEvents()`, `createEvent()`)
- **Deal Flows** - CRUD for deal pipelines and stages
- **Deal Activities** - CRUD for activities within deal flows
- **Tasks** - CRUD with nested todo items sub-resource, deal progression on status change
- **Timeline Comments** - CRUD for comments on customer/contact timelines, with attachments and tagged users
- **Lists** - CRUD for organizing customers/contacts, with addEntities/removeEntities

### Meetings & AI
- **Meetings** - CRUD, recording upload (getUploadUrl), transcription (startTranscription, getTranscriptionStatus), recording playback (getRecordingUrl), attendee management, AI enrichment (sentiment, engagement, deal insights, key points, decisions, topics), task suggestions (acceptTaskSuggestion, dismissTaskSuggestion)
- **AI Agent Runs** - create, retrieve, createAndWait (convenience polling helper)

### Apps & Billing
- **Apps** - Parent resource with nested: plans, features, reviews, usage metrics, app events, event names, property keys
- **Subscriptions** - List and retrieve
- **Transactions** - List and retrieve
- **Charges** - List only
- **Usage Events** - List and create (single or batch)
- **Metrics** - mrr, arr, arpu, ltv, predictedLtv, revenueChurn, logoChurn, revenueRetention, netRevenueRetention, netRevenue, activeSubscriptions, activeInstalls, netInstalls, charges, payout, usageEvent, usageMetric, sales, fetch (custom)

### Support
- **Tickets** - CRUD with nested messages resource (listMessages, retrieveMessage, createMessage, updateMessage, deleteMessage)
- **Channels** - List and create (email/chat)
- **Agents** - list, retrieve, create, findOrCreate

### Affiliates
- **Affiliates** - List, retrieve, update
- **Affiliate Programs** - Full CRUD
- **Affiliate Commissions** - List and retrieve only
- **Affiliate Payouts** - List and retrieve only
- **Affiliate Referrals** - List and retrieve

### Documentation
- **Docs** - Collections (CRUD), groups (CRUD), pages (CRUD + publishPage, archivePage), repositories (list, retrieve), tree (getTree)

### Automation & Extensions
- **Flows** - CRUD for automation flows
- **Flow Extensions** - Custom actions (listActions, retrieveAction, createAction, updateAction, deleteAction), action run updates (updateActionRun)

### Data & Search
- **Entities** - Unified search across contacts and customers (`search()`)
- **Custom Data** - set, getValue, del for arbitrary key-value data on tickets/customers/contacts/deals/conversations
- **Journal Entries** - CRUD for app journal/changelog entries

### Email
- **Email Unsubscribe Groups** - list, retrieve, listMembers, addMembers, removeMembers, removeMember

### Platform
- **Webhooks** - Full CRUD
- **Users** - List and retrieve
- **Me** - Retrieve current user and organization
- **Organization** - Retrieve organization details

## Types to Know

### Enums/Literals
- Ticket status: `'open' | 'pending' | 'resolved' | 'closed'`
- Ticket priority: `'low' | 'medium' | 'high' | 'urgent'`
- Plan interval: `'month' | 'year' | 'one_time'`
- Feature type: `'boolean' | 'limit' | 'unlimited'`
- Social profile: `'linkedin' | 'x' | 'facebook' | 'instagram' | 'website'`
- Channel type: `'email' | 'chat'`
- Custom field type: `'string' | 'number' | 'boolean' | 'date' | 'select'`
- Task status: `'new' | 'in_progress' | 'complete'`
- Task priority: `'low' | 'medium' | 'high'`
- Agent run status: `'pending' | 'running' | 'completed' | 'error'`
- Flow action run status: `'pending' | 'running' | 'completed' | 'failed'`
- Doc page status: `'draft' | 'published' | 'archived'`
- Custom data resource type: `'ticket' | 'customer' | 'contact' | 'deal' | 'conversation'`
- Recording status: `'pending' | 'processing' | 'ready' | 'failed'`
- Entity type: `'contact' | 'customer'`

### Date Ranges (for metrics)
`'last_30_minutes' | 'last_60_minutes' | 'last_12_hours' | 'last_24_hours' | 'last_7_days' | 'last_14_days' | 'last_30_days' | 'last_90_days' | 'last_12_months' | 'last_24_months' | 'today' | 'yesterday' | 'last_month' | 'month_to_date' | 'quarter_to_date' | 'year_to_date' | 'all_time' | 'custom'`

## Error Classes

```typescript
MantleAPIError           // Base error (includes statusCode)
MantleAuthenticationError // 401
MantlePermissionError    // 403
MantleNotFoundError      // 404 (includes resource and id)
MantleValidationError    // 422 (includes details)
MantleRateLimitError     // 429 (includes retryAfter)
```

## Commands

```bash
npm run build           # Build TypeScript (tsup: CJS + ESM + DTS)
npm run typecheck       # Type checking only
npm run test            # Run tests (Vitest)
npm run test:watch      # Run tests in watch mode
npm run test:ui         # Run tests with Vitest UI
npm run test:coverage   # Run tests with coverage (v8)
```

## Testing

- **Framework:** Vitest ^1.2.0
- **Coverage:** @vitest/coverage-v8
- **Test location:** `tests/`
- **UI:** @vitest/ui for browser-based test viewer

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`):
- Triggers on push/PR to `main`
- Node.js matrix: 18.x, 20.x
- Steps: install (`npm ci`) -> typecheck -> test -> build

## Build Configuration

- **Build tool:** tsup (CJS + ESM + DTS output)
- **Node engine:** >=18.0.0
- **Dual exports:** `import` (ESM) and `require` (CJS) with TypeScript declarations
- **Entry point:** `src/index.ts`

## Code Style

- TypeScript strict mode
- Async/await for all API calls
- JSDoc comments on public methods
- Export types separately from implementations
- Use `_delete` internally, expose as `del` on resources
- Vitest for testing
