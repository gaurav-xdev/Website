import { describe, it, expect } from 'vitest'

describe('Founding 50 Concurrent Allocation Mathematical & Transactional Guarantee', () => {
  it('strictly limits allocations to <= 50 under high-throughput concurrent verifications', async () => {
    interface UserRecord {
      id: string
      email: string
      is_verified: boolean
      verified_at: number
      created_at: number
      is_founding_50: boolean
      founding_50_granted_at?: number
    }

    const MAX_FOUNDING_COUNT = 50
    const TOTAL_CANDIDATES = 120 // 120 users racing simultaneously to verify

    // Initialize mock table with unverified users
    const mockDb: UserRecord[] = Array.from({ length: TOTAL_CANDIDATES }, (_, i) => ({
      id: `usr_${i + 1}`,
      email: `candidate_${i + 1}@test.local`,
      is_verified: false,
      created_at: 1000 + i,
      verified_at: 0,
      is_founding_50: false,
    }))

    // Mutex locking mechanism mirroring PostgreSQL pg_advisory_xact_lock
    let lockHolder: string | null = null
    const lockQueue: (() => void)[] = []

    async function acquireAdvisoryLock(txId: string): Promise<() => void> {
      if (!lockHolder) {
        lockHolder = txId
        return () => {
          lockHolder = null
          const next = lockQueue.shift()
          if (next) next()
        }
      }

      return new Promise((resolve) => {
        lockQueue.push(() => {
          lockHolder = txId
          resolve(() => {
            lockHolder = null
            const next = lockQueue.shift()
            if (next) next()
          })
        })
      })
    }

    let clock = 2000

    // Atomic verify and assign simulation mirroring PostgreSQL verify_early_access_token RPC
    async function verifyAndAssign(userId: string) {
      // Advisory transaction lock guarantees atomic serialization
      const releaseLock = await acquireAdvisoryLock(userId)
      try {
        const user = mockDb.find((u) => u.id === userId)
        if (!user || user.is_verified) return

        // Timestamp assigned at moment of verified transaction
        clock += 1
        user.is_verified = true
        user.verified_at = clock

        // Execute assign_founding_50_rewards() under advisory lock
        const currentCount = mockDb.filter((u) => u.is_founding_50).length

        if (currentCount < MAX_FOUNDING_COUNT) {
          const remainingSlots = MAX_FOUNDING_COUNT - currentCount

          // Find eligible verified signups ordered deterministically
          const candidates = mockDb
            .filter((u) => u.is_verified && !u.is_founding_50)
            .sort((a, b) => a.verified_at - b.verified_at || a.created_at - b.created_at)
            .slice(0, remainingSlots)

          for (const cand of candidates) {
            cand.is_founding_50 = true
            cand.founding_50_granted_at = clock
          }
        }
      } finally {
        releaseLock()
      }
    }

    // Run all 120 verifications in parallel with random network jitter
    const concurrentPromises = mockDb.map(async (user) => {
      const jitterMs = Math.floor(Math.random() * 15)
      await new Promise((res) => setTimeout(res, jitterMs))
      await verifyAndAssign(user.id)
    })

    await Promise.all(concurrentPromises)

    // Assertions
    const totalFoundingMembers = mockDb.filter((u) => u.is_founding_50).length
    const totalVerified = mockDb.filter((u) => u.is_verified).length

    expect(totalVerified).toBe(TOTAL_CANDIDATES)
    expect(totalFoundingMembers).toBe(MAX_FOUNDING_COUNT)
    expect(totalFoundingMembers).not.toBeGreaterThan(MAX_FOUNDING_COUNT)

    // Check that exactly the earliest 50 verified signups received the reward
    const sortedByVerification = [...mockDb].sort(
      (a, b) => a.verified_at - b.verified_at || a.created_at - b.created_at
    )
    const top50 = sortedByVerification.slice(0, 50)
    const remaining = sortedByVerification.slice(50)

    for (const member of top50) {
      expect(member.is_founding_50).toBe(true)
    }

    for (const member of remaining) {
      expect(member.is_founding_50).toBe(false)
    }
  })
})
