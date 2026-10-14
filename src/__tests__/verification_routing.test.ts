import { describe, it, expect } from 'vitest'
import { parseRouteFromUrl } from '../App'
import { extractVerificationTokenFromUrl } from '../pages/VerifyEmailPage'

describe('Verification & URL Hash Routing Regression Tests', () => {
  describe('parseRouteFromUrl', () => {
    it('correctly parses #verify when query parameters are present (#verify?token=...)', () => {
      const route = parseRouteFromUrl('#verify?token=abcdef0123456789abcdef0123456789')
      expect(route).toBe('verify')
    })

    it('correctly parses #/verify when query parameters are present (#/verify?token=...)', () => {
      const route = parseRouteFromUrl('#/verify?token=abcdef0123456789abcdef0123456789')
      expect(route).toBe('verify')
    })

    it('correctly parses routes with other query parameters (e.g. #pricing?checkout=success)', () => {
      const route = parseRouteFromUrl('#pricing?checkout=success')
      expect(route).toBe('pricing')
    })

    it('correctly parses legal subroutes (e.g. #legal/privacy)', () => {
      expect(parseRouteFromUrl('#legal/privacy')).toBe('legal/privacy')
      expect(parseRouteFromUrl('#/legal/terms?ref=footer')).toBe('legal/terms')
    })

    it('falls back to pathname when hash is empty or not matching', () => {
      expect(parseRouteFromUrl('', '/verify')).toBe('verify')
      expect(parseRouteFromUrl('', '/pricing')).toBe('pricing')
      expect(parseRouteFromUrl('#', '/how-it-works')).toBe('how-it-works')
    })

    it('routes OAuth hash fragments to home for modal handling', () => {
      expect(parseRouteFromUrl('#access_token=xyz123&token_type=bearer')).toBe('home')
      expect(parseRouteFromUrl('#error=access_denied&error_description=User+cancelled')).toBe('home')
    })

    it('defaults unknown or empty routes to home', () => {
      expect(parseRouteFromUrl('')).toBe('home')
      expect(parseRouteFromUrl('#')).toBe('home')
      expect(parseRouteFromUrl('#/')).toBe('home')
      expect(parseRouteFromUrl('#unknown-page')).toBe('home')
      expect(parseRouteFromUrl('#/non-existent-route?foo=bar')).toBe('home')
    })
  })

  describe('extractVerificationTokenFromUrl', () => {
    it('extracts hex token from hash query string (#verify?token=...)', () => {
      const token = 'a1b2c3d4e5f60718293a4b5c6d7e8f90'
      const extracted = extractVerificationTokenFromUrl(`#verify?token=${token}`)
      expect(extracted).toBe(token)
    })

    it('extracts hex token from hash with slash (#/verify?token=...)', () => {
      const token = '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      const extracted = extractVerificationTokenFromUrl(`#/verify?token=${token}&source=email`)
      expect(extracted).toBe(token)
    })

    it('extracts token from window.location.search when hash lacks token', () => {
      const token = 'f0e1d2c3b4a59687f0e1d2c3b4a59687'
      const extracted = extractVerificationTokenFromUrl('#verify', `?token=${token}&utm_source=email`)
      expect(extracted).toBe(token)
    })

    it('handles clean token extraction with multiple parameters', () => {
      const token = 'deadbeefcafe0123456789abcdef0123'
      const extracted = extractVerificationTokenFromUrl(`#verify?utm_medium=email&token=${token}&utm_campaign=waitlist`)
      expect(extracted).toBe(token)
    })

    it('returns null when no token is present', () => {
      expect(extractVerificationTokenFromUrl('#verify')).toBeNull()
      expect(extractVerificationTokenFromUrl('#verify?foo=bar')).toBeNull()
      expect(extractVerificationTokenFromUrl('')).toBeNull()
      expect(extractVerificationTokenFromUrl('', '?foo=bar')).toBeNull()
    })
  })
})
