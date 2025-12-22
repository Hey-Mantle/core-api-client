import { describe, it, expect } from 'vitest'
import {
  MantleAPIError,
  MantleAuthenticationError,
  MantlePermissionError,
  MantleNotFoundError,
  MantleValidationError,
  MantleRateLimitError,
} from '../../src/utils/errors'

describe('MantleAPIError', () => {
  it('sets message, statusCode, and details', () => {
    const error = new MantleAPIError('Something went wrong', 500, 'Details here')

    expect(error.message).toBe('Something went wrong')
    expect(error.statusCode).toBe(500)
    expect(error.details).toBe('Details here')
    expect(error.name).toBe('MantleAPIError')
  })

  it('works without details', () => {
    const error = new MantleAPIError('Error', 400)

    expect(error.statusCode).toBe(400)
    expect(error.details).toBeUndefined()
  })

  it('is instanceof Error', () => {
    const error = new MantleAPIError('Error', 500)

    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(MantleAPIError)
  })

  describe('fromResponse', () => {
    it('creates error from response object', () => {
      const response = { error: 'Bad request', details: 'Invalid field' }
      const error = MantleAPIError.fromResponse(response, 400)

      expect(error.message).toBe('Bad request')
      expect(error.statusCode).toBe(400)
      expect(error.details).toBe('Invalid field')
    })

    it('creates error without details', () => {
      const response = { error: 'Not found' }
      const error = MantleAPIError.fromResponse(response, 404)

      expect(error.message).toBe('Not found')
      expect(error.details).toBeUndefined()
    })
  })
})

describe('MantleAuthenticationError', () => {
  it('defaults to 401 status code', () => {
    const error = new MantleAuthenticationError()

    expect(error.statusCode).toBe(401)
    expect(error.name).toBe('MantleAuthenticationError')
  })

  it('uses default message when none provided', () => {
    const error = new MantleAuthenticationError()

    expect(error.message).toBe('Authentication failed')
  })

  it('accepts custom message', () => {
    const error = new MantleAuthenticationError('Invalid token')

    expect(error.message).toBe('Invalid token')
  })

  it('is instanceof MantleAPIError', () => {
    const error = new MantleAuthenticationError()

    expect(error).toBeInstanceOf(MantleAPIError)
    expect(error).toBeInstanceOf(MantleAuthenticationError)
  })
})

describe('MantlePermissionError', () => {
  it('defaults to 403 status code', () => {
    const error = new MantlePermissionError()

    expect(error.statusCode).toBe(403)
    expect(error.name).toBe('MantlePermissionError')
  })

  it('uses default message when none provided', () => {
    const error = new MantlePermissionError()

    expect(error.message).toBe('Permission denied')
  })

  it('accepts custom message', () => {
    const error = new MantlePermissionError('Admin only')

    expect(error.message).toBe('Admin only')
  })

  it('is instanceof MantleAPIError', () => {
    const error = new MantlePermissionError()

    expect(error).toBeInstanceOf(MantleAPIError)
    expect(error).toBeInstanceOf(MantlePermissionError)
  })
})

describe('MantleNotFoundError', () => {
  it('defaults to 404 status code', () => {
    const error = new MantleNotFoundError('Customer', '123')

    expect(error.statusCode).toBe(404)
    expect(error.name).toBe('MantleNotFoundError')
  })

  it('formats message with resource and id', () => {
    const error = new MantleNotFoundError('Customer', 'cust_abc123')

    expect(error.message).toBe("Customer with id 'cust_abc123' not found")
  })

  it('is instanceof MantleAPIError', () => {
    const error = new MantleNotFoundError('Deal', '456')

    expect(error).toBeInstanceOf(MantleAPIError)
    expect(error).toBeInstanceOf(MantleNotFoundError)
  })
})

describe('MantleValidationError', () => {
  it('defaults to 422 status code', () => {
    const error = new MantleValidationError('Invalid input')

    expect(error.statusCode).toBe(422)
    expect(error.name).toBe('MantleValidationError')
  })

  it('stores validation details', () => {
    const error = new MantleValidationError('Validation failed', 'email: invalid format')

    expect(error.message).toBe('Validation failed')
    expect(error.details).toBe('email: invalid format')
  })

  it('works without details', () => {
    const error = new MantleValidationError('Invalid')

    expect(error.details).toBeUndefined()
  })

  it('is instanceof MantleAPIError', () => {
    const error = new MantleValidationError('Error')

    expect(error).toBeInstanceOf(MantleAPIError)
    expect(error).toBeInstanceOf(MantleValidationError)
  })
})

describe('MantleRateLimitError', () => {
  it('defaults to 429 status code', () => {
    const error = new MantleRateLimitError()

    expect(error.statusCode).toBe(429)
    expect(error.name).toBe('MantleRateLimitError')
  })

  it('uses default message when none provided', () => {
    const error = new MantleRateLimitError()

    expect(error.message).toBe('Rate limit exceeded')
  })

  it('accepts custom message', () => {
    const error = new MantleRateLimitError('Too many requests')

    expect(error.message).toBe('Too many requests')
  })

  it('stores retryAfter value', () => {
    const error = new MantleRateLimitError('Rate limited', 30)

    expect(error.retryAfter).toBe(30)
  })

  it('works without retryAfter', () => {
    const error = new MantleRateLimitError()

    expect(error.retryAfter).toBeUndefined()
  })

  it('is instanceof MantleAPIError', () => {
    const error = new MantleRateLimitError()

    expect(error).toBeInstanceOf(MantleAPIError)
    expect(error).toBeInstanceOf(MantleRateLimitError)
  })
})

describe('error instanceof checks across hierarchy', () => {
  it('can differentiate error types with instanceof', () => {
    const authError = new MantleAuthenticationError()
    const permError = new MantlePermissionError()
    const notFoundError = new MantleNotFoundError('User', '1')
    const validationError = new MantleValidationError('Invalid')
    const rateLimitError = new MantleRateLimitError()

    // Each error is only instanceof its own class (besides parents)
    expect(authError).toBeInstanceOf(MantleAuthenticationError)
    expect(authError).not.toBeInstanceOf(MantlePermissionError)

    expect(permError).toBeInstanceOf(MantlePermissionError)
    expect(permError).not.toBeInstanceOf(MantleAuthenticationError)

    expect(notFoundError).toBeInstanceOf(MantleNotFoundError)
    expect(notFoundError).not.toBeInstanceOf(MantleValidationError)

    expect(validationError).toBeInstanceOf(MantleValidationError)
    expect(validationError).not.toBeInstanceOf(MantleRateLimitError)

    expect(rateLimitError).toBeInstanceOf(MantleRateLimitError)
    expect(rateLimitError).not.toBeInstanceOf(MantleNotFoundError)

    // All are instances of MantleAPIError
    expect(authError).toBeInstanceOf(MantleAPIError)
    expect(permError).toBeInstanceOf(MantleAPIError)
    expect(notFoundError).toBeInstanceOf(MantleAPIError)
    expect(validationError).toBeInstanceOf(MantleAPIError)
    expect(rateLimitError).toBeInstanceOf(MantleAPIError)
  })
})
