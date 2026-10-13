// Typed Frontend Client for OSMOO Backend Endpoints

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
  rateLimited?: boolean
  details?: Record<string, string>
}

export interface EarlyAccessPayload {
  email: string
  firstName?: string
  source?: string
}

export interface EarlyAccessResponseData {
  id?: string
  isDuplicate?: boolean
  isVerified?: boolean
  isFounding50Eligible?: boolean
  emailSent?: boolean
  resendAvailable?: boolean
  emailErrorNotice?: string
}

export interface VerificationResult {
  status: 'verified' | 'already_verified' | 'expired' | 'invalid'
  email?: string
  firstName?: string
  isFounding50?: boolean
}

export interface ContactPayload {
  name: string
  email: string
  category: string
  message: string
}

export interface CheckoutPayload {
  planId: string
  billingInterval?: 'month' | 'year'
}

export interface CheckoutResponseData {
  checkoutUrl: string
  sessionId?: string
  planId: string
  status: 'created' | 'simulated' | 'redirect_ready'
}

export async function submitEarlyAccess(
  payload: EarlyAccessPayload
): Promise<ApiResponse<EarlyAccessResponseData>> {
  try {
    const res = await fetch('/api/early-access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json().catch(() => null)

    if (!res.ok) {
      if (res.status === 429) {
        return {
          success: false,
          rateLimited: true,
          error: data?.error || 'Too many submissions. Please wait a few moments before trying again.',
        }
      }
      return {
        success: false,
        error: data?.error || `Request failed with status ${res.status}`,
      }
    }

    return {
      success: true,
      data: data?.data,
      message: data?.message || 'Access request recorded successfully.',
    }
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error communicating with server.',
    }
  }
}

export async function submitContact(payload: ContactPayload): Promise<ApiResponse<{ id?: string }>> {
  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json().catch(() => null)

    if (!res.ok) {
      if (res.status === 429) {
        return {
          success: false,
          rateLimited: true,
          error: data?.error || 'Rate limit reached. Please wait before submitting another inquiry.',
        }
      }
      return {
        success: false,
        error: data?.error || `Submission failed with status ${res.status}`,
        details: data?.details,
      }
    }

    return {
      success: true,
      data: data?.data,
      message: data?.message || 'Inquiry transmitted and queued.',
    }
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network connection failure.',
    }
  }
}

export async function createCheckout(
  payload: CheckoutPayload,
  authToken?: string
): Promise<ApiResponse<CheckoutResponseData>> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`
    }

    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })

    const data = await res.json().catch(() => null)

    if (!res.ok) {
      return {
        success: false,
        error: data?.error || `Checkout failed (${res.status})`,
      }
    }

    return {
      success: true,
      data: data?.data,
      message: data?.message,
    }
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to initiate checkout session.',
    }
  }
}

export async function verifyEarlyAccess(
  token: string
): Promise<ApiResponse<VerificationResult>> {
  try {
    const res = await fetch('/api/verify-early-access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ token }),
    })

    const data = await res.json().catch(() => null)

    if (!res.ok) {
      return {
        success: false,
        error: data?.error || 'Verification failed',
        data: {
          status: data?.status || 'invalid',
          email: data?.email,
        },
      }
    }

    return {
      success: true,
      data: {
        status: data.status,
        email: data.email,
        firstName: data.firstName,
        isFounding50: data.isFounding50,
      },
      message: data.message,
    }
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error verifying token',
    }
  }
}

export async function resendVerificationEmail(
  email: string
): Promise<ApiResponse<{ isVerified?: boolean; emailSent?: boolean }>> {
  try {
    const res = await fetch('/api/resend-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })

    const data = await res.json().catch(() => null)

    if (!res.ok) {
      return {
        success: false,
        error: data?.error || 'Failed to resend verification email',
      }
    }

    return {
      success: true,
      data: {
        isVerified: data?.isVerified,
        emailSent: data?.emailSent,
      },
      message: data?.message || 'Verification email resent.',
    }
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error requesting resend',
    }
  }
}

export interface Founding50StatusData {
  totalCapacity: number
  allocatedCount: number
  remainingSlots: number
  isFull: boolean
}

export async function fetchFounding50Status(): Promise<ApiResponse<Founding50StatusData>> {
  try {
    const res = await fetch('/api/founding-status', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    const data = await res.json().catch(() => null)

    if (!res.ok) {
      return {
        success: false,
        error: data?.error || 'Failed to fetch Founding 50 status',
      }
    }

    return {
      success: true,
      data: data?.data,
    }
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network failure querying Founding 50 status',
    }
  }
}


