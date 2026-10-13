import { describe, it, expect } from 'vitest'
import { earlyAccessSchema, contactSchema, checkoutSchema } from '../../api/_lib/validation.js'

describe('API Validation Schemas (Zod)', () => {
  describe('Early Access Schema', () => {
    it('accepts valid email', () => {
      const res = earlyAccessSchema.safeParse({ email: 'developer@osmoo.in' })
      expect(res.success).toBe(true)
      if (res.success) {
        expect(res.data.email).toBe('developer@osmoo.in')
        expect(res.data.source).toBe('website_waitlist_modal')
      }
    })

    it('accepts valid email with optional firstName', () => {
      const res = earlyAccessSchema.safeParse({
        email: 'alex@osmoo.in',
        firstName: 'Alex',
      })
      expect(res.success).toBe(true)
      if (res.success) {
        expect(res.data.email).toBe('alex@osmoo.in')
        expect(res.data.firstName).toBe('Alex')
      }
    })

    it('trims and lowercases emails', () => {
      const res = earlyAccessSchema.safeParse({ email: '  ALEX@DOMAIN.COM  ' })
      expect(res.success).toBe(true)
      if (res.success) {
        expect(res.data.email).toBe('alex@domain.com')
      }
    })

    it('rejects invalid email formats', () => {
      const invalid = ['not-an-email', 'user@', '@domain.com', '', 'user@domain..com']
      for (const email of invalid) {
        const res = earlyAccessSchema.safeParse({ email })
        expect(res.success).toBe(false)
      }
    })

    it('rejects oversized email inputs', () => {
      const hugeEmail = `${'a'.repeat(250)}@example.com`
      const res = earlyAccessSchema.safeParse({ email: hugeEmail })
      expect(res.success).toBe(false)
    })
  })

  describe('Contact Message Schema', () => {
    it('accepts valid contact submission', () => {
      const valid = {
        name: 'Dr. Jordan Vance',
        email: 'jordan@osmiora.com',
        category: 'Enterprise Pilot',
        message: 'We are requesting dedicated on-premise neural engine cluster deployment details.',
      }
      const res = contactSchema.safeParse(valid)
      expect(res.success).toBe(true)
    })

    it('rejects submissions with missing or short names', () => {
      const res = contactSchema.safeParse({
        name: 'A',
        email: 'user@domain.com',
        category: 'General',
        message: 'This is a message with sufficient characters.',
      })
      expect(res.success).toBe(false)
    })

    it('rejects too short messages (< 10 chars)', () => {
      const res = contactSchema.safeParse({
        name: 'Valid Name',
        email: 'user@domain.com',
        category: 'General',
        message: 'Short',
      })
      expect(res.success).toBe(false)
    })

    it('rejects oversized payloads (> 4000 chars)', () => {
      const res = contactSchema.safeParse({
        name: 'Valid Name',
        email: 'user@domain.com',
        category: 'General',
        message: 'x'.repeat(4001),
      })
      expect(res.success).toBe(false)
    })
  })

  describe('Checkout Schema', () => {
    it('accepts valid plans', () => {
      const plans = ['free', 'pro', 'max', 'enterprise'] as const
      for (const planId of plans) {
        const res = checkoutSchema.safeParse({ planId, billingInterval: 'month' })
        expect(res.success).toBe(true)
      }
    })

    it('defaults interval to month when omitted', () => {
      const res = checkoutSchema.safeParse({ planId: 'pro' })
      expect(res.success).toBe(true)
      if (res.success) {
        expect(res.data.billingInterval).toBe('month')
      }
    })

    it('rejects unauthorized or arbitrary plan strings', () => {
      const res = checkoutSchema.safeParse({ planId: 'super_vip_discount' })
      expect(res.success).toBe(false)
    })
  })
})
