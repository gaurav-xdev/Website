import type { ApiRequest, ApiResponse } from './_lib/types.js'
import { checkoutSchema, formatZodErrors } from './_lib/validation.js'
import { checkRateLimit, extractClientIpHash } from './_lib/rateLimit.js'
import { getServerPlan, arePaymentsEnabled } from './_lib/plans.js'
import { createDodoCheckout } from './_lib/dodoPayments.js'
import { getSupabaseAdmin } from './_lib/supabaseAdmin.js'
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

export default async function handler(req: ApiRequest, res: ApiResponse) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST')
      return res.status(405).json({ success: false, error: 'Method Not Allowed' })
    }

  const ipHash = extractClientIpHash(req)
  const rateLimit = checkRateLimit(ipHash, {
    windowMs: 60 * 1000,
    maxRequests: 10,
    prefix: 'checkout',
  })

  if (rateLimit.isLimited) {
    return res.status(429).json({
      success: false,
      error: 'Too many checkout attempts. Please wait a moment.',
    })
  }

  const rawBody = parseBody(req)
  if (!rawBody) {
    return res.status(400).json({ success: false, error: 'Invalid or missing JSON payload' })
  }

  const parseResult = checkoutSchema.safeParse(rawBody)
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      error: 'Invalid checkout parameters',
      details: formatZodErrors(parseResult.error),
    })
  }

  const { planId, billingInterval } = parseResult.data
  const plan = getServerPlan(planId)

  if (!plan) {
    return res.status(404).json({
      success: false,
      error: `Plan '${planId}' does not exist in catalog`,
    })
  }

  // Handle Free plan: No checkout necessary
  if (!plan.requiresCheckout && plan.id === 'free') {
    return res.status(200).json({
      success: true,
      data: {
        planId: 'free',
        status: 'created',
        checkoutUrl: '/#download',
      },
      message: 'Free tier activated. You can proceed to access previews.',
    })
  }

  // Handle Enterprise plan: Direct to contact flow
  if (plan.isContactFlow) {
    return res.status(200).json({
      success: true,
      data: {
        planId: 'enterprise',
        status: 'created',
        checkoutUrl: '/#contact?category=Enterprise+Solutions',
      },
      message: 'Enterprise tier requires bespoke architectural consultation.',
    })
  }

  // Server-side payment gate: payments are disabled until desktop app launch
  if (plan.requiresCheckout && !arePaymentsEnabled()) {
    return res.status(403).json({
      success: false,
      code: 'PAYMENTS_DISABLED',
      paymentsDisabled: true,
      error: 'Paid checkouts are temporarily disabled until the OSMOO desktop application is released.',
    })
  }

  // Optional: Resolve authenticated user from Supabase JWT if header present
  let userId = 'anonymous'
  let userEmail: string | undefined = undefined

  const authHeader = req.headers['authorization']
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim()
    const admin = getSupabaseAdmin()
    if (admin && token) {
      try {
        const { data: { user } } = await admin.auth.getUser(token)
        if (user) {
          userId = user.id
          userEmail = user.email

          // Verify user does not already have an active subscription for this plan
          const { data: existingSub } = await admin
            .from('subscriptions')
            .select('id, plan_id, status')
            .eq('user_id', userId)
            .eq('status', 'active')
            .maybeSingle()

          if (existingSub && existingSub.plan_id === plan.id) {
            return res.status(409).json({
              success: false,
              error: `You already have an active subscription to the ${plan.name} plan.`,
            })
          }
        }
      } catch {
        // Fallback to anonymous checkout session
      }
    }
  }

  // Initiate real Dodo Payments checkout
  const checkoutResult = await createDodoCheckout({
    planId: plan.id,
    billingInterval,
    userId,
    userEmail,
  })

  if (!checkoutResult.success) {
    if (checkoutResult.setupMode) {
      return res.status(503).json({
        success: false,
        error: checkoutResult.error,
        setupMode: true,
      })
    }

    return res.status(500).json({
      success: false,
      error: checkoutResult.error || 'Failed to initialize payment gateway session.',
    })
  }

  return res.status(200).json({
    success: true,
    data: {
      planId: plan.id,
      sessionId: checkoutResult.sessionId,
      checkoutUrl: checkoutResult.checkoutUrl,
      status: 'redirect_ready',
    },
    message: 'Checkout session created. Proceeding to payment.',
  })
  } catch (err: unknown) {
    return sendSafeError(res, {
      status: 500,
      publicMessage: 'Failed to initialize payment gateway session. Please try again later.',
      internalError: err,
    })
  }
}
