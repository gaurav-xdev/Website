import { LegalLayout } from './LegalLayout'

interface PrivacyPolicyPageProps {
  onNavigate?: (route: string) => void
}

export function PrivacyPolicyPage({ onNavigate }: PrivacyPolicyPageProps) {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="Transparency regarding data collection, processing purposes, retention, user rights under Indian and international data protection laws, and clear distinction between our website and future desktop application."
      activeRoute="legal/privacy"
      onNavigate={onNavigate}
    >
      {/* 1. Introduction & Operating Identity */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-[#1f1c2d] pb-2">
          1. Identity & Scope of this Policy
        </h2>
        <p>
          This Privacy Policy governs the processing of personal data collected through the official website (
          <span className="text-white font-mono">osmoo.in</span> and associated subdomains) operated under the trade name{' '}
          <strong className="text-white">Osmiora Computational Systems</strong> (collectively referred to as "OSMOO", "we", "us", or "our").
        </p>
        <p>
          We are committed to processing personal data responsibly, fairly, and transparently in accordance with applicable data protection laws, including the{' '}
          <strong className="text-white">Digital Personal Data Protection Act, 2023 (DPDP Act, 2023)</strong> and the applicable rules framed thereunder in the Republic of India, as well as internationally recognized data protection principles for global visitors.
        </p>
        <div className="p-4 rounded-2xl bg-[#0f0d18] border border-purple-500/20 text-purple-200">
          <strong className="text-white block mb-1">Important Architecture Distinction:</strong>
          This document explicitly differentiates between data collected on our <span className="underline">public website</span> today and the processing architecture of our <span className="underline">future native desktop application</span> (OSMOO for macOS and Windows 11).
        </div>
      </section>

      {/* 2. Data We Collect on the Website */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-[#1f1c2d] pb-2">
          2. Personal Data Collected via this Website
        </h2>
        <p>
          We collect only the minimum personal data necessary to provide our web services, administer the early access waitlist, and communicate with you:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-zinc-300">
          <li>
            <strong className="text-white">Waitlist & Cohort Registrations:</strong> When you submit a waitlist entry (including "The Founding 50" reward cohort), we collect your email address and optional first name. We also record the submission timestamp and an irreversible SHA-256 cryptographic hash of your client IP address solely for automated rate-limiting abuse prevention.
          </li>
          <li>
            <strong className="text-white">One-Time Password (OTP) Authentication:</strong> When you log into your preview session, our authentication infrastructure (powered by Supabase Auth) processes your email address and generates a temporary verification token. We do not store plaintext passwords.
          </li>
          <li>
            <strong className="text-white">Contact & Engineering Inquiries:</strong> When you submit our contact form, we collect your name, institutional/work email, inquiry classification, and message contents to route your request to our engineering team.
          </li>
          <li>
            <strong className="text-white">Technical Diagnostic Logs:</strong> Our web hosting infrastructure (Vercel) automatically logs standard HTTP request headers, browser user-agent strings, referral headers, and IP addresses to maintain security and mitigate distributed denial-of-service (DDoS) threats.
          </li>
          <li>
            <strong className="text-white">Local Browser Preferences:</strong> We store small configuration values in your browser's <code className="text-purple-300">localStorage</code> (such as your sound toggle status <code className="text-purple-300">osmoo_sound_enabled</code> and your cookie preference choice <code className="text-purple-300">osmoo_cookie_consent</code>). These preferences remain entirely on your local device.
          </li>
        </ul>
      </section>

      {/* 3. Purpose & Legal Basis */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-[#1f1c2d] pb-2">
          3. Purposes and Grounds for Processing
        </h2>
        <p>We process your personal data exclusively for specified, legitimate purposes:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-[#0c0a13] border border-[#201d2e]">
            <h3 className="font-bold text-white text-xs uppercase font-mono mb-1">Waitlist & Pilot Invitations</h3>
            <p className="text-xs text-zinc-400">
              To record your position in the early access cohort, determine eligibility for The Founding 50 Pro reward upon email verification, and transmit your software invitation when builds become available.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#0c0a13] border border-[#201d2e]">
            <h3 className="font-bold text-white text-xs uppercase font-mono mb-1">Direct Communication</h3>
            <p className="text-xs text-zinc-400">
              To respond to engineering, research collaboration, and enterprise pilot inquiries transmitted via our website contact channel.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#0c0a13] border border-[#201d2e]">
            <h3 className="font-bold text-white text-xs uppercase font-mono mb-1">Security & Abuse Defense</h3>
            <p className="text-xs text-zinc-400">
              To enforce sliding-window rate limits, prevent automated bot spam, and protect our serverless endpoints against unauthorized intrusion.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#0c0a13] border border-[#201d2e]">
            <h3 className="font-bold text-white text-xs uppercase font-mono mb-1">Statutory Compliance</h3>
            <p className="text-xs text-zinc-400">
              To maintain audit records, fulfill statutory privacy requests, and comply with binding directions issued by competent courts or regulatory bodies in India.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Desktop Application Processing Architecture */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-[#1f1c2d] pb-2">
          4. Future Desktop Application Data Processing (Technical Reality)
        </h2>
        <p>
          Honesty and factual precision are core engineering tenets at OSMOO. We do not make misleading claims that "data never leaves your machine" without explaining the exact technical boundaries:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-zinc-300">
          <li>
            <strong className="text-white">Local-First Execution:</strong> The core 3D companion interface, user workspace indexing, AST parsing, and local neural models execute directly on your workstation hardware utilizing Apple Silicon Metal or Windows DirectML accelerators.
          </li>
          <li>
            <strong className="text-white">Cloud AI & Third-Party Frontier Models:</strong> If you configure and invoke cloud-hosted frontier AI models (such as models provided by Anthropic, OpenAI, or Google Cloud) using your own API credentials, the specific prompts, workspace snippets, and instructions you choose to send will be transmitted to those respective providers over encrypted TLS 1.3 connections. Those transmissions are governed by your agreement with those respective providers.
          </li>
          <li>
            <strong className="text-white">Voice & Speech Processing:</strong> Local Whisper models process voice input on-device when hardware requirements are satisfied. If cloud fallback speech-to-text or text-to-speech services are selected in application settings, audio packets will be processed by the designated cloud audio provider.
          </li>
          <li>
            <strong className="text-white">Zero Telemetry Promise:</strong> The OSMOO desktop application does not transmit unsolicited background telemetry, keystroke logs, screen recordings, or browsing history to Osmiora Computational Systems servers.
          </li>
        </ul>
      </section>

      {/* 5. Sub-Processors & Data Sharing */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-[#1f1c2d] pb-2">
          5. Verified Service Providers & Sub-Processors
        </h2>
        <p>
          We do not sell, rent, or trade your personal data. To provide our public website, we engage the following service providers who act strictly as data processors:
        </p>
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs border border-[#201d2e] rounded-xl overflow-hidden">
            <thead className="bg-[#12101c] text-white font-mono uppercase">
              <tr>
                <th className="p-3 border-b border-[#201d2e]">Provider</th>
                <th className="p-3 border-b border-[#201d2e]">Role / Purpose</th>
                <th className="p-3 border-b border-[#201d2e]">Location & Safeguards</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1b2b] text-zinc-300">
              <tr>
                <td className="p-3 font-semibold text-white">Vercel Inc.</td>
                <td className="p-3">Web hosting, CDN edge delivery, serverless API execution</td>
                <td className="p-3">Global Edge Network; SOC2 Type II, TLS 1.3 encryption</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">Supabase, Inc.</td>
                <td className="p-3">Database persistence, user auth & Row-Level Security (RLS)</td>
                <td className="p-3">Cloud infrastructure (AWS), SOC2 Type II, encrypted at rest (AES-256)</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">Dodo Payments Inc.</td>
                <td className="p-3">Merchant payment gateway (currently in onboarding/setup mode)</td>
                <td className="p-3">PCI-DSS Level 1 compliant merchant processor</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">Resend, Inc.</td>
                <td className="p-3">Transactional email delivery for contact inquiries (optional integration)</td>
                <td className="p-3">TLS encrypted transit, SOC2 compliant</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 6. Data Retention & Deletion */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-[#1f1c2d] pb-2">
          6. Data Retention & Deletion Policy
        </h2>
        <p>
          We retain personal data only as long as necessary to fulfill the purposes set out in this Policy:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-zinc-300">
          <li>
            <strong className="text-white">Waitlist records:</strong> Retained until the release cohort completes or until you request removal.
          </li>
          <li>
            <strong className="text-white">Contact inquiries:</strong> Retained for 180 days following resolution of the inquiry, unless extended business correspondence or legal requirements mandate longer retention.
          </li>
          <li>
            <strong className="text-white">Server security logs:</strong> Retained for up to 90 days for forensic analysis and DDoS investigation, after which they are automatically purged or anonymized.
          </li>
        </ul>
        <p>
          You may request permanent deletion of your waitlist record or stored contact information at any time by emailing{' '}
          <a href="mailto:privacy@osmoo.in" className="text-purple-400 hover:underline">
            privacy@osmoo.in
          </a>.
        </p>
      </section>

      {/* 7. Rights Under DPDP Act 2023 & International Frameworks */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-[#1f1c2d] pb-2">
          7. Your Rights as a Data Principal
        </h2>
        <p>
          Under the Digital Personal Data Protection Act, 2023 (DPDP Act, 2023), you hold the following statutory rights regarding your digital personal data:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-zinc-300">
          <li>
            <strong className="text-white">Right to Access & Summary:</strong> You may request a summary of the personal data we hold about you and the processing activities undertaken.
          </li>
          <li>
            <strong className="text-white">Right to Correction & Erasure:</strong> You have the right to request correction of inaccurate data and erasure of personal data that is no longer necessary for the purpose for which it was collected.
          </li>
          <li>
            <strong className="text-white">Right of Grievance Redressal:</strong> You have the right to readily available means of grievance redressal regarding our data processing practices. See Section 8 and our dedicated Grievance page.
          </li>
          <li>
            <strong className="text-white">Right to Nominate:</strong> You have the right to nominate an individual who will exercise your rights in the event of death or incapacity.
          </li>
        </ul>
      </section>

      {/* 8. Contact & Privacy Inquiries */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-[#1f1c2d] pb-2">
          8. Exercising Rights & Grievance Mechanism
        </h2>
        <p>
          To exercise any of your data principal rights, or if you have questions regarding this Privacy Policy, please contact our designated Privacy Desk:
        </p>
        <div className="p-4 rounded-2xl bg-[#0c0a13] border border-[#201d2e] space-y-1 font-mono text-xs">
          <div><strong className="text-white font-sans">Entity:</strong> Osmiora Computational Systems</div>
          <div><strong className="text-white font-sans">Privacy Desk:</strong> privacy@osmoo.in</div>
          <div><strong className="text-white font-sans">General Contact:</strong> contact@osmoo.in</div>
          <div><strong className="text-white font-sans">Response Window:</strong> Within 30 calendar days (or expedited per DPDP rules)</div>
        </div>
      </section>
    </LegalLayout>
  )
}
