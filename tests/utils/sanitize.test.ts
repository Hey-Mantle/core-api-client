import { describe, it, expect } from 'vitest'
import { sanitizeObject, toQueryString } from '../../src/utils/sanitize'

describe('sanitizeObject', () => {
  it('removes undefined values', () => {
    const input = { a: 1, b: undefined, c: 'hello' }
    const result = sanitizeObject(input)

    expect(result).toEqual({ a: 1, c: 'hello' })
    expect('b' in result).toBe(false)
  })

  it('keeps null values', () => {
    const input = { a: 1, b: null }
    const result = sanitizeObject(input)

    expect(result).toEqual({ a: 1, b: null })
  })

  it('keeps false values', () => {
    const input = { a: true, b: false }
    const result = sanitizeObject(input)

    expect(result).toEqual({ a: true, b: false })
  })

  it('keeps zero values', () => {
    const input = { a: 1, b: 0 }
    const result = sanitizeObject(input)

    expect(result).toEqual({ a: 1, b: 0 })
  })

  it('keeps empty string values', () => {
    const input = { a: 'hello', b: '' }
    const result = sanitizeObject(input)

    expect(result).toEqual({ a: 'hello', b: '' })
  })

  it('handles empty object', () => {
    const result = sanitizeObject({})

    expect(result).toEqual({})
  })

  it('handles object with only undefined values', () => {
    const input = { a: undefined, b: undefined }
    const result = sanitizeObject(input)

    expect(result).toEqual({})
  })

  it('preserves arrays', () => {
    const input = { tags: ['a', 'b'], empty: undefined }
    const result = sanitizeObject(input)

    expect(result).toEqual({ tags: ['a', 'b'] })
  })

  it('preserves nested objects', () => {
    const input = { data: { nested: 'value' }, empty: undefined }
    const result = sanitizeObject(input)

    expect(result).toEqual({ data: { nested: 'value' } })
  })

  it('returns non-object inputs as-is', () => {
    // @ts-expect-error - testing edge case
    expect(sanitizeObject(null)).toBe(null)
    // @ts-expect-error - testing edge case
    expect(sanitizeObject(undefined)).toBe(undefined)
  })
})

describe('toQueryString', () => {
  it('converts simple object to query string', () => {
    const result = toQueryString({ page: 1, limit: 10 })

    expect(result).toBe('page=1&limit=10')
  })

  it('handles string values', () => {
    const result = toQueryString({ search: 'hello world' })

    expect(result).toBe('search=hello+world')
  })

  it('handles boolean values', () => {
    const result = toQueryString({ active: true, deleted: false })

    expect(result).toBe('active=true&deleted=false')
  })

  it('handles array values with comma-separated values', () => {
    const result = toQueryString({ tags: ['a', 'b', 'c'] })

    // Arrays are joined with commas (URL-encoded as %2C)
    expect(result).toBe('tags=a%2Cb%2Cc')
  })

  it('filters out undefined values', () => {
    const result = toQueryString({ a: 1, b: undefined, c: 3 })

    expect(result).toBe('a=1&c=3')
  })

  it('filters out null values', () => {
    const result = toQueryString({ a: 1, b: null, c: 3 })

    expect(result).toBe('a=1&c=3')
  })

  it('returns empty string for empty object', () => {
    const result = toQueryString({})

    expect(result).toBe('')
  })

  it('returns empty string when all values are undefined', () => {
    const result = toQueryString({ a: undefined, b: undefined })

    expect(result).toBe('')
  })

  it('URL encodes special characters', () => {
    const result = toQueryString({ query: 'a=b&c=d' })

    expect(result).toBe('query=a%3Db%26c%3Dd')
  })

  it('handles numeric zero values', () => {
    const result = toQueryString({ offset: 0 })

    expect(result).toBe('offset=0')
  })

  it('handles empty string values', () => {
    const result = toQueryString({ filter: '' })

    expect(result).toBe('filter=')
  })

  it('converts objects to string representation', () => {
    const result = toQueryString({ obj: { key: 'value' } })

    expect(result).toBe('obj=%5Bobject+Object%5D')
  })
})
