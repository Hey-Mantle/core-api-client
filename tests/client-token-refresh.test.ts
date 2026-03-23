import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MantleCoreClient } from '../src/client'

// Mock fetch globally
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function createMockResponse(
  body: unknown,
  options: { status?: number; headers?: Record<string, string> } = {}
) {
  const { status = 200, headers = {} } = options
  return new Response(JSON.stringify(body), {
    status,
    headers: new Headers({
      'Content-Type': 'application/json',
      ...headers,
    }),
  })
}

describe('MantleCoreClient token refresh', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  describe('preemptive refresh', () => {
    it('refreshes token before request when accessTokenExpiresAt is in the past', async () => {
      const refreshAccessToken = vi.fn().mockResolvedValue({
        accessToken: 'new-token',
        expiresAt: new Date(Date.now() + 3600_000),
      })

      const client = new MantleCoreClient({
        accessToken: 'expired-token',
        accessTokenExpiresAt: new Date(Date.now() - 60_000), // expired 1 min ago
        refreshAccessToken,
      })

      mockFetch.mockResolvedValueOnce(createMockResponse({ customers: [] }))
      await client.customers.list()

      expect(refreshAccessToken).toHaveBeenCalledTimes(1)
      const request = mockFetch.mock.calls[0][0] as Request
      expect(request.headers.get('Authorization')).toBe('Bearer new-token')
    })

    it('refreshes token when accessTokenExpiresAt is within 30s buffer', async () => {
      const refreshAccessToken = vi.fn().mockResolvedValue({
        accessToken: 'new-token',
      })

      const client = new MantleCoreClient({
        accessToken: 'almost-expired-token',
        accessTokenExpiresAt: new Date(Date.now() + 15_000), // expires in 15s
        refreshAccessToken,
      })

      mockFetch.mockResolvedValueOnce(createMockResponse({ customers: [] }))
      await client.customers.list()

      expect(refreshAccessToken).toHaveBeenCalledTimes(1)
    })

    it('does not refresh when token is still valid', async () => {
      const refreshAccessToken = vi.fn().mockResolvedValue({
        accessToken: 'new-token',
      })

      const client = new MantleCoreClient({
        accessToken: 'valid-token',
        accessTokenExpiresAt: new Date(Date.now() + 3600_000), // expires in 1hr
        refreshAccessToken,
      })

      mockFetch.mockResolvedValueOnce(createMockResponse({ customers: [] }))
      await client.customers.list()

      expect(refreshAccessToken).not.toHaveBeenCalled()
      const request = mockFetch.mock.calls[0][0] as Request
      expect(request.headers.get('Authorization')).toBe('Bearer valid-token')
    })

    it('does not refresh when no expiresAt is set', async () => {
      const refreshAccessToken = vi.fn().mockResolvedValue({
        accessToken: 'new-token',
      })

      const client = new MantleCoreClient({
        accessToken: 'some-token',
        refreshAccessToken,
      })

      mockFetch.mockResolvedValueOnce(createMockResponse({ customers: [] }))
      await client.customers.list()

      expect(refreshAccessToken).not.toHaveBeenCalled()
    })
  })

  describe('reactive refresh (401)', () => {
    it('refreshes and retries on 401', async () => {
      const refreshAccessToken = vi.fn().mockResolvedValue({
        accessToken: 'new-token',
      })

      const client = new MantleCoreClient({
        accessToken: 'stale-token',
        refreshAccessToken,
      })

      // First call from openapi-fetch returns 401, retry via global fetch returns 200
      const retryResponse = createMockResponse({ customers: [] })
      mockFetch
        .mockResolvedValueOnce(createMockResponse({ error: 'expired_token' }, { status: 401 }))
        .mockResolvedValueOnce(retryResponse)

      const result = await client.customers.list()

      expect(refreshAccessToken).toHaveBeenCalledTimes(1)
      // The retry fetch should have the new token
      const retryRequest = mockFetch.mock.calls[1][0] as Request
      expect(retryRequest.headers.get('Authorization')).toBe('Bearer new-token')
    })

    it('does not refresh on invalid_token 401', async () => {
      const refreshAccessToken = vi.fn().mockResolvedValue({
        accessToken: 'new-token',
      })

      const client = new MantleCoreClient({
        accessToken: 'bad-token',
        refreshAccessToken,
      })

      mockFetch.mockResolvedValueOnce(
        createMockResponse({ error: 'invalid_token' }, { status: 401 })
      )

      await expect(client.customers.list()).rejects.toThrow()
      expect(refreshAccessToken).not.toHaveBeenCalled()
    })

    it('does not refresh on invalid_client 401', async () => {
      const refreshAccessToken = vi.fn().mockResolvedValue({
        accessToken: 'new-token',
      })

      const client = new MantleCoreClient({
        accessToken: 'bad-token',
        refreshAccessToken,
      })

      mockFetch.mockResolvedValueOnce(
        createMockResponse({ error: 'invalid_client' }, { status: 401 })
      )

      await expect(client.customers.list()).rejects.toThrow()
      expect(refreshAccessToken).not.toHaveBeenCalled()
    })

    it('does not retry when no refreshAccessToken is configured', async () => {
      const client = new MantleCoreClient({
        accessToken: 'stale-token',
      })

      mockFetch.mockResolvedValueOnce(
        createMockResponse({ error: 'expired_token' }, { status: 401 })
      )

      await expect(client.customers.list()).rejects.toThrow()
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('returns original error when refresh fails', async () => {
      const refreshAccessToken = vi.fn().mockRejectedValue(new Error('Refresh failed'))

      const client = new MantleCoreClient({
        accessToken: 'stale-token',
        refreshAccessToken,
      })

      mockFetch.mockResolvedValueOnce(
        createMockResponse({ error: 'expired_token' }, { status: 401 })
      )

      await expect(client.customers.list()).rejects.toThrow()
      expect(refreshAccessToken).toHaveBeenCalledTimes(1)
      // Should not have retried
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('concurrent refresh deduplication', () => {
    it('deduplicates concurrent refresh calls into a single invocation', async () => {
      let resolveRefresh: (value: { accessToken: string }) => void
      const refreshAccessToken = vi.fn().mockReturnValue(
        new Promise((resolve) => {
          resolveRefresh = resolve
        })
      )

      const client = new MantleCoreClient({
        accessToken: 'expired-token',
        accessTokenExpiresAt: new Date(Date.now() - 60_000),
        refreshAccessToken,
      })

      mockFetch
        .mockResolvedValueOnce(createMockResponse({ customers: [] }))
        .mockResolvedValueOnce(createMockResponse({ contacts: [] }))

      // Fire two concurrent requests — both should trigger preemptive refresh
      const p1 = client.customers.list()
      const p2 = client.contacts.list()

      // Resolve the single refresh
      resolveRefresh!({ accessToken: 'shared-new-token' })

      await Promise.all([p1, p2])

      // refreshAccessToken should only be called once
      expect(refreshAccessToken).toHaveBeenCalledTimes(1)
    })
  })

  describe('expiresAt update', () => {
    it('updates expiresAt from refresh result for subsequent requests', async () => {
      const futureExpiry = new Date(Date.now() + 3600_000)
      const refreshAccessToken = vi
        .fn()
        .mockResolvedValueOnce({ accessToken: 'new-token', expiresAt: futureExpiry })
        .mockResolvedValueOnce({ accessToken: 'should-not-be-called' })

      const client = new MantleCoreClient({
        accessToken: 'expired-token',
        accessTokenExpiresAt: new Date(Date.now() - 60_000),
        refreshAccessToken,
      })

      mockFetch
        .mockResolvedValueOnce(createMockResponse({ customers: [] }))
        .mockResolvedValueOnce(createMockResponse({ customers: [] }))

      // First request triggers refresh
      await client.customers.list()
      expect(refreshAccessToken).toHaveBeenCalledTimes(1)

      // Second request should NOT refresh since expiresAt was updated
      await client.customers.list()
      expect(refreshAccessToken).toHaveBeenCalledTimes(1)
    })
  })
})
