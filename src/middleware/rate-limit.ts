import type { Middleware } from 'openapi-fetch';

/**
 * Options for the rate limit middleware
 */
export interface RateLimitOptions {
  /** Enable automatic retry on 429 responses (default: false) */
  enableRetry?: boolean;
  /** Enable preemptive throttling to avoid hitting rate limits (default: false) */
  enableThrottle?: boolean;
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;
  /** Base delay in milliseconds for retries (default: 1000) */
  baseDelay?: number;
  /** Use exponential backoff for retries (default: true) */
  exponentialBackoff?: boolean;
  /** Add random jitter to retry delays (default: true) */
  jitter?: boolean;
  /** Maximum requests per minute (default: 1000) */
  requestsPerMinute?: number;
  /** Maximum requests per burst window (default: 5000) */
  burstLimit?: number;
  /** Burst window in milliseconds (default: 300000 / 5 minutes) */
  burstWindowMs?: number;
  /** Start throttling when usage reaches this percentage (0-1, default: 0.9) */
  throttleThreshold?: number;
}

/**
 * Sliding window rate limiter.
 * Exported for testing purposes.
 */
export class RateLimiter {
  private timestamps: number[] = [];
  private readonly requestsPerMinute: number;
  private readonly burstLimit: number;
  private readonly burstWindowMs: number;
  private readonly throttleThreshold: number;

  constructor(options: {
    requestsPerMinute: number;
    burstLimit: number;
    burstWindowMs: number;
    throttleThreshold: number;
  }) {
    this.requestsPerMinute = options.requestsPerMinute;
    this.burstLimit = options.burstLimit;
    this.burstWindowMs = options.burstWindowMs;
    this.throttleThreshold = options.throttleThreshold;
  }

  private prune(): void {
    const cutoff = Date.now() - this.burstWindowMs;
    this.timestamps = this.timestamps.filter((ts) => ts > cutoff);
  }

  getUsage(): { minuteUsage: number; burstUsage: number } {
    this.prune();
    const oneMinuteAgo = Date.now() - 60_000;
    const minuteUsage = this.timestamps.filter((ts) => ts > oneMinuteAgo).length;
    return { minuteUsage, burstUsage: this.timestamps.length };
  }

  getDelay(): number {
    const { minuteUsage, burstUsage } = this.getUsage();
    const minuteThreshold = Math.floor(this.requestsPerMinute * this.throttleThreshold);
    const burstThreshold = Math.floor(this.burstLimit * this.throttleThreshold);
    const now = Date.now();

    if (minuteUsage >= minuteThreshold) {
      const oneMinuteAgo = now - 60_000;
      const oldest = this.timestamps.find((ts) => ts > oneMinuteAgo);
      if (oldest) {
        const delay = oldest + 60_000 - now;
        if (delay > 0) return delay;
      }
    }

    if (burstUsage >= burstThreshold) {
      const burstCutoff = now - this.burstWindowMs;
      const oldest = this.timestamps.find((ts) => ts > burstCutoff);
      if (oldest) {
        const delay = oldest + this.burstWindowMs - now;
        if (delay > 0) return delay;
      }
    }

    return 0;
  }

  recordRequest(): void {
    this.timestamps.push(Date.now());
  }
}

function calculateRetryDelay(
  retryAfterHeader: string | null,
  retryCount: number,
  options: { baseDelay: number; exponentialBackoff: boolean; jitter: boolean }
): number {
  if (retryAfterHeader) {
    const retryAfter = parseInt(retryAfterHeader, 10);
    if (!isNaN(retryAfter) && retryAfter > 0) {
      return retryAfter * 1000;
    }
  }

  let delay: number;
  if (options.exponentialBackoff) {
    delay = options.baseDelay * Math.pow(2, retryCount);
  } else {
    delay = options.baseDelay;
  }

  if (options.jitter) {
    const jitterFactor = 0.75 + Math.random() * 0.5;
    delay = Math.floor(delay * jitterFactor);
  }

  return delay;
}

/**
 * Creates an openapi-fetch middleware that handles rate limiting with
 * optional retry and preemptive throttling.
 *
 * @example
 * ```typescript
 * client.use(createRateLimitMiddleware({ enableRetry: true }));
 * client.use(createRateLimitMiddleware({ enableThrottle: true }));
 * client.use(createRateLimitMiddleware({ enableRetry: true, enableThrottle: true }));
 * ```
 */
export function createRateLimitMiddleware(options: RateLimitOptions = {}): Middleware {
  const {
    enableRetry = false,
    enableThrottle = false,
    maxRetries = 3,
    baseDelay = 1000,
    exponentialBackoff = true,
    jitter = true,
    requestsPerMinute = 1000,
    burstLimit = 5000,
    burstWindowMs = 300_000,
    throttleThreshold = 0.9,
  } = options;

  const rateLimiter = enableThrottle
    ? new RateLimiter({ requestsPerMinute, burstLimit, burstWindowMs, throttleThreshold })
    : null;

  let retryCount = 0;

  return {
    async onRequest({ request }) {
      if (rateLimiter) {
        const delay = rateLimiter.getDelay();
        if (delay > 0) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
      return request;
    },

    async onResponse({ request, response }) {
      rateLimiter?.recordRequest();

      if (response.status !== 429 || !enableRetry) return undefined;
      if (retryCount >= maxRetries) {
        retryCount = 0;
        return undefined;
      }

      const delay = calculateRetryDelay(
        response.headers.get('Retry-After'),
        retryCount,
        { baseDelay, exponentialBackoff, jitter }
      );
      retryCount++;

      await new Promise((resolve) => setTimeout(resolve, delay));
      const retryResponse = await fetch(new Request(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body,
        signal: request.signal,
      }));

      if (retryResponse.status !== 429) {
        retryCount = 0;
      }

      return retryResponse;
    },
  };
}
