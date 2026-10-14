import type { ApiRequest, ApiResponse } from '../_lib/types.js'
import {
  verifyAdminCaller,
  fetchAdminContactsData,
  updateAdminContactStatus,
} from '../_lib/adminAuth.js'
import { checkRateLimit, extractClientIpHash } from '../_lib/rateLimit.js'
import { sendSafeError } from '../_lib/safeError.js'

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
  const ipHash = extractClientIpHash(req)
  const rateLimit = checkRateLimit(ipHash, {
    windowMs: 60 * 1000,
    maxRequests: 60,
    prefix: 'admin_contacts',
  })

  if (rateLimit.isLimited) {
    return res.status(429).json({ success: false, error: 'Too many administrative requests' })
  }

  const auth = await verifyAdminCaller(req)
  if (!auth.authorized || !auth.user) {
    return res.status(auth.status).json({ success: false, error: auth.error })
  }

  if (req.method === 'GET') {
    try {
      const page = parseInt((req.query?.page as string) || '1', 10) || 1
      const pageSize = parseInt((req.query?.pageSize as string) || '20', 10) || 20
      const search = typeof req.query?.search === 'string' ? req.query.search : undefined
      const status = typeof req.query?.status === 'string' ? req.query.status : undefined

      const result = await fetchAdminContactsData({
        page,
        pageSize,
        search,
        status,
      })

      return res.status(200).json({ success: true, ...result })
    } catch (err: unknown) {
      return sendSafeError(res, {
        status: 500,
        publicMessage: 'Failed to retrieve contact inquiries',
        internalError: err,
      })
    }
  }

  if (req.method === 'PATCH') {
    try {
      const body = parseBody(req)
      if (!body || !body.id || !body.status) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: id and status are required.',
        })
      }

      if (!['unread', 'read', 'resolved'].includes(body.status)) {
        return res.status(400).json({
          success: false,
          error: "Invalid status value. Must be 'unread', 'read', or 'resolved'.",
        })
      }

      const updated = await updateAdminContactStatus({
        id: body.id,
        status: body.status,
        notes: typeof body.notes === 'string' ? body.notes : undefined,
        adminEmail: auth.user.email,
        ipHash,
      })

      return res.status(200).json({
        success: true,
        data: updated,
        message: 'Inquiry status updated successfully.',
      })
    } catch (err: unknown) {
      return sendSafeError(res, {
        status: 500,
        publicMessage: 'Failed to update contact inquiry status',
        internalError: err,
      })
    }
  }

  res.setHeader('Allow', 'GET, PATCH')
  return res.status(405).json({ success: false, error: 'Method Not Allowed' })
}
