import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

let adminClient: SupabaseClient | null = null

export function isSupabaseAdminConfigured(): boolean {
  return Boolean(
    supabaseUrl &&
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('your-project.supabase.co') &&
    serviceRoleKey &&
    serviceRoleKey.length > 20 &&
    !serviceRoleKey.includes('your_supabase_service_role')
  )
}

export function getSupabaseAdmin(): SupabaseClient | null {
  if (!isSupabaseAdminConfigured() || !supabaseUrl || !serviceRoleKey) {
    return null
  }

  if (!adminClient) {
    adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }

  return adminClient
}

export async function insertEarlyAccess(data: {
  email: string
  firstName?: string
  source?: string
  ipHash?: string
  verificationTokenHash?: string
  verificationExpiresAt?: string
}): Promise<{
  success: boolean
  id?: string
  isDuplicate?: boolean
  isVerified?: boolean
  isFounding50Eligible?: boolean
  error?: string
  configured: boolean
}> {
  const isConfigured = isSupabaseAdminConfigured()
  const admin = getSupabaseAdmin()

  if (!admin || !isConfigured) {
    // Honest reporting: database is not configured in environment
    return {
      success: false,
      configured: false,
      error: 'Waitlist database is currently in setup mode. Please configure SUPABASE_SERVICE_ROLE_KEY to activate persistence.',
    }
  }

  try {
    // Check if user already registered
    const { data: existing } = await admin
      .from('early_access_requests')
      .select('id, email, is_verified, is_founding_50, created_at, verification_sent_at')
      .eq('email', data.email)
      .maybeSingle()

    if (existing) {
      return {
        success: true,
        id: existing.id,
        isDuplicate: true,
        isVerified: existing.is_verified,
        isFounding50Eligible: existing.is_founding_50,
        configured: true,
      }
    }

    // Server-side Founding 50 reward quota check:
    // Only verified signups qualify for the first 50 reward
    const { count: verifiedFoundingCount } = await admin
      .from('early_access_requests')
      .select('*', { count: 'exact', head: true })
      .eq('is_founding_50', true)

    const remainingSpots = Math.max(0, 50 - (verifiedFoundingCount || 0))
    const isEligibleForOffer = remainingSpots > 0

    const nowIso = new Date().toISOString()
    const { data: record, error } = await admin
      .from('early_access_requests')
      .insert({
        email: data.email,
        first_name: data.firstName || null,
        source: data.source || 'website_waitlist_modal',
        ip_hash: data.ipHash,
        status: 'pending',
        is_verified: false,
        is_founding_50: false, // will be confirmed upon email verification
        verification_token_hash: data.verificationTokenHash || null,
        verification_token_expires_at: data.verificationExpiresAt || null,
        verification_sent_at: data.verificationTokenHash ? nowIso : null,
        created_at: nowIso,
      })
      .select('id')
      .single()

    if (error) {
      return { success: false, configured: true, error: error.message }
    }

    return {
      success: true,
      id: record?.id,
      isDuplicate: false,
      isVerified: false,
      isFounding50Eligible: isEligibleForOffer,
      configured: true,
    }
  } catch (err: unknown) {
    return {
      success: false,
      configured: true,
      error: err instanceof Error ? err.message : 'Database operation failed',
    }
  }
}

export async function insertContactMessage(data: {
  name: string
  email: string
  category: string
  message: string
  ipHash?: string
}): Promise<{ success: boolean; id?: string; error?: string }> {
  const admin = getSupabaseAdmin()
  if (!admin) {
    return { success: true, id: `local-${Date.now()}` }
  }

  try {
    const { data: record, error } = await admin
      .from('contact_messages')
      .insert({
        name: data.name,
        email: data.email,
        category: data.category,
        message: data.message,
        ip_hash: data.ipHash,
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, id: record?.id }
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to persist contact inquiry',
    }
  }
}

export async function getPaymentEventStatus(eventId: string): Promise<{
  exists: boolean
  status?: 'pending' | 'processing' | 'processed' | 'failed' | 'ignored'
  retryCount?: number
  processedAt?: string
  lastError?: string
}> {
  const admin = getSupabaseAdmin()
  if (!admin) return { exists: false }

  try {
    const { data, error } = await admin
      .from('payment_events')
      .select('status, retry_count, processed_at, last_error, error_message')
      .eq('event_id', eventId)
      .maybeSingle()

    if (error || !data) {
      return { exists: false }
    }

    return {
      exists: true,
      status: data.status,
      retryCount: data.retry_count ?? 0,
      processedAt: data.processed_at,
      lastError: data.last_error || data.error_message || undefined,
    }
  } catch {
    return { exists: false }
  }
}

export async function hasProcessedPaymentEvent(eventId: string): Promise<boolean> {
  const info = await getPaymentEventStatus(eventId)
  return info.exists && info.status === 'processed'
}

export async function claimPaymentEventForProcessing(params: {
  provider: string
  eventId: string
  eventType: string
  payload: Record<string, unknown>
}): Promise<{
  shouldProcess: boolean
  alreadyProcessed?: boolean
  inFlight?: boolean
  error?: string
}> {
  const admin = getSupabaseAdmin()
  if (!admin) return { shouldProcess: true }

  try {
    const statusInfo = await getPaymentEventStatus(params.eventId)
    if (statusInfo.exists) {
      if (statusInfo.status === 'processed') {
        return { shouldProcess: false, alreadyProcessed: true }
      }
      if (statusInfo.status === 'processing' && statusInfo.processedAt) {
        const processingAgeMs = Date.now() - new Date(statusInfo.processedAt).getTime()
        // If actively claimed within 45 seconds, treat as concurrent in-flight
        if (processingAgeMs < 45_000) {
          return { shouldProcess: false, inFlight: true }
        }
      }
    }

    const nowIso = new Date().toISOString()
    const nextRetryCount = (statusInfo.retryCount ?? 0) + (statusInfo.exists ? 1 : 0)

    const { error } = await admin.from('payment_events').upsert({
      provider: params.provider,
      event_id: params.eventId,
      event_type: params.eventType,
      payload: params.payload,
      status: 'processing',
      retry_count: nextRetryCount,
      processed_at: nowIso,
      updated_at: nowIso,
    }, { onConflict: 'event_id' })

    if (error) {
      return { shouldProcess: false, error: error.message }
    }

    return { shouldProcess: true }
  } catch (err: unknown) {
    return {
      shouldProcess: false,
      error: err instanceof Error ? err.message : 'Failed to claim payment event',
    }
  }
}

export async function recordPaymentEvent(params: {
  provider: string
  eventId: string
  eventType: string
  payload: Record<string, unknown>
  status: 'pending' | 'processing' | 'processed' | 'ignored' | 'failed'
  errorMessage?: string
}): Promise<{ success: boolean; error?: string }> {
  const admin = getSupabaseAdmin()
  if (!admin) return { success: true }

  try {
    const nowIso = new Date().toISOString()
    const { error } = await admin.from('payment_events').upsert({
      provider: params.provider,
      event_id: params.eventId,
      event_type: params.eventType,
      payload: params.payload,
      status: params.status,
      error_message: params.errorMessage || null,
      last_error: params.errorMessage || null,
      processed_at: nowIso,
      updated_at: nowIso,
    }, { onConflict: 'event_id' })

    if (error) {
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to record payment event',
    }
  }
}

export async function handleSubscriptionLifecycleEvent(params: {
  eventType: string
  payload: Record<string, unknown>
}): Promise<{ success: boolean; error?: string }> {
  const admin = getSupabaseAdmin()
  if (!admin) return { success: true }

  try {
    const data = params.payload as {
      customer?: { email?: string; customer_id?: string }
      customer_id?: string
      subscription_id?: string
      id?: string
      metadata?: { userId?: string; planId?: string }
      status?: string
      plan_id?: string
      product_id?: string
      current_period_start?: string
      current_period_end?: string
    }

    let userId = data.metadata?.userId
    const planId = data.metadata?.planId || 'pro'
    const subscriptionId = data.subscription_id || data.id

    // If userId not provided in metadata, attempt fallback lookup by email if available
    if (!userId || userId === 'anonymous' || !userId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      if (data.customer?.email) {
        const { data: usersData } = await admin.auth.admin.listUsers()
        const matched = usersData?.users?.find(
          (u) => u.email?.toLowerCase() === data.customer?.email?.toLowerCase()
        )
        if (matched) {
          userId = matched.id
        }
      }
    }

    // If still no valid user UUID exists (e.g. anonymous test or unauthenticated checkout),
    // acknowledge cleanly without throwing DB foreign key violations
    if (!userId || !userId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return { success: true }
    }

    const nowIso = new Date().toISOString()

    switch (params.eventType) {
      case 'subscription.created':
      case 'subscription.active':
      case 'subscription.renewed':
      case 'payment.succeeded': {
        // Upsert subscription
        const { error: subError } = await admin.from('subscriptions').upsert({
          user_id: userId,
          plan_id: planId,
          provider: 'dodo_payments',
          external_subscription_id: subscriptionId,
          external_customer_id: data.customer_id || data.customer?.customer_id,
          status: 'active',
          updated_at: nowIso,
        }, { onConflict: 'user_id, plan_id' })

        if (subError) {
          return { success: false, error: `Failed to upsert subscription: ${subError.message}` }
        }

        // Grant core neural companion entitlements
        const features = ['local_neural_companion', 'priority_inference', 'continuous_context']
        for (const feat of features) {
          const { error: entError } = await admin.from('entitlements').upsert({
            user_id: userId,
            feature_key: feat,
            is_enabled: true,
            updated_at: nowIso,
          }, { onConflict: 'user_id, feature_key' })

          if (entError) {
            return { success: false, error: `Failed to grant entitlement ${feat}: ${entError.message}` }
          }
        }
        break
      }

      case 'subscription.cancelled':
      case 'subscription.expired': {
        if (subscriptionId) {
          const { error: cancelError } = await admin.from('subscriptions').update({
            status: 'canceled',
            updated_at: nowIso,
          }).eq('external_subscription_id', subscriptionId)

          if (cancelError) {
            return { success: false, error: `Failed to cancel subscription: ${cancelError.message}` }
          }
        }

        // Check if user has an active Founding 50 grant before revoking priority entitlements
        const { data: foundingGrant } = await admin
          .from('founding_entitlements')
          .select('id, expires_at, status')
          .eq('user_id', userId)
          .eq('status', 'active')
          .gt('expires_at', nowIso)
          .maybeSingle()

        // If user does not have active Founding 50 grant, revoke paid priority entitlements
        if (!foundingGrant) {
          const revocableFeatures = ['priority_inference', 'continuous_context']
          for (const feat of revocableFeatures) {
            const { error: revError } = await admin.from('entitlements').update({
              is_enabled: false,
              updated_at: nowIso,
            }).eq('user_id', userId).eq('feature_key', feat)

            if (revError) {
              return { success: false, error: `Failed to revoke entitlement ${feat}: ${revError.message}` }
            }
          }
        }
        break
      }

      default:
        // Ignore unhandled non-entitlement events cleanly
        break
    }

    return { success: true }
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error applying subscription lifecycle',
    }
  }
}

/**
 * Idempotently links a registered user to their verified Founding 50 waitlist grant.
 */
export async function linkFounding50Account(userId: string): Promise<{
  success: boolean
  status: 'linked' | 'already_linked' | 'not_founding_member' | 'user_not_found' | 'expired'
  expiresAt?: string
  error?: string
}> {
  const admin = getSupabaseAdmin()
  if (!admin) {
    return { success: false, status: 'user_not_found', error: 'Database unconfigured' }
  }

  try {
    const { data, error } = await admin.rpc('link_founding_50_account', {
      target_user_id: userId,
    })

    if (!error && data) {
      return {
        success: Boolean(data.success),
        status: data.status,
        expiresAt: data.expires_at,
        error: data.error,
      }
    }

    return {
      success: false,
      status: 'not_founding_member',
      error: error?.message || 'Failed to link account',
    }
  } catch (err: unknown) {
    return {
      success: false,
      status: 'not_founding_member',
      error: err instanceof Error ? err.message : 'Account linking failed',
    }
  }
}

export async function verifyEarlyAccessToken(tokenHash: string): Promise<{
  success: boolean
  status: 'verified' | 'already_verified' | 'expired' | 'invalid'
  email?: string
  firstName?: string
  isFounding50?: boolean
  message?: string
  error?: string
}> {
  const admin = getSupabaseAdmin()
  if (!admin) {
    return {
      success: false,
      status: 'invalid',
      error: 'Database is unconfigured.',
    }
  }

  try {
    // 1. Try atomic database RPC function first
    const { data, error } = await admin.rpc('verify_early_access_token', {
      target_token_hash: tokenHash,
    })

    if (!error && data) {
      return {
        success: Boolean(data.success),
        status: data.status,
        email: data.email,
        firstName: data.first_name,
        isFounding50: data.is_founding_50,
        message: data.message,
        error: data.error,
      }
    }

    // 2. Fallback if RPC migration not yet applied: perform atomic query
    const { data: record, error: findError } = await admin
      .from('early_access_requests')
      .select('id, email, first_name, is_verified, is_founding_50, verification_token_expires_at')
      .eq('verification_token_hash', tokenHash)
      .maybeSingle()

    if (findError || !record) {
      return {
        success: false,
        status: 'invalid',
        error: 'Verification link is invalid or has already been used.',
      }
    }

    if (record.is_verified) {
      return {
        success: true,
        status: 'already_verified',
        email: record.email,
        firstName: record.first_name,
        isFounding50: record.is_founding_50,
        message: 'Email address has already been verified.',
      }
    }

    if (record.verification_token_expires_at && new Date(record.verification_token_expires_at) < new Date()) {
      return {
        success: false,
        status: 'expired',
        email: record.email,
        error: 'Verification link has expired. Please request a new one.',
      }
    }

    // Update record to verified
    const nowIso = new Date().toISOString()
    const { error: updateError } = await admin
      .from('early_access_requests')
      .update({
        is_verified: true,
        verified_at: nowIso,
        verification_token_hash: null,
        verification_token_expires_at: null,
        status: 'verified',
      })
      .eq('id', record.id)

    if (updateError) {
      return {
        success: false,
        status: 'invalid',
        error: 'Failed to update verification status.',
      }
    }

    // Attempt reward election if available
    try {
      await admin.rpc('assign_founding_50_rewards')
    } catch {
      // Non-blocking
    }

    return {
      success: true,
      status: 'verified',
      email: record.email,
      firstName: record.first_name,
      isFounding50: record.is_founding_50,
      message: 'Your email has been verified successfully!',
    }
  } catch (err: unknown) {
    return {
      success: false,
      status: 'invalid',
      error: err instanceof Error ? err.message : 'Verification failed.',
    }
  }
}

export async function updateEarlyAccessVerificationToken(params: {
  email: string
  tokenHash: string
  expiresAt: string
}): Promise<{
  success: boolean
  id?: string
  firstName?: string
  isVerified?: boolean
  isFounding50?: boolean
  error?: string
  cooldownActive?: boolean
  cooldownRemainingSeconds?: number
}> {
  const admin = getSupabaseAdmin()
  if (!admin) {
    return { success: false, error: 'Database is unconfigured.' }
  }

  try {
    const { data: record, error: findError } = await admin
      .from('early_access_requests')
      .select('id, email, first_name, is_verified, is_founding_50, verification_sent_at')
      .eq('email', params.email)
      .maybeSingle()

    if (findError || !record) {
      return { success: false, error: 'No waitlist entry found for this email address.' }
    }

    if (record.is_verified) {
      return {
        success: true,
        isVerified: true,
        id: record.id,
        firstName: record.first_name,
        isFounding50: record.is_founding_50,
      }
    }

    // Check 60-second cooldown
    if (record.verification_sent_at) {
      const elapsedMs = Date.now() - new Date(record.verification_sent_at).getTime()
      if (elapsedMs < 60000) {
        const remainingSeconds = Math.ceil((60000 - elapsedMs) / 1000)
        return {
          success: false,
          cooldownActive: true,
          cooldownRemainingSeconds: remainingSeconds,
          error: `Please wait ${remainingSeconds} seconds before requesting another verification email.`,
        }
      }
    }

    const nowIso = new Date().toISOString()
    const { error: updateError } = await admin
      .from('early_access_requests')
      .update({
        verification_token_hash: params.tokenHash,
        verification_token_expires_at: params.expiresAt,
        verification_sent_at: nowIso,
      })
      .eq('id', record.id)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    return {
      success: true,
      id: record.id,
      firstName: record.first_name,
      isVerified: false,
      isFounding50: record.is_founding_50,
    }
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Database error',
    }
  }
}

export interface Founding50Status {
  totalCapacity: number
  allocatedCount: number
  remainingSlots: number
  isFull: boolean
}

/**
 * Returns database-authoritative status and remaining slots for The Founding 50.
 * Queries PostgreSQL get_founding_50_status() RPC or falls back to table count.
 */
export async function getFounding50Status(): Promise<Founding50Status> {
  const admin = getSupabaseAdmin()
  const MAX_CAP = 50

  if (!admin) {
    return {
      totalCapacity: MAX_CAP,
      allocatedCount: 0,
      remainingSlots: MAX_CAP,
      isFull: false,
    }
  }

  try {
    const { data, error } = await admin.rpc('get_founding_50_status')
    if (!error && data) {
      return {
        totalCapacity: Number(data.total_capacity ?? MAX_CAP),
        allocatedCount: Number(data.allocated_count ?? 0),
        remainingSlots: Number(data.remaining_slots ?? MAX_CAP),
        isFull: Boolean(data.is_full),
      }
    }

    // Direct table query fallback
    const { count } = await admin
      .from('early_access_requests')
      .select('*', { count: 'exact', head: true })
      .eq('is_founding_50', true)

    const allocated = count ?? 0
    const remaining = Math.max(0, MAX_CAP - allocated)

    return {
      totalCapacity: MAX_CAP,
      allocatedCount: allocated,
      remainingSlots: remaining,
      isFull: remaining <= 0,
    }
  } catch {
    return {
      totalCapacity: MAX_CAP,
      allocatedCount: 0,
      remainingSlots: MAX_CAP,
      isFull: false,
    }
  }
}

export interface EffectiveUserEntitlements {
  userId: string
  effectiveTier: string
  isPro: boolean
  hasPaidSubscription: boolean
  hasFounding50: boolean
  activeSource?: string | null
  expiresAt?: string | null
  evaluatedAt: string
}

/**
 * Evaluates request-time user entitlements separating paid Pro from Founding Pro.
 * Expired founding grants are immediately denied Pro status unless covered by an active paid subscription.
 */
export async function getEffectiveUserEntitlements(userId: string): Promise<EffectiveUserEntitlements> {
  const admin = getSupabaseAdmin()
  const nowIso = new Date().toISOString()

  if (!admin || !userId) {
    return {
      userId,
      effectiveTier: 'free',
      isPro: false,
      hasPaidSubscription: false,
      hasFounding50: false,
      activeSource: null,
      expiresAt: null,
      evaluatedAt: nowIso,
    }
  }

  try {
    const { data, error } = await admin.rpc('get_effective_user_entitlements', {
      target_user_id: userId,
    })

    if (!error && data) {
      return {
        userId: data.user_id,
        effectiveTier: data.effective_tier,
        isPro: Boolean(data.is_pro),
        hasPaidSubscription: Boolean(data.has_paid_subscription),
        hasFounding50: Boolean(data.has_founding_50),
        activeSource: data.active_source,
        expiresAt: data.expires_at,
        evaluatedAt: data.evaluated_at || nowIso,
      }
    }

    // Direct query fallback: check paid subscriptions first
    const { data: sub } = await admin
      .from('subscriptions')
      .select('plan_id, status, current_period_end')
      .eq('user_id', userId)
      .in('status', ['active', 'trialing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const hasPaid = Boolean(sub && (!sub.current_period_end || new Date(sub.current_period_end) > new Date()))
    if (hasPaid && sub) {
      return {
        userId,
        effectiveTier: sub.plan_id || 'pro',
        isPro: true,
        hasPaidSubscription: true,
        hasFounding50: false,
        activeSource: 'paid_subscription',
        expiresAt: sub.current_period_end || null,
        evaluatedAt: nowIso,
      }
    }

    // Check founding entitlements
    const { data: founding } = await admin
      .from('founding_entitlements')
      .select('tier, status, expires_at')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle()

    const isFoundingValid = Boolean(founding && new Date(founding.expires_at) > new Date())

    return {
      userId,
      effectiveTier: isFoundingValid ? 'pro' : 'free',
      isPro: isFoundingValid,
      hasPaidSubscription: false,
      hasFounding50: isFoundingValid,
      activeSource: isFoundingValid ? 'founding_50' : null,
      expiresAt: isFoundingValid ? founding?.expires_at : null,
      evaluatedAt: nowIso,
    }
  } catch {
    return {
      userId,
      effectiveTier: 'free',
      isPro: false,
      hasPaidSubscription: false,
      hasFounding50: false,
      activeSource: null,
      expiresAt: null,
      evaluatedAt: nowIso,
    }
  }
}

/**
 * Scheduled or manual cleanup maintenance job: marks expired founding grants as expired.
 * Idempotent: safe to run repeatedly.
 */
export async function expireStaleFoundingGrants(): Promise<{ success: boolean; expiredCount: number; error?: string }> {
  const admin = getSupabaseAdmin()
  if (!admin) return { success: true, expiredCount: 0 }

  try {
    const { data, error } = await admin.rpc('expire_stale_founding_grants')
    if (!error && typeof data === 'number') {
      return { success: true, expiredCount: data }
    }

    // Direct fallback
    const nowIso = new Date().toISOString()
    const { data: expiredRecords } = await admin
      .from('founding_entitlements')
      .select('id, user_id')
      .eq('status', 'active')
      .lte('expires_at', nowIso)

    let count = 0
    if (expiredRecords && expiredRecords.length > 0) {
      for (const rec of expiredRecords) {
        await admin
          .from('founding_entitlements')
          .update({ status: 'expired', updated_at: nowIso })
          .eq('id', rec.id)

        // Check if user has paid sub
        const { data: paidSub } = await admin
          .from('subscriptions')
          .select('id')
          .eq('user_id', rec.user_id)
          .eq('status', 'active')
          .maybeSingle()

        if (!paidSub) {
          await admin
            .from('entitlements')
            .update({ is_enabled: false, updated_at: nowIso })
            .eq('user_id', rec.user_id)
            .in('feature_key', ['priority_inference', 'continuous_context'])
        }
        count++
      }
    }

    return { success: true, expiredCount: count }
  } catch (err: unknown) {
    return {
      success: false,
      expiredCount: 0,
      error: err instanceof Error ? err.message : 'Cleanup job failed',
    }
  }
}

