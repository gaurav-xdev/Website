import { useState } from 'react'
import { motion } from 'motion/react'
import { Eye, ShieldCheck, Zap, Terminal, Sparkles, Command } from 'lucide-react'

interface FeaturesSectionProps {
  onOpenModal: () => void
}

export function FeaturesSection({ onOpenModal }: FeaturesSectionProps) {
  const [activeFeature, setActiveFeature] = useState(0)

  const features = [
    {
      id: 'context',
      icon: Eye,
      title: 'Active Context Awareness',
      badge: 'Visual & Semantic',
      description:
        'OSMOO observes active screen context and file hierarchies in real-time, understanding multi-application tasks without requiring manual copy-pasting or prompt re-contextualization.',
      details: [
        'Real-time screen vision & window comprehension',
        'Automatic cross-reference of open projects and repositories',
        'Zero-prompt contextual proactive assistance',
      ],
      codeSnippet: `// OSMOO Context Observer
const activeTask = await osmoo.context.capture({
  surface: 'active_window',
  includeDocumentTree: true,
  privacyFilter: 'strict'
});
// Resolves: VS Code (OSMOO/src) + Figma (Design System v2)`,
    },
    {
      id: 'system',
      icon: Terminal,
      title: 'Native System Orchestration',
      badge: 'OS-Level API',
      description:
        'Direct integration with OS file systems, process execution, and terminal workflows. OSMOO performs verified multi-step system actions with explicit consent gates.',
      details: [
        'Script execution in isolated sandbox containers',
        'Intelligent file diffing & safe automated batch refactoring',
        'System shortcut binding and keyboard-driven velocity',
      ],
      codeSnippet: `// System Automation Pipeline
await osmoo.system.executeBatch([
  { action: 'git.checkout', branch: 'feat/neural-sync' },
  { action: 'build.verify', timeoutMs: 15000 },
  { action: 'notify.complete', channel: 'desktop_hud' }
]);`,
    },
    {
      id: 'privacy',
      icon: ShieldCheck,
      title: 'Local-First Neural Vault',
      badge: 'Zero-Knowledge',
      description:
        'Your code, documents, and credentials never train public models. Local vector embeddings and encrypted session memory run on-device via Apple Neural Engine and DirectML.',
      details: [
        'Hardware-accelerated on-device neural indexing',
        'Hardware Security Module (HSM) / Secure Enclave integration',
        'Configurable offline air-gap mode for sensitive codebases',
      ],
      codeSnippet: `// Neural Vault Cryptographic Guard
const vault = new osmoo.Vault({
  encryption: 'AES-256-GCM',
  hardwareEnclave: true,
  networkTelemetry: false
});
await vault.sealSessionMemory();`,
    },
    {
      id: 'speed',
      icon: Zap,
      title: 'Sub-Millisecond Haptic Response',
      badge: 'Ultra-Low Latency',
      description:
        'Engineered in lightweight native code with zero electron overhead. Instant global keyboard summon with immediate streaming responses and haptic-fluid UI.',
      details: [
        'Memory footprint under 140MB in idle background state',
        'Instant hotkey summon (< 16ms frame-budget target)',
        'Fluid metal/DirectX composited overlay HUD',
      ],
      codeSnippet: `// Global Command Dispatch
osmoo.on('hotkey:summon', (event) => {
  event.target.mountOverlay({
    renderTarget: 'compositor_direct',
    latencyTarget: '<16ms'
  });
});`,
    },
  ]

  return (
    <section id="features" className="relative w-full py-24 sm:py-32 px-4 sm:px-6 md:px-8">
      {/* Background Atmosphere */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-purple-900/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center space-y-4 mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#2b2938] bg-[#14131b]/80 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
            <span className="text-[12px] font-semibold text-zinc-300 tracking-wider uppercase">
              Core Architecture
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase max-w-2xl leading-[1.05]">
            Engineered For Pure Desktop Flow.
          </h2>

          <p className="text-sm sm:text-base text-zinc-400 max-w-xl leading-relaxed">
            Not another browser chat box. OSMOO lives inside your operating system, anticipating workflows and executing complex tasks across native applications.
          </p>
        </div>

        {/* Feature Grid & Interactive Explorer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* Feature Selector Tabs (Left) */}
          <div className="lg:col-span-5 flex flex-col space-y-3 justify-center">
            {features.map((feat, idx) => {
              const Icon = feat.icon
              const isSelected = activeFeature === idx
              return (
                <button
                  key={feat.id}
                  type="button"
                  onClick={() => setActiveFeature(idx)}
                  className={`relative p-5 rounded-2xl text-left transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-[#15141c] border-[#383547] shadow-[0_0_30px_rgba(0,0,0,0.5)]'
                      : 'bg-[#0b0a0f]/60 border-[#1f1d28]/60 hover:border-[#2d2a3a] hover:bg-[#111017]/80'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-2.5 rounded-xl transition-colors ${
                        isSelected
                          ? 'bg-white text-black shadow-md'
                          : 'bg-[#1a1922] text-zinc-400'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-base font-bold text-white tracking-tight">
                          {feat.title}
                        </span>
                        <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md bg-[#232030] text-zinc-400">
                          {feat.badge}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                        {feat.description}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <motion.div
                      layoutId="activeFeatureBar"
                      className="absolute left-0 top-3 bottom-3 w-[3px] bg-white rounded-r-full"
                    />
                  )}
                </button>
              )
            })}
          </div>

          {/* Interactive Feature Terminal Display (Right) */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="h-full min-h-[380px] rounded-2xl border border-[#2b2838] bg-[#0c0b11] p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
              {/* Subtle Ambient Radial Highlight */}
              <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

              <div>
                {/* Simulated Window Chrome */}
                <div className="flex items-center justify-between pb-5 border-b border-[#201d2b] mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f57]/80" />
                    <div className="w-3 h-3 rounded-full bg-[#febc2e]/80" />
                    <div className="w-3 h-3 rounded-full bg-[#28c840]/80" />
                    <span className="ml-3 text-xs font-mono text-zinc-400">
                      osmoo_runtime::{features[activeFeature].id}.ts
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <Command className="w-3.5 h-3.5" />
                    <span className="font-mono text-[11px]">ACTIVE</span>
                  </div>
                </div>

                {/* Feature Deep Dive Header */}
                <div className="mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                    {features[activeFeature].title}
                  </h3>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    {features[activeFeature].description}
                  </p>
                </div>

                {/* Feature Capabilities Checklist */}
                <ul className="space-y-2.5 mb-6">
                  {features[activeFeature].details.map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-xs sm:text-sm text-zinc-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                {/* Real-time Code Execution Display */}
                <div className="rounded-xl bg-[#060509] border border-[#1d1b26] p-4 font-mono text-[11px] sm:text-xs text-zinc-300 overflow-x-auto leading-relaxed shadow-inner">
                  <pre>{features[activeFeature].codeSnippet}</pre>
                </div>
              </div>

              {/* Bottom Section CTA */}
              <div className="pt-6 mt-6 border-t border-[#1a1824] flex items-center justify-between">
                <span className="text-xs text-zinc-400">
                  Ready to test with your daily toolchain?
                </span>
                <button
                  type="button"
                  onClick={onOpenModal}
                  className="px-4 py-2 rounded-full bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-all active:scale-95 cursor-pointer"
                >
                  Request Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
