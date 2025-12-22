# CLAUDE.md - @heymantle/core-api-client

## Project Overview

TypeScript SDK for the Mantle Core API. Provides a resource-based architecture similar to the Stripe SDK, with full TypeScript support, middleware capabilities, and comprehensive error handling.

## Architecture

```
src/
├── client.ts          # Main MantleCoreClient class
├── index.ts           # Public exports
├── resources/         # 30+ resource classes
│   ├── base.ts        # BaseResource with HTTP methods
│   ├── customers.ts   # CustomersResource
│   ├── deals.ts       # DealsResource
│   └── ...
├── types/             # TypeScript interfaces
│   ├── common.ts      # Shared types (ListParams, PaginatedResponse)
│   ├── customers.ts   # Customer types
│   └── ...
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

## Important Resources

### Complex Resources
- **Deals** - Has inline customer/contact creation via `customer` and `contacts` objects
- **Apps** - Parent resource with nested plans, features, reviews, usage metrics
- **Tickets** - Has nested messages resource
- **Customers** - Has custom fields, account owners, timeline

### Newly Added (may need docs)
- `dealFlows` - Deal pipeline management
- `dealActivities` - Deal activity tracking
- `channels` - CX channels (email/chat)
- `agents` - Support agents
- `entities` - Generic entity resource

## Types to Know

### Enums/Literals
- Ticket status: `'open' | 'pending' | 'resolved' | 'closed'`
- Ticket priority: `'low' | 'medium' | 'high' | 'urgent'`
- Plan interval: `'month' | 'year' | 'one_time'`
- Feature type: `'boolean' | 'limit' | 'unlimited'`
- Social profile: `'linkedin' | 'x' | 'facebook' | 'instagram' | 'website'`
- Channel type: `'email' | 'chat'`
- Custom field type: `'string' | 'number' | 'boolean' | 'date' | 'select'`

### Date Ranges (for metrics)
`'last_30_minutes' | 'last_60_minutes' | 'last_12_hours' | 'last_24_hours' | 'last_7_days' | 'last_14_days' | 'last_30_days' | 'last_90_days' | 'last_12_months' | 'last_24_months' | 'today' | 'yesterday' | 'last_month' | 'month_to_date' | 'quarter_to_date' | 'year_to_date' | 'all_time' | 'custom'`

## Error Classes

```typescript
MantleAPIError           // Base error (includes statusCode)
MantleAuthenticationError // 401
MantlePermissionError    // 403
MantleValidationError    // 422 (includes details)
MantleRateLimitError     // 429 (includes retryAfter)
```

## Commands

```bash
npm run build        # Build TypeScript
npm run typecheck    # Type checking only
npm run lint         # ESLint
npm run format       # Prettier
```

## Code Style

- TypeScript strict mode
- Async/await for all API calls
- JSDoc comments on public methods
- Export types separately from implementations
- Use `_delete` internally, expose as `del` on resources
