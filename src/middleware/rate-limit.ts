import type { Middleware } from './types'
import { MantleRateLimitError } from '../utils/errors'

/**
 * Options for the rate limit middleware
 */
export interface RateLimitOptions {
  /**
   * Enable automatic retry on 429 responses
   * @default false
   */
  enableRetry?: boolean

  /**
   * Enable preemptive throttling to avoid hitting rate limits
   * @default false
   */
  enableThrottle?: boolean

  // Retry options (when enableRetry: true)

  /**
   * Maximum number of retry attempts
   * @default 3
   */
  maxRetries?: number

  /**
   * Base delay in milliseconds for retries when no retryAfter is provided
   * @default 1000
   */
  baseDelay?: number

  /**
   * Use exponential backoff for retries
   * @default true
   */
  exponentialBackoff?: boolean

  /**
   * Add random jitter to retry delays to prevent thundering herd
   * @default true
   */
  jitter?: boolean

  // Throttle options (when enableThrottle: true)

  /**
   * Maximum requests per minute (primary limit)
   * @default 1000
   */
  requestsPerMinute?: number

  /**
   * Maximum requests per burst window
   * @default 5000
   */
  burstLimit?: number

  /**
   * Burst window in milliseconds
   * @default 300000 (5 minutes)
   */
  burstWindowMs?: number

  /**
   * Start throttling when usage reaches this percentage of the limit (0-1)
   * @default 0.9
   */
  throttleThreshold?: number
}

/**
 * Class for tracking request rates using a sliding window.
 * Exported for testing purposes.
 */
export class RateLimiter {
  private timestamps: number[] = []
  private readonly requestsPerMinute: number
  private readonly burstLimit: number
  private readonly burstWindowMs: number
  private readonly throttleThreshold: number

  constructor(options: {
    requestsPerMinute: number
    burstLimit: number
    burstWindowMs: number
    throttleThreshold: number
  }) {
    this.requestsPerMinute = options.requestsPerMinute
    this.burstLimit = options.burstLimit
    this.burstWindowMs = options.burstWindowMs
    this.throttleThreshold = options.throttleThreshold
  }

  /**
   * Prune timestamps older than the burst window
   */
  private prune(): void {
    const now = Date.now()
    const cutoff = now - this.burstWindowMs
    this.timestamps = this.timestamps.filter((ts) => ts > cutoff)
  }

  /**
   * Get current usage statistics
   */
  getUsage(): { minuteUsage: number; burstUsage: number } {
    this.prune()
    const now = Date.now()
    const oneMinuteAgo = now - 60_000

    const minuteUsage = this.timestamps.filter((ts) => ts > oneMinuteAgo).length
    const burstUsage = this.timestamps.length

    return { minuteUsage, burstUsage }
  }

  /**
   * Calculate the delay needed before the next request can be made
   * Returns 0 if no delay is needed
   */
  getDelay(): number {
    const { minuteUsage, burstUsage } = this.getUsage()

    const minuteThreshold = Math.floor(this.requestsPerMinute * this.throttleThreshold)
    const burstThreshold = Math.floor(this.burstLimit * this.throttleThreshold)

    // Check if we're approaching the minute limit
    if (minuteUsage >= minuteThreshold) {
      // Find the oldest timestamp in the last minute and wait until it expires
      const now = Date.now()
      const oneMinuteAgo = now - 60_000
      const oldestInMinute = this.timestamps.find((ts) => ts > oneMinuteAgo)

      if (oldestInMinute) {
        // Wait until this timestamp is older than 1 minute
        const delay = oldestInMinute + 60_000 - now
        if (delay > 0) {
          return delay
        }
      }
    }

    // Check if we're approaching the burst limit
    if (burstUsage >= burstThreshold) {
      const now = Date.now()
      const burstCutoff = now - this.burstWindowMs
      const oldestInBurst = this.timestamps.find((ts) => ts > burstCutoff)

      if (oldestInBurst) {
        // Wait until this timestamp is older than the burst window
        const delay = oldestInBurst + this.burstWindowMs - now
        if (delay > 0) {
          return delay
        }
      }
    }

    return 0
  }

  /**
   * Record a request timestamp
   */
  recordRequest(): void {
    this.timestamps.push(Date.now())
  }
}

/**
 * Calculate retry delay with optional exponential backoff and jitter
 */
function calculateRetryDelay(
  retryAfter: number | undefined,
  retryCount: number,
  options: { baseDelay: number; exponentialBackoff: boolean; jitter: boolean }
): number {
  let delay: number

  if (retryAfter !== undefined && retryAfter > 0) {
    // Use the server-provided retry-after (convert from seconds to ms)
    // Don't apply jitter here - retryAfter is the minimum time to wait
    return retryAfter * 1000
  } else if (options.exponentialBackoff) {
    // Exponential backoff: baseDelay * 2^retryCount
    delay = options.baseDelay * Math.pow(2, retryCount)
  } else {
    delay = options.baseDelay
  }

  // Only apply jitter to calculated delays, not server-provided retryAfter
  if (options.jitter) {
    // Add ±25% random jitter
    const jitterFactor = 0.75 + Math.random() * 0.5
    delay = Math.floor(delay * jitterFactor)
  }

  return delay
}

/**
 * Creates a middleware that handles rate limiting with optional retry and throttling
 *
 * @example
 * ```typescript
 * const client = new MantleCoreClient({ ... });
 *
 * // Enable retry on 429 responses
 * client.use(createRateLimitMiddleware({
 *   enableRetry: true,
 * }));
 *
 * // Enable preemptive throttling
 * client.use(createRateLimitMiddleware({
 *   enableThrottle: true,
 * }));
 *
 * // Enable both features
 * client.use(createRateLimitMiddleware({
 *   enableRetry: true,
 *   enableThrottle: true,
 *   maxRetries: 5,
 *   requestsPerMinute: 500,
 * }));
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
  } = options

  // Create rate limiter if throttling is enabled
  const rateLimiter = enableThrottle
    ? new RateLimiter({
        requestsPerMinute,
        burstLimit,
        burstWindowMs,
        throttleThreshold,
      })
    : null

  return async (ctx, next) => {
    // Preemptive throttling: delay if we're approaching limits
    if (rateLimiter) {
      const delay = rateLimiter.getDelay()
      if (delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }

    try {
      await next()

      // Record successful request for throttling
      rateLimiter?.recordRequest()
    } catch (error) {
      // Record the request even on error (it still counts against limits)
      rateLimiter?.recordRequest()

      // Handle rate limit errors with retry
      if (enableRetry && error instanceof MantleRateLimitError) {
        if (ctx.retryCount < maxRetries) {
          const delay = calculateRetryDelay(error.retryAfter, ctx.retryCount, {
            baseDelay,
            exponentialBackoff,
            jitter,
          })

          await new Promise((resolve) => setTimeout(resolve, delay))
          ctx.retry = true
          return
        }
      }

      throw error
    }
  }
}
