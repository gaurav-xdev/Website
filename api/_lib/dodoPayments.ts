import crypto from 'node:crypto'
import { getServerPlan } from './plans.js'
import {
  recordPaymentEvent,
  claimPaymentEventForProcessing,
  handleSubscriptionLifecycleEvent,
} from './supabaseAdmin.js'

function getApiKey(): string | undefined {
  return process.env.DODO_PAYMENTS_API_KEY
}

function getWebhookSecret(): string | undefined {
  return process.env.DODO_PAYMENTS_WEBHOOK_SECRET
}

export function isDodoConfigured(): boolean {
  const key = getApiKey()
  return Boolean(
    key &&
    key.length > 10 &&
    !key.includes('dodo_api_key')
  )
}

export function isDodoWebhookConfigured(): boolean {
  const secret = getWebhookSecret()
  return Boolean(
    secret &&
    secret.length > 10 &&
    !secret.includes('whsec_your_dodo')
  )
}

export interface CreateCheckoutParams {
  planId: string
  billingInterval?: 'month' | 'year'
  userEmail?: string
  userId?: string
}

export interface CheckoutResult {
  success: boolean
  checkoutUrl?: string
  sessionId?: string
  error?: string
  setupMode?: boolean
}

export async function createDodoCheckout(params: CreateCheckoutParams): Promise<CheckoutResult> {
  const plan = getServerPlan(params.planId)
  if (!plan) {
    return { success: false, error: `Invalid plan specified: ${params.planId}` }
  }

  if (!plan.requiresCheckout) {
    return { success: false, error: `Plan '${plan.name}' does not require checkout.` }
  }

  if (!isDodoConfigured()) {
    return {
      success: false,
      setupMode: true,
      error: 'Dodo Payments provider is currently in setup mode. Live checkout will activate once commercial keys are provisioned.',
    }
  }

  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production'
  const isLiveEnv = process.env.DODO_PAYMENTS_ENVIRONMENT === 'live_mode'
  const hasPlaceholderProductId = !plan.dodoProductId || plan.dodoProductId.startsWith('p_osmoo_')

  if ((isProduction || isLiveEnv) && hasPlaceholderProductId) {
    return {
      success: false,
      setupMode: true,
      error: `Live Dodo Payments product ID is not configured for ${plan.name} plan. Please set DODO_${plan.id.toUpperCase()}_PRODUCT_ID in environment.`,
    }
  }

  const apiKey = getApiKey()
  const environment = process.env.DODO_PAYMENTS_ENVIRONMENT || 'test_mode'
  const appBaseUrl = process.env.APP_BASE_URL || 'https://osmoo.in'

  const baseUrl = environment === 'live_mode'
    ? 'https://api.dodopayments.com'
    : 'https://test.dodopayments.com'

  try {
    const payload = {
      product_id: plan.dodoProductId,
      billing: {
        interval: params.billingInterval || 'month',
      },
      customer: {
        email: params.userEmail,
      },
      metadata: {
        userId: params.userId || 'anonymous',
        planId: plan.id,
      },
      return_url: `${appBaseUrl}/#pricing?checkout=success&plan=${plan.id}`,
      cancel_url: `${appBaseUrl}/#pricing?checkout=cancelled`,
    }

    const response = await fetch(`${baseUrl}/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errBody = await response.text()
      return {
        success: false,
        error: `Payment provider error (${response.status}): ${errBody.slice(0, 150)}`,
      }
    }

    const data = await response.json() as { checkout_url?: string; session_id?: string; url?: string }
    const checkoutUrl = data.checkout_url || data.url

    if (!checkoutUrl) {
      return { success: false, error: 'Checkout session created but no redirect URL was returned by provider.' }
    }

    return {
      success: true,
      checkoutUrl,
      sessionId: data.session_id,
    }
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error reaching payment provider.',
    }
  }
}

/**
 * Verifies standard webhook signatures (Standard Webhooks / Dodo Payments specification)
 * Header spec:
 * webhook-id: unique event id
 * webhook-timestamp: unix epoch in seconds
 * webhook-signature: space-delimited signatures prefixed with v1,
 */
export function verifyWebhookSignature(
  rawBody: string,
  headers: Record<string, string | string[] | undefined>
): { isValid: boolean; error?: string } {
  const webhookSecret = getWebhookSecret()
  if (!isDodoWebhookConfigured() || !webhookSecret) {
    return { isValid: false, error: 'Webhook secret is not configured on the server.' }
  }

  const webhookId = (headers['webhook-id'] || headers['Webhook-Id']) as string | undefined
  const webhookTimestamp = (headers['webhook-timestamp'] || headers['Webhook-Timestamp']) as string | undefined
  const webhookSignature = (headers['webhook-signature'] || headers['Webhook-Signature'] || headers['dodo-signature']) as string | undefined

  if (!webhookId || !webhookTimestamp || !webhookSignature) {
    return { isValid: false, error: 'Missing required webhook signature headers.' }
  }

  // Verify timestamp within 5-minute tolerance to prevent replay attacks
  const ts = Number(webhookTimestamp)
  const now = Math.floor(Date.now() / 1000)
  if (isNaN(ts) || Math.abs(now - ts) > 300) {
    return { isValid: false, error: 'Webhook timestamp is outside the acceptable 5-minute window.' }
  }

  // Prepare secret key
  let secretBytes: Buffer
  if (webhookSecret.startsWith('whsec_')) {
    secretBytes = Buffer.from(webhookSecret.slice(6), 'base64')
  } else {
    secretBytes = Buffer.from(webhookSecret, 'utf-8')
  }

  // Construct signed payload: id.timestamp.body
  const signedPayload = `${webhookId}.${webhookTimestamp}.${rawBody}`
  const hmac = crypto.createHmac('sha256', secretBytes)
  hmac.update(signedPayload)
  const computedSignature = `v1,${hmac.digest('base64')}`

  // Extract signatures from header
  const receivedSignatures = webhookSignature.split(' ')

  let matched = false
  for (const sig of receivedSignatures) {
    if (sig.length === computedSignature.length) {
      if (crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(computedSignature))) {
        matched = true
        break
      }
    }
  }

  if (!matched) {
    return { isValid: false, error: 'Webhook signature verification failed.' }
  }

  return { isValid: true }
}

export async function processWebhookEvent(
  rawBody: string,
  headers: Record<string, string | string[] | undefined>
): Promise<{ status: number; message: string }> {
  const verification = verifyWebhookSignature(rawBody, headers)
  if (!verification.isValid) {
    return { status: 401, message: verification.error || 'Unauthorized webhook signature' }
  }

  let event: { id?: string; type?: string; data?: Record<string, unknown> }
  try {
    event = JSON.parse(rawBody)
  } catch {
    return { status: 400, message: 'Invalid JSON payload' }
  }

  const eventId = event.id || (headers['webhook-id'] as string)
  const eventType = event.type || 'unknown'

  if (!eventId) {
    return { status: 400, message: 'Missing event ID' }
  }

  // Atomically claim the event for processing
  const claim = await claimPaymentEventForProcessing({
    provider: 'dodo_payments',
    eventId,
    eventType,
    payload: event.data || {},
  })

  if (!claim.shouldProcess) {
    if (claim.alreadyProcessed) {
      return { status: 200, message: 'Event already processed (idempotent)' }
    }
    if (claim.inFlight) {
      return { status: 429, message: 'Event is currently being processed by another worker' }
    }
    return { status: 500, message: claim.error || 'Failed to claim payment event' }
  }

  // Process lifecycle states
  try {
    // Apply subscription & entitlement updates server-side
    const lifecycleResult = await handleSubscriptionLifecycleEvent({
      eventType,
      payload: event.data || {},
    })

    if (!lifecycleResult.success) {
      throw new Error(lifecycleResult.error || 'Failed to apply subscription lifecycle mutations')
    }

    // Mark event as processed only after mutations succeed
    await recordPaymentEvent({
      provider: 'dodo_payments',
      eventId,
      eventType,
      payload: event.data || {},
      status: 'processed',
    })

    return { status: 200, message: `Processed ${eventType} successfully` }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Processing error'
    await recordPaymentEvent({
      provider: 'dodo_payments',
      eventId,
      eventType,
      payload: event.data || {},
      status: 'failed',
      errorMessage: errorMsg,
    })

    // Return HTTP 500 so Dodo Payments retries
    return { status: 500, message: errorMsg }
  }
}
