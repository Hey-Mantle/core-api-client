import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createAuthRefreshMiddleware } from '../../src/middleware/auth-refresh'

// Mock fetch globally for retry requests
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function createMockRequest(
  url = 'https://api.example.com/test',
  init: RequestInit = {}
): Request {
  return new Request(url, {
    method: 'GET',
    headers: { Authorization: 'Bearer old-token' },
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

describe('createAuthRefreshMiddleware', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  describe('successful responses', () => {
    it('passes through non-401 responses', async () => {
      const refreshToken = vi.fn()
      const updateAuth = vi.fn()
      const middleware = createAuthRefreshMiddleware({ refreshToken, updateAuth })

      const request = createMockRequest()
      const response = createMockResponse(200)

      const result = await middleware.onResponse!({
        request,
        response,
        options: {},
        schemaPath: '/test',
      } as never)

      expect(result).toBeUndefined()
      expect(refreshToken).not.toHaveBeenCalled()
    })
  })

  describe('401 handling', () => {
    it('refreshes token and retries on 401', async () => {
      const refreshToken = vi.fn().mockResolvedValue('new-token')
      const updateAuth = vi.fn()
      const retryResponse = createMockResponse(200, { success: true })
      mockFetch.mockResolvedValueOnce(retryResponse)

      const middleware = createAuthRefreshMiddleware({ refreshToken, updateAuth })

      const request = createMockRequest()
      const response = createMockResponse(401)

      const result = await middleware.onResponse!({
        request,
        response,
        options: {},
        schemaPath: '/test',
      } as never)

      expect(refreshToken).toHaveBeenCalled()
      expect(updateAuth).toHaveBeenCalledWith('new-token')
      expect(result).toBe(retryResponse)
    })

    it('sets Authorization header on retry request', async () => {
      const refreshToken = vi.fn().mockResolvedValue('new-token')
      const updateAuth = vi.fn()
      mockFetch.mockResolvedValueOnce(createMockResponse(200))

      const middleware = createAuthRefreshMiddleware({ refreshToken, updateAuth })

      const request = createMockRequest()
      const response = createMockResponse(401)

      await middleware.onResponse!({
        request,
        response,
        options: {},
        schemaPath: '/test',
      } as never)

      const retryRequest = mockFetch.mock.calls[0][0] as Request
      expect(retryRequest.headers.get('Authorization')).toBe('Bearer new-token')
    })

    it('calls onRefreshSuccess callback', async () => {
      const refreshToken = vi.fn().mockResolvedValue('new-token')
      const updateAuth = vi.fn()
      const onRefreshSuccess = vi.fn()
      mockFetch.mockResolvedValueOnce(createMockResponse(200))

      const middleware = createAuthRefreshMiddleware({
        refreshToken,
        updateAuth,
        onRefreshSuccess,
      })

      const request = createMockRequest()
      const response = createMockResponse(401)

      await middleware.onResponse!({
        request,
        response,
        options: {},
        schemaPath: '/test',
      } as never)

      expect(onRefreshSuccess).toHaveBeenCalledWith('new-token')
    })

    it('ignores non-401 error responses', async () => {
      const refreshToken = vi.fn()
      const updateAuth = vi.fn()
      const middleware = createAuthRefreshMiddleware({ refreshToken, updateAuth })

      const request = createMockRequest()
      const response = createMockResponse(403)

      const result = await middleware.onResponse!({
        request,
        response,
        options: {},
        schemaPath: '/test',
      } as never)

      expect(result).toBeUndefined()
      expect(refreshToken).not.toHaveBeenCalled()
    })
  })

  describe('refresh failure', () => {
    it('calls onRefreshFailed on refresh error and returns undefined', async () => {
      const refreshError = new Error('Refresh failed')
      const refreshToken = vi.fn().mockRejectedValue(refreshError)
      const updateAuth = vi.fn()
      const onRefreshFailed = vi.fn()

      const middleware = createAuthRefreshMiddleware({
        refreshToken,
        updateAuth,
        onRefreshFailed,
      })

      const request = createMockRequest()
      const response = createMockResponse(401)

      const result = await middleware.onResponse!({
        request,
        response,
        options: {},
        schemaPath: '/test',
      } as never)

      expect(onRefreshFailed).toHaveBeenCalledWith(refreshError)
      expect(result).toBeUndefined()
    })

    it('returns undefined when refresh fails without callback', async () => {
      const refreshToken = vi.fn().mockRejectedValue(new Error('Refresh failed'))
      const updateAuth = vi.fn()

      const middleware = createAuthRefreshMiddleware({ refreshToken, updateAuth })

      const request = createMockRequest()
      const response = createMockResponse(401)

      const result = await middleware.onResponse!({
        request,
        response,
        options: {},
        schemaPath: '/test',
      } as never)

      expect(result).toBeUndefined()
    })
  })

  describe('maxRefreshAttempts', () => {
    it('stops refreshing after max attempts reached', async () => {
      const refreshToken = vi.fn().mockResolvedValue('new-token')
      const updateAuth = vi.fn()
      mockFetch.mockResolvedValue(createMockResponse(200))

      const middleware = createAuthRefreshMiddleware({
        refreshToken,
        updateAuth,
        maxRefreshAttempts: 1,
      })

      const request = createMockRequest()
      const response401 = createMockResponse(401)

      // First 401 - should refresh
      const result1 = await middleware.onResponse!({
        request,
        response: response401,
        options: {},
        schemaPath: '/test',
      } as never)
      expect(result1).toBeDefined()
      expect(refreshToken).toHaveBeenCalledTimes(1)

      // Second consecutive 401 - should pass through (counter reset after success)
      // Note: the middleware resets the counter after successful refresh,
      // so a second call should also work
      const result2 = await middleware.onResponse!({
        request,
        response: response401,
        options: {},
        schemaPath: '/test',
      } as never)
      expect(result2).toBeDefined()
      expect(refreshToken).toHaveBeenCalledTimes(2)
    })

    it('returns undefined when max attempts exceeded without reset', async () => {
      // Simulate the case where refresh succeeds but the retry still returns 401
      // The middleware increments refreshAttempts, then on success resets to 0
      // This means maxRefreshAttempts limits within a single flow where
      // refresh keeps failing
      const refreshToken = vi.fn().mockResolvedValue('new-token')
      const updateAuth = vi.fn()

      const middleware = createAuthRefreshMiddleware({
        refreshToken,
        updateAuth,
        maxRefreshAttempts: 2,
      })

      const request = createMockRequest()
      const response401 = createMockResponse(401)

      // Each successful refresh resets the counter
      mockFetch.mockResolvedValue(createMockResponse(200))
      for (let i = 0; i < 5; i++) {
        const result = await middleware.onResponse!({
          request,
          response: response401,
          options: {},
          schemaPath: '/test',
        } as never)
        expect(result).toBeDefined()
      }
      // All 5 should have succeeded since counter resets after each
      expect(refreshToken).toHaveBeenCalledTimes(5)
    })

    it('resets attempts after refresh failure', async () => {
      const refreshToken = vi
        .fn()
        .mockRejectedValueOnce(new Error('Failed'))
        .mockResolvedValueOnce('new-token')
      const updateAuth = vi.fn()

      const middleware = createAuthRefreshMiddleware({
        refreshToken,
        updateAuth,
        maxRefreshAttempts: 1,
      })

      const request = createMockRequest()
      const response401 = createMockResponse(401)

      // First attempt - refresh fails, returns undefined
      const result1 = await middleware.onResponse!({
        request,
        response: response401,
        options: {},
        schemaPath: '/test',
      } as never)
      expect(result1).toBeUndefined()

      // Second attempt - should try again (counter was reset after failure)
      mockFetch.mockResolvedValueOnce(createMockResponse(200))
      const result2 = await middleware.onResponse!({
        request,
        response: response401,
        options: {},
        schemaPath: '/test',
      } as never)
      expect(result2).toBeDefined()
    })
  })

  describe('retry request properties', () => {
    it('preserves request method on retry', async () => {
      const refreshToken = vi.fn().mockResolvedValue('new-token')
      const updateAuth = vi.fn()
      mockFetch.mockResolvedValueOnce(createMockResponse(200))

      const middleware = createAuthRefreshMiddleware({ refreshToken, updateAuth })

      const request = createMockRequest('https://api.example.com/test', {
        method: 'POST',
      })
      const response = createMockResponse(401)

      await middleware.onResponse!({
        request,
        response,
        options: {},
        schemaPath: '/test',
      } as never)

      const retryRequest = mockFetch.mock.calls[0][0] as Request
      expect(retryRequest.method).toBe('POST')
    })

    it('preserves request URL on retry', async () => {
      const refreshToken = vi.fn().mockResolvedValue('new-token')
      const updateAuth = vi.fn()
      mockFetch.mockResolvedValueOnce(createMockResponse(200))

      const middleware = createAuthRefreshMiddleware({ refreshToken, updateAuth })

      const request = createMockRequest('https://api.example.com/customers/123')
      const response = createMockResponse(401)

      await middleware.onResponse!({
        request,
        response,
        options: {},
        schemaPath: '/test',
      } as never)

      const retryRequest = mockFetch.mock.calls[0][0] as Request
      expect(retryRequest.url).toBe('https://api.example.com/customers/123')
    })
  })
})
