import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getHmacSecret, extractClientIpHash } from '../../api/_lib/rateLimit.js'
import { createDodoCheckout } from '../../api/_lib/dodoPayments.js'
import { getServerPlan } from '../../api/_lib/plans.js'
import type { ApiRequest } from '../../api/_lib/types.js'

describe('Rate Limit HMAC Security & Checkout Hardening', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    vi.restoreAllMocks()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  describe('Rate Limit HMAC Secret Resolution', () => {
    it('uses RATE_LIMIT_HMAC_SECRET when configured', () => {
      process.env.RATE_LIMIT_HMAC_SECRET = 'custom-dedicated-hmac-secret-123'
      expect(getHmacSecret()).toBe('custom-dedicated-hmac-secret-123')
    })

    it('falls back to SUPABASE_SERVICE_ROLE_KEY when RATE_LIMIT_HMAC_SECRET is unset', () => {
      delete process.env.RATE_LIMIT_HMAC_SECRET
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJh...super-long-service-role-key-32-chars-long'
      expect(getHmacSecret()).toBe('eyJh...super-long-service-role-key-32-chars-long')
    })

    it('fails closed and throws error in production when no secure secret is set', () => {
      delete process.env.RATE_LIMIT_HMAC_SECRET
      delete process.env.SUPABASE_SERVICE_ROLE_KEY
      process.env.NODE_ENV = 'production'

      expect(() => getHmacSecret()).toThrow(
        /RATE_LIMIT_HMAC_SECRET or SUPABASE_SERVICE_ROLE_KEY must be configured in production/
      )
    })

    it('allows development fallback in test/development environment', () => {
      delete process.env.RATE_LIMIT_HMAC_SECRET
      delete process.env.SUPABASE_SERVICE_ROLE_KEY
      process.env.NODE_ENV = 'development'
      delete process.env.VERCEL_ENV

      expect(getHmacSecret()).toBe('osmoo_dev_privacy_salt_local')
    })
  })

  describe('Trusted Reverse Proxy Precedence', () => {
    it('prioritizes x-vercel-forwarded-for over x-forwarded-for', () => {
      process.env.RATE_LIMIT_HMAC_SECRET = 'test-secret'
      const req1 = {
        headers: {
          'x-vercel-forwarded-for': '203.0.113.195',
          'x-forwarded-for': '198.51.100.1',
        },
      } as unknown as ApiRequest
      const req2 = {
        headers: {
          'x-vercel-forwarded-for': '203.0.113.195',
        },
      } as unknown as ApiRequest

      expect(extractClientIpHash(req1)).toBe(extractClientIpHash(req2))
    })

    it('prioritizes cf-connecting-ip when present', () => {
      process.env.RATE_LIMIT_HMAC_SECRET = 'test-secret'
      const req1 = {
        headers: {
          'cf-connecting-ip': '198.51.100.77',
          'x-forwarded-for': '10.0.0.1',
        },
      } as unknown as ApiRequest
      const req2 = {
        headers: {
          'cf-connecting-ip': '198.51.100.77',
        },
      } as unknown as ApiRequest

      expect(extractClientIpHash(req1)).toBe(extractClientIpHash(req2))
    })
  })

  describe('Checkout Hardening & Production Safeguards', () => {
    it('fails safely into setupMode in production when product ID uses placeholder prefix', async () => {
      process.env.NODE_ENV = 'production'
      process.env.DODO_PAYMENTS_API_KEY = 'sk_live_valid_production_secret_key_9999'
      delete process.env.DODO_PRO_PRODUCT_ID // plan defaults to 'p_osmoo_pro_monthly'

      const result = await createDodoCheckout({
        planId: 'pro',
        userEmail: 'subscriber@example.com',
      })

      expect(result.success).toBe(false)
      expect(result.setupMode).toBe(true)
      expect(result.error).toContain('Live Dodo Payments product ID is not configured')
    })

    it('reads product IDs dynamically from environment variables', () => {
      process.env.DODO_PRO_PRODUCT_ID = 'prod_live_pro_9999'
      process.env.DODO_MAX_PRODUCT_ID = 'prod_live_max_8888'

      const proPlan = getServerPlan('pro')
      const maxPlan = getServerPlan('max')

      expect(proPlan?.dodoProductId).toBe('prod_live_pro_9999')
      expect(maxPlan?.dodoProductId).toBe('prod_live_max_8888')
    })

    it('rejects checkout for free and enterprise plans appropriately', async () => {
      const freeResult = await createDodoCheckout({ planId: 'free' })
      expect(freeResult.success).toBe(false)
      expect(freeResult.error).toContain('does not require checkout')

      const enterpriseResult = await createDodoCheckout({ planId: 'enterprise' })
      expect(enterpriseResult.success).toBe(false)
      expect(enterpriseResult.error).toContain('does not require checkout')
    })
  })
})
