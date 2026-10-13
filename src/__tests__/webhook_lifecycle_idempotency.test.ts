import { describe, it, expect, vi, beforeEach } from 'vitest'
import crypto from 'node:crypto'
import { processWebhookEvent } from '../../api/_lib/dodoPayments.js'
import * as supabaseAdmin from '../../api/_lib/supabaseAdmin.js'

describe('Dodo Payments Webhook Processing, Idempotency & Lifecycle', () => {
  const secretKey = 'whsec_' + Buffer.from('test-secret-key-32-bytes-minimum-length').toString('base64')

  beforeEach(() => {
    vi.restoreAllMocks()
    process.env.DODO_PAYMENTS_WEBHOOK_SECRET = secretKey
  })

  function createSignedWebhook(eventId: string, eventType: string, payload: Record<string, unknown> = {}) {
    const rawBody = JSON.stringify({
      id: eventId,
      type: eventType,
      data: payload,
    })
    const timestamp = Math.floor(Date.now() / 1000).toString()
    const rawSecretBytes = Buffer.from(secretKey.slice(6), 'base64')
    const signedPayload = `${eventId}.${timestamp}.${rawBody}`
    const sig = crypto.createHmac('sha256', rawSecretBytes).update(signedPayload).digest('base64')

    const headers = {
      'webhook-id': eventId,
      'webhook-timestamp': timestamp,
      'webhook-signature': `v1,${sig}`,
    }

    return { rawBody, headers }
  }

  it('transitions state: claiming -> processing -> processed on successful lifecycle', async () => {
    const eventId = 'evt_success_100'
    const eventType = 'payment.succeeded'

    const claimSpy = vi.spyOn(supabaseAdmin, 'claimPaymentEventForProcessing').mockResolvedValue({
      shouldProcess: true,
    })
    const lifecycleSpy = vi.spyOn(supabaseAdmin, 'handleSubscriptionLifecycleEvent').mockResolvedValue({
      success: true,
    })
    const recordSpy = vi.spyOn(supabaseAdmin, 'recordPaymentEvent').mockResolvedValue({
      success: true,
    })

    const { rawBody, headers } = createSignedWebhook(eventId, eventType, {
      customer: { email: 'user@example.com' },
      metadata: { userId: '11111111-1111-1111-1111-111111111111', planId: 'pro' },
    })

    const result = await processWebhookEvent(rawBody, headers)

    expect(result.status).toBe(200)
    expect(result.message).toContain('Processed payment.succeeded successfully')
    expect(claimSpy).toHaveBeenCalledWith(
      expect.objectContaining({ eventId, eventType, provider: 'dodo_payments' })
    )
    expect(lifecycleSpy).toHaveBeenCalledWith({
      eventType,
      payload: expect.any(Object),
    })
    expect(recordSpy).toHaveBeenCalledWith(
      expect.objectContaining({ eventId, status: 'processed' })
    )
  })

  it('transitions state to failed and returns HTTP 500 when lifecycle mutation fails, enabling provider retries', async () => {
    const eventId = 'evt_failure_200'
    const eventType = 'subscription.created'

    vi.spyOn(supabaseAdmin, 'claimPaymentEventForProcessing').mockResolvedValue({
      shouldProcess: true,
    })
    vi.spyOn(supabaseAdmin, 'handleSubscriptionLifecycleEvent').mockResolvedValue({
      success: false,
      error: 'Database lock contention during entitlement update',
    })
    const recordSpy = vi.spyOn(supabaseAdmin, 'recordPaymentEvent').mockResolvedValue({
      success: true,
    })

    const { rawBody, headers } = createSignedWebhook(eventId, eventType, {
      metadata: { userId: '22222222-2222-2222-2222-222222222222', planId: 'pro' },
    })

    const result = await processWebhookEvent(rawBody, headers)

    expect(result.status).toBe(500)
    expect(result.message).toContain('Database lock contention')
    expect(recordSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        eventId,
        status: 'failed',
        errorMessage: expect.stringContaining('Database lock contention'),
      })
    )
  })

  it('allows retrying previously failed events and recovers without false duplicate detection', async () => {
    const eventId = 'evt_retry_300'
    const eventType = 'payment.succeeded'

    // First attempt fails
    vi.spyOn(supabaseAdmin, 'claimPaymentEventForProcessing').mockResolvedValue({
      shouldProcess: true,
    })
    vi.spyOn(supabaseAdmin, 'handleSubscriptionLifecycleEvent').mockResolvedValueOnce({
      success: false,
      error: 'Transient network failure',
    }).mockResolvedValueOnce({
      success: true,
    })
    const recordSpy = vi.spyOn(supabaseAdmin, 'recordPaymentEvent').mockResolvedValue({
      success: true,
    })

    const { rawBody, headers } = createSignedWebhook(eventId, eventType, {
      metadata: { userId: '33333333-3333-3333-3333-333333333333', planId: 'pro' },
    })

    // Attempt 1 fails -> returns 500
    const attempt1 = await processWebhookEvent(rawBody, headers)
    expect(attempt1.status).toBe(500)
    expect(recordSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({ eventId, status: 'failed' })
    )

    // Attempt 2 succeeds -> returns 200
    const attempt2 = await processWebhookEvent(rawBody, headers)
    expect(attempt2.status).toBe(200)
    expect(recordSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({ eventId, status: 'processed' })
    )
  })

  it('skips duplicate already-processed events idempotently with HTTP 200', async () => {
    const eventId = 'evt_duplicate_400'
    const eventType = 'subscription.renewed'

    vi.spyOn(supabaseAdmin, 'claimPaymentEventForProcessing').mockResolvedValue({
      shouldProcess: false,
      alreadyProcessed: true,
    })
    const lifecycleSpy = vi.spyOn(supabaseAdmin, 'handleSubscriptionLifecycleEvent')

    const { rawBody, headers } = createSignedWebhook(eventId, eventType)
    const result = await processWebhookEvent(rawBody, headers)

    expect(result.status).toBe(200)
    expect(result.message).toContain('already processed (idempotent)')
    expect(lifecycleSpy).not.toHaveBeenCalled()
  })

  it('returns HTTP 429 when event is in flight across concurrent workers', async () => {
    const eventId = 'evt_inflight_500'
    const eventType = 'payment.succeeded'

    vi.spyOn(supabaseAdmin, 'claimPaymentEventForProcessing').mockResolvedValue({
      shouldProcess: false,
      inFlight: true,
    })

    const { rawBody, headers } = createSignedWebhook(eventId, eventType)
    const result = await processWebhookEvent(rawBody, headers)

    expect(result.status).toBe(429)
    expect(result.message).toContain('being processed')
  })
})
