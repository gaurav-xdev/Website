import { describe, it, expect, vi, afterEach } from 'vitest'
import { getCanonicalRedirectUrl, signInWithGoogle } from '../lib/supabase/client'

describe('Supabase Canonical Domain & Google OAuth', () => {
  const originalWindow = global.window

  afterEach(() => {
    // Restore window
    if (originalWindow) {
      global.window = originalWindow
    }
    vi.restoreAllMocks()
  })

  it('resolves canonical production domain https://osmoo.in as default when window is undefined', () => {
    // Simulating server/headless environment
    // @ts-expect-error test simulation of node environment
    delete global.window
    const url = getCanonicalRedirectUrl('/')
    expect(url).toBe('https://osmoo.in/')
  })

  it('resolves https://osmoo.in for production domain with sub-paths', () => {
    global.window = {
      location: {
        origin: 'https://osmoo.in',
        hostname: 'osmoo.in',
      },
    } as unknown as Window & typeof globalThis

    expect(getCanonicalRedirectUrl('/auth/callback')).toBe('https://osmoo.in/auth/callback')
  })

  it('preserves localhost during local development', () => {
    global.window = {
      location: {
        origin: 'http://localhost:5173',
        hostname: 'localhost',
      },
    } as unknown as Window & typeof globalThis

    expect(getCanonicalRedirectUrl('/auth/callback')).toBe('http://localhost:5173/auth/callback')
  })

  it('preserves official Vercel preview domains', () => {
    global.window = {
      location: {
        origin: 'https://osmoo-preview-abc.vercel.app',
        hostname: 'osmoo-preview-abc.vercel.app',
      },
    } as unknown as Window & typeof globalThis

    expect(getCanonicalRedirectUrl('/auth/callback')).toBe('https://osmoo-preview-abc.vercel.app/auth/callback')
  })

  it('rejects unapproved third-party host origins and falls back to https://osmoo.in', () => {
    global.window = {
      location: {
        origin: 'https://evil-phishing-site.com',
        hostname: 'evil-phishing-site.com',
      },
    } as unknown as Window & typeof globalThis

    expect(getCanonicalRedirectUrl('/auth/callback')).toBe('https://osmoo.in/auth/callback')
  })

  it('handles signInWithGoogle failure gracefully when client or provider is unconfigured', async () => {
    const res = await signInWithGoogle()
    // Either initiates OAuth with url or returns actionable error
    expect(typeof res.success).toBe('boolean')
    if (!res.success) {
      expect(typeof res.error).toBe('string')
    }
  })
})
