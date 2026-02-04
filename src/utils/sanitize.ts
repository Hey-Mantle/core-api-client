/**
 * Removes undefined values from an object to prevent sending
 * undefined parameters in API requests
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T
): Partial<T> {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const sanitized: Partial<T> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      sanitized[key as keyof T] = value as T[keyof T];
    }
  }
  return sanitized;
}

/**
 * Converts parameters object to URLSearchParams string,
 * handling arrays and nested objects
 */
export function toQueryString(params: Record<string, unknown>): string {
  const sanitized = sanitizeObject(params);
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(sanitized)) {
    if (Array.isArray(value)) {
      // Join array values with commas (e.g., stage=lead,closed_won)
      if (value.length > 0) {
        searchParams.append(key, value.map(String).join(','));
      }
    } else if (value !== null && value !== undefined) {
      searchParams.append(key, String(value));
    }
  }

  return searchParams.toString();
}
