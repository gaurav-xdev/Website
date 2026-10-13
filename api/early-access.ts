import type { ApiRequest, ApiResponse } from './_lib/types.js'
import { earlyAccessSchema, formatZodErrors } from './_lib/validation.js'
import { checkRateLimit, extractClientIpHash } from './_lib/rateLimit.js'
import { insertEarlyAccess } from './_lib/supabaseAdmin.js'
import { sendSafeError } from './_lib/safeError.js'
import {
  generateVerificationToken,
  sendEarlyAccessVerificationEmail,
} from './_lib/verificationEmail.js'
import { resolveAppBaseUrl } from './_lib/baseUrl.js'

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

  // Rate limit: 5 submissions per 10 minutes per IP
  const ipHash = extractClientIpHash(req)
  const rateLimit = checkRateLimit(ipHash, {
    windowMs: 10 * 60 * 1000,
    maxRequests: 5,
    prefix: 'early_access',
  })

  if (rateLimit.isLimited) {
    res.setHeader('Retry-After', rateLimit.resetInSeconds.toString())
    return res.status(429).json({
      success: false,
      error: `Too many submissions. Please retry after ${rateLimit.resetInSeconds} seconds.`,
    })
  }

  const rawBody = parseBody(req)
  if (!rawBody) {
    return res.status(400).json({ success: false, error: 'Invalid or missing JSON payload' })
  }

  const parseResult = earlyAccessSchema.safeParse(rawBody)
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: formatZodErrors(parseResult.error),
    })
  }

  const { email, firstName, source } = parseResult.data

  // Generate cryptographically secure, single-use token (60 min expiry)
  const { token, tokenHash, expiresAt } = generateVerificationToken(60)

  const insertResult = await insertEarlyAccess({
    email,
    firstName,
    source,
    ipHash,
    verificationTokenHash: tokenHash,
    verificationExpiresAt: expiresAt,
  })

  if (!insertResult.configured) {
    return res.status(503).json({
      success: false,
      configured: false,
      error: insertResult.error || 'Waitlist database is currently in setup mode. Please configure Supabase credentials.',
    })
  }

  if (!insertResult.success) {
    return sendSafeError(res, {
      status: 500,
      publicMessage: 'Unable to register early access request at this moment. Please try again later.',
      internalError: insertResult.error,
    })
  }

  // Determine site base URL for verification link dynamically matching host or production
  const appBaseUrl = resolveAppBaseUrl(req)
  const verificationUrl = `${appBaseUrl}/#verify?token=${token}`

  if (insertResult.isDuplicate) {
    // If user already verified, let them know; if unverified, offer resend hint
    if (insertResult.isVerified) {
      return res.status(200).json({
        success: true,
        data: {
          id: insertResult.id,
          isDuplicate: true,
          isVerified: true,
          isFounding50Eligible: insertResult.isFounding50Eligible,
          emailSent: false,
        },
        message: 'Your email address is already registered and verified on the OSMOO early access list.',
      })
    }

    return res.status(200).json({
      success: true,
      data: {
        id: insertResult.id,
        isDuplicate: true,
        isVerified: false,
        isFounding50Eligible: insertResult.isFounding50Eligible,
        emailSent: false,
        resendAvailable: true,
      },
      message: 'You are already registered! Check your inbox for the verification link, or request a new one.',
    })
  }

  // Dispatch transactional email via Resend
  let emailDispatched = false
  let emailError: string | undefined

  try {
    const dispatchResult = await sendEarlyAccessVerificationEmail({
      email,
      firstName,
      verificationUrl,
      isFounding50Eligible: insertResult.isFounding50Eligible,
    })
    emailDispatched = dispatchResult.sent
    emailError = dispatchResult.error
  } catch (err: unknown) {
    emailError = err instanceof Error ? err.message : 'Email dispatch failed'
  }

  return res.status(200).json({
    success: true,
    data: {
      id: insertResult.id,
      isDuplicate: false,
      isVerified: false,
      isFounding50Eligible: insertResult.isFounding50Eligible,
      emailSent: emailDispatched,
      emailErrorNotice: !emailDispatched && emailError ? emailError : undefined,
    },
    message: emailDispatched
      ? 'Spot reserved! A verification email has been sent. Click the link within 60 minutes to confirm your spot.'
      : 'Spot reserved on the waitlist. Verification email dispatch will activate upon domain setup.',
  })
  } catch (err: unknown) {
    return sendSafeError(res, {
      status: 500,
      publicMessage: 'Unable to process early access registration at this moment. Please try again later.',
      internalError: err,
    })
  }
}
