import { LegalLayout } from './LegalLayout'

interface EulaPageProps {
  onNavigate?: (route: string) => void
}

export function EulaPage({ onNavigate }: EulaPageProps) {
  return (
    <LegalLayout
      title="End User License Agreement (EULA)"
      subtitle="Standard software license terms governing preview builds, runtime executables, and future desktop releases of the OSMOO AI Operating Companion."
      activeRoute="legal/eula"
      onNavigate={onNavigate}
    >
      {/* 1. Preview Software Notice */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-[#1f1c2d] pb-2">
          1. Software Preview Notice
        </h2>
        <div className="p-4 rounded-2xl bg-[#0f0d18] border border-purple-500/20 text-purple-200">
          <strong className="text-white block mb-1">Developer Preview Status (v0.9.4):</strong>
          This End User License Agreement ("EULA") is a legal agreement between you and <strong className="text-white">Osmiora Computational Systems</strong> governing the future binary release of OSMOO for macOS and Windows 11. Desktop binaries are currently distributed selectively to approved preview cohorts.
        </div>
      </section>

      {/* 2. License Grant */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-[#1f1c2d] pb-2">
          2. Grant of License
        </h2>
        <p>
          Subject to your continuous compliance with this EULA, Osmiora Computational Systems grants you a revocable, non-exclusive, non-transferable, limited license to download, install, and execute the binary build of OSMOO on compatible personal workstations (Apple Silicon macOS 14+ or Windows 11 DirectML) owned or controlled by you:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-zinc-300">
          <li>
            <strong className="text-white">Free License:</strong> Permitted on up to 1 workstation for individual evaluation and development.
          </li>
          <li>
            <strong className="text-white">Pro / Founding 50 License:</strong> Permitted on up to 3 workstations associated with your registered email account.
          </li>
          <li>
            <strong className="text-white">Enterprise License:</strong> Multi-seat installation managed via corporate license keys according to dedicated service agreements.
          </li>
        </ul>
      </section>

      {/* 3. Restrictions */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-[#1f1c2d] pb-2">
          3. License Restrictions
        </h2>
        <p>You expressly agree that you will not:</p>
        <ul className="list-disc pl-5 space-y-1.5 text-zinc-300">
          <li>Decompile, disassemble, reverse engineer, or attempt to derive the source code of the binary application, except to the extent permitted by applicable law;</li>
          <li>Modify, adapt, translate, rent, lease, loan, resell, or distribute the software or any portion thereof to any third party;</li>
          <li>Circumvent or disable any technological protection, cryptographic verification signature, or license enforcement mechanisms;</li>
          <li>Use the software to construct a competing desktop neural companion or malicious automated actuation tool;</li>
          <li>Remove, alter, or obscure any proprietary copyright or trademark notices placed on or within the software.</li>
        </ul>
      </section>

      {/* 4. Open Source & Third-Party Components */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-[#1f1c2d] pb-2">
          4. Open Source & Third-Party Components
        </h2>
        <p>
          The OSMOO desktop executable incorporates certain open-source software libraries, runtimes, and models (including components licensed under MIT, Apache 2.0, and BSD licenses). Nothing in this EULA limits your rights under, or grants you rights that supersede, the terms of any applicable open-source software license. A full inventory of open-source disclosures and attribution will be bundled in the software's <code className="text-purple-300">LICENSE.txt</code> build artifact.
        </p>
      </section>

      {/* 5. Updates & Telemetry Disclosures */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-[#1f1c2d] pb-2">
          5. Updates & Zero-Telemetry Architecture
        </h2>
        <p>
          The software may periodically query our release endpoint to detect available security updates and bug fixes. These queries transmit only standard build version identifiers. The software enforces a strict <strong className="text-white">zero-telemetry default</strong>: your local workspace files, git repositories, terminal histories, and AI conversation context are never transmitted to our servers without your affirmative, explicit command.
        </p>
      </section>

      {/* 6. Warranty Disclaimers & Governing Law */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-[#1f1c2d] pb-2">
          6. Warranty Disclaimer & Termination
        </h2>
        <div className="p-4 rounded-2xl bg-[#0c0a13] border border-[#201d2e] text-zinc-300 space-y-2 text-xs">
          <p>
            THE PREVIEW SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND. OSMIORA COMPUTATIONAL SYSTEMS DISCLAIMS ALL WARRANTIES, WHETHER EXPRESS OR IMPLIED, INCLUDING THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.
          </p>
          <p>
            This EULA is effective until terminated. Your rights under this license terminate automatically without notice if you fail to comply with any of its terms.
          </p>
        </div>
      </section>
    </LegalLayout>
  )
}
