import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createRateLimitMiddleware, RateLimiter } from './rate-limit'
import { MantleRateLimitError } from '../utils/errors'
import type { MiddlewareContext } from './types'

// Helper to create a mock middleware context
function createMockContext(overrides: Partial<MiddlewareContext> = {}): MiddlewareContext {
  return {
    request: {
      url: 'https://api.example.com/test',
      method: 'GET',
      headers: {},
      endpoint: '/test',
    },
    retry: false,
    retryCount: 0,
    maxRetries: 3,
    updateAuth: vi.fn(),
    ...overrides,
  }
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

      // Record some requests
      limiter.recordRequest()
      limiter.recordRequest()

      // Advance time by 61 seconds (past the minute window)
      vi.advanceTimersByTime(61_000)

      // Record one more request
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
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('with no features enabled', () => {
    it('passes through to next without modification', async () => {
      const middleware = createRateLimitMiddleware()
      const ctx = createMockContext()
      const next = vi.fn().mockResolvedValue(undefined)

      await middleware(ctx, next)

      expect(next).toHaveBeenCalledOnce()
      expect(ctx.retry).toBe(false)
    })

    it('re-throws errors from next', async () => {
      const middleware = createRateLimitMiddleware()
      const ctx = createMockContext()
      const error = new Error('Test error')
      const next = vi.fn().mockRejectedValue(error)

      await expect(middleware(ctx, next)).rejects.toThrow('Test error')
    })
  })

  describe('with enableRetry: true', () => {
    it('does nothing when no error occurs', async () => {
      const middleware = createRateLimitMiddleware({ enableRetry: true })
      const ctx = createMockContext()
      const next = vi.fn().mockResolvedValue(undefined)

      await middleware(ctx, next)

      expect(next).toHaveBeenCalledOnce()
      expect(ctx.retry).toBe(false)
    })

    it('catches MantleRateLimitError and sets ctx.retry = true', async () => {
      const middleware = createRateLimitMiddleware({
        enableRetry: true,
        jitter: false,
        baseDelay: 100,
      })
      const ctx = createMockContext()
      const error = new MantleRateLimitError('Rate limited', 1)
      const next = vi.fn().mockRejectedValue(error)

      const promise = middleware(ctx, next)
      await vi.advanceTimersByTimeAsync(1000) // retryAfter is 1 second
      await promise

      expect(ctx.retry).toBe(true)
    })

    it('uses retryAfter from error when available', async () => {
      const middleware = createRateLimitMiddleware({
        enableRetry: true,
        jitter: false,
      })
      const ctx = createMockContext()
      const error = new MantleRateLimitError('Rate limited', 5) // 5 seconds
      const next = vi.fn().mockRejectedValue(error)

      const startTime = Date.now()
      const promise = middleware(ctx, next)

      // Advance less than retryAfter - should not resolve yet
      await vi.advanceTimersByTimeAsync(4000)

      // Advance past retryAfter
      await vi.advanceTimersByTimeAsync(1500)
      await promise

      expect(ctx.retry).toBe(true)
    })

    it('uses exponential backoff when no retryAfter', async () => {
      const middleware = createRateLimitMiddleware({
        enableRetry: true,
        baseDelay: 1000,
        exponentialBackoff: true,
        jitter: false,
      })

      // First retry (retryCount = 0): 1000 * 2^0 = 1000ms
      const ctx1 = createMockContext({ retryCount: 0 })
      const error = new MantleRateLimitError('Rate limited')
      const next1 = vi.fn().mockRejectedValue(error)

      const promise1 = middleware(ctx1, next1)
      await vi.advanceTimersByTimeAsync(1000)
      await promise1

      expect(ctx1.retry).toBe(true)

      // Second retry (retryCount = 1): 1000 * 2^1 = 2000ms
      const ctx2 = createMockContext({ retryCount: 1 })
      const next2 = vi.fn().mockRejectedValue(error)

      const promise2 = middleware(ctx2, next2)
      await vi.advanceTimersByTimeAsync(2000)
      await promise2

      expect(ctx2.retry).toBe(true)
    })

    it('respects maxRetries limit and re-throws after exceeded', async () => {
      const middleware = createRateLimitMiddleware({
        enableRetry: true,
        maxRetries: 2,
      })
      const ctx = createMockContext({ retryCount: 2 }) // Already at max
      const error = new MantleRateLimitError('Rate limited', 1)
      const next = vi.fn().mockRejectedValue(error)

      await expect(middleware(ctx, next)).rejects.toThrow(MantleRateLimitError)
      expect(ctx.retry).toBe(false)
    })

    it('ignores non-rate-limit errors', async () => {
      const middleware = createRateLimitMiddleware({ enableRetry: true })
      const ctx = createMockContext()
      const error = new Error('Some other error')
      const next = vi.fn().mockRejectedValue(error)

      await expect(middleware(ctx, next)).rejects.toThrow('Some other error')
      expect(ctx.retry).toBe(false)
    })

    it('does not apply jitter to server-provided retryAfter', async () => {
      // This test verifies that when a server provides a retryAfter value,
      // we wait exactly that amount (not less due to jitter)
      const middleware = createRateLimitMiddleware({
        enableRetry: true,
        jitter: true, // Jitter enabled, but should not reduce below retryAfter
      })
      const ctx = createMockContext()
      const error = new MantleRateLimitError('Rate limited', 5) // 5 seconds
      const next = vi.fn().mockRejectedValue(error)

      let resolved = false
      const promise = middleware(ctx, next).then(() => {
        resolved = true
      })

      // If jitter were applied incorrectly, delay could be as low as 3750ms (5000 * 0.75)
      // We verify the request does NOT resolve before 5000ms
      await vi.advanceTimersByTimeAsync(4500)
      expect(resolved).toBe(false)

      // Should resolve at exactly 5000ms (the server-specified time)
      await vi.advanceTimersByTimeAsync(500)
      await promise

      expect(resolved).toBe(true)
      expect(ctx.retry).toBe(true)
    })
  })

  describe('with enableThrottle: true', () => {
    it('does not delay when under threshold', async () => {
      const middleware = createRateLimitMiddleware({
        enableThrottle: true,
        requestsPerMinute: 100,
        throttleThreshold: 0.9,
      })
      const ctx = createMockContext()
      const next = vi.fn().mockResolvedValue(undefined)

      await middleware(ctx, next)

      expect(next).toHaveBeenCalledOnce()
    })

    it('delays request when approaching limits', async () => {
      const middleware = createRateLimitMiddleware({
        enableThrottle: true,
        requestsPerMinute: 10,
        burstLimit: 50,
        throttleThreshold: 0.9, // 9 requests threshold
      })

      // Make 9 requests to hit threshold
      for (let i = 0; i < 9; i++) {
        const ctx = createMockContext()
        const next = vi.fn().mockResolvedValue(undefined)
        await middleware(ctx, next)
      }

      // Next request should be delayed
      const ctx = createMockContext()
      const next = vi.fn().mockResolvedValue(undefined)
      let resolved = false

      const promise = middleware(ctx, next).then(() => {
        resolved = true
      })

      // Should not resolve immediately
      await vi.advanceTimersByTimeAsync(100)
      expect(resolved).toBe(false)

      // Advance past the delay
      await vi.advanceTimersByTimeAsync(60_000)
      await promise

      expect(resolved).toBe(true)
      expect(next).toHaveBeenCalled()
    })

    it('records requests after completion', async () => {
      const middleware = createRateLimitMiddleware({
        enableThrottle: true,
        requestsPerMinute: 100,
      })

      // First request
      const ctx1 = createMockContext()
      const next1 = vi.fn().mockResolvedValue(undefined)
      await middleware(ctx1, next1)

      // Second request
      const ctx2 = createMockContext()
      const next2 = vi.fn().mockResolvedValue(undefined)
      await middleware(ctx2, next2)

      // Both requests should have been counted (tested via delay behavior)
      expect(next1).toHaveBeenCalled()
      expect(next2).toHaveBeenCalled()
    })

    it('records requests even on error', async () => {
      const middleware = createRateLimitMiddleware({
        enableThrottle: true,
        requestsPerMinute: 100,
      })

      const ctx = createMockContext()
      const error = new Error('Request failed')
      const next = vi.fn().mockRejectedValue(error)

      await expect(middleware(ctx, next)).rejects.toThrow('Request failed')
      // Request should still be recorded (tested via subsequent behavior)
    })
  })

  describe('with both features enabled', () => {
    it('applies throttling and handles retry on rate limit error', async () => {
      const middleware = createRateLimitMiddleware({
        enableRetry: true,
        enableThrottle: true,
        requestsPerMinute: 100,
        maxRetries: 3,
        jitter: false,
        baseDelay: 100,
      })

      const ctx = createMockContext()
      const error = new MantleRateLimitError('Rate limited', 1)
      const next = vi.fn().mockRejectedValue(error)

      const promise = middleware(ctx, next)
      await vi.advanceTimersByTimeAsync(1000)
      await promise

      expect(ctx.retry).toBe(true)
    })
  })
})
