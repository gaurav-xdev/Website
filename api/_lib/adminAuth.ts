import type { ApiRequest } from './types.js'
import { getSupabaseAdmin, isSupabaseAdminConfigured } from './supabaseAdmin.js'
import { arePaymentsEnabled } from './plans.js'

export interface AdminCallerVerification {
  authorized: boolean
  status: number
  error?: string
  user?: {
    id: string
    email: string
  }
}

/**
 * Validates whether the incoming request is issued by an authenticated user
 * possessing explicit server-side administrative authority.
 *
 * Authorization is evaluated strictly server-side:
 * 1. Valid Supabase JWT Bearer token checked via Supabase Auth.
 * 2. Explicit server authorization via:
 *    a) public.admin_users database table row with role 'admin' or 'superadmin', OR
 *    b) Explicit server-side ADMIN_EMAILS environment variable allowlist.
 *
 * Client-supplied claims, cookies without JWT verification, or unverified headers are rejected.
 */
export async function verifyAdminCaller(req: ApiRequest): Promise<AdminCallerVerification> {
  const authHeader = req.headers['authorization']
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      authorized: false,
      status: 401,
      error: 'Unauthorized: Missing or malformed authentication header',
    }
  }

  const token = authHeader.slice(7).trim()
  if (!token) {
    return {
      authorized: false,
      status: 401,
      error: 'Unauthorized: Missing authentication bearer token',
    }
  }

  if (!isSupabaseAdminConfigured()) {
    return {
      authorized: false,
      status: 503,
      error: 'Service Unavailable: Database administrative client is not configured in environment',
    }
  }

  const admin = getSupabaseAdmin()
  if (!admin) {
    return {
      authorized: false,
      status: 503,
      error: 'Service Unavailable: Unable to initialize administrative client',
    }
  }

  try {
    const { data: { user }, error } = await admin.auth.getUser(token)
    if (error || !user || !user.email) {
      return {
        authorized: false,
        status: 401,
        error: 'Unauthorized: Authentication token is invalid or has expired',
      }
    }

    const normalizedEmail = user.email.toLowerCase().trim()

    // 1. Check server-side environment allowlist: ADMIN_EMAILS
    const envAdminEmails = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((e) => e.toLowerCase().trim())
      .filter(Boolean)

    if (envAdminEmails.includes(normalizedEmail)) {
      return {
        authorized: true,
        status: 200,
        user: { id: user.id, email: user.email },
      }
    }

    // 2. Check database admin_users table
    const { data: adminRecord } = await admin
      .from('admin_users')
      .select('id, role')
      .or(`user_id.eq.${user.id},email.ilike.${normalizedEmail}`)
      .in('role', ['admin', 'superadmin'])
      .maybeSingle()

    if (adminRecord) {
      return {
        authorized: true,
        status: 200,
        user: { id: user.id, email: user.email },
      }
    }

    // Authenticated user lacks administrative privileges
    return {
      authorized: false,
      status: 403,
      error: 'Forbidden: Insufficient administrative privileges',
    }
  } catch {
    return {
      authorized: false,
      status: 401,
      error: 'Unauthorized: Authentication verification failed',
    }
  }
}

/**
 * Securely writes an entry into the public.admin_audit_logs table.
 * Never throws; operational logging failure does not break primary admin actions.
 */
export async function recordAdminAuditLog(params: {
  adminEmail: string
  action: string
  targetType?: string
  targetId?: string
  details?: Record<string, unknown>
  ipHash?: string
}): Promise<void> {
  const admin = getSupabaseAdmin()
  if (!admin) return

  try {
    await admin.from('admin_audit_logs').insert({
      admin_email: params.adminEmail,
      action: params.action,
      target_type: params.targetType || null,
      target_id: params.targetId || null,
      details: params.details || {},
      ip_hash: params.ipHash || null,
    })
  } catch {
    // Non-blocking
  }
}

/**
 * Fetches aggregated statistics for the administrative overview.
 */
export async function fetchAdminOverviewData() {
  const admin = getSupabaseAdmin()
  if (!admin) throw new Error('Database client unconfigured')

  // 1. Early Access Signups stats
  const [
    { count: totalSignups },
    { count: verifiedSignups },
    { count: unverifiedSignups },
    { count: founding50Claimed },
  ] = await Promise.all([
    admin.from('early_access_requests').select('*', { count: 'exact', head: true }),
    admin.from('early_access_requests').select('*', { count: 'exact', head: true }).eq('is_verified', true),
    admin.from('early_access_requests').select('*', { count: 'exact', head: true }).eq('is_verified', false),
    admin.from('early_access_requests').select('*', { count: 'exact', head: true }).eq('is_founding_50', true),
  ])

  // 2. Contact Inquiries stats
  const [
    { count: totalContacts },
    { count: unreadContacts },
    { count: readContacts },
    { count: resolvedContacts },
  ] = await Promise.all([
    admin.from('contact_messages').select('*', { count: 'exact', head: true }),
    admin.from('contact_messages').select('*', { count: 'exact', head: true }).eq('status', 'unread'),
    admin.from('contact_messages').select('*', { count: 'exact', head: true }).eq('status', 'read'),
    admin.from('contact_messages').select('*', { count: 'exact', head: true }).eq('status', 'resolved'),
  ])

  // 3. Payment Events stats
  const [
    { count: totalPaymentEvents },
    { count: failedPaymentEvents },
  ] = await Promise.all([
    admin.from('payment_events').select('*', { count: 'exact', head: true }),
    admin.from('payment_events').select('*', { count: 'exact', head: true }).eq('status', 'failed'),
  ])

  const foundingCap = 50
  const claimedCount = founding50Claimed || 0
  const founding50Remaining = Math.max(0, foundingCap - claimedCount)

  const resendApiKey = process.env.RESEND_API_KEY
  const isResendConfigured = Boolean(
    resendApiKey && resendApiKey.startsWith('re_') && !resendApiKey.includes('your_resend')
  )

  const dodoKey = process.env.DODO_PAYMENTS_API_KEY
  const isDodoConfigured = Boolean(
    dodoKey && dodoKey.length > 10 && !dodoKey.includes('dodo_api_key')
  )

  return {
    signups: {
      total: totalSignups || 0,
      verified: verifiedSignups || 0,
      unverified: unverifiedSignups || 0,
      founding50Claimed: claimedCount,
      founding50Remaining,
      founding50Cap: foundingCap,
    },
    contacts: {
      total: totalContacts || 0,
      unread: unreadContacts || 0,
      read: readContacts || 0,
      resolved: resolvedContacts || 0,
    },
    payments: {
      enabled: arePaymentsEnabled(),
      totalEvents: totalPaymentEvents || 0,
      failedEvents: failedPaymentEvents || 0,
    },
    system: {
      nodeEnv: process.env.NODE_ENV || 'development',
      databaseConnected: true,
      emailConfigured: isResendConfigured,
      paymentsConfigured: isDodoConfigured,
      paymentsFeatureFlag: arePaymentsEnabled(),
      serverTimestamp: new Date().toISOString(),
    },
  }
}

/**
 * Fetches paginated Early Access signups with search and filter.
 */
export async function fetchAdminWaitlistData(params: {
  page: number
  pageSize: number
  search?: string
  filter?: 'all' | 'verified' | 'unverified' | 'founding50'
}) {
  const admin = getSupabaseAdmin()
  if (!admin) throw new Error('Database client unconfigured')

  const page = Math.max(1, params.page || 1)
  const pageSize = Math.min(100, Math.max(1, params.pageSize || 20))
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = admin
    .from('early_access_requests')
    .select('id, email, first_name, source, is_verified, is_founding_50, founding_50_granted_at, created_at, verification_sent_at', {
      count: 'exact',
    })
    .order('created_at', { ascending: false })

  if (params.filter === 'verified') {
    query = query.eq('is_verified', true)
  } else if (params.filter === 'unverified') {
    query = query.eq('is_verified', false)
  } else if (params.filter === 'founding50') {
    query = query.eq('is_founding_50', true)
  }

  if (params.search && params.search.trim()) {
    const term = `%${params.search.trim().toLowerCase()}%`
    query = query.or(`email.ilike.${term},first_name.ilike.${term}`)
  }

  const { data, count, error } = await query.range(from, to)
  if (error) throw error

  return {
    data: data || [],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize) || 1,
  }
}

/**
 * Fetches paginated Contact Inquiries with search and status filter.
 */
export async function fetchAdminContactsData(params: {
  page: number
  pageSize: number
  search?: string
  status?: string
}) {
  const admin = getSupabaseAdmin()
  if (!admin) throw new Error('Database client unconfigured')

  const page = Math.max(1, params.page || 1)
  const pageSize = Math.min(100, Math.max(1, params.pageSize || 20))
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = admin
    .from('contact_messages')
    .select('id, name, email, category, message, status, notes, created_at, updated_at', {
      count: 'exact',
    })
    .order('created_at', { ascending: false })

  if (params.status && ['unread', 'read', 'resolved'].includes(params.status)) {
    query = query.eq('status', params.status)
  }

  if (params.search && params.search.trim()) {
    const term = `%${params.search.trim().toLowerCase()}%`
    query = query.or(`name.ilike.${term},email.ilike.${term},category.ilike.${term},message.ilike.${term}`)
  }

  const { data, count, error } = await query.range(from, to)
  if (error) throw error

  return {
    data: data || [],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize) || 1,
  }
}

/**
 * Updates status or notes on a contact message.
 */
export async function updateAdminContactStatus(params: {
  id: string
  status: 'unread' | 'read' | 'resolved'
  notes?: string
  adminEmail: string
  ipHash?: string
}) {
  const admin = getSupabaseAdmin()
  if (!admin) throw new Error('Database client unconfigured')

  const updates: Record<string, unknown> = {
    status: params.status,
    updated_at: new Date().toISOString(),
  }
  if (params.notes !== undefined) {
    updates.notes = params.notes
  }

  const { data, error } = await admin
    .from('contact_messages')
    .update(updates)
    .eq('id', params.id)
    .select('id, status, notes, updated_at')
    .single()

  if (error) throw error

  await recordAdminAuditLog({
    adminEmail: params.adminEmail,
    action: 'update_contact_status',
    targetType: 'contact_message',
    targetId: params.id,
    details: { newStatus: params.status, hasNotes: Boolean(params.notes) },
    ipHash: params.ipHash,
  })

  return data
}

/**
 * Fetches payment status and read-only recent payment audit events.
 */
export async function fetchAdminPaymentsData(params: {
  page: number
  pageSize: number
}) {
  const admin = getSupabaseAdmin()
  if (!admin) throw new Error('Database client unconfigured')

  const page = Math.max(1, params.page || 1)
  const pageSize = Math.min(100, Math.max(1, params.pageSize || 20))
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, count, error } = await admin
    .from('payment_events')
    .select('id, provider, event_id, event_type, processed_at, status, error_message', {
      count: 'exact',
    })
    .order('processed_at', { ascending: false })
    .range(from, to)

  if (error) throw error

  return {
    paymentsEnabled: arePaymentsEnabled(),
    recentEvents: data || [],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize) || 1,
  }
}

/**
 * Fetches recent administrative audit logs.
 */
export async function fetchAdminAuditLogsData(limit = 50) {
  const admin = getSupabaseAdmin()
  if (!admin) throw new Error('Database client unconfigured')

  const safeLimit = Math.min(100, Math.max(1, limit))

  const { data, error } = await admin
    .from('admin_audit_logs')
    .select('id, admin_email, action, target_type, target_id, details, created_at')
    .order('created_at', { ascending: false })
    .limit(safeLimit)

  if (error) throw error

  return data || []
}
