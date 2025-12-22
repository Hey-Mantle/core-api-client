import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { readdirSync } from 'fs'
import { join } from 'path'
import { MantleCoreClient } from '../src/client'
import {
  MantleAPIError,
  MantleAuthenticationError,
  MantlePermissionError,
  MantleValidationError,
  MantleRateLimitError,
} from '../src/utils/errors'
import * as resources from '../src/resources'

// Mock fetch globally
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function createMockResponse(
  data: unknown,
  options: { status?: number; headers?: Record<string, string> } = {}
) {
  const { status = 200, headers = {} } = options
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers(headers),
    text: vi.fn().mockResolvedValue(JSON.stringify(data)),
  }
}

/**
 * Convert kebab-case filename to PascalCase class name with Resource suffix
 * e.g., "affiliate-commissions.ts" -> "AffiliateCommissionsResource"
 */
function fileNameToClassName(fileName: string): string {
  const baseName = fileName.replace('.ts', '')
  const pascalCase = baseName
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
  return `${pascalCase}Resource`
}

/**
 * Convert PascalCase class name to camelCase property name
 * e.g., "AffiliateCommissionsResource" -> "affiliateCommissions"
 */
function classNameToPropertyName(className: string): string {
  const withoutSuffix = className.replace('Resource', '')
  return withoutSuffix.charAt(0).toLowerCase() + withoutSuffix.slice(1)
}

/**
 * Get all resource files from src/resources directory (excluding base.ts and index.ts)
 */
function getResourceFiles(): string[] {
  const resourcesDir = join(__dirname, '../src/resources')
  return readdirSync(resourcesDir).filter(
    (file) => file.endsWith('.ts') && file !== 'base.ts' && file !== 'index.ts'
  )
}

describe('MantleCoreClient', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('constructor', () => {
    it('throws when neither apiKey nor accessToken is provided', () => {
      expect(() => new MantleCoreClient({} as never)).toThrow(
        'MantleCoreClient requires either apiKey or accessToken'
      )
    })

    it('accepts apiKey', () => {
      const client = new MantleCoreClient({ apiKey: 'test-api-key' })
      expect(client).toBeInstanceOf(MantleCoreClient)
    })

    it('accepts accessToken', () => {
      const client = new MantleCoreClient({ accessToken: 'test-access-token' })
      expect(client).toBeInstanceOf(MantleCoreClient)
    })

    it('initializes all resources', () => {
      const client = new MantleCoreClient({ apiKey: 'test-key' })

      // Get all resource files from the directory (source of truth)
      const resourceFiles = getResourceFiles()

      // Verify we have resource files
      expect(resourceFiles.length).toBeGreaterThan(0)

      // Check each resource file has a corresponding export and client property
      for (const fileName of resourceFiles) {
        const className = fileNameToClassName(fileName)
        const propertyName = classNameToPropertyName(className)

        // Verify the resource class is exported from src/resources/index.ts
        expect(
          (resources as Record<string, unknown>)[className],
          `Resource class ${className} (from ${fileName}) is not exported from src/resources/index.ts`
        ).toBeDefined()

        // Verify the client has a property for this resource
        expect(
          (client as unknown as Record<string, unknown>)[propertyName],
          `Expected client.${propertyName} to be defined for ${className} (from ${fileName})`
        ).toBeDefined()

        // Verify it's an instance of the correct resource class
        expect(
          (client as unknown as Record<string, unknown>)[propertyName],
          `Expected client.${propertyName} to be instance of ${className}`
        ).toBeInstanceOf(
          (resources as Record<string, unknown>)[className] as new (
            ...args: unknown[]
          ) => unknown
        )
      }
    })

    it('uses default baseURL when not provided', async () => {
      const client = new MantleCoreClient({ apiKey: 'test-key' })
      mockFetch.mockResolvedValueOnce(createMockResponse({ data: 'test' }))

      await client.get('/test')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.heymantle.com/v1/test',
        expect.any(Object)
      )
    })

    it('uses custom baseURL when provided', async () => {
      const client = new MantleCoreClient({
        apiKey: 'test-key',
        baseURL: 'https://custom.api.com/v2',
      })
      mockFetch.mockResolvedValueOnce(createMockResponse({ data: 'test' }))

      await client.get('/test')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://custom.api.com/v2/test',
        expect.any(Object)
      )
    })

    it('registers middleware from config', async () => {
      const middleware = vi.fn(async (_ctx, next) => {
        await next()
      })

      const client = new MantleCoreClient({
        apiKey: 'test-key',
        middleware: [middleware],
      })
      mockFetch.mockResolvedValueOnce(createMockResponse({ data: 'test' }))

      await client.get('/test')

      expect(middleware).toHaveBeenCalled()
    })

    it('registers middleware with options from config', async () => {
      const middleware = vi.fn(async (_ctx, next) => {
        await next()
      })

      const client = new MantleCoreClient({
        apiKey: 'test-key',
        middleware: [[middleware, { name: 'test-middleware', priority: 50 }]],
      })
      mockFetch.mockResolvedValueOnce(createMockResponse({ data: 'test' }))

      await client.get('/test')

      expect(middleware).toHaveBeenCalled()
    })
  })

  describe('HTTP methods', () => {
    let client: MantleCoreClient

    beforeEach(() => {
      client = new MantleCoreClient({ apiKey: 'test-key' })
    })

    describe('get', () => {
      it('makes GET request with correct headers', async () => {
        mockFetch.mockResolvedValueOnce(createMockResponse({ data: 'test' }))

        await client.get('/endpoint')

        expect(mockFetch).toHaveBeenCalledWith(
          'https://api.heymantle.com/v1/endpoint',
          expect.objectContaining({
            method: 'GET',
            headers: expect.objectContaining({
              Authorization: 'Bearer test-key',
              'Content-Type': 'application/json',
            }),
          })
        )
      })

      it('appends query string from params', async () => {
        mockFetch.mockResolvedValueOnce(createMockResponse({ data: 'test' }))

        await client.get('/endpoint', { page: 1, limit: 10 })

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('page=1'),
          expect.any(Object)
        )
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('limit=10'),
          expect.any(Object)
        )
      })

      it('filters undefined params', async () => {
        mockFetch.mockResolvedValueOnce(createMockResponse({ data: 'test' }))

        await client.get('/endpoint', { page: 1, filter: undefined })

        const calledUrl = mockFetch.mock.calls[0][0]
        expect(calledUrl).toContain('page=1')
        expect(calledUrl).not.toContain('filter')
      })

      it('returns parsed JSON response', async () => {
        mockFetch.mockResolvedValueOnce(createMockResponse({ result: 'success' }))

        const response = await client.get<{ result: string }>('/endpoint')

        expect(response).toEqual({ result: 'success' })
      })
    })

    describe('post', () => {
      it('makes POST request with JSON body', async () => {
        mockFetch.mockResolvedValueOnce(createMockResponse({ id: '123' }))

        await client.post('/endpoint', { name: 'Test' })

        expect(mockFetch).toHaveBeenCalledWith(
          'https://api.heymantle.com/v1/endpoint',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ name: 'Test' }),
          })
        )
      })

      it('filters undefined values from body', async () => {
        mockFetch.mockResolvedValueOnce(createMockResponse({ id: '123' }))

        await client.post('/endpoint', { name: 'Test', email: undefined })

        const calledBody = mockFetch.mock.calls[0][1].body
        expect(JSON.parse(calledBody)).toEqual({ name: 'Test' })
      })
    })

    describe('put', () => {
      it('makes PUT request with JSON body', async () => {
        mockFetch.mockResolvedValueOnce(createMockResponse({ updated: true }))

        await client.put('/endpoint', { name: 'Updated' })

        expect(mockFetch).toHaveBeenCalledWith(
          'https://api.heymantle.com/v1/endpoint',
          expect.objectContaining({
            method: 'PUT',
            body: JSON.stringify({ name: 'Updated' }),
          })
        )
      })
    })

    describe('delete', () => {
      it('makes DELETE request', async () => {
        mockFetch.mockResolvedValueOnce(createMockResponse({ deleted: true }))

        await client.delete('/endpoint/123')

        expect(mockFetch).toHaveBeenCalledWith(
          'https://api.heymantle.com/v1/endpoint/123',
          expect.objectContaining({
            method: 'DELETE',
          })
        )
      })
    })
  })

  describe('authentication', () => {
    it('uses accessToken when both apiKey and accessToken are provided', async () => {
      const client = new MantleCoreClient({
        apiKey: 'api-key',
        accessToken: 'access-token',
      })
      mockFetch.mockResolvedValueOnce(createMockResponse({}))

      await client.get('/test')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer access-token',
          }),
        })
      )
    })

    it('uses apiKey when accessToken is not provided', async () => {
      const client = new MantleCoreClient({ apiKey: 'api-key' })
      mockFetch.mockResolvedValueOnce(createMockResponse({}))

      await client.get('/test')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer api-key',
          }),
        })
      )
    })

    it('updateAuth updates accessToken', async () => {
      const client = new MantleCoreClient({ apiKey: 'api-key' })
      client.updateAuth({ accessToken: 'new-token' })

      mockFetch.mockResolvedValueOnce(createMockResponse({}))
      await client.get('/test')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer new-token',
          }),
        })
      )
    })

    it('updateAuth updates apiKey', async () => {
      const client = new MantleCoreClient({ apiKey: 'old-key' })
      client.updateAuth({ apiKey: 'new-key' })

      mockFetch.mockResolvedValueOnce(createMockResponse({}))
      await client.get('/test')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer new-key',
          }),
        })
      )
    })
  })

  describe('error handling', () => {
    let client: MantleCoreClient

    beforeEach(() => {
      client = new MantleCoreClient({ apiKey: 'test-key' })
    })

    it('throws MantleAuthenticationError on 401', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: new Headers(),
        text: vi.fn().mockResolvedValue(JSON.stringify({ error: 'Unauthorized' })),
      })

      await expect(client.get('/test')).rejects.toThrow(MantleAuthenticationError)
    })

    it('throws MantlePermissionError on 403', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        headers: new Headers(),
        text: vi.fn().mockResolvedValue(JSON.stringify({ error: 'Forbidden' })),
      })

      await expect(client.get('/test')).rejects.toThrow(MantlePermissionError)
    })

    it('throws MantleAPIError on 404 with status code', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: new Headers(),
        text: vi.fn().mockResolvedValue(JSON.stringify({ error: 'Not found' })),
      })

      try {
        await client.get('/test')
      } catch (error) {
        expect(error).toBeInstanceOf(MantleAPIError)
        expect((error as MantleAPIError).statusCode).toBe(404)
      }
    })

    it('throws MantleValidationError on 422', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        headers: new Headers(),
        text: vi
          .fn()
          .mockResolvedValue(
            JSON.stringify({ error: 'Validation failed', details: 'email is required' })
          ),
      })

      try {
        await client.post('/test', {})
      } catch (error) {
        expect(error).toBeInstanceOf(MantleValidationError)
        expect((error as MantleValidationError).details).toBe('email is required')
      }
    })

    it('throws MantleRateLimitError on 429 with retryAfter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: new Headers({ 'Retry-After': '30' }),
        text: vi.fn().mockResolvedValue(JSON.stringify({ error: 'Rate limited' })),
      })

      try {
        await client.get('/test')
      } catch (error) {
        expect(error).toBeInstanceOf(MantleRateLimitError)
        expect((error as MantleRateLimitError).retryAfter).toBe(30)
      }
    })

    it('throws MantleAPIError on 500', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: new Headers(),
        text: vi.fn().mockResolvedValue(JSON.stringify({ error: 'Internal error' })),
      })

      try {
        await client.get('/test')
      } catch (error) {
        expect(error).toBeInstanceOf(MantleAPIError)
        expect((error as MantleAPIError).statusCode).toBe(500)
      }
    })

    it('throws MantleAPIError with timeout on request timeout', async () => {
      vi.useFakeTimers()
      const client = new MantleCoreClient({ apiKey: 'test-key', timeout: 1000 })

      mockFetch.mockImplementation(
        () =>
          new Promise((_, reject) => {
            setTimeout(() => {
              const error = new Error('Aborted')
              error.name = 'AbortError'
              reject(error)
            }, 2000)
          })
      )

      const promise = client.get('/test')
      vi.advanceTimersByTime(2000)

      try {
        await promise
      } catch (error) {
        expect(error).toBeInstanceOf(MantleAPIError)
        expect((error as MantleAPIError).statusCode).toBe(408)
        expect((error as MantleAPIError).message).toBe('Request timeout')
      }
    })

    it('handles empty error response body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: new Headers(),
        text: vi.fn().mockResolvedValue(''),
      })

      try {
        await client.get('/test')
      } catch (error) {
        expect(error).toBeInstanceOf(MantleAPIError)
        expect((error as MantleAPIError).message).toBe('API request failed: 500')
      }
    })

    it('handles invalid JSON in error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: new Headers(),
        text: vi.fn().mockResolvedValue('not json'),
      })

      try {
        await client.get('/test')
      } catch (error) {
        expect(error).toBeInstanceOf(MantleAPIError)
        expect((error as MantleAPIError).message).toBe('API request failed: 500')
      }
    })
  })

  describe('middleware', () => {
    it('use() returns this for chaining', () => {
      const client = new MantleCoreClient({ apiKey: 'test-key' })
      const result = client.use(async (_ctx, next) => {
        await next()
      })

      expect(result).toBe(client)
    })

    it('middleware receives correct context', async () => {
      const client = new MantleCoreClient({ apiKey: 'test-key' })
      let capturedCtx: unknown

      client.use(async (ctx, next) => {
        capturedCtx = ctx
        await next()
      })

      mockFetch.mockResolvedValueOnce(createMockResponse({ data: 'test' }))
      await client.get('/endpoint')

      expect(capturedCtx).toMatchObject({
        request: expect.objectContaining({
          url: 'https://api.heymantle.com/v1/endpoint',
          method: 'GET',
          endpoint: '/endpoint',
        }),
        retry: false,
        retryCount: 0,
        maxRetries: 3,
      })
    })

    it('middleware can modify request headers', async () => {
      const client = new MantleCoreClient({ apiKey: 'test-key' })

      client.use(async (ctx, next) => {
        ctx.request.headers['X-Custom-Header'] = 'custom-value'
        await next()
      })

      mockFetch.mockResolvedValueOnce(createMockResponse({ data: 'test' }))
      await client.get('/endpoint')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom-Header': 'custom-value',
          }),
        })
      )
    })

    it('removeMiddleware removes by name', async () => {
      const client = new MantleCoreClient({ apiKey: 'test-key' })
      const middleware = vi.fn(async (_ctx, next) => {
        await next()
      })

      client.use(middleware, { name: 'test-mw' })
      const removed = client.removeMiddleware('test-mw')

      expect(removed).toBe(true)

      mockFetch.mockResolvedValueOnce(createMockResponse({ data: 'test' }))
      await client.get('/endpoint')

      expect(middleware).not.toHaveBeenCalled()
    })

    it('removeMiddleware returns false for non-existent middleware', () => {
      const client = new MantleCoreClient({ apiKey: 'test-key' })
      const removed = client.removeMiddleware('non-existent')

      expect(removed).toBe(false)
    })
  })

  describe('empty responses', () => {
    it('handles empty response body', async () => {
      const client = new MantleCoreClient({ apiKey: 'test-key' })
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: new Headers(),
        text: vi.fn().mockResolvedValue(''),
      })

      const response = await client.delete('/endpoint/123')

      expect(response).toEqual({})
    })
  })
})
