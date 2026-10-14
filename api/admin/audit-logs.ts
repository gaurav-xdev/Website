import type { ApiRequest, ApiResponse } from '../_lib/types.js'
import { verifyAdminCaller, fetchAdminAuditLogsData } from '../_lib/adminAuth.js'
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
    prefix: 'admin_audit',
  })

  if (rateLimit.isLimited) {
    return res.status(429).json({ success: false, error: 'Too many administrative requests' })
  }

  const auth = await verifyAdminCaller(req)
  if (!auth.authorized) {
    return res.status(auth.status).json({ success: false, error: auth.error })
  }

  try {
    const limit = parseInt((req.query?.limit as string) || '50', 10) || 50
    const logs = await fetchAdminAuditLogsData(limit)
    return res.status(200).json({ success: true, data: logs })
  } catch (err: unknown) {
    return sendSafeError(res, {
      status: 500,
      publicMessage: 'Failed to retrieve administrative audit logs',
      internalError: err,
    })
  }
}
