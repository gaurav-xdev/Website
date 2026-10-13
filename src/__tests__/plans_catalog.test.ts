import { describe, it, expect } from 'vitest'
import { OSMOO_PLANS, getPlan } from '../lib/plans.js'
import { SERVER_PLANS, getServerPlan } from '../../api/_lib/plans.js'

describe('Plans Catalog & Single Source of Truth', () => {
  it('defines all required tiers: free, pro, max, enterprise', () => {
    const required = ['free', 'pro', 'max', 'enterprise']
    for (const id of required) {
      expect(OSMOO_PLANS[id]).toBeDefined()
      expect(SERVER_PLANS[id]).toBeDefined()
    }
  })

  it('guarantees price and interval parity between frontend and backend', () => {
    expect(OSMOO_PLANS.free.priceCents).toBe(0)
    expect(SERVER_PLANS.free.priceCents).toBe(0)

    expect(OSMOO_PLANS.pro.priceCents).toBe(2400)
    expect(SERVER_PLANS.pro.priceCents).toBe(2400)

    expect(OSMOO_PLANS.max.priceCents).toBe(4900)
    expect(SERVER_PLANS.max.priceCents).toBe(4900)

    expect(OSMOO_PLANS.free.requiresCheckout).toBe(false)
    expect(SERVER_PLANS.free.requiresCheckout).toBe(false)

    expect(OSMOO_PLANS.pro.requiresCheckout).toBe(true)
    expect(SERVER_PLANS.pro.requiresCheckout).toBe(true)
  })

  it('lookup functions handle case-insensitivity safely', () => {
    expect(getPlan('PRO')?.id).toBe('pro')
    expect(getServerPlan('Max')?.id).toBe('max')
    expect(getServerPlan('nonexistent')).toBeUndefined()
  })
})
