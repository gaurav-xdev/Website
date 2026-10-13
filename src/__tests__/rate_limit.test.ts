import { describe, it, expect } from 'vitest'
import { checkRateLimit, extractClientIpHash } from '../../api/_lib/rateLimit.js'
import type { ApiRequest } from '../../api/_lib/types.js'

describe('Rate Limiting & IP Hashing Utility', () => {
  it('extracts and hashes client IP reliably', () => {
    const mockReq = {
      headers: {
        'x-forwarded-for': '203.0.113.195, 198.51.100.1',
      },
    } as unknown as ApiRequest

    const hash = extractClientIpHash(mockReq)
    expect(hash).toHaveLength(32)
    expect(/^[0-9a-f]+$/.test(hash)).toBe(true)

    // Repeated call produces identical hash
    expect(extractClientIpHash(mockReq)).toBe(hash)
  })

  it('enforces limit after quota is exceeded', () => {
    const testKey = `test-ip-${Date.now()}`
    const options = { windowMs: 10_000, maxRequests: 3, prefix: 'test_limit' }

    const r1 = checkRateLimit(testKey, options)
    expect(r1.isLimited).toBe(false)
    expect(r1.remaining).toBe(2)

    const r2 = checkRateLimit(testKey, options)
    expect(r2.isLimited).toBe(false)
    expect(r2.remaining).toBe(1)

    const r3 = checkRateLimit(testKey, options)
    expect(r3.isLimited).toBe(false)
    expect(r3.remaining).toBe(0)

    // 4th request must be rate-limited
    const r4 = checkRateLimit(testKey, options)
    expect(r4.isLimited).toBe(true)
    expect(r4.remaining).toBe(0)
    expect(r4.resetInSeconds).toBeGreaterThan(0)
  })
})
