import { motion } from 'motion/react'
import { ShieldCheck, Cpu, KeyRound, CheckSquare, HardDrive, AlertTriangle } from 'lucide-react'

interface PrivacySecurityPageProps {
  onNavigate?: (tab: string) => void
}

export function PrivacySecurityPage({ onNavigate }: PrivacySecurityPageProps) {
  const cards = [
    {
      title: 'Local Processing vs. External AI',
      icon: Cpu,
      description:
        'Run native lightweight models directly on your hardware using Apple Silicon Neural Engine or Windows DirectML with zero cloud transmission. When external frontier models are invoked, requests route exclusively through zero-retention cryptographic tunnels that never train on your data.',
    },
    {
      title: 'Permissions',
      icon: KeyRound,
      description:
        'Granular OS-level boundaries strictly enforced by design. You specify exactly which project directories, terminal workspaces, and application windows OSMOO can observe. Background activity outside granted sandboxes is structurally prohibited.',
    },
    {
      title: 'Approval Flows',
      icon: CheckSquare,
      description:
        'Deterministic guardrails before every mutation. OSMOO previews visual AST diffs, shell dry-runs, and file modifications with explicit one-click approvals before touching your filesystem or repositories.',
    },
    {
      title: 'Data Handling',
      icon: HardDrive,
      description:
        'Zero telemetry, zero user tracking, and zero third-party logging. All embeddings, contextual memory indexes, and neural session caches reside entirely on your local encrypted NVMe storage (AES-256) and can be purged instantly.',
    },
    {
      title: 'Known Limitations',
      icon: AlertTriangle,
      description:
        'Transparent architectural boundaries. OSMOO never circumvents OS security sandboxes, cannot access unmounted network volumes without explicit tokens, and will decline any non-deterministic shell action lacking verified undo protocols.',
    },
  ]

  return (
    <div className="relative w-full min-h-screen py-16 sm:py-24 px-4 sm:px-6 md:px-8 flex flex-col items-center justify-center overflow-hidden">
      {/* Background atmospheric ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-purple-950/20 rounded-full blur-[160px] pointer-events-none" />

      {/* Main Framed Stage Container matching Reference Page 2 */}
      <div className="relative w-full max-w-4xl rounded-[32px] sm:rounded-[40px] bg-[#07060a]/90 border border-[#201d2d] p-6 sm:p-10 md:p-14 shadow-[0_25px_70px_rgba(0,0,0,0.9)] flex flex-col items-center text-center">
        {/* ─── TITLE & HEADING ─── */}
        <div className="mb-10 sm:mb-14 space-y-4 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151222] border border-[#2c2642] text-[11px] font-mono text-purple-300">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>Architecture & Trust Specification</span>
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-[-0.04em] leading-[0.95] text-white">
            PRIVACY &
            <br />
            SECURITY
          </h1>
        </div>

        {/* ─── VERTICAL STACK OF 5 CARDS MATCHING REFERENCE ─── */}
        <div className="w-full space-y-4 sm:space-y-5 text-left">
          {cards.map((card, idx) => {
            const Icon = card.icon
            return (
              <div
                key={idx}
                className="rounded-2xl sm:rounded-[20px] bg-[#0c0a13] border border-[#201d2e] p-5 sm:p-6 shadow-inner hover:border-[#3a3450] transition-all duration-200 group"
              >
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="p-2 rounded-lg bg-[#141220] border border-[#28243c] text-purple-400 group-hover:text-purple-300 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    {card.title}
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed pl-0 sm:pl-11">
                  {card.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* ─── BOTTOM CTA BUTTON MATCHING REFERENCE ─── */}
        <div className="mt-12 sm:mt-14">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate?.('download')}
            type="button"
            className="px-8 py-3.5 rounded-full bg-white text-black font-semibold text-sm tracking-tight shadow-[0_0_25px_rgba(255,255,255,0.25)] hover:bg-zinc-100 transition-all cursor-pointer"
          >
            Explore the product
          </motion.button>
        </div>
      </div>
    </div>
  )
}
