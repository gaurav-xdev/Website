import type { ApiRequest, ApiResponse } from './_lib/types.js'
import { z } from 'zod'
import { formatZodErrors } from './_lib/validation.js'
import { checkRateLimit, extractClientIpHash } from './_lib/rateLimit.js'
import { updateEarlyAccessVerificationToken } from './_lib/supabaseAdmin.js'
import {
  generateVerificationToken,
  sendEarlyAccessVerificationEmail,
} from './_lib/verificationEmail.js'
import { resolveAppBaseUrl } from './_lib/baseUrl.js'
import { sendSafeError } from './_lib/safeError.js'

const resendSchema = z.object({
  email: z
    .string()
    .email('Invalid email address format')
    .max(255)
    .trim()
    .toLowerCase(),
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
      return res.status(405).json({ success: false, error: 'Method Not Allowed' })
    }

    // Rate limit: 3 resend attempts per 10 minutes per IP
    const ipHash = extractClientIpHash(req)
    const rateLimit = checkRateLimit(ipHash, {
      windowMs: 10 * 60 * 1000,
      maxRequests: 3,
      prefix: 'resend_verification',
    })

    if (rateLimit.isLimited) {
      res.setHeader('Retry-After', rateLimit.resetInSeconds.toString())
      return res.status(429).json({
        success: false,
        error: `Too many resend requests. Please wait ${rateLimit.resetInSeconds} seconds before trying again.`,
      })
    }

    const rawBody = parseBody(req)
    if (!rawBody) {
      return res.status(400).json({ success: false, error: 'Invalid or missing JSON payload' })
    }

    const parseResult = resendSchema.safeParse(rawBody)
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: formatZodErrors(parseResult.error),
      })
    }

    const { email } = parseResult.data

    // Generate new token & hash (60 min expiry)
    const { token, tokenHash, expiresAt } = generateVerificationToken(60)

    const updateResult = await updateEarlyAccessVerificationToken({
      email,
      tokenHash,
      expiresAt,
    })

    if (!updateResult.success) {
      if (updateResult.cooldownActive) {
        return res.status(429).json({
          success: false,
          error: updateResult.error,
          cooldownRemainingSeconds: updateResult.cooldownRemainingSeconds,
        })
      }

      // Safe account enumeration protection:
      // Return 200 with standard wording so observers cannot probe email existence
      return res.status(200).json({
        success: true,
        message: 'If an early access registration exists for this email, a verification link has been dispatched.',
      })
    }

    if (updateResult.isVerified) {
      return res.status(200).json({
        success: true,
        isVerified: true,
        message: 'This email is already verified. Your spot is confirmed!',
      })
    }

    // Dispatch verification email matching request origin or production domain
    const appBaseUrl = resolveAppBaseUrl(req)
    const verificationUrl = `${appBaseUrl}/#verify?token=${token}`

    const dispatch = await sendEarlyAccessVerificationEmail({
      email,
      firstName: updateResult.firstName,
      verificationUrl,
      isFounding50Eligible: updateResult.isFounding50,
    })

    return res.status(200).json({
      success: true,
      emailSent: dispatch.sent,
      message: dispatch.sent
        ? 'A new verification link has been sent to your inbox.'
        : 'Verification link generated. (Email dispatch will activate with production domain setup).',
    })
  } catch (err: unknown) {
    return sendSafeError(res, {
      status: 500,
      publicMessage: 'Failed to process verification resend request. Please try again later.',
      internalError: err,
    })
  }
}
