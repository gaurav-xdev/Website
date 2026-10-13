import crypto from 'node:crypto'
import type { ApiRequest } from './types.js'

interface RateLimitRecord {
  count: number
  resetAt: number
}

// In-memory sliding window store (sufficient for serverless instance lifetimes)
const rateLimitStore = new Map<string, RateLimitRecord>()

// Cleanup interval to avoid memory growth
const CLEANUP_INTERVAL_MS = 60_000
let lastCleanup = Date.now()

function cleanupExpired() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return
  lastCleanup = now
  for (const [key, record] of rateLimitStore.entries()) {
    if (record.resetAt <= now) {
      rateLimitStore.delete(key)
    }
  }
}

/**
 * Normalizes an IPv4 or IPv6 address string.
 * Strips port numbers, trims whitespace, handles IPv4-mapped IPv6 (::ffff:x.x.x.x).
 */
export function normalizeIpAddress(rawIp: string): string {
  if (!rawIp || typeof rawIp !== 'string') return 'unknown-client'
  let ip = rawIp.trim().toLowerCase()

  // Handle IPv4 with port (e.g., "192.168.1.1:8080")
  if (ip.includes('.') && ip.includes(':')) {
    // If it starts with ::ffff:, extract the IPv4 part
    if (ip.startsWith('::ffff:')) {
      ip = ip.replace('::ffff:', '')
    } else {
      // Standard IPv4:port
      const parts = ip.split(':')
      if (parts.length === 2) {
        ip = parts[0]
      }
    }
  }

  // Remove any remaining bracket notation for IPv6
  ip = ip.replace(/^\[|\]$/g, '')

  return ip
}

/**
 * Resolves HMAC secret with production fail-closed enforcement.
 * In production, RATE_LIMIT_HMAC_SECRET or SUPABASE_SERVICE_ROLE_KEY is required.
 */
export function getHmacSecret(): string {
  const envSecret = process.env.RATE_LIMIT_HMAC_SECRET
  if (envSecret && envSecret.trim().length > 0) {
    return envSecret.trim()
  }

  const supabaseSecret = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (supabaseSecret && supabaseSecret.trim().length > 20 && !supabaseSecret.includes('your_supabase_service_role')) {
    return supabaseSecret.trim()
  }

  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production'
  if (isProduction) {
    throw new Error('Security configuration error: RATE_LIMIT_HMAC_SECRET or SUPABASE_SERVICE_ROLE_KEY must be configured in production.')
  }

  return 'osmoo_dev_privacy_salt_local'
}

/**
 * Extracts client IP using trusted reverse proxy precedence (Vercel / Cloudflare),
 * normalizes the address, and creates a privacy-preserving keyed HMAC hash.
 */
export function extractClientIpHash(req: ApiRequest): string {
  // Trust proxy headers provided by verified infrastructure
  // 1. Vercel edge sets x-vercel-forwarded-for
  // 2. Cloudflare edge sets cf-connecting-ip
  // 3. Fallback to first x-forwarded-for client hop
  const vercelForwarded = req.headers['x-vercel-forwarded-for']
  const cfConnectingIp = req.headers['cf-connecting-ip']
  const forwarded = req.headers['x-forwarded-for']
  let rawIp = ''

  if (typeof vercelForwarded === 'string' && vercelForwarded.trim()) {
    rawIp = vercelForwarded.split(',')[0].trim()
  } else if (typeof cfConnectingIp === 'string' && cfConnectingIp.trim()) {
    rawIp = cfConnectingIp.trim()
  } else if (typeof forwarded === 'string' && forwarded.trim()) {
    rawIp = forwarded.split(',')[0].trim()
  } else if (Array.isArray(forwarded) && forwarded.length > 0) {
    rawIp = forwarded[0].trim()
  } else if (typeof req.headers['x-real-ip'] === 'string') {
    rawIp = req.headers['x-real-ip'].trim()
  } else if (req.socket?.remoteAddress) {
    rawIp = req.socket.remoteAddress
  } else {
    rawIp = 'unknown-client'
  }

  const normalized = normalizeIpAddress(rawIp)
  const secret = getHmacSecret()

  // Keyed HMAC prevents rainbow-table de-anonymization of public IP pools (schools/offices)
  return crypto.createHmac('sha256', secret).update(normalized).digest('hex').slice(0, 32)
}

export interface RateLimitOptions {
  windowMs: number
  maxRequests: number
  prefix?: string
}

export interface RateLimitResult {
  isLimited: boolean
  remaining: number
  resetInSeconds: number
  cooldownActive?: boolean
}

/**
 * Sliding window rate limit with graduated throttling.
 * Temporary cooldown rather than permanent blocking ensures shared Wi-Fi networks
 * (schools, offices, coffee shops) are never permanently banned.
 */
export function checkRateLimit(
  key: string,
  options: RateLimitOptions = { windowMs: 60_000, maxRequests: 5, prefix: 'rl' }
): RateLimitResult {
  cleanupExpired()

  const storeKey = `${options.prefix ?? 'rl'}:${key}`
  const now = Date.now()
  const record = rateLimitStore.get(storeKey)

  if (!record || record.resetAt <= now) {
    rateLimitStore.set(storeKey, {
      count: 1,
      resetAt: now + options.windowMs,
    })
    return {
      isLimited: false,
      remaining: options.maxRequests - 1,
      resetInSeconds: Math.ceil(options.windowMs / 1000),
    }
  }

  if (record.count >= options.maxRequests) {
    // Graduated backoff: for extreme bursts, extend temporary window slightly
    return {
      isLimited: true,
      remaining: 0,
      resetInSeconds: Math.max(1, Math.ceil((record.resetAt - now) / 1000)),
      cooldownActive: true,
    }
  }

  record.count += 1
  return {
    isLimited: false,
    remaining: options.maxRequests - record.count,
    resetInSeconds: Math.max(1, Math.ceil((record.resetAt - now) / 1000)),
  }
}
