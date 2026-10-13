import type { ApiRequest, ApiResponse } from './_lib/types.js'
import { z } from 'zod'
import { formatZodErrors } from './_lib/validation.js'
import { checkRateLimit, extractClientIpHash } from './_lib/rateLimit.js'
import { verifyEarlyAccessToken } from './_lib/supabaseAdmin.js'
import { hashVerificationToken } from './_lib/verificationEmail.js'
import { sendSafeError } from './_lib/safeError.js'

const verifyQuerySchema = z.object({
  token: z
    .string()
    .min(32, 'Verification token format is invalid')
    .max(128, 'Verification token format is invalid')
    .regex(/^[a-f0-9]+$/i, 'Verification token must be hexadecimal'),
})

function parseBody(req: ApiRequest) {
  if (typeof req.body === 'object' && req.body !== null) return req.body
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body)
    } catch {
      return null
    }
  }
  return null
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST')
      return res.status(405).json({
        success: false,
        error: 'Method Not Allowed. Verification requires POST to prevent automated email prefetchers from consuming tokens.',
      })
    }

    // Rate limit: 20 verification attempts per 10 minutes per IP
    const ipHash = extractClientIpHash(req)
    const rateLimit = checkRateLimit(ipHash, {
      windowMs: 10 * 60 * 1000,
      maxRequests: 20,
      prefix: 'verify_token',
    })

    if (rateLimit.isLimited) {
      res.setHeader('Retry-After', rateLimit.resetInSeconds.toString())
      return res.status(429).json({
        success: false,
        error: `Too many verification requests. Please retry in ${rateLimit.resetInSeconds} seconds.`,
      })
    }

    // Extract token strictly from POST json body
    const body = parseBody(req)
    const rawToken = body?.token

    const parseResult = verifyQuerySchema.safeParse({ token: rawToken })
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        status: 'invalid',
        error: 'Invalid or missing verification token.',
        details: formatZodErrors(parseResult.error),
      })
    }

    const { token } = parseResult.data

    // Compute cryptographic SHA-256 hash
    const tokenHash = hashVerificationToken(token)

    // Execute atomic verification
    const verification = await verifyEarlyAccessToken(tokenHash)

    if (!verification.success) {
      const statusCode = verification.status === 'expired' ? 410 : 400
      return res.status(statusCode).json({
        success: false,
        status: verification.status,
        email: verification.email,
        error: verification.error || 'Verification link is invalid or expired.',
      })
    }

    return res.status(200).json({
      success: true,
      status: verification.status,
      email: verification.email,
      firstName: verification.firstName,
      isFounding50: verification.isFounding50,
      message: verification.message || 'Email successfully verified!',
    })
  } catch (err: unknown) {
    return sendSafeError(res, {
      status: 500,
      publicMessage: 'Unable to verify email at this moment. Please try again later.',
      internalError: err,
    })
  }
}
