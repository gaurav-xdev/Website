import { LegalLayout } from './LegalLayout'

interface RefundsPageProps {
  onNavigate?: (route: string) => void
}

export function RefundsPage({ onNavigate }: RefundsPageProps) {
  return (
    <LegalLayout
      title="Refund, Cancellation & Subscription Policy"
      subtitle="Comprehensive terms governing future paid tiers (OSMOO Pro and Max), billing cycles, cancellation terms, refund eligibility, and statutory consumer rights."
      activeRoute="legal/refunds"
      onNavigate={onNavigate}
    >
      {/* 1. Current Pre-Launch Status */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-[#1f1c2d] pb-2">
          1. Current Billing Status: Commercial Payments Inactive
        </h2>
        <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 text-purple-200">
          <strong className="text-white block mb-1">Important Pre-Launch Notice:</strong>
          Commercial subscription payments are currently <span className="underline font-bold">inactive</span> on this website. Our merchant integration with Dodo Payments is currently in setup mode. We do not accept credit card or UPI charges today, and zero paid subscriptions have been billed.
        </div>
        <p className="text-zinc-300">
          This Policy is published in advance to establish transparent billing guidelines for when the commercial OSMOO Pro and Max plans become officially active.
        </p>
      </section>

      {/* 2. Subscription Tiers & Billing Structure */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-[#1f1c2d] pb-2">
          2. Subscription Tiers & Billing Mechanism
        </h2>
        <ul className="list-disc pl-5 space-y-2 text-zinc-300">
          <li>
            <strong className="text-white">Free Tier ($0/forever):</strong> Local-first on-device execution with zero financial obligation. No payment method required.
          </li>
          <li>
            <strong className="text-white">OSMOO Pro ($24/month or $19/month billed annually):</strong> Unlocks persistent multi-project neural memory, priority updates, and automated dry-run pipelines. Billed in advance on a recurring monthly or annual basis.
          </li>
          <li>
            <strong className="text-white">OSMOO Max ($49/month or $39/month billed annually):</strong> Proposed power-user tier for high-throughput monorepos and parallel agent orchestration. Billed in advance on a recurring cycle.
          </li>
          <li>
            <strong className="text-white">Enterprise (Custom):</strong> Invoiced individually per organizational SLA with tailored billing terms.
          </li>
        </ul>
      </section>

      {/* 3. The Founding 50 Reward Terms */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-[#1f1c2d] pb-2">
          3. "The Founding 50" Complimentary Reward
        </h2>
        <p>
          The first 50 verified signups on our early access waitlist receive 12 months of OSMOO Pro at no charge ($0) upon commercial release.
        </p>
        <p>
          Founding 50 participants will not be billed during their 12-month reward term. Prior to the expiration of the 12-month period, participants will be notified and given the option to continue on a paid Pro plan or transition to the standard Free tier. No automatic non-consensual charging will occur without affirmative user agreement.
        </p>
      </section>

      {/* 4. Cancellation Policy */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-[#1f1c2d] pb-2">
          4. Cancellation Rights
        </h2>
        <p>
          You may cancel your future OSMOO subscription at any time via your Account settings or by notifying us at{' '}
          <a href="mailto:billing@osmoo.in" className="text-purple-400 hover:underline">
            billing@osmoo.in
          </a>.
        </p>
        <p>
          Cancellation becomes effective at the conclusion of your current paid billing period. You will retain full access to Pro/Max features until the end of that billing period. We do not provide prorated partial refunds for unused days within an ongoing monthly billing cycle.
        </p>
      </section>

      {/* 5. Refund Eligibility */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-[#1f1c2d] pb-2">
          5. 14-Day Refund Guarantee (Initial Subscriptions)
        </h2>
        <p>
          We provide a <strong className="text-white">14-day money-back guarantee</strong> on initial purchases of monthly or annual Pro subscriptions:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-zinc-300">
          <li>If you request a refund within fourteen (14) days of your initial subscription payment, we will issue a full refund to your original payment method;</li>
          <li>Subsequent automatic recurring renewals are non-refundable once processed, provided advance renewal reminders were delivered;</li>
          <li>Accounts terminated due to violations of our Acceptable Use Terms are strictly ineligible for refunds.</li>
        </ul>
      </section>

      {/* 6. Indian Consumer Protection Compliance */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-[#1f1c2d] pb-2">
          6. Statutory Consumer Rights in India
        </h2>
        <p>
          Nothing in this Policy excludes, restricts, or modifies any non-excludable statutory rights or remedies granted to consumers under the <strong className="text-white">Consumer Protection Act, 2019</strong> or the <strong className="text-white">Consumer Protection (E-Commerce) Rules, 2020</strong> of the Republic of India.
        </p>
      </section>
    </LegalLayout>
  )
}
