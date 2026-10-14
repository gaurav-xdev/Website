import type { ApiRequest, ApiResponse } from '../_lib/types.js'
import { verifyAdminCaller, fetchAdminWaitlistData } from '../_lib/adminAuth.js'
import { checkRateLimit, extractClientIpHash } from '../_lib/rateLimit.js'
import { sendSafeError } from '../_lib/safeError.js'

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ success: false, error: 'Method Not Allowed' })
  }

  const ipHash = extractClientIpHash(req)
  const rateLimit = checkRateLimit(ipHash, {
    windowMs: 60 * 1000,
    maxRequests: 60,
    prefix: 'admin_waitlist',
  })

  if (rateLimit.isLimited) {
    return res.status(429).json({ success: false, error: 'Too many administrative requests' })
  }

  const auth = await verifyAdminCaller(req)
  if (!auth.authorized) {
    return res.status(auth.status).json({ success: false, error: auth.error })
  }

  try {
    const page = parseInt((req.query?.page as string) || '1', 10) || 1
    const pageSize = parseInt((req.query?.pageSize as string) || '20', 10) || 20
    const search = typeof req.query?.search === 'string' ? req.query.search : undefined
    const filter = (req.query?.filter as 'all' | 'verified' | 'unverified' | 'founding50') || 'all'

    const result = await fetchAdminWaitlistData({
      page,
      pageSize,
      search,
      filter,
    })

    return res.status(200).json({ success: true, ...result })
  } catch (err: unknown) {
    return sendSafeError(res, {
      status: 500,
      publicMessage: 'Failed to retrieve waitlist cohort data',
      internalError: err,
    })
  }
}
