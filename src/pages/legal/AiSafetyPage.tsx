import { LegalLayout } from './LegalLayout'

interface AiSafetyPageProps {
  onNavigate?: (route: string) => void
}

export function AiSafetyPage({ onNavigate }: AiSafetyPageProps) {
  return (
    <LegalLayout
      title="AI & Computer-Control Safety Disclosure"
      subtitle="Comprehensive technical disclosure regarding non-deterministic artificial intelligence outputs, automated operating system actuation boundaries, and user responsibility."
      activeRoute="legal/ai-safety"
      onNavigate={onNavigate}
    >
      {/* 1. Core Disclosure */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-[#1f1c2d] pb-2">
          1. Probabilistic Nature of Artificial Intelligence
        </h2>
        <p>
          OSMOO utilizes frontier generative artificial intelligence architectures, machine learning models, and local neural perceptual pipelines. Users must understand that <strong className="text-white">generative AI models are probabilistic and non-deterministic</strong>.
        </p>
        <p>
          AI-generated outputs, including code transformations, syntax analysis, terminal commands, workflow decompositions, and conversational statements, may contain errors, inaccuracies, hallucinations, omissions, or unintended behaviors.
        </p>
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
          <strong className="text-amber-100 block mb-1">Human-in-the-Loop Mandate:</strong>
          You must never rely on OSMOO for safety-critical, medical, legal, high-risk financial, life-support, or hazardous industrial operations where an erroneous output could result in injury, death, physical destruction, or severe financial catastrophe.
        </div>
      </section>

      {/* 2. Computer Automation & Operating System Actions */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-[#1f1c2d] pb-2">
          2. Computer Automation & Actuation Boundaries
        </h2>
        <p>
          The planned OSMOO desktop companion is engineered to interact with your workstation environment through user-granted operating system hooks (such as macOS Accessibility APIs, AppleScript, or Windows UI Automation):
        </p>
        <ul className="list-disc pl-5 space-y-2 text-zinc-300">
          <li>
            <strong className="text-white">Deterministic User Approval:</strong> High-impact file mutations, script executions, package installations, and git commit operations require mandatory, explicit human confirmation. OSMOO is designed not to perform silent destructive filesystem writes without review.
          </li>
          <li>
            <strong className="text-white">Workspace Sandboxing:</strong> Users designate explicit directory scopes and repository workspaces. OSMOO's observation boundaries are constrained to granted spaces.
          </li>
          <li>
            <strong className="text-white">Reversibility & Git History:</strong> While OSMOO generates visual AST diffs prior to file mutation, users are strongly advised to run automated companions only in source-controlled repositories with clean git staging branches.
          </li>
        </ul>
      </section>

      {/* 3. Third-Party Frontier AI Models */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-[#1f1c2d] pb-2">
          3. Third-Party Frontier Model Providers
        </h2>
        <p>
          When you configure external API keys (such as Claude, OpenAI, or Google Gemini), OSMOO acts merely as a client coordinating context and user prompts:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-zinc-300">
          <li>We have no control over the underlying training sets, weights, safety guardrails, or potential biases of third-party frontier models;</li>
          <li>Third-party providers may experience outages, rate limiting, latency spikes, or sudden policy modifications;</li>
          <li>You are solely responsible for compliance with the terms of service and acceptable use policies of any external model provider whose credentials you supply.</li>
        </ul>
      </section>

      {/* 4. Limitation of Warranty for AI Operations */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-[#1f1c2d] pb-2">
          4. No Guarantee of Error-Free Execution
        </h2>
        <div className="p-4 rounded-2xl bg-[#0c0a13] border border-[#201d2e] text-zinc-300 space-y-2 text-xs">
          <p>
            OSMIORA COMPUTATIONAL SYSTEMS DOES NOT WARRANT THAT AI-PROPOSED AUTOMATION RUNS, TERMINAL COMMANDS, OR CODE GENERATION WILL BE SECURE, ERROR-FREE, UNINTERRUPTED, OR FREE FROM VULNERABILITIES.
          </p>
          <p>
            YOU ASSUME FULL TECHNICAL AND OPERATIONAL RESPONSIBILITY FOR REVIEWING, TESTING, VERIFYING, AND EXECUTING ANY AI-GENERATED SCRIPT OR CODE SUGGESTION ON YOUR WORKSTATION AND PRODUCTION INFRASTRUCTURE.
          </p>
        </div>
      </section>
    </LegalLayout>
  )
}
