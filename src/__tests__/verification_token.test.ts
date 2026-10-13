import { describe, it, expect } from 'vitest'
import {
  generateVerificationToken,
  hashVerificationToken,
} from '../../api/_lib/verificationEmail.js'

describe('Secure Email Verification Token Engine', () => {
  it('generates high-entropy 64-character hex tokens', () => {
    const { token, tokenHash, expiresAt } = generateVerificationToken(60)

    expect(token).toHaveLength(64)
    expect(token).toMatch(/^[a-f0-9]{64}$/)
    expect(tokenHash).toHaveLength(64)
    expect(tokenHash).toMatch(/^[a-f0-9]{64}$/)

    // Hash must differ from the raw token
    expect(tokenHash).not.toBe(token)

    // Expiry must be roughly 60 minutes in the future
    const expiryTime = new Date(expiresAt).getTime()
    const now = Date.now()
    const diffMinutes = (expiryTime - now) / (60 * 1000)
    expect(diffMinutes).toBeGreaterThan(58)
    expect(diffMinutes).toBeLessThan(62)
  })

  it('computes deterministic SHA-256 hashes of verification tokens', () => {
    const token = 'a'.repeat(64)
    const hash1 = hashVerificationToken(token)
    const hash2 = hashVerificationToken(token)

    expect(hash1).toBe(hash2)
    expect(hash1).toHaveLength(64)
  })

  it('trims tokens before hashing to prevent whitespace padding evasion', () => {
    const token = 'b'.repeat(64)
    const hashDirect = hashVerificationToken(token)
    const hashWithSpaces = hashVerificationToken(`  ${token}  \n`)

    expect(hashWithSpaces).toBe(hashDirect)
  })
})
