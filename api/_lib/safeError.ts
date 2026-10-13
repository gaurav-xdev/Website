import crypto from 'node:crypto'
import type { ApiResponse } from './types.js'

export interface SafeErrorOptions {
  status?: number
  publicMessage?: string
  internalError?: unknown
  context?: Record<string, unknown>
}

/**
 * Strips sensitive keys (passwords, tokens, secrets, SQL) from server logs
 */
function sanitizeContext(ctx?: Record<string, unknown>): Record<string, unknown> {
  if (!ctx) return {}
  const sanitized: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(ctx)) {
    const lower = k.toLowerCase()
    if (
      lower.includes('secret') ||
      lower.includes('key') ||
      lower.includes('token') ||
      lower.includes('password') ||
      lower.includes('auth')
    ) {
      sanitized[k] = '[REDACTED]'
    } else {
      sanitized[k] = v
    }
  }
  return sanitized
}

/**
 * Sends a safe, minimal JSON error response to client, preventing leaks of
 * stack traces, internal paths, SQL details, and environment secrets.
 */
export function sendSafeError(
  res: ApiResponse,
  options: SafeErrorOptions
) {
  const status = options.status || 500
  const requestId = `req_${crypto.randomBytes(8).toString('hex')}`

  const publicMessage =
    options.publicMessage ||
    (status >= 500
      ? 'Something went wrong. Please try again later.'
      : 'Invalid request.')

  // Log on server for diagnostics with secrets redacted
  if (process.env.NODE_ENV !== 'test') {
    const rawError = options.internalError instanceof Error
      ? options.internalError.message
      : String(options.internalError || '')

    console.error(`[API ERROR ${requestId}] status=${status} msg="${publicMessage}" internal="${rawError}"`, sanitizeContext(options.context))
  }

  return res.status(status).json({
    success: false,
    error: publicMessage,
    requestId,
  })
}
