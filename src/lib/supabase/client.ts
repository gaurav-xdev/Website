import { createClient, type SupabaseClient, type User, type Session } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export interface SupabaseConfigStatus {
  isConfigured: boolean
  urlMissing: boolean
  keyMissing: boolean
  targetUrl?: string
}

export function getSupabaseConfigStatus(): SupabaseConfigStatus {
  const isUrlSet = Boolean(supabaseUrl && supabaseUrl.startsWith('http') && !supabaseUrl.includes('your-project.supabase.co'))
  const isKeySet = Boolean(supabaseAnonKey && supabaseAnonKey.length > 20 && !supabaseAnonKey.includes('your_supabase_anon'))

  return {
    isConfigured: isUrlSet && isKeySet,
    urlMissing: !isUrlSet,
    keyMissing: !isKeySet,
    targetUrl: supabaseUrl,
  }
}

let clientInstance: SupabaseClient | null = null

export function getSupabase(): SupabaseClient | null {
  const status = getSupabaseConfigStatus()
  if (!status.isConfigured || !supabaseUrl || !supabaseAnonKey) {
    return null
  }

  if (!clientInstance) {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'osmoo_auth_token',
      },
    })
  }

  return clientInstance
}

export function getCanonicalRedirectUrl(path = ''): string {
  if (typeof window !== 'undefined') {
    const origin = window.location.origin
    const hostname = window.location.hostname.toLowerCase()
    // If running on localhost or on osmoo.in or *.vercel.app, trust window.location.origin
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === 'osmoo.in' ||
      hostname.endsWith('.osmoo.in') ||
      hostname.endsWith('.vercel.app')
    ) {
      return `${origin}${path.startsWith('/') ? path : `/${path}`}`
    }
  }
  return `https://osmoo.in${path.startsWith('/') ? path : `/${path}`}`
}

export async function signInWithGoogle(options?: { redirectTo?: string }): Promise<{ success: boolean; url?: string; error?: string }> {
  const supabase = getSupabase()
  if (!supabase) {
    return {
      success: false,
      error: 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    }
  }

  try {
    const redirectTo = options?.redirectTo || getCanonicalRedirectUrl('/')
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) {
      // Check if provider is not enabled in Supabase Dashboard
      if (
        error.message.toLowerCase().includes('unsupported provider') ||
        error.message.toLowerCase().includes('validation_failed') ||
        error.message.toLowerCase().includes('provider is not enabled')
      ) {
        return {
          success: false,
          error: 'Google OAuth is not enabled in the Supabase project. In Supabase Dashboard -> Authentication -> Providers -> Google, enable Google and paste your Google Cloud OAuth Client ID and Secret.',
        }
      }
      return { success: false, error: error.message }
    }

    return { success: true, url: data.url }
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to initiate Google sign-in.',
    }
  }
}

export async function sendEmailOtp(email: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase()
  if (!supabase) {
    return {
      success: false,
      error: 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.',
    }
  }

  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: getCanonicalRedirectUrl('/'),
      },
    })

    if (error) {
      if (error.message.toLowerCase().includes('rate limit')) {
        return {
          success: false,
          error: 'Email rate limit reached for Supabase default mailer (3-4 emails/hour limit). Please configure a custom SMTP provider in Supabase Dashboard -> Auth -> SMTP, or wait a few minutes before retrying.',
        }
      }
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to send OTP code. Please try again.',
    }
  }
}

export async function verifyEmailOtp(
  email: string,
  token: string
): Promise<{ success: boolean; user?: User; session?: Session; error?: string }> {
  const supabase = getSupabase()
  if (!supabase) {
    return {
      success: false,
      error: 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    }
  }

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return {
      success: true,
      user: data.user ?? undefined,
      session: data.session ?? undefined,
    }
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Verification failed.',
    }
  }
}

export async function signOutUser(): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase()
  if (!supabase) return { success: true }

  try {
    const { error } = await supabase.auth.signOut()
    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Sign out error',
    }
  }
}

export async function getCurrentSession(): Promise<Session | null> {
  const supabase = getSupabase()
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session
}

export function subscribeToAuth(callback: (event: string, session: Session | null) => void): (() => void) {
  const supabase = getSupabase()
  if (!supabase) {
    return () => {}
  }

  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session)
  })

  return () => {
    subscription.unsubscribe()
  }
}

export interface UserEntitlementDetails {
  tier: string
  isPro: boolean
  source?: string
  expiresAt?: string | null
  isExpired?: boolean
}

export async function getUserEntitlementStatus(userId: string): Promise<UserEntitlementDetails> {
  const supabase = getSupabase()
  if (!supabase || !userId) {
    return { tier: 'free', isPro: false }
  }

  try {
    // 1. Check for active paid subscription
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('plan_id, status, current_period_end')
      .eq('user_id', userId)
      .in('status', ['active', 'trialing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (sub) {
      const isPeriodValid = !sub.current_period_end || new Date(sub.current_period_end) > new Date()
      if (isPeriodValid) {
        return {
          tier: sub.plan_id || 'pro',
          isPro: true,
          source: 'Paid Subscription',
          expiresAt: sub.current_period_end || null,
          isExpired: false,
        }
      }
    }

    // 2. Check for Founding 50 entitlement
    const { data: founding } = await supabase
      .from('founding_entitlements')
      .select('tier, status, expires_at')
      .eq('user_id', userId)
      .maybeSingle()

    if (founding) {
      const isExpired = new Date(founding.expires_at) <= new Date() || founding.status === 'expired'
      return {
        tier: isExpired ? 'free' : 'pro',
        isPro: !isExpired,
        source: 'The Founding 50 (12 Months Free)',
        expiresAt: founding.expires_at,
        isExpired,
      }
    }

    return {
      tier: 'free',
      isPro: false,
    }
  } catch {
    return {
      tier: 'free',
      isPro: false,
    }
  }
}

