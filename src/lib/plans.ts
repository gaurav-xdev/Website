// Authoritative Plan Definitions for OSMOO (Single Source of Truth)

export type PlanInterval = 'month' | 'year' | 'one_time'

export interface PlanFeature {
  text: string
  included: boolean
  highlight?: boolean
}

export interface PlanDefinition {
  id: 'free' | 'pro' | 'max' | 'enterprise'
  name: string
  tagline: string
  priceMonthly: number // in USD
  priceCents: number
  interval: PlanInterval
  popular?: boolean
  badge?: string
  status: 'active' | 'proposed' | 'custom'
  features: PlanFeature[]
  ctaText: string
  ctaVariant: 'secondary' | 'primary' | 'white'
  isContactFlow?: boolean
  requiresCheckout?: boolean
}

export const OSMOO_PLANS: Record<string, PlanDefinition> = {
  free: {
    id: 'free',
    name: 'Free',
    tagline: 'Personal AI operating foundation with essential local companion capabilities.',
    priceMonthly: 0,
    priceCents: 0,
    interval: 'month',
    status: 'active',
    features: [
      { text: 'Single device neural workspace', included: true },
      { text: 'Basic local companion & idle reactivity', included: true },
      { text: 'Standard intent prediction', included: true },
      { text: 'Up to 50 local task automations/day', included: true },
      { text: 'Community forum & documentation', included: true },
      { text: 'Continuous context memory engine', included: false },
      { text: 'Zero-latency multi-model orchestration', included: false },
      { text: 'Dedicated enterprise SLA & compliance', included: false },
    ],
    ctaText: 'Get Started Free',
    ctaVariant: 'secondary',
    requiresCheckout: false,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    tagline: 'Full neural capabilities, continuous context engine, and workflow acceleration.',
    priceMonthly: 24,
    priceCents: 2400,
    interval: 'month',
    popular: true,
    badge: 'RECOMMENDED',
    status: 'active',
    features: [
      { text: 'Up to 3 active synchronized devices', included: true },
      { text: 'Advanced companion expressions & spatial voice', included: true },
      { text: 'Continuous context memory (30-day index)', included: true },
      { text: 'Unlimited local automations & script hooks', included: true },
      { text: 'Priority inference queuing', included: true },
      { text: 'Encrypted peer device synchronization', included: true },
      { text: 'Zero-latency multi-model orchestration', included: false },
      { text: 'Dedicated enterprise SLA & compliance', included: false },
    ],
    ctaText: 'Subscribe to Pro',
    ctaVariant: 'primary',
    requiresCheckout: true,
  },
  max: {
    id: 'max',
    name: 'Max',
    tagline: 'Proposed advanced tier with deep offline model weights and boundless compute.',
    priceMonthly: 49,
    priceCents: 4900,
    interval: 'month',
    badge: 'PROPOSED TIER',
    status: 'proposed',
    features: [
      { text: 'Up to 10 synchronized workstations', included: true },
      { text: 'All Pro capabilities included', included: true },
      { text: 'Zero-latency multi-model local orchestration', included: true },
      { text: 'Unlimited perpetual context indexing', included: true },
      { text: 'Full biometric cryptographic security', included: true },
      { text: 'Early access to preview neural checkpoints', included: true },
      { text: 'Direct priority developer support channel', included: true },
      { text: 'Dedicated enterprise SLA & compliance', included: false },
    ],
    ctaText: 'Reserve Max Plan',
    ctaVariant: 'white',
    requiresCheckout: true,
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'Tailored on-premise neural engine, sovereign deployments, and custom compliance.',
    priceMonthly: 0,
    priceCents: 0,
    interval: 'month',
    badge: 'SOVEREIGN CLOUD',
    status: 'custom',
    features: [
      { text: 'Unlimited seats & devices across company', included: true },
      { text: 'Air-gapped on-premise neural deployment', included: true },
      { text: 'Custom model fine-tuning & domain adapter weights', included: true },
      { text: 'SOC2 / HIPAA / GDPR enterprise compliance audit', included: true },
      { text: 'Dedicated solutions architect & 99.99% uptime SLA', included: true },
      { text: 'Hardware-accelerated fleet management server', included: true },
      { text: 'Enterprise SSO, SAML, and SCIM directory sync', included: true },
      { text: '24/7 dedicated engineering hotline', included: true },
    ],
    ctaText: 'Contact Enterprise Sales',
    ctaVariant: 'secondary',
    isContactFlow: true,
    requiresCheckout: false,
  },
}

export function getPlan(planId: string): PlanDefinition | undefined {
  return OSMOO_PLANS[planId.toLowerCase()]
}
