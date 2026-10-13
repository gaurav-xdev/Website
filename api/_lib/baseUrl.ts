import type { ApiRequest } from './types.js'

/**
 * Validates and normalizes host strings against an allowlist of approved domains.
 * Prevents Host Header Injection, forged X-Forwarded-Host, and malicious redirection.
 *
 * Allowed domains/patterns:
 * 1. osmoo.in and *.osmoo.in
 * 2. localhost(:port)? and 127.0.0.1(:port)? (strictly in non-production or dev)
 * 3. *.vercel.app (official Vercel preview and branch deployments)
 */
export function isAllowedHost(host: string, isProduction = process.env.NODE_ENV === 'production'): boolean {
  if (!host || typeof host !== 'string') return false
  const cleanHost = host.trim().toLowerCase()

  // Reject invalid characters (e.g. carriage returns, slashes, spaces)
  if (/[^a-z0-9.:\-_]/i.test(cleanHost)) return false

  // Strip port for domain matching
  const hostname = cleanHost.split(':')[0]

  // Production domain: osmoo.in or subdomains
  if (hostname === 'osmoo.in' || hostname.endsWith('.osmoo.in')) {
    return true
  }

  // Official Vercel deployment domain: *.vercel.app
  if (hostname === 'vercel.app' || hostname.endsWith('.vercel.app')) {
    return true
  }

  // Localhost allowed in development, test, or when NODE_ENV is not production
  if (!isProduction || process.env.ALLOW_LOCALHOST_IN_PROD === 'true') {
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return true
    }
  }

  return false
}

/**
 * Resolves an authenticated, strictly validated base URL for outgoing email verification links.
 * 
 * Boundary Enforcement:
 * 1. APP_BASE_URL: Explicit override. Must match approved scheme and host.
 * 2. Request Host / X-Forwarded-Host: Validated against strict allowlist.
 *    Any unapproved or forged host (e.g. attacker.com, evil.com) is REJECTED.
 * 3. VERCEL_URL: Official preview deployments (*.vercel.app).
 * 4. Fallback: Canonical production domain 'https://osmoo.in'.
 */
export function resolveAppBaseUrl(req?: ApiRequest): string {
  const isProduction = process.env.NODE_ENV === 'production'

  // 1. Explicit environment configuration with validation
  const envBase = process.env.APP_BASE_URL?.trim()
  if (envBase) {
    try {
      const parsed = new URL(envBase)
      if (
        (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
        isAllowedHost(parsed.host, isProduction)
      ) {
        return envBase.replace(/\/+$/, '')
      }
    } catch {
      // Invalid APP_BASE_URL syntax or unapproved host, fall through to host detection
    }
  }

  // 2. Request host introspection with strict allowlist validation
  if (req) {
    const forwardedHost = req.headers['x-forwarded-host']
    const hostHeader = req.headers['host']
    const candidateHost = (
      typeof forwardedHost === 'string'
        ? forwardedHost.split(',')[0].trim()
        : Array.isArray(forwardedHost) && forwardedHost.length > 0
        ? forwardedHost[0].trim()
        : typeof hostHeader === 'string'
        ? hostHeader.trim()
        : ''
    )

    if (candidateHost && isAllowedHost(candidateHost, isProduction)) {
      const protoHeader = req.headers['x-forwarded-proto']
      const cleanCandidate = candidateHost.toLowerCase()
      const isLocal = cleanCandidate.startsWith('localhost') || cleanCandidate.startsWith('127.0.0.1')

      let proto = 'https'
      if (typeof protoHeader === 'string') {
        const firstProto = protoHeader.split(',')[0].trim().toLowerCase()
        if (firstProto === 'http' || firstProto === 'https') {
          proto = isLocal ? firstProto : 'https'
        }
      } else if (isLocal) {
        proto = 'http'
      }

      return `${proto}://${candidateHost}`.replace(/\/+$/, '')
    }
  }

  // 3. Vercel deployment preview URL
  const vercelUrl = process.env.VERCEL_URL?.trim()
  if (vercelUrl) {
    const cleanVercel = vercelUrl.replace(/^https?:\/\//, '')
    if (isAllowedHost(cleanVercel, isProduction)) {
      return `https://${cleanVercel}`.replace(/\/+$/, '')
    }
  }

  // 4. Default fallback: Canonical production target
  return 'https://osmoo.in'
}
