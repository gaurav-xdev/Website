import { useState } from 'react'
import { motion } from 'motion/react'
import { Check, Sparkles, Shield, ArrowRight, Info, AlertCircle, ExternalLink } from 'lucide-react'
import type { CompanionExpression } from '../components/PersistentCompanionScene'
import { soundEngine } from '../utils/soundEngine'

interface PricingPageProps {
  onNavigate?: (tab: string) => void
  onSelectPlan?: (planName: string) => void
  onHoverPlan?: (expression: CompanionExpression) => void
  onOpenEarlyAccessModal?: () => void
  activeExpression?: CompanionExpression
}

export function PricingPage({
  onNavigate,
  onSelectPlan,
  onHoverPlan,
  onOpenEarlyAccessModal,
  activeExpression = 'neutral',
}: PricingPageProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')
  const [checkoutNotice, setCheckoutNotice] = useState<{
    title: string
    message: string
    type: 'info' | 'error' | 'success'
  } | null>(null)


  const plans: {
    name: string
    badge: string
    expression: CompanionExpression
    priceMonthly: number | null
    priceAnnual: number | null
    period: string
    description: string
    highlight: boolean
    ctaText: string
    reactionHint: string
    features: string[]
    planned: string[]
  }[] = [
    {
      name: 'Free',
      badge: 'Local-First',
      expression: 'free',
      priceMonthly: 0,
      priceAnnual: 0,
      period: 'forever',
      description: 'The core OSMOO experience running completely on your local device hardware.',
      highlight: false,
      ctaText: 'Join Free Waitlist',
      reactionHint: 'Cute sad puppy eyes & gentle downward head droop',
      features: [
        'Full native on-device model execution',
        'DirectML and Apple Silicon hardware acceleration',
        'Local workspace context & AST inspection',
        'Zero telemetry, local encrypted storage (AES-256)',
        'Basic OS accessibility and editor integration',
        'Standard community support',
      ],
      planned: [
        'Cloud sync (planned for v1.1)',
      ],
    },
    {
      name: 'Pro',
      badge: 'The Founding 50',
      expression: 'pro',
      priceMonthly: 24,
      priceAnnual: 19,
      period: 'per month',
      description: 'For software engineers and creators demanding high-throughput frontier AI coordination.',
      highlight: true,
      ctaText: 'Join Waitlist (Claim Pro)',
      reactionHint: 'Smiling squint & warm inquisitive head tilt',
      features: [
        'Everything in Free, plus:',
        'The Founding 50: 12 months free for first 50 verified signups',
        'Bring-your-own frontier API keys (Claude, GPT, Gemini)',
        'Multi-project persistent neural memory',
        'Background multi-step autonomous dry-run execution',
        'High-speed Whisper voice interaction pipeline',
        'Priority feature updates and releases',
      ],
      planned: [
        'Team knowledge sharing (in development)',
      ],
    },
    {
      name: 'Max',
      badge: 'Available with Desktop App Launch',
      expression: 'max',
      priceMonthly: 49,
      priceAnnual: 39,
      period: 'per month',
      description: 'Advanced power-user tier designed for deep multi-agent pipelines and heavy workloads.',
      highlight: false,
      ctaText: 'Coming Soon (Desktop App)',
      reactionHint: 'Excited wide eyes, radiant emission & joyful bounce',
      features: [
        'Everything in Pro, plus:',
        'Concurrent multi-agent parallel dispatching',
        'Extended AST diff analysis for massive monorepos',
        'Advanced automated regression test generation',
        'Hardware priority buffer allocation',
        'Direct engineering chat channel',
      ],
      planned: [
        'Custom local model fine-tuning (experimental)',
      ],
    },
    {
      name: 'Enterprise',
      badge: 'Organization',
      expression: 'enterprise',
      priceMonthly: null,
      priceAnnual: null,
      period: 'custom',
      description: 'Custom governance, air-gapped security, and dedicated organizational support.',
      highlight: false,
      ctaText: 'Contact Engineering',
      reactionHint: 'Calm, confident, attentive corporate poise',
      features: [
        'Everything in Max, plus:',
        'Air-gapped and on-premise deployment options',
        'Custom SSO (Okta, Entra ID) integration support',
        'Dedicated SLA and hardware tuning assistance',
        'Custom legal NDA and compliance documentation',
        'Centralized license and fleet management',
      ],
      planned: [],
    },
  ]

  const handlePlanAction = async (plan: (typeof plans)[0]) => {
    soundEngine.playClick()
    if (plan.name === 'Enterprise') {
      onNavigate?.('contact')
      return
    }

    if (plan.name === 'Free') {
      onSelectPlan?.(plan.name)
      if (onOpenEarlyAccessModal) {
        onOpenEarlyAccessModal()
      } else {
        onNavigate?.('download')
      }
      return
    }

    if (plan.name === 'Pro') {
      // Direct users to waitlist to claim The Founding 50 Pro reward
      setCheckoutNotice({
        title: 'The Founding 50 Offer Active (12 Months Free)',
        message:
          'Commercial checkouts are temporarily disabled while the OSMOO desktop application is prepared for release. The first 50 verified signups receive 12 complimentary months of OSMOO Pro.',
        type: 'info',
      })
      if (onOpenEarlyAccessModal) {
        onOpenEarlyAccessModal()
      }
      return
    }

    if (plan.name === 'Max') {
      // Direct users to Early Access while paid checkouts are paused pre-desktop release
      setCheckoutNotice({
        title: 'Available with Desktop App Launch',
        message:
          'Paid subscriptions are temporarily paused until the OSMOO desktop application launches. Register for Early Access to receive immediate priority notification when the desktop engine becomes available.',
        type: 'info',
      })
      if (onOpenEarlyAccessModal) {
        onOpenEarlyAccessModal()
      }
      return
    }
  }

  return (
    <div className="relative w-full min-h-screen py-16 sm:py-24 px-4 sm:px-6 md:px-8 flex flex-col items-center justify-center overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] bg-purple-950/20 rounded-full blur-[170px] pointer-events-none" />

      {/* Main Framed Stage Container */}
      <div className="relative w-full max-w-6xl rounded-[32px] sm:rounded-[40px] bg-[#07060a]/90 border border-[#201d2d] p-6 sm:p-10 md:p-14 shadow-[0_25px_70px_rgba(0,0,0,0.9)] flex flex-col items-center text-center">
        {/* ─── HEADER & HEADING ─── */}
        <div className="mb-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151222] border border-[#2c2642] text-[11px] font-mono text-purple-300">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Transparent Subscription Architecture</span>
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-[-0.04em] leading-[0.95] text-white">
            CHOOSE YOUR
            <br />
            COMPUTING PLAN
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 font-sans tracking-tight max-w-lg mx-auto leading-relaxed">
            Transparent pricing for individuals, power users, and engineering teams. Zero hidden fees or unverified quotas. Hover over any plan to preview your 3D companion's reaction.
          </p>

          {/* Pre-Launch Payment Status Notice */}
          <div className="mx-auto max-w-xl px-4 py-2.5 rounded-xl bg-purple-950/30 border border-purple-800/40 text-xs text-purple-200/90 flex items-center justify-center gap-2">
            <Info className="w-4 h-4 text-purple-400 shrink-0" />
            <span>Commercial checkouts are paused during pre-launch. Paid tiers activate alongside the desktop application release. Join Early Access to qualify for 12 months free Pro via The Founding 50.</span>
          </div>

          {/* Billing Cycle Switcher */}
          <div className="pt-2 flex items-center justify-center">
            <div className="inline-flex items-center p-1 rounded-full bg-[#12101c] border border-[#28233b] text-xs">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick()
                  setBillingCycle('monthly')
                }}
                className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-purple-600 text-white font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Monthly billing
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick()
                  setBillingCycle('annual')
                }}
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                  billingCycle === 'annual'
                    ? 'bg-purple-600 text-white font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>Annual billing</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Gateway Status Notification Banner */}
        {checkoutNotice && (
          <div className="w-full max-w-2xl mb-8 p-4 rounded-2xl bg-[#161224] border border-purple-500/40 text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs sm:text-sm font-bold text-white mb-0.5">{checkoutNotice.title}</div>
                <div className="text-[11px] sm:text-xs text-zinc-300 leading-relaxed">{checkoutNotice.message}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              {onOpenEarlyAccessModal && (
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick()
                    onOpenEarlyAccessModal()
                  }}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <span>Join Waitlist</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setCheckoutNotice(null)}
                className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-300 text-xs transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* ─── 4-TIER PRICING CARDS GRID ─── */}
        <div
          onMouseLeave={() => onHoverPlan?.('neutral')}
          className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 text-left items-stretch"
        >
          {plans.map((plan, idx) => {
            const price = billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly
            const isCardActive = activeExpression === plan.expression

            return (
              <div
                key={idx}
                tabIndex={0}
                role="region"
                aria-label={`${plan.name} pricing plan: ${plan.reactionHint}`}
                onMouseEnter={() => {
                  soundEngine.playPlanReaction(plan.expression as 'free' | 'pro' | 'max' | 'enterprise')
                  onHoverPlan?.(plan.expression)
                }}
                onFocus={() => {
                  soundEngine.playPlanReaction(plan.expression as 'free' | 'pro' | 'max' | 'enterprise')
                  onHoverPlan?.(plan.expression)
                }}
                onBlur={() => onHoverPlan?.('neutral')}
                onClick={() => {
                  // Mobile touch interaction: toggle expression
                  const next = isCardActive ? 'neutral' : plan.expression
                  if (next !== 'neutral') {
                    soundEngine.playPlanReaction(plan.expression as 'free' | 'pro' | 'max' | 'enterprise')
                  }
                  onHoverPlan?.(next)
                }}
                className={`relative rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 outline-none cursor-pointer select-none ${
                  isCardActive
                    ? 'border-purple-400 ring-2 ring-purple-500/50 shadow-[0_0_35px_rgba(168,85,247,0.3)] ' +
                      (plan.highlight ? 'bg-gradient-to-b from-[#201838] to-[#120d24]' : 'bg-[#151124]')
                    : plan.highlight
                    ? 'bg-gradient-to-b from-[#181427] to-[#0e0b17] border-2 border-purple-500/60 shadow-[0_15px_40px_rgba(147,51,234,0.18)] scale-[1.02]'
                    : 'bg-[#0c0a13] border border-[#201d2e] hover:border-[#38314e] shadow-inner'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-bold tracking-wider uppercase shadow-md">
                    Recommended
                  </div>
                )}

                <div>
                  {/* Plan Top Header */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-mono text-zinc-400 font-semibold">
                      {plan.badge}
                    </span>
                    <h2 className="text-xl font-black text-white tracking-tight">
                      {plan.name}
                    </h2>
                  </div>

                  {/* Price display */}
                  <div className="mb-4 pb-4 border-b border-[#1f1c2d]">
                    {price !== null ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                          ${price}
                        </span>
                        <span className="text-xs text-zinc-400 font-mono">
                          /{billingCycle === 'annual' ? 'mo (billed ann.)' : 'month'}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                          Custom
                        </span>
                        <span className="text-xs text-zinc-400 font-mono">
                          /organization
                        </span>
                      </div>
                    )}
                    <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                      {plan.description}
                    </p>
                  </div>

                  {/* Confirmed Features */}
                  <div className="space-y-2.5 mb-6">
                    <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                      Included Capabilities
                    </div>
                    {plan.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2 text-xs text-zinc-300">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5 stroke-[2.5]" />
                        <span className="leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Planned Roadmap Features */}
                  {plan.planned.length > 0 && (
                    <div className="space-y-2 mb-6 pt-3 border-t border-[#1a1726]">
                      <div className="text-[10px] font-mono text-purple-400 uppercase tracking-wider flex items-center gap-1 font-semibold">
                        <Info className="w-3 h-3" />
                        <span>Planned Features</span>
                      </div>
                      {plan.planned.map((item, pIdx) => (
                        <div key={pIdx} className="flex items-start gap-2 text-xs text-zinc-500 italic">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400/60 mt-1.5 flex-shrink-0" />
                          <span className="leading-snug">{item}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Plan CTA Button */}
                <div className="pt-4 border-t border-[#1c192a]">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      void handlePlanAction(plan)
                    }}
                    type="button"
                    className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm tracking-tight transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed ${
                      plan.highlight
                        ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:bg-zinc-100'
                        : 'bg-[#161324] hover:bg-[#201c34] text-white border border-[#2d2844]'
                    }`}
                  >
                    <span>{plan.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
              </div>
            )
          })}
        </div>

        {/* ─── ENTERPRISE GOVERNANCE ASSURANCE NOTE ─── */}
        <div className="mt-12 p-4 sm:p-5 rounded-2xl bg-[#0b0912] border border-[#1f1c2d] max-w-3xl flex flex-col sm:flex-row items-center gap-4 text-left">
          <div className="p-3 rounded-xl bg-[#141120] border border-[#2b2540] text-purple-400 flex-shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight">
              Honest & Transparent Software Commitments
            </h3>
            <p className="text-[11px] sm:text-xs text-zinc-400 leading-relaxed">
              Target price for Pro is $24/month. The Max tier ($49/month) represents a proposed power-user tier. Enterprise deployments feature custom tailored SLAs and NDA protections. No fake urgency, fabricated reviews, or unverified claims.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
