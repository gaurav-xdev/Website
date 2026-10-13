import type { ApiRequest, ApiResponse } from './_lib/types.js'
import { getFounding50Status } from './_lib/supabaseAdmin.js'
import { checkRateLimit, extractClientIpHash } from './_lib/rateLimit.js'
import { sendSafeError } from './_lib/safeError.js'

export default async function handler(req: ApiRequest, res: ApiResponse) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET')
      return res.status(405).json({ success: false, error: 'Method Not Allowed' })
    }

    // IP rate limit: 60 requests per minute
    const ipHash = extractClientIpHash(req)
    const rateLimit = checkRateLimit(ipHash, {
      windowMs: 60 * 1000,
      maxRequests: 60,
      prefix: 'founding_status',
    })

    if (rateLimit.isLimited) {
      res.setHeader('Retry-After', rateLimit.resetInSeconds.toString())
      return res.status(429).json({
        success: false,
        error: 'Too many requests. Please slow down.',
      })
    }

    const status = await getFounding50Status()

    // Cache control: short cache so remaining slots stay fresh
    res.setHeader('Cache-Control', 'public, max-age=5, s-maxage=5, stale-while-revalidate=10')

    return res.status(200).json({
      success: true,
      data: status,
    })
  } catch (err: unknown) {
    return sendSafeError(res, {
      status: 500,
      publicMessage: 'Failed to retrieve Founding 50 availability.',
      internalError: err,
    })
  }
}
