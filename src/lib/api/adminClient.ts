export interface AdminOverviewStats {
  signups: {
    total: number
    verified: number
    unverified: number
    founding50Claimed: number
    founding50Remaining: number
    founding50Cap: number
  }
  contacts: {
    total: number
    unread: number
    read: number
    resolved: number
  }
  payments: {
    enabled: boolean
    totalEvents: number
    failedEvents: number
  }
  system: {
    nodeEnv: string
    databaseConnected: boolean
    emailConfigured: boolean
    paymentsConfigured: boolean
    paymentsFeatureFlag: boolean
    serverTimestamp: string
  }
}

export interface AdminWaitlistEntry {
  id: string
  email: string
  first_name: string | null
  source: string
  is_verified: boolean
  is_founding_50: boolean
  founding_50_granted_at: string | null
  created_at: string
  verification_sent_at: string | null
}

export interface AdminWaitlistResponse {
  data: AdminWaitlistEntry[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface AdminContactEntry {
  id: string
  name: string
  email: string
  category: string
  message: string
  status: 'unread' | 'read' | 'resolved'
  notes: string | null
  created_at: string
  updated_at: string
}

export interface AdminContactsResponse {
  data: AdminContactEntry[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface AdminPaymentEvent {
  id: string
  provider: string
  event_id: string
  event_type: string
  processed_at: string
  status: string
  error_message: string | null
}

export interface AdminPaymentsResponse {
  paymentsEnabled: boolean
  recentEvents: AdminPaymentEvent[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface AdminAuditLogEntry {
  id: string
  admin_email: string
  action: string
  target_type: string | null
  target_id: string | null
  details: Record<string, unknown>
  created_at: string
}

async function handleAdminFetch<T>(url: string, token: string, options: RequestInit = {}): Promise<{ success: boolean; data?: T; error?: string; status: number }> {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...(options.headers || {}),
      },
    })

    const body = await res.json().catch(() => null)

    if (!res.ok) {
      return {
        success: false,
        status: res.status,
        error: body?.error || `Request failed with status ${res.status}`,
      }
    }

    return {
      success: true,
      status: res.status,
      data: (body?.data !== undefined ? body.data : body) as T,
    }
  } catch (err: unknown) {
    return {
      success: false,
      status: 0,
      error: err instanceof Error ? err.message : 'Network error reaching administrative endpoint',
    }
  }
}

export async function fetchAdminOverview(token: string) {
  return handleAdminFetch<AdminOverviewStats>('/api/admin/overview', token)
}

export async function fetchAdminWaitlist(
  token: string,
  params: { page?: number; pageSize?: number; search?: string; filter?: string } = {}
) {
  const query = new URLSearchParams()
  if (params.page) query.set('page', params.page.toString())
  if (params.pageSize) query.set('pageSize', params.pageSize.toString())
  if (params.search) query.set('search', params.search)
  if (params.filter) query.set('filter', params.filter)

  return handleAdminFetch<AdminWaitlistResponse>(`/api/admin/waitlist?${query.toString()}`, token)
}

export async function fetchAdminContacts(
  token: string,
  params: { page?: number; pageSize?: number; search?: string; status?: string } = {}
) {
  const query = new URLSearchParams()
  if (params.page) query.set('page', params.page.toString())
  if (params.pageSize) query.set('pageSize', params.pageSize.toString())
  if (params.search) query.set('search', params.search)
  if (params.status) query.set('status', params.status)

  return handleAdminFetch<AdminContactsResponse>(`/api/admin/contacts?${query.toString()}`, token)
}

export async function updateAdminContact(
  token: string,
  payload: { id: string; status: 'unread' | 'read' | 'resolved'; notes?: string }
) {
  return handleAdminFetch<{ id: string; status: string; notes?: string }>('/api/admin/contacts', token, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function fetchAdminPayments(
  token: string,
  params: { page?: number; pageSize?: number } = {}
) {
  const query = new URLSearchParams()
  if (params.page) query.set('page', params.page.toString())
  if (params.pageSize) query.set('pageSize', params.pageSize.toString())

  return handleAdminFetch<AdminPaymentsResponse>(`/api/admin/payments?${query.toString()}`, token)
}

export async function fetchAdminAuditLogs(token: string, limit = 50) {
  return handleAdminFetch<AdminAuditLogEntry[]>(`/api/admin/audit-logs?limit=${limit}`, token)
}
