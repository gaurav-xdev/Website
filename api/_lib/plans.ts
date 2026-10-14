// Authoritative Server-side Plan Catalog

export interface ServerPlan {
  id: string
  name: string
  priceCents: number
  currency: string
  interval: 'month' | 'year' | 'one_time'
  requiresCheckout: boolean
  isContactFlow?: boolean
  dodoProductId?: string
}

export const SERVER_PLANS: Record<string, ServerPlan> = {
  free: {
    id: 'free',
    name: 'Free',
    priceCents: 0,
    currency: 'USD',
    interval: 'month',
    requiresCheckout: false,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    priceCents: 2400,
    currency: 'USD',
    interval: 'month',
    requiresCheckout: true,
    get dodoProductId() {
      return process.env.DODO_PRO_PRODUCT_ID || 'p_osmoo_pro_monthly'
    },
  },
  max: {
    id: 'max',
    name: 'Max',
    priceCents: 4900,
    currency: 'USD',
    interval: 'month',
    requiresCheckout: true,
    get dodoProductId() {
      return process.env.DODO_MAX_PRODUCT_ID || 'p_osmoo_max_monthly'
    },
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    priceCents: 0,
    currency: 'USD',
    interval: 'month',
    requiresCheckout: false,
    isContactFlow: true,
  },
}

export function getServerPlan(planId: string): ServerPlan | undefined {
  if (!planId || typeof planId !== 'string') return undefined
  return SERVER_PLANS[planId.toLowerCase()]
}

/**
 * Server-side payment feature flag.
 * Default is strictly FALSE (disabled) in all environments until the OSMOO desktop application
 * is released and payment provider onboarding is fully certified.
 * Only the explicit string 'true' in PAYMENTS_ENABLED will enable checkouts.
 */
export function arePaymentsEnabled(): boolean {
  return process.env.PAYMENTS_ENABLED === 'true'
}

