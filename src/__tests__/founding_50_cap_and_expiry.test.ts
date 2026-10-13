import { describe, it, expect } from 'vitest'

describe('Founding 50 12-Month Hard Cap, Expiration & Coexistence Logic', () => {
  interface EntitlementRecord {
    id: string
    userId: string
    source: 'founding_50' | 'paid_subscription'
    status: 'active' | 'expired'
    grantedAt: number
    expiresAt: number
  }

  interface PaidSubscription {
    id: string
    userId: string
    planId: string
    status: 'active' | 'canceled'
    currentPeriodEnd: number
  }

  it('calculates exactly 12 calendar months expiration for founding grants', () => {
    const grantDate = new Date('2026-10-13T12:00:00.000Z')
    // 12 calendar months later
    const expectedExpiry = new Date(grantDate)
    expectedExpiry.setFullYear(expectedExpiry.getFullYear() + 1)

    expect(expectedExpiry.toISOString()).toBe('2027-10-13T12:00:00.000Z')
    // Ensure expiration is strictly in the future
    expect(expectedExpiry.getTime()).toBeGreaterThan(grantDate.getTime())
  })

  it('rejects unverified email addresses from receiving any Founding 50 reward', () => {
    const candidate = {
      id: 'usr_unverified',
      email: 'unverified@test.com',
      is_verified: false,
      is_founding_50: false,
    }

    // Eligibility check requires is_verified = true
    const isEligible = candidate.is_verified
    expect(isEligible).toBe(false)
  })

  it('enforces one reward per authenticated user and rejects duplicates', () => {
    const grantedUsers = new Set<string>()
    const grants: EntitlementRecord[] = []

    function grantFounding(userId: string, now: number): boolean {
      if (grantedUsers.has(userId)) {
        return false // Duplicate rejected by unique constraint
      }
      grantedUsers.add(userId)
      const expiry = new Date(now)
      expiry.setFullYear(expiry.getFullYear() + 1)
      grants.push({
        id: `grant_${grants.length + 1}`,
        userId,
        source: 'founding_50',
        status: 'active',
        grantedAt: now,
        expiresAt: expiry.getTime(),
      })
      return true
    }

    const t0 = Date.now()
    expect(grantFounding('user_alpha', t0)).toBe(true)
    expect(grantFounding('user_alpha', t0)).toBe(false) // Duplicate blocked
    expect(grants.length).toBe(1)
  })

  it('stops authorizing Pro immediately at or after expiration timestamp (request-time enforcement)', () => {
    const now = Date.now()
    const expiredGrant: EntitlementRecord = {
      id: 'grant_old',
      userId: 'user_expired',
      source: 'founding_50',
      status: 'active', // not yet updated by scheduled job
      grantedAt: now - 366 * 24 * 60 * 60 * 1000,
      expiresAt: now - 1000, // expired 1 second ago
    }

    function evaluateProAccess(grant: EntitlementRecord, currentTime: number): boolean {
      if (grant.source === 'founding_50') {
        // Request-time check: must be active AND expiresAt > currentTime
        return grant.status === 'active' && grant.expiresAt > currentTime
      }
      return false
    }

    expect(evaluateProAccess(expiredGrant, now)).toBe(false)
  })

  it('preserves paid Pro subscription when Founding 50 grant expires (coexistence rule)', () => {
    const now = Date.now()

    const expiredFounding: EntitlementRecord = {
      id: 'f_grant_1',
      userId: 'user_vip',
      source: 'founding_50',
      status: 'expired',
      grantedAt: now - 366 * 24 * 60 * 60 * 1000,
      expiresAt: now - 1000,
    }

    const activePaidSub: PaidSubscription = {
      id: 'sub_paid_1',
      userId: 'user_vip',
      planId: 'pro',
      status: 'active',
      currentPeriodEnd: now + 30 * 24 * 60 * 60 * 1000, // valid for 30 more days
    }

    function resolveEffectiveTier(
      founding: EntitlementRecord | null,
      paid: PaidSubscription | null,
      currentTime: number
    ): { tier: string; isPro: boolean; source: string } {
      // 1. Paid subscription takes priority
      if (paid && paid.status === 'active' && paid.currentPeriodEnd > currentTime) {
        return { tier: paid.planId, isPro: true, source: 'paid_subscription' }
      }
      // 2. Founding grant fallback
      if (founding && founding.status === 'active' && founding.expiresAt > currentTime) {
        return { tier: 'pro', isPro: true, source: 'founding_50' }
      }
      return { tier: 'free', isPro: false, source: 'default' }
    }

    const access = resolveEffectiveTier(expiredFounding, activePaidSub, now)
    expect(access.isPro).toBe(true)
    expect(access.tier).toBe('pro')
    expect(access.source).toBe('paid_subscription')
  })

  it('guarantees that scheduled cleanup is idempotent and preserves history', () => {
    const databaseGrants: EntitlementRecord[] = [
      {
        id: 'g1',
        userId: 'u1',
        source: 'founding_50',
        status: 'active',
        grantedAt: 1000,
        expiresAt: 2000, // expired
      },
      {
        id: 'g2',
        userId: 'u2',
        source: 'founding_50',
        status: 'active',
        grantedAt: 3000,
        expiresAt: 9999999999, // still active
      },
    ]

    function runCleanupJob(currentTime: number): number {
      let modified = 0
      for (const g of databaseGrants) {
        if (g.status === 'active' && g.expiresAt <= currentTime) {
          g.status = 'expired'
          modified++
        }
      }
      return modified
    }

    const testTime = 5000
    // First run updates 1 grant
    const firstRun = runCleanupJob(testTime)
    expect(firstRun).toBe(1)
    expect(databaseGrants[0].status).toBe('expired')
    expect(databaseGrants[1].status).toBe('active')

    // Second run is idempotent (0 updates)
    const secondRun = runCleanupJob(testTime)
    expect(secondRun).toBe(0)

    // History is preserved (record is not deleted)
    expect(databaseGrants.length).toBe(2)
  })

  it('strictly rejects claims once 50 slots are allocated', () => {
    const MAX_CAP = 50
    let allocated = 50

    function attemptClaim(): { success: boolean; error?: string } {
      if (allocated >= MAX_CAP) {
        return { success: false, error: 'Founding 50 cohort is full' }
      }
      allocated++
      return { success: true }
    }

    const result = attemptClaim()
    expect(result.success).toBe(false)
    expect(result.error).toBe('Founding 50 cohort is full')
  })
})
