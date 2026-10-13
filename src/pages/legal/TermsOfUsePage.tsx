import { LegalLayout } from './LegalLayout'

interface TermsOfUsePageProps {
  onNavigate?: (route: string) => void
}

export function TermsOfUsePage({ onNavigate }: TermsOfUsePageProps) {
  return (
    <LegalLayout
      title="Terms of Use"
      subtitle="Governing terms and conditions for accessing and using the OSMOO website, early access waitlist, preview accounts, and preliminary software services."
      activeRoute="legal/terms"
      onNavigate={onNavigate}
    >
      {/* 1. Agreement to Terms */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-[#1f1c2d] pb-2">
          1. Acceptance of Terms
        </h2>
        <p>
          These Terms of Use ("Terms") constitute a legally binding agreement between you ("User", "you", or "your") and{' '}
          <strong className="text-white">Osmiora Computational Systems</strong> ("OSMOO", "we", "us", or "our"), governing your access to and use of our website (<code className="text-purple-300">osmoo.in</code>), early access waitlist, interactive materials, and any preview services provided through the website.
        </p>
        <p>
          By accessing the website, submitting an email to our waitlist, or logging in via one-time passcode (OTP), you acknowledge that you have read, understood, and agreed to be bound by these Terms and our Privacy Policy. If you do not agree, you must immediately discontinue use of the website.
        </p>
      </section>

      {/* 2. Eligibility & Age Restrictions */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-[#1f1c2d] pb-2">
          2. Eligibility & User Representation
        </h2>
        <p>
          You represent and warrant that you are at least 18 years of age (or the age of legal majority in your jurisdiction of residence) and possess the full legal capacity to enter into these Terms. If you are accessing the website on behalf of an organization, enterprise, or research laboratory, you represent that you have full authorization to bind that entity to these Terms.
        </p>
      </section>

      {/* 3. Waitlist & The Founding 50 Terms */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-[#1f1c2d] pb-2">
          3. Early Access Waitlist & "The Founding 50" Terms
        </h2>
        <p>
          Submitting your email to the OSMOO early access waitlist registers your interest in testing preview versions of our operating companion software:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-zinc-300">
          <li>
            <strong className="text-white">No Guaranteed Commercial Delivery:</strong> Waitlist registration does not constitute a guaranteed commercial delivery timeline. Software builds are distributed incrementally to approved developer cohorts based on system compatibility and hardware evaluation.
          </li>
          <li>
            <strong className="text-white">The Founding 50 Qualification:</strong> The promotional reward offering 12 months of complimentary OSMOO Pro to the first 50 verified signups is subject to server-side verification of valid email delivery and eligibility. The reward will be credited and activated only when the commercial OSMOO Pro tier is officially launched. It holds zero cash surrender value and cannot be exchanged, assigned, or transferred.
          </li>
          <li>
            <strong className="text-white">Fair Use & Anti-Fraud:</strong> Automated script submissions, temporary disposable inboxes, alias flooding, or fraudulent attempts to capture Founding 50 spots will result in immediate disqualification and revocation of waitlist eligibility.
          </li>
        </ul>
      </section>

      {/* 4. Acceptable Use & Prohibited Activities */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-[#1f1c2d] pb-2">
          4. Prohibited Activities
        </h2>
        <p>You agree not to engage in any of the following prohibited behaviors:</p>
        <ul className="list-disc pl-5 space-y-1.5 text-zinc-300">
          <li>Attempting to bypass, decompile, or reverse engineer any frontend verification code or serverless API endpoint;</li>
          <li>Conducting denial-of-service (DoS) attacks, brute-force attempts against OTP authentication, or rate limit circumvention;</li>
          <li>Using automated spiders, scrapers, or scripts to collect data from the website without prior express written authorization;</li>
          <li>Introducing viruses, trojans, worms, logic bombs, or other malicious or technologically harmful materials;</li>
          <li>Impersonating another person, business, or entity when submitting contact inquiries or early access forms;</li>
          <li>Violating any applicable municipal, state, national, or international law, including the Information Technology Act, 2000.</li>
        </ul>
      </section>

      {/* 5. Intellectual Property Rights */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-[#1f1c2d] pb-2">
          5. Intellectual Property Ownership
        </h2>
        <p>
          All content, software code, 3D character models, shaders, user interface designs, audio synthesis routines, brand names, logos, trademarks, and documentation published on this website are the proprietary property of Osmiora Computational Systems or its licensors and are protected under Indian and international copyright, trademark, and trade secret laws.
        </p>
        <p>
          You are granted a limited, revocable, non-exclusive, non-transferable license to access the website for personal and internal evaluation purposes. No rights or licenses in our intellectual property are granted by implication or estoppel.
        </p>
      </section>

      {/* 6. Disclaimers & Limitations of Liability */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-[#1f1c2d] pb-2">
          6. Disclaimers & Limitation of Liability
        </h2>
        <div className="p-4 rounded-2xl bg-[#0e0c15] border border-[#221f2f] text-zinc-300 space-y-2">
          <p className="uppercase font-mono text-[11px] text-zinc-400 font-bold">
            Notice Regarding As-Is Availability (Information Technology Act, 2000 & Consumer Protection Act, 2019):
          </p>
          <p className="text-xs">
            TO THE MAXIMUM EXTENT PERMITTED UNDER APPLICABLE LAW, THE WEBSITE, ALL PREVIEW MATERIALS, AND EARLY ACCESS DEMOS ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
          </p>
          <p className="text-xs">
            IN NO EVENT SHALL OSMIORA COMPUTATIONAL SYSTEMS, ITS FOUNDERS, EMPLOYEES, OR SUPPLIERS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES (INCLUDING LOSS OF PROFITS, DATA, USE, OR GOODWILL) ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF OR INABILITY TO USE THIS WEBSITE.
          </p>
        </div>
      </section>

      {/* 7. Governing Law & Dispute Resolution */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-[#1f1c2d] pb-2">
          7. Governing Law & Jurisdiction
        </h2>
        <p>
          These Terms and any dispute or claim arising out of or related to their subject matter shall be governed by and construed in accordance with the laws of the <strong className="text-white">Republic of India</strong>, without giving effect to any principles of conflicts of law.
        </p>
        <p>
          Subject to applicable consumer protection legislation, any legal action, suit, or proceeding arising under these Terms shall be subject to the exclusive jurisdiction of the competent courts of India.
        </p>
      </section>

      {/* 8. Modifications to Terms */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-[#1f1c2d] pb-2">
          8. Amendments & Updates
        </h2>
        <p>
          We reserve the right to amend these Terms at any time by publishing the revised document on this page with an updated "Last Updated" date. Continued use of our website following the posting of changes constitutes your acceptance of the amended Terms.
        </p>
      </section>
    </LegalLayout>
  )
}
