import type { ApiRequest, ApiResponse } from './_lib/types.js'
import { contactSchema, formatZodErrors } from './_lib/validation.js'
import { checkRateLimit, extractClientIpHash } from './_lib/rateLimit.js'
import { insertContactMessage } from './_lib/supabaseAdmin.js'
import { sendSafeError } from './_lib/safeError.js'

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

async function sendNotificationEmail(data: { name: string; email: string; category: string; message: string }) {
  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'OSMOO <notifications@osmoo.in>'
  const notificationTo = process.env.CONTACT_NOTIFICATION_EMAIL || 'gaurav@osmoo.in'

  if (!apiKey || !apiKey.startsWith('re_') || apiKey.includes('your_resend')) {
    return
  }

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: notificationTo,
        subject: `[OSMOO Contact] ${data.category}: from ${data.name}`,
        text: `Name: ${data.name}\nEmail: ${data.email}\nCategory: ${data.category}\n\nMessage:\n${data.message}`,
      }),
    })
  } catch {
    // Non-blocking: failure to send admin alert does not fail the user's persisted inquiry
  }
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST')
      return res.status(405).json({ success: false, error: 'Method Not Allowed' })
    }

  // Rate limit: 5 messages per 10 minutes per IP
  const ipHash = extractClientIpHash(req)
  const rateLimit = checkRateLimit(ipHash, {
    windowMs: 10 * 60 * 1000,
    maxRequests: 5,
    prefix: 'contact',
  })

  if (rateLimit.isLimited) {
    res.setHeader('Retry-After', rateLimit.resetInSeconds.toString())
    return res.status(429).json({
      success: false,
      error: `Too many inquiries submitted. Please retry in ${rateLimit.resetInSeconds} seconds.`,
    })
  }

  const rawBody = parseBody(req)
  if (!rawBody) {
    return res.status(400).json({ success: false, error: 'Invalid or missing JSON payload' })
  }

  const parseResult = contactSchema.safeParse(rawBody)
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      error: 'Invalid inquiry data',
      details: formatZodErrors(parseResult.error),
    })
  }

  const { name, email, category, message } = parseResult.data

  const insertResult = await insertContactMessage({
    name,
    email,
    category,
    message,
    ipHash,
  })

  if (!insertResult.success) {
    return res.status(500).json({
      success: false,
      error: 'Failed to record your message. Please try again later or reach out directly to support.',
    })
  }

  // Trigger non-blocking transactional email notification if configured
  void sendNotificationEmail({ name, email, category, message })

  return res.status(200).json({
    success: true,
    data: { id: insertResult.id },
    message: 'Your inquiry has been received. Our computational systems team will review it.',
  })
  } catch (err: unknown) {
    return sendSafeError(res, {
      status: 500,
      publicMessage: 'Failed to record your message. Please try again later.',
      internalError: err,
    })
  }
}
