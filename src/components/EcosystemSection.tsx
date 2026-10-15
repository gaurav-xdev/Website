import { motion } from 'motion/react'
import {
  Code2,
  Palette,
  Terminal,
  Globe,
  Workflow,
  CheckCircle2,
} from 'lucide-react'

interface EcosystemSectionProps {
  onOpenModal: () => void
}

export function EcosystemSection({ onOpenModal }: EcosystemSectionProps) {
  const integrations = [
    {
      category: 'Developer Environments',
      icon: Code2,
      description: 'Zero-friction code intelligence, PR review, and multi-file refactoring.',
      apps: ['VS Code', 'Cursor', 'Xcode', 'JetBrains', 'Neovim'],
    },
    {
      category: 'Shell & Terminal',
      icon: Terminal,
      description: 'Natural language terminal synthesis with dry-run safety verification.',
      apps: ['Zsh', 'Bash', 'PowerShell', 'Warp', 'Ghostty'],
    },
    {
      category: 'Design & Creative',
      icon: Palette,
      description: 'Asset pipeline orchestration, Figma token sync, and render automation.',
      apps: ['Figma', 'Blender', 'Photoshop', 'DaVinci Resolve'],
    },
    {
      category: 'System & Knowledge',
      icon: Globe,
      description: 'Cross-app memory linking across browsers, local docs, and notes.',
      apps: ['Safari', 'Arc', 'Chrome', 'Obsidian', 'Notion'],
    },
  ]

  const architectureLayers = [
    {
      layer: 'Layer 01',
      title: 'Neural Perception Compositor',
      subtitle: 'Real-time multi-display frame analysis & accessibility tree capture at 60 FPS.',
    },
    {
      layer: 'Layer 02',
      title: 'Adaptive Agent Orchestrator',
      subtitle: 'Dynamic sub-agent dispatching for parallel research, verification, and code synthesis.',
    },
    {
      layer: 'Layer 03',
      title: 'Local Privacy Guardian',
      subtitle: 'End-to-end encrypted session memory stored in local NVMe cryptographic vault.',
    },
    {
      layer: 'Layer 04',
      title: 'Cross-App Action Bridge',
      subtitle: 'OS-level Accessibility and AppleScript/Win32 direct actuation with undo support.',
    },
  ]

  return (
    <section id="ecosystem" className="relative w-full py-24 sm:py-32 px-4 sm:px-6 md:px-8 border-t border-[#1b1924]">
      {/* Background Glow */}
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-[#B9A995]/15 rounded-full blur-[180px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-6xl mx-auto"
      >
        {/* Section Header */}
        <div className="flex flex-col items-center text-center space-y-4 mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#2b2938] bg-[#14131b]/80 backdrop-blur-md">
            <Workflow className="w-3.5 h-3.5 text-zinc-300" />
            <span className="text-[12px] font-semibold text-zinc-300 tracking-wider uppercase">
              Unified Platform
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase max-w-2xl leading-[1.05]">
            Bridging Your Entire Toolchain.
          </h2>

          <p className="text-sm sm:text-base text-zinc-400 max-w-xl leading-relaxed">
            OSMOO seamlessly binds the software you already use into an interconnected intelligent desktop layer.
          </p>
        </div>

        {/* Integration Categories 4-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {integrations.map((item, idx) => {
            const Icon = item.icon
            return (
              <div
                key={idx}
                className="group relative p-7 rounded-2xl border border-[#22202d] bg-[#0c0b11]/80 hover:bg-[#12111a] hover:border-[#343144] transition-all duration-300 shadow-xl overflow-hidden"
              >
                {/* Corner accent glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 group-hover:bg-purple-500/10 rounded-full blur-2xl transition-all" />

                <div className="flex items-center gap-3.5 mb-4">
                  <div className="p-3 rounded-xl bg-[#181622] text-white border border-[#2a2838] group-hover:border-zinc-500 transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      {item.category}
                    </h3>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-zinc-400 mb-6 leading-relaxed">
                  {item.description}
                </p>

                {/* App Pills */}
                <div className="flex flex-wrap gap-2">
                  {item.apps.map((app) => (
                    <span
                      key={app}
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-[#161420] border border-[#252332] text-zinc-300"
                    >
                      {app}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Deep Stack Architecture Visualization */}
        <div className="rounded-3xl border border-[#242230] bg-[#0a090e] p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-10 pb-8 border-b border-[#1c1a26]">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                System Specification
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white uppercase mt-1">
                Zero-Compromise Native Runtime
              </h3>
            </div>

            <div className="flex items-center gap-6 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero Cloud Lock-in</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Sub-16ms Compositor</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {architectureLayers.map((arch) => (
              <div
                key={arch.layer}
                className="p-5 rounded-2xl border border-[#1e1c28] bg-[#0e0d14]/70 hover:border-[#312e40] transition-colors"
              >
                <div className="text-[11px] font-mono text-purple-400 font-semibold mb-2">
                  {arch.layer}
                </div>
                <h4 className="text-base font-bold text-white mb-2 leading-snug">
                  {arch.title}
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {arch.subtitle}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 pt-8 border-t border-[#1c1a26] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-zinc-400 text-center sm:text-left">
              Developer SDK available for custom plugins, internal tooling, and custom agent hooks.
            </p>
            <button
              type="button"
              onClick={onOpenModal}
              className="px-6 py-2.5 rounded-full bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-all active:scale-95 whitespace-nowrap cursor-pointer shadow-lg shadow-white/5"
            >
              Explore Developer SDK
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
