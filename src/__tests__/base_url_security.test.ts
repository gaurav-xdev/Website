import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { resolveAppBaseUrl, isAllowedHost } from '../../api/_lib/baseUrl.js'
import type { ApiRequest } from '../../api/_lib/types.js'

describe('Base URL Trust Boundary & Host Validation', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    process.env = { ...originalEnv }
    delete process.env.APP_BASE_URL
    delete process.env.VERCEL_URL
    process.env.NODE_ENV = 'production'
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('isAllowedHost', () => {
    it('accepts canonical production domain and subdomains', () => {
      expect(isAllowedHost('osmoo.in', true)).toBe(true)
      expect(isAllowedHost('auth.osmoo.in', true)).toBe(true)
      expect(isAllowedHost('api.osmoo.in', true)).toBe(true)
      expect(isAllowedHost('osmoo.in:443', true)).toBe(true)
    })

    it('accepts official Vercel preview domains', () => {
      expect(isAllowedHost('osmoo-preview-abc123.vercel.app', true)).toBe(true)
      expect(isAllowedHost('osmoo-gaurav.vercel.app:443', true)).toBe(true)
    })

    it('rejects attacker and arbitrary domains', () => {
      expect(isAllowedHost('evil.com', true)).toBe(false)
      expect(isAllowedHost('attacker.osmoo.in.evil.com', true)).toBe(false)
      expect(isAllowedHost('osmoo.in.attacker.com', true)).toBe(false)
      expect(isAllowedHost('notosmoo.in', true)).toBe(false)
      expect(isAllowedHost('phishing-osmoo.com', true)).toBe(false)
    })

    it('rejects malicious characters and injection attempts', () => {
      expect(isAllowedHost('osmoo.in/evil', true)).toBe(false)
      expect(isAllowedHost('osmoo.in\r\nHost: evil.com', true)).toBe(false)
      expect(isAllowedHost('osmoo.in;evil.com', true)).toBe(false)
    })

    it('permits localhost only in non-production environments', () => {
      expect(isAllowedHost('localhost:5173', false)).toBe(true)
      expect(isAllowedHost('127.0.0.1:5173', false)).toBe(true)
      expect(isAllowedHost('localhost:5173', true)).toBe(false)
      expect(isAllowedHost('127.0.0.1:5173', true)).toBe(false)
    })
  })

  describe('resolveAppBaseUrl with forged headers', () => {
    it('rejects forged X-Forwarded-Host and falls back to production canonical', () => {
      const mockReq = {
        headers: {
          'x-forwarded-host': 'attacker-controlled.site',
          'x-forwarded-proto': 'https',
          'host': 'attacker-controlled.site',
        },
      } as unknown as ApiRequest

      const url = resolveAppBaseUrl(mockReq)
      expect(url).toBe('https://osmoo.in')
      expect(url).not.toContain('attacker')
    })

    it('rejects forged host header even when protocol is forged', () => {
      const mockReq = {
        headers: {
          'host': 'evil-phishing-page.com',
          'x-forwarded-proto': 'https',
        },
      } as unknown as ApiRequest

      const url = resolveAppBaseUrl(mockReq)
      expect(url).toBe('https://osmoo.in')
    })

    it('preserves approved localhost with port in development/test', () => {
      process.env.NODE_ENV = 'development'
      const mockReq = {
        headers: {
          'host': 'localhost:5173',
        },
      } as unknown as ApiRequest

      const url = resolveAppBaseUrl(mockReq)
      expect(url).toBe('http://localhost:5173')
    })

    it('resolves approved Vercel preview domain safely', () => {
      const mockReq = {
        headers: {
          'x-forwarded-host': 'osmoo-feature-branch.vercel.app',
          'x-forwarded-proto': 'https',
        },
      } as unknown as ApiRequest

      const url = resolveAppBaseUrl(mockReq)
      expect(url).toBe('https://osmoo-feature-branch.vercel.app')
    })

    it('prioritizes valid APP_BASE_URL over headers if matching approved domain', () => {
      process.env.APP_BASE_URL = 'https://osmoo.in'
      const mockReq = {
        headers: {
          'host': 'osmoo-preview.vercel.app',
        },
      } as unknown as ApiRequest

      const url = resolveAppBaseUrl(mockReq)
      expect(url).toBe('https://osmoo.in')
    })

    it('rejects attacker domain even if set in corrupted APP_BASE_URL', () => {
      process.env.APP_BASE_URL = 'https://malicious-override.com'
      const url = resolveAppBaseUrl()
      expect(url).toBe('https://osmoo.in')
    })
  })
})
