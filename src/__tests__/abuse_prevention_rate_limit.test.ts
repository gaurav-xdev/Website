import { describe, it, expect } from 'vitest'
import {
  normalizeIpAddress,
  extractClientIpHash,
  checkRateLimit,
} from '../../api/_lib/rateLimit.js'
import type { ApiRequest } from '../../api/_lib/types.js'

describe('Abuse Prevention, IP Normalization & Graduated Throttling', () => {
  it('normalizes IPv4 and IPv6 addresses correctly', () => {
    expect(normalizeIpAddress('192.168.1.1:8080')).toBe('192.168.1.1')
    expect(normalizeIpAddress('::ffff:192.168.1.1')).toBe('192.168.1.1')
    expect(normalizeIpAddress('[2001:db8::1]')).toBe('2001:db8::1')
    expect(normalizeIpAddress('  10.0.0.1  ')).toBe('10.0.0.1')
  })

  it('produces identical keyed HMAC hashes for equivalent normalized IPs', () => {
    const req1 = {
      headers: { 'x-forwarded-for': '203.0.113.195:443' },
    } as unknown as ApiRequest

    const req2 = {
      headers: { 'x-forwarded-for': '203.0.113.195' },
    } as unknown as ApiRequest

    const hash1 = extractClientIpHash(req1)
    const hash2 = extractClientIpHash(req2)
    expect(hash1).toBe(hash2)
  })

  it('prioritizes trusted verified proxy headers (x-vercel-forwarded-for)', () => {
    const req = {
      headers: {
        'x-vercel-forwarded-for': '198.51.100.22',
        'x-forwarded-for': 'evil-spoofed-ip',
      },
    } as unknown as ApiRequest

    const hash = extractClientIpHash(req)
    const reqExpected = {
      headers: { 'x-forwarded-for': '198.51.100.22' },
    } as unknown as ApiRequest
    const expectedHash = extractClientIpHash(reqExpected)

    expect(hash).toBe(expectedHash)
  })

  it('throttles high-volume claim bursts from a single IP', () => {
    const testKey = 'test_abusive_ip_' + Date.now()
    const options = { windowMs: 1000, maxRequests: 3, prefix: 'abuse_test' }

    // 1st request
    const r1 = checkRateLimit(testKey, options)
    expect(r1.isLimited).toBe(false)
    expect(r1.remaining).toBe(2)

    // 2nd request
    const r2 = checkRateLimit(testKey, options)
    expect(r2.isLimited).toBe(false)
    expect(r2.remaining).toBe(1)

    // 3rd request
    const r3 = checkRateLimit(testKey, options)
    expect(r3.isLimited).toBe(false)
    expect(r3.remaining).toBe(0)

    // 4th request exceeds limit
    const r4 = checkRateLimit(testKey, options)
    expect(r4.isLimited).toBe(true)
    expect(r4.cooldownActive).toBe(true)
    expect(r4.resetInSeconds).toBeGreaterThanOrEqual(1)
  })

  it('does not permanently block legitimate users behind a shared IP after temporary cooldown expires', async () => {
    const sharedIpKey = 'shared_school_ip_' + Date.now()
    const options = { windowMs: 50, maxRequests: 2, prefix: 'shared_net_test' }

    // Exceed limit
    checkRateLimit(sharedIpKey, options)
    checkRateLimit(sharedIpKey, options)
    const blocked = checkRateLimit(sharedIpKey, options)
    expect(blocked.isLimited).toBe(true)

    // Wait for temporary cooldown window to elapse
    await new Promise((resolve) => setTimeout(resolve, 60))

    // New request from another user behind same NAT/Wi-Fi succeeds
    const recovered = checkRateLimit(sharedIpKey, options)
    expect(recovered.isLimited).toBe(false)
  })
})
