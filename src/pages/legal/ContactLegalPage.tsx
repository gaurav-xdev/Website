import { LegalLayout } from './LegalLayout'
import { Mail, ShieldCheck, AlertCircle } from 'lucide-react'

interface ContactLegalPageProps {
  onNavigate?: (route: string) => void
}

export function ContactLegalPage({ onNavigate }: ContactLegalPageProps) {
  return (
    <LegalLayout
      title="Contact, Privacy Requests & Grievance Information"
      subtitle="Verified business contact channels, statutory privacy request mechanisms, and grievance redressal officer details under Indian Information Technology and DPDP regulations."
      activeRoute="legal/contact"
      onNavigate={onNavigate}
    >
      {/* 1. Official Communication Channels */}
      <section className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-[#1f1c2d] pb-2">
          1. Verified Business Channels
        </h2>
        <p>
          For general technical inquiries, business collaborations, or enterprise questions, use our verified contact channels:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-[#0c0a13] border border-[#201d2e] space-y-3">
            <div className="flex items-center gap-2.5 text-white font-bold text-sm">
              <Mail className="w-4 h-4 text-purple-400" />
              <span>General & Engineering Inquiries</span>
            </div>
            <div className="space-y-1 text-xs text-zinc-300">
              <div><strong className="text-white">Email:</strong> contact@osmoo.in</div>
              <div><strong className="text-white">Website Form:</strong> Available on the homepage under <a href="#contact" className="text-purple-400 hover:underline">Contact</a></div>
              <div><strong className="text-white">Expected SLA:</strong> Within 24 business hours</div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0c0a13] border border-[#201d2e] space-y-3">
            <div className="flex items-center gap-2.5 text-white font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Privacy & Data Rights Desk</span>
            </div>
            <div className="space-y-1 text-xs text-zinc-300">
              <div><strong className="text-white">Email:</strong> privacy@osmoo.in</div>
              <div><strong className="text-white">Scope:</strong> Data access, rectification, waitlist removal, consent revocation</div>
              <div><strong className="text-white">Statutory Window:</strong> Responded within 30 days</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Statutory Grievance Redressal (DPDP Act, 2023 & IT Rules) */}
      <section className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-[#1f1c2d] pb-2">
          2. Statutory Grievance Redressal Mechanism
        </h2>
        <p>
          In compliance with the <strong className="text-white">Digital Personal Data Protection Act, 2023</strong> and the <strong className="text-white">Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021</strong>, individuals located in India may direct unresolved grievances to our designated Grievance Officer:
        </p>

        <div className="p-5 rounded-2xl bg-[#0e0c15] border border-purple-500/30 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#1c192a]">
            <span className="font-mono text-xs text-purple-300 font-bold uppercase">Designated Grievance Desk</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300">Republic of India</span>
          </div>

          <div className="space-y-1.5 text-xs text-zinc-300">
            <div><strong className="text-white">Operating Entity:</strong> Osmiora Computational Systems</div>
            <div><strong className="text-white">Designation:</strong> Grievance Redressal Officer</div>
            <div><strong className="text-white">Dedicated Email:</strong> grievance@osmoo.in (and privacy@osmoo.in)</div>
            <div><strong className="text-white">Physical Operating Jurisdiction:</strong> Republic of India</div>
          </div>

          <div className="pt-2 text-[11px] text-zinc-400 border-t border-[#1a1726] leading-relaxed">
            Upon receipt of a formal grievance, we will acknowledge the communication within forty-eight (48) hours and aim to dispose of the grievance within fifteen (15) calendar days (or the statutory period prescribed by applicable rules).
          </div>
        </div>
      </section>

      {/* 3. Missing Corporate Registration Flag (Factual Transparency) */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-[#1f1c2d] pb-2">
          3. Corporate Entity Notice & Owner Disclosures
        </h2>
        <div className="p-4 rounded-2xl bg-[#110e1a] border border-[#262136] text-xs text-zinc-300 space-y-2">
          <div className="flex items-center gap-2 text-amber-300 font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Pre-Launch Business Identity Notice</span>
          </div>
          <p className="leading-relaxed">
            OSMOO is presently developed under the operational brand <strong className="text-white">Osmiora Computational Systems</strong> in pre-launch private preview. Formal corporate registration details (such as CIN/LLPIN, physical registered office address, and direct phone contact) are in finalization and will be published upon full commercial incorporation prior to billing activation.
          </p>
        </div>
      </section>
    </LegalLayout>
  )
}
