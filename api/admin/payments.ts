import type { ApiRequest, ApiResponse } from '../_lib/types.js'
import { verifyAdminCaller, fetchAdminPaymentsData } from '../_lib/adminAuth.js'
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
    prefix: 'admin_payments',
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

    const data = await fetchAdminPaymentsData({ page, pageSize })
    return res.status(200).json({ success: true, data })
  } catch (err: unknown) {
    return sendSafeError(res, {
      status: 500,
      publicMessage: 'Failed to retrieve payment health metrics',
      internalError: err,
    })
  }
}
