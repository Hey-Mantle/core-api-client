import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  createRateLimitMiddleware,
  RateLimiter,
} from '../../src/middleware/rate-limit'

// Mock fetch globally for retry requests
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function createMockRequest(
  url = 'https://api.example.com/test',
  init: RequestInit = {}
): Request {
  return new Request(url, {
    method: 'GET',
    ...init,
  })
}

function createMockResponse(
  status: number,
  body: unknown = {},
  headers: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: new Headers(headers),
  })
}

describe('RateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('getUsage', () => {
    it('returns zero usage when no requests have been made', () => {
      const limiter = new RateLimiter({
        requestsPerMinute: 1000,
        burstLimit: 5000,
        burstWindowMs: 300_000,
        throttleThreshold: 0.9,
      })

      const usage = limiter.getUsage()
      expect(usage.minuteUsage).toBe(0)
      expect(usage.burstUsage).toBe(0)
    })

    it('counts requests within the last minute', () => {
      const limiter = new RateLimiter({
        requestsPerMinute: 1000,
        burstLimit: 5000,
        burstWindowMs: 300_000,
        throttleThreshold: 0.9,
      })

      limiter.recordRequest()
      limiter.recordRequest()
      limiter.recordRequest()

      const usage = limiter.getUsage()
      expect(usage.minuteUsage).toBe(3)
      expect(usage.burstUsage).toBe(3)
    })

    it('excludes requests older than one minute from minuteUsage', () => {
      const limiter = new RateLimiter({
        requestsPerMinute: 1000,
        burstLimit: 5000,
        burstWindowMs: 300_000,
        throttleThreshold: 0.9,
      })

      limiter.recordRequest()
      limiter.recordRequest()

      // Advance time by 61 seconds (past the minute window)
      vi.advanceTimersByTime(61_000)

      limiter.recordRequest()

      const usage = limiter.getUsage()
      expect(usage.minuteUsage).toBe(1) // Only the recent one
      expect(usage.burstUsage).toBe(3) // All three still in burst window
    })

    it('prunes requests older than burst window', () => {
      const limiter = new RateLimiter({
        requestsPerMinute: 1000,
        burstLimit: 5000,
        burstWindowMs: 300_000, // 5 minutes
        throttleThreshold: 0.9,
      })

      limiter.recordRequest()
      limiter.recordRequest()

      // Advance time past burst window
      vi.advanceTimersByTime(301_000)

      limiter.recordRequest()

      const usage = limiter.getUsage()
      expect(usage.minuteUsage).toBe(1)
      expect(usage.burstUsage).toBe(1) // Old requests pruned
    })
  })

  describe('getDelay', () => {
    it('returns 0 when under threshold', () => {
      const limiter = new RateLimiter({
        requestsPerMinute: 100,
        burstLimit: 500,
        burstWindowMs: 300_000,
        throttleThreshold: 0.9, // 90 requests threshold
      })

      // Record 50 requests (under 90% threshold)
      for (let i = 0; i < 50; i++) {
        limiter.recordRequest()
      }

      expect(limiter.getDelay()).toBe(0)
    })

    it('returns positive delay when at minute threshold', () => {
      const limiter = new RateLimiter({
        requestsPerMinute: 100,
        burstLimit: 500,
        burstWindowMs: 300_000,
        throttleThreshold: 0.9, // 90 requests threshold
      })

      // Record 90 requests to hit threshold
      for (let i = 0; i < 90; i++) {
        limiter.recordRequest()
      }

      const delay = limiter.getDelay()
      expect(delay).toBeGreaterThan(0)
      expect(delay).toBeLessThanOrEqual(60_000) // Max 1 minute
    })

    it('returns positive delay when at burst threshold', () => {
      const limiter = new RateLimiter({
        requestsPerMinute: 1000,
        burstLimit: 100,
        burstWindowMs: 300_000,
        throttleThreshold: 0.9, // 90 requests threshold for burst
      })

      // Record 90 requests to hit burst threshold
      for (let i = 0; i < 90; i++) {
        limiter.recordRequest()
      }

      const delay = limiter.getDelay()
      expect(delay).toBeGreaterThan(0)
    })
  })

  describe('recordRequest', () => {
    it('adds a timestamp', () => {
      const limiter = new RateLimiter({
        requestsPerMinute: 1000,
        burstLimit: 5000,
        burstWindowMs: 300_000,
        throttleThreshold: 0.9,
      })

      expect(limiter.getUsage().burstUsage).toBe(0)
      limiter.recordRequest()
      expect(limiter.getUsage().burstUsage).toBe(1)
    })
  })
})

describe('createRateLimitMiddleware', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockFetch.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('with no features enabled', () => {
    it('onRequest returns the request unchanged', async () => {
      const middleware = createRateLimitMiddleware()
      const request = createMockRequest()

      const result = await middleware.onRequest!({
        request,
        options: {},
        schemaPath: '/test',
      } as never)

      expect(result).toBe(request)
    })

    it('onResponse returns undefined for non-429', async () => {
      const middleware = createRateLimitMiddleware()
      const request = createMockRequest()
      const response = createMockResponse(200)

      const result = await middleware.onResponse!({
        request,
        response,
        options: {},
        schemaPath: '/test',
      } as never)

      expect(result).toBeUndefined()
    })
  })

  describe('with enableRetry: true', () => {
    it('returns undefined for non-429 responses', async () => {
      const middleware = createRateLimitMiddleware({ enableRetry: true })
      const request = createMockRequest()
      const response = createMockResponse(200)

      const result = await middleware.onResponse!({
        request,
        response,
        options: {},
        schemaPath: '/test',
      } as never)

      expect(result).toBeUndefined()
    })

    it('retries on 429 and returns new response', async () => {
      const middleware = createRateLimitMiddleware({
        enableRetry: true,
        jitter: false,
        baseDelay: 100,
      })
      const request = createMockRequest()
      const response429 = createMockResponse(429)
      const successResponse = createMockResponse(200, { success: true })
      mockFetch.mockResolvedValueOnce(successResponse)

      const promise = middleware.onResponse!({
        request,
        response: response429,
        options: {},
        schemaPath: '/test',
      } as never)

      // Advance past the delay
      await vi.advanceTimersByTimeAsync(200)
      const result = await promise

      expect(result).toBe(successResponse)
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('uses Retry-After header when available', async () => {
      const middleware = createRateLimitMiddleware({
        enableRetry: true,
        jitter: false,
      })
      const request = createMockRequest()
      const response429 = createMockResponse(429, {}, { 'Retry-After': '5' })
      const successResponse = createMockResponse(200)
      mockFetch.mockResolvedValueOnce(successResponse)

      let resolved = false
      const promise = middleware
        .onResponse!({
          request,
          response: response429,
          options: {},
          schemaPath: '/test',
        } as never)
        .then((r) => {
          resolved = true
          return r
        })

      // Should not resolve before 5 seconds
      await vi.advanceTimersByTimeAsync(4000)
      expect(resolved).toBe(false)

      // Should resolve after 5 seconds
      await vi.advanceTimersByTimeAsync(1500)
      await promise
      expect(resolved).toBe(true)
    })

    it('uses exponential backoff when no Retry-After', async () => {
      const middleware = createRateLimitMiddleware({
        enableRetry: true,
        baseDelay: 1000,
        exponentialBackoff: true,
        jitter: false,
      })
      const request = createMockRequest()
      const response429 = createMockResponse(429)

      // First retry: 1000 * 2^0 = 1000ms
      mockFetch.mockResolvedValueOnce(createMockResponse(429)) // still 429
      const promise1 = middleware.onResponse!({
        request,
        response: response429,
        options: {},
        schemaPath: '/test',
      } as never)
      await vi.advanceTimersByTimeAsync(1000)
      await promise1

      // Second retry: 1000 * 2^1 = 2000ms
      mockFetch.mockResolvedValueOnce(createMockResponse(200))
      let resolved = false
      const promise2 = middleware
        .onResponse!({
          request,
          response: response429,
          options: {},
          schemaPath: '/test',
        } as never)
        .then((r) => {
          resolved = true
          return r
        })

      await vi.advanceTimersByTimeAsync(1500)
      expect(resolved).toBe(false)
      await vi.advanceTimersByTimeAsync(1000)
      await promise2
      expect(resolved).toBe(true)
    })

    it('stops retrying after maxRetries', async () => {
      const middleware = createRateLimitMiddleware({
        enableRetry: true,
        maxRetries: 2,
        baseDelay: 100,
        jitter: false,
      })
      const request = createMockRequest()
      const response429 = createMockResponse(429)

      // Exhaust retries - each retry returns another 429
      mockFetch.mockResolvedValue(createMockResponse(429))

      for (let i = 0; i < 2; i++) {
        const promise = middleware.onResponse!({
          request,
          response: response429,
          options: {},
          schemaPath: '/test',
        } as never)
        await vi.advanceTimersByTimeAsync(5000)
        await promise
      }

      // Third attempt should return undefined (max retries exceeded)
      const result = await middleware.onResponse!({
        request,
        response: response429,
        options: {},
        schemaPath: '/test',
      } as never)
      expect(result).toBeUndefined()
    })

    it('resets retry count after successful response', async () => {
      const middleware = createRateLimitMiddleware({
        enableRetry: true,
        maxRetries: 1,
        baseDelay: 100,
        jitter: false,
      })
      const request = createMockRequest()
      const response429 = createMockResponse(429)

      // First 429 → retry succeeds
      mockFetch.mockResolvedValueOnce(createMockResponse(200))
      const promise = middleware.onResponse!({
        request,
        response: response429,
        options: {},
        schemaPath: '/test',
      } as never)
      await vi.advanceTimersByTimeAsync(200)
      await promise

      // Second 429 → should still retry (counter was reset)
      mockFetch.mockResolvedValueOnce(createMockResponse(200))
      const promise2 = middleware.onResponse!({
        request,
        response: response429,
        options: {},
        schemaPath: '/test',
      } as never)
      await vi.advanceTimersByTimeAsync(200)
      const result2 = await promise2
      expect(result2).toBeDefined()
    })

    it('ignores non-429 responses even with enableRetry', async () => {
      const middleware = createRateLimitMiddleware({ enableRetry: true })
      const request = createMockRequest()
      const response500 = createMockResponse(500)

      const result = await middleware.onResponse!({
        request,
        response: response500,
        options: {},
        schemaPath: '/test',
      } as never)

      expect(result).toBeUndefined()
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('does not apply jitter to server-provided Retry-After', async () => {
      const middleware = createRateLimitMiddleware({
        enableRetry: true,
        jitter: true,
      })
      const request = createMockRequest()
      const response429 = createMockResponse(429, {}, { 'Retry-After': '5' })
      mockFetch.mockResolvedValueOnce(createMockResponse(200))

      let resolved = false
      const promise = middleware
        .onResponse!({
          request,
          response: response429,
          options: {},
          schemaPath: '/test',
        } as never)
        .then((r) => {
          resolved = true
          return r
        })

      // If jitter were applied, delay could be as low as 3750ms (5000 * 0.75)
      // Verify request does NOT resolve before 5000ms
      await vi.advanceTimersByTimeAsync(4500)
      expect(resolved).toBe(false)

      await vi.advanceTimersByTimeAsync(500)
      await promise
      expect(resolved).toBe(true)
    })
  })

  describe('with enableThrottle: true', () => {
    it('does not delay when under threshold', async () => {
      const middleware = createRateLimitMiddleware({
        enableThrottle: true,
        requestsPerMinute: 100,
        throttleThreshold: 0.9,
      })
      const request = createMockRequest()

      const result = await middleware.onRequest!({
        request,
        options: {},
        schemaPath: '/test',
      } as never)

      expect(result).toBe(request)
    })

    it('delays request when approaching limits', async () => {
      const middleware = createRateLimitMiddleware({
        enableThrottle: true,
        requestsPerMinute: 10,
        burstLimit: 50,
        throttleThreshold: 0.9, // 9 requests threshold
      })

      // Make 9 requests to hit threshold — each call invokes both onRequest and onResponse
      for (let i = 0; i < 9; i++) {
        const req = createMockRequest()
        await middleware.onRequest!({
          request: req,
          options: {},
          schemaPath: '/test',
        } as never)
        await middleware.onResponse!({
          request: req,
          response: createMockResponse(200),
          options: {},
          schemaPath: '/test',
        } as never)
      }

      // Next request should be delayed
      const request = createMockRequest()
      let resolved = false
      const promise = middleware
        .onRequest!({
          request,
          options: {},
          schemaPath: '/test',
        } as never)
        .then(() => {
          resolved = true
        })

      // Should not resolve immediately
      await vi.advanceTimersByTimeAsync(100)
      expect(resolved).toBe(false)

      // Advance past the delay
      await vi.advanceTimersByTimeAsync(60_000)
      await promise
      expect(resolved).toBe(true)
    })

    it('records requests in onResponse', async () => {
      const middleware = createRateLimitMiddleware({
        enableThrottle: true,
        requestsPerMinute: 100,
      })

      const request = createMockRequest()
      const response = createMockResponse(200)

      // Call onResponse — should record request
      await middleware.onResponse!({
        request,
        response,
        options: {},
        schemaPath: '/test',
      } as never)

      // Second call should also work fine (request was recorded)
      await middleware.onResponse!({
        request,
        response,
        options: {},
        schemaPath: '/test',
      } as never)
    })
  })

  describe('with both features enabled', () => {
    it('throttles and retries on 429', async () => {
      const middleware = createRateLimitMiddleware({
        enableRetry: true,
        enableThrottle: true,
        requestsPerMinute: 100,
        maxRetries: 3,
        jitter: false,
        baseDelay: 100,
      })

      const request = createMockRequest()
      const response429 = createMockResponse(429)
      const successResponse = createMockResponse(200, { ok: true })
      mockFetch.mockResolvedValueOnce(successResponse)

      const promise = middleware.onResponse!({
        request,
        response: response429,
        options: {},
        schemaPath: '/test',
      } as never)

      await vi.advanceTimersByTimeAsync(200)
      const result = await promise

      expect(result).toBe(successResponse)
    })
  })
})
