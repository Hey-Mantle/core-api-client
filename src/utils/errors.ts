/**
 * Base error class for Mantle API errors
 */
export class MantleAPIError extends Error {
  public readonly statusCode: number;
  public readonly details?: string;

  constructor(message: string, statusCode: number, details?: string) {
    super(message);
    this.name = 'MantleAPIError';
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, MantleAPIError.prototype);
  }

  static fromResponse(
    response: { error: string; details?: string },
    statusCode: number
  ): MantleAPIError {
    return new MantleAPIError(response.error, statusCode, response.details);
  }
}

/**
 * Authentication failed (401)
 */
export class MantleAuthenticationError extends MantleAPIError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401);
    this.name = 'MantleAuthenticationError';
    Object.setPrototypeOf(this, MantleAuthenticationError.prototype);
  }
}

/**
 * Permission denied (403)
 */
export class MantlePermissionError extends MantleAPIError {
  constructor(message: string = 'Permission denied') {
    super(message, 403);
    this.name = 'MantlePermissionError';
    Object.setPrototypeOf(this, MantlePermissionError.prototype);
  }
}

/**
 * Resource not found (404)
 */
export class MantleNotFoundError extends MantleAPIError {
  constructor(resource: string, id: string) {
    super(`${resource} with id '${id}' not found`, 404);
    this.name = 'MantleNotFoundError';
    Object.setPrototypeOf(this, MantleNotFoundError.prototype);
  }
}

/**
 * Validation error (422)
 */
export class MantleValidationError extends MantleAPIError {
  constructor(message: string, details?: string) {
    super(message, 422, details);
    this.name = 'MantleValidationError';
    Object.setPrototypeOf(this, MantleValidationError.prototype);
  }
}

/**
 * Rate limit exceeded (429)
 */
export class MantleRateLimitError extends MantleAPIError {
  public readonly retryAfter?: number;

  constructor(message: string = 'Rate limit exceeded', retryAfter?: number) {
    super(message, 429);
    this.name = 'MantleRateLimitError';
    this.retryAfter = retryAfter;
    Object.setPrototypeOf(this, MantleRateLimitError.prototype);
  }
}
