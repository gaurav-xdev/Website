import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { verifyWebhookSignature } from '../../api/_lib/dodoPayments.js'
import crypto from 'node:crypto'

describe('Dodo Payments Webhook Signature & Security', () => {
  const secretKey = 'whsec_' + Buffer.from('test-secret-key-32-bytes-minimum-length').toString('base64')
  const originalSecret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET

  beforeEach(() => {
    process.env.DODO_PAYMENTS_WEBHOOK_SECRET = secretKey
  })

  afterEach(() => {
    process.env.DODO_PAYMENTS_WEBHOOK_SECRET = originalSecret
  })

  it('verifies valid HMAC-SHA256 signature conforming to Standard Webhooks', () => {
    const rawBody = JSON.stringify({
      id: 'evt_123456789',
      type: 'payment.succeeded',
      data: { amount_cents: 2400, currency: 'USD' },
    })

    const webhookId = 'msg_test_001'
    const timestamp = Math.floor(Date.now() / 1000).toString()

    const rawSecretBytes = Buffer.from(secretKey.slice(6), 'base64')
    const signedPayload = `${webhookId}.${timestamp}.${rawBody}`
    const sig = crypto.createHmac('sha256', rawSecretBytes).update(signedPayload).digest('base64')

    const headers = {
      'webhook-id': webhookId,
      'webhook-timestamp': timestamp,
      'webhook-signature': `v1,${sig}`,
    }

    const verification = verifyWebhookSignature(rawBody, headers)
    expect(verification.isValid).toBe(true)
  })

  it('rejects tampered body or invalid signature', () => {
    const rawBody = JSON.stringify({ id: 'evt_valid', type: 'payment.succeeded' })
    const webhookId = 'msg_test_002'
    const timestamp = Math.floor(Date.now() / 1000).toString()

    const headers = {
      'webhook-id': webhookId,
      'webhook-timestamp': timestamp,
      'webhook-signature': 'v1,invalidBase64SignatureHere==',
    }

    const verification = verifyWebhookSignature(rawBody, headers)
    expect(verification.isValid).toBe(false)
  })

  it('rejects replay attacks with timestamp older than 5 minutes', () => {
    const rawBody = JSON.stringify({ id: 'evt_old', type: 'payment.succeeded' })
    const webhookId = 'msg_test_003'
    // 10 minutes in the past
    const expiredTimestamp = (Math.floor(Date.now() / 1000) - 600).toString()

    const rawSecretBytes = Buffer.from(secretKey.slice(6), 'base64')
    const signedPayload = `${webhookId}.${expiredTimestamp}.${rawBody}`
    const sig = crypto.createHmac('sha256', rawSecretBytes).update(signedPayload).digest('base64')

    const headers = {
      'webhook-id': webhookId,
      'webhook-timestamp': expiredTimestamp,
      'webhook-signature': `v1,${sig}`,
    }

    const verification = verifyWebhookSignature(rawBody, headers)
    expect(verification.isValid).toBe(false)
    expect(verification.error).toContain('outside the acceptable 5-minute window')
  })
})
