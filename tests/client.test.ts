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

    it('registers middleware from config', async () => {
      let onRequestCalled = false

      const client = new MantleCoreClient({
        apiKey: 'test-key',
        middleware: [
          {
            onRequest({ request }) {
              onRequestCalled = true
              return request
            },
          },
        ],
      })

      mockFetch.mockResolvedValueOnce(createMockResponse({ customers: [] }))
      await client.customers.list()

      expect(onRequestCalled).toBe(true)
    })
  })

  describe('authentication', () => {
    it('sends Authorization header with apiKey', async () => {
      const client = new MantleCoreClient({ apiKey: 'test-api-key' })
      mockFetch.mockResolvedValueOnce(createMockResponse({ customers: [] }))

      await client.customers.list()

      const request = mockFetch.mock.calls[0][0] as Request
      expect(request.headers.get('Authorization')).toBe('Bearer test-api-key')
    })

    it('sends Authorization header with accessToken', async () => {
      const client = new MantleCoreClient({ accessToken: 'test-access-token' })
      mockFetch.mockResolvedValueOnce(createMockResponse({ customers: [] }))

      await client.customers.list()

      const request = mockFetch.mock.calls[0][0] as Request
      expect(request.headers.get('Authorization')).toBe(
        'Bearer test-access-token'
      )
    })

    it('prefers accessToken over apiKey', async () => {
      const client = new MantleCoreClient({
        apiKey: 'api-key',
        accessToken: 'access-token',
      })
      mockFetch.mockResolvedValueOnce(createMockResponse({ customers: [] }))

      await client.customers.list()

      const request = mockFetch.mock.calls[0][0] as Request
      expect(request.headers.get('Authorization')).toBe('Bearer access-token')
    })

    it('updateAuth updates accessToken', async () => {
      const client = new MantleCoreClient({ apiKey: 'old-key' })
      client.updateAuth({ accessToken: 'new-token' })

      mockFetch.mockResolvedValueOnce(createMockResponse({ customers: [] }))
      await client.customers.list()

      const request = mockFetch.mock.calls[0][0] as Request
      expect(request.headers.get('Authorization')).toBe('Bearer new-token')
    })

    it('updateAuth updates apiKey', async () => {
      const client = new MantleCoreClient({ apiKey: 'old-key' })
      client.updateAuth({ apiKey: 'new-key' })

      mockFetch.mockResolvedValueOnce(createMockResponse({ customers: [] }))
      await client.customers.list()

      const request = mockFetch.mock.calls[0][0] as Request
      expect(request.headers.get('Authorization')).toBe('Bearer new-key')
    })
  })

  describe('requests', () => {
    it('uses default baseURL', async () => {
      const client = new MantleCoreClient({ apiKey: 'test-key' })
      mockFetch.mockResolvedValueOnce(createMockResponse({ customers: [] }))

      await client.customers.list()

      const request = mockFetch.mock.calls[0][0] as Request
      expect(request.url).toContain('https://api.heymantle.com/v1')
    })

    it('uses custom baseURL', async () => {
      const client = new MantleCoreClient({
        apiKey: 'test-key',
        baseURL: 'https://custom.api.com/v2',
      })
      mockFetch.mockResolvedValueOnce(createMockResponse({ customers: [] }))

      await client.customers.list()

      const request = mockFetch.mock.calls[0][0] as Request
      expect(request.url).toContain('https://custom.api.com/v2')
    })

    it('sends Content-Type header', async () => {
      const client = new MantleCoreClient({ apiKey: 'test-key' })
      mockFetch.mockResolvedValueOnce(createMockResponse({ customers: [] }))

      await client.customers.list()

      const request = mockFetch.mock.calls[0][0] as Request
      expect(request.headers.get('Content-Type')).toBe('application/json')
    })
  })

  describe('error handling', () => {
    let client: MantleCoreClient

    beforeEach(() => {
      client = new MantleCoreClient({ apiKey: 'test-key' })
    })

    it('throws MantleAuthenticationError on 401', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ error: 'Unauthorized' }, { status: 401 })
      )

      await expect(client.customers.list()).rejects.toThrow(
        MantleAuthenticationError
      )
    })

    it('throws MantlePermissionError on 403', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ error: 'Forbidden' }, { status: 403 })
      )

      await expect(client.customers.list()).rejects.toThrow(
        MantlePermissionError
      )
    })

    it('throws MantleAPIError on 404 with status code', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ error: 'Not found' }, { status: 404 })
      )

      try {
        await client.customers.list()
      } catch (error) {
        expect(error).toBeInstanceOf(MantleAPIError)
        expect((error as MantleAPIError).statusCode).toBe(404)
      }
    })

    it('throws MantleValidationError on 422', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse(
          { error: 'Validation failed', details: 'email is required' },
          { status: 422 }
        )
      )

      try {
        await client.customers.create({ name: 'Test' } as never)
      } catch (error) {
        expect(error).toBeInstanceOf(MantleValidationError)
        expect((error as MantleValidationError).details).toBe(
          'email is required'
        )
      }
    })

    it('throws MantleRateLimitError on 429 with retryAfter', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse(
          { error: 'Rate limited' },
          { status: 429, headers: { 'Retry-After': '30' } }
        )
      )

      try {
        await client.customers.list()
      } catch (error) {
        expect(error).toBeInstanceOf(MantleRateLimitError)
        expect((error as MantleRateLimitError).retryAfter).toBe(30)
      }
    })

    it('throws MantleAPIError on 500', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ error: 'Internal error' }, { status: 500 })
      )

      try {
        await client.customers.list()
      } catch (error) {
        expect(error).toBeInstanceOf(MantleAPIError)
        expect((error as MantleAPIError).statusCode).toBe(500)
      }
    })
  })

  describe('middleware', () => {
    it('use() returns this for chaining', () => {
      const client = new MantleCoreClient({ apiKey: 'test-key' })
      const result = client.use({
        onRequest({ request }) {
          return request
        },
      })

      expect(result).toBe(client)
    })

    it('middleware onRequest receives the request', async () => {
      const client = new MantleCoreClient({ apiKey: 'test-key' })
      let capturedRequest: Request | undefined

      client.use({
        onRequest({ request }) {
          capturedRequest = request
          return request
        },
      })

      mockFetch.mockResolvedValueOnce(createMockResponse({ customers: [] }))
      await client.customers.list()

      expect(capturedRequest).toBeDefined()
      expect(capturedRequest!.url).toContain('/customers')
      expect(capturedRequest!.method).toBe('GET')
    })

    it('middleware can modify request headers', async () => {
      const client = new MantleCoreClient({ apiKey: 'test-key' })

      client.use({
        onRequest({ request }) {
          request.headers.set('X-Custom-Header', 'custom-value')
          return request
        },
      })

      mockFetch.mockResolvedValueOnce(createMockResponse({ customers: [] }))
      await client.customers.list()

      const request = mockFetch.mock.calls[0][0] as Request
      expect(request.headers.get('X-Custom-Header')).toBe('custom-value')
    })

    it('middleware onResponse receives the response', async () => {
      const client = new MantleCoreClient({ apiKey: 'test-key' })
      let capturedStatus: number | undefined

      client.use({
        onResponse({ response }) {
          capturedStatus = response.status
          return undefined
        },
      })

      mockFetch.mockResolvedValueOnce(createMockResponse({ customers: [] }))
      await client.customers.list()

      expect(capturedStatus).toBe(200)
    })

    it('eject() removes middleware', async () => {
      const client = new MantleCoreClient({ apiKey: 'test-key' })
      let callCount = 0

      const mw = {
        onRequest({ request }: { request: Request }) {
          callCount++
          return request
        },
      }

      client.use(mw)
      client.eject(mw)

      mockFetch.mockResolvedValueOnce(createMockResponse({ customers: [] }))
      await client.customers.list()

      expect(callCount).toBe(0)
    })
  })
})
