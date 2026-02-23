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

For full documentation on all available resources and their parameters, see the [Mantle Core API Reference](https://coreapi.heymantle.dev/reference).

### Customers

```typescript
// List customers
const { customers, hasNextPage, total } = await client.customers.list({
  take: 25,
  search: 'acme',
  sort: 'createdAt',
  sortDirection: 'desc',
});

// Cursor-based pagination
if (hasNextPage) {
  const nextPage = await client.customers.list({ take: 25, cursor });
}

// Get a customer
const { customer } = await client.customers.retrieve('cust_123');

// Update a customer
const { customer } = await client.customers.update('cust_123', {
  name: 'Acme Corporation',
  tags: ['enterprise', 'vip'],
});

// Delete a customer
await client.customers.del('cust_123');
```

## Configuration Options

```typescript
import { MantleCoreClient } from '@heymantle/core-api-client';

const client = new MantleCoreClient({
  // Required: one of apiKey or accessToken
  apiKey: 'your-api-key',

  // Optional: custom base URL (defaults to https://api.heymantle.com/v1)
  baseURL: 'https://api.heymantle.com/v1',

  // Optional: request timeout in ms (defaults to 30000)
  timeout: 30000,

  // Optional: override the fetch implementation
  fetchFn: customFetch,
});

// Update authentication at runtime
client.updateAuth({ accessToken: 'new-token' });
```

### Custom fetch — JWT sessions with `@heymantle/app-bridge-react`

If you're building a Mantle app and want API calls to be authenticated via JWT session rather than an API key, you can pass the `authenticatedFetch` function from [`@heymantle/app-bridge-react`](https://www.npmjs.com/package/@heymantle/app-bridge-react) as the `fetchFn` override:

```typescript
import { MantleCoreClient } from '@heymantle/core-api-client';
import { useAuthenticatedFetch } from '@heymantle/app-bridge-react';

function useClient() {
  const authenticatedFetch = useAuthenticatedFetch();

  return new MantleCoreClient({
    fetchFn: authenticatedFetch,
  });
}
```

This ensures every request made by the SDK is routed through the app bridge's authenticated fetch, automatically attaching the session token.

## Middleware

The client supports Koa-style middleware for intercepting requests and responses. Middleware can be used for logging, authentication refresh, retry logic, and more.

### Creating Custom Middleware

```typescript
import { MantleCoreClient, type Middleware } from '@heymantle/core-api-client';

const loggingMiddleware: Middleware = async (ctx, next) => {
  const start = Date.now();
  console.log(`[Request] ${ctx.request.method} ${ctx.request.url}`);

  await next();

  const duration = Date.now() - start;
  console.log(`[Response] ${ctx.response?.status} (${duration}ms)`);
};

const client = new MantleCoreClient({ apiKey: 'your-api-key' });
client.use(loggingMiddleware, { name: 'logging', priority: 10 });
```

### Auth Refresh Middleware

Automatically refresh expired access tokens:

```typescript
import { MantleCoreClient, createAuthRefreshMiddleware } from '@heymantle/core-api-client';

const client = new MantleCoreClient({ accessToken: 'initial-token' });

client.use(
  createAuthRefreshMiddleware({
    refreshToken: async () => {
      const response = await fetch('/api/refresh', { method: 'POST' });
      const data = await response.json();
      return data.accessToken;
    },
    onRefreshSuccess: (newToken) => {
      localStorage.setItem('accessToken', newToken);
    },
    onRefreshFailed: (error) => {
      window.location.href = '/login';
    },
  }),
  { name: 'auth-refresh' }
);
```

### Rate Limit Middleware

The API enforces rate limits: 1,000 requests/minute and 5,000 requests/5 minutes. Use the built-in middleware:

```typescript
import { createRateLimitMiddleware } from '@heymantle/core-api-client';

// Auto-retry on 429 responses
client.use(createRateLimitMiddleware({ enableRetry: true }));

// Preemptive throttling to avoid hitting limits
client.use(createRateLimitMiddleware({ enableThrottle: true }));
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
    console.log('Please re-authenticate');
  } else if (error instanceof MantlePermissionError) {
    console.log('Access denied');
  } else if (error instanceof MantleNotFoundError) {
    console.log('Resource not found');
  } else if (error instanceof MantleValidationError) {
    console.log('Validation failed:', error.details);
  } else if (error instanceof MantleRateLimitError) {
    console.log(`Rate limited. Retry after: ${error.retryAfter}s`);
  } else if (error instanceof MantleAPIError) {
    console.log(`Error ${error.statusCode}: ${error.message}`);
  }
}
```

## License

MIT
