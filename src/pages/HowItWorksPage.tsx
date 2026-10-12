import { motion } from 'motion/react'
import { ArrowRight, ArrowDown, ArrowLeft, Terminal, Search, Wand2, Eye, ShieldCheck, Cpu } from 'lucide-react'

interface HowItWorksPageProps {
  onNavigate?: (tab: string) => void
}

export function HowItWorksPage({ onNavigate }: HowItWorksPageProps) {
  return (
    <div className="relative w-full min-h-screen py-16 sm:py-24 px-4 sm:px-6 md:px-8 flex flex-col items-center justify-center overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-purple-950/20 rounded-full blur-[160px] pointer-events-none" />

      {/* Main Framed Stage Container matching Reference Page 1 */}
      <div className="relative w-full max-w-5xl rounded-[32px] sm:rounded-[40px] bg-[#07060a]/90 border border-[#201d2d] p-6 sm:p-10 md:p-14 shadow-[0_25px_70px_rgba(0,0,0,0.9)] flex flex-col items-center text-center">
        {/* ─── HEADER TITLE & SUBTITLE ─── */}
        <div className="mb-12 sm:mb-16 space-y-4 max-w-2xl">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-[-0.04em] leading-[0.95] text-white">
            HOW OSMOO
            <br />
            WORKS
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 font-sans tracking-tight max-w-lg mx-auto leading-relaxed">
            A zero-overhead AI app integrated into operating model for your toolkit.
          </p>
        </div>

        {/* ─── 2x2 PROCESS FLOW GRID (1 -> 2 -> 4 -> 3) ─── */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 items-stretch relative">
          {/* STEP 1: OBSERVE (Top Left) */}
          <div className="relative flex flex-col text-left group">
            <div className="mb-3 space-y-1">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                1. Observe
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-snug">
                Capturing context without disturbing working sequence.
              </p>
            </div>

            {/* Visual Card 1 */}
            <div className="relative w-full h-[260px] sm:h-[280px] rounded-2xl bg-[#0d0b14] border border-[#232032] p-4 flex flex-col items-center justify-center overflow-hidden shadow-inner group-hover:border-[#3d3754] transition-colors">
              <div className="absolute w-36 h-36 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="relative w-28 h-36 flex items-center justify-center">
                <img
                  src="/osmoo_bot_transparent.png"
                  alt="OSMOO Observing"
                  className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.95)]"
                />
              </div>
              <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#161422] border border-[#2b273b] text-[10px] text-zinc-300 font-mono">
                <Eye className="w-3 h-3 text-purple-400" />
                <span>Zero-Latency Screen Perception</span>
              </div>
            </div>

            {/* Connecting Arrow -> Step 2 (Desktop only) */}
            <div className="hidden md:flex absolute -right-5 top-[58%] -translate-y-1/2 z-20 text-zinc-600 bg-[#07060a] p-1 rounded-full border border-[#232032]">
              <ArrowRight className="w-4 h-4 stroke-[2]" />
            </div>
          </div>

          {/* STEP 2: PLAN (Top Right) */}
          <div className="relative flex flex-col text-left group">
            <div className="mb-3 space-y-1">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                2. Plan
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-snug">
                Breaks down requests into executable steps with transparent dependencies.
              </p>
            </div>

            {/* Visual Card 2 */}
            <div className="relative w-full h-[260px] sm:h-[280px] rounded-2xl bg-[#0d0b14] border border-[#232032] p-4 flex items-center justify-between overflow-hidden shadow-inner group-hover:border-[#3d3754] transition-colors">
              {/* Task Node Graph */}
              <div className="flex-1 space-y-2 pr-3 font-mono text-[11px]">
                <div className="p-2 rounded-lg bg-[#141220] border border-[#29253c] text-zinc-300 flex items-center justify-between">
                  <span>1. Parse active AST</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
                <div className="p-2 rounded-lg bg-[#191629] border border-[#3b3557] text-white flex items-center justify-between shadow-sm">
                  <span className="font-semibold">2. Generate dry-run</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-600/40 text-purple-300">ACTIVE</span>
                </div>
                <div className="p-2 rounded-lg bg-[#141220] border border-[#29253c] text-zinc-400 flex items-center justify-between">
                  <span>3. Verify mutations</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                </div>
              </div>

              {/* Companion Observing */}
              <div className="w-20 h-28 relative flex items-center justify-center flex-shrink-0">
                <img
                  src="/osmoo_bot_transparent.png"
                  alt="OSMOO Planning"
                  className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.95)]"
                />
              </div>
            </div>

            {/* Connecting Arrow v Step 4 (Desktop only) */}
            <div className="hidden md:flex absolute right-1/2 translate-x-1/2 -bottom-6 z-20 text-zinc-600 bg-[#07060a] p-1 rounded-full border border-[#232032]">
              <ArrowDown className="w-4 h-4 stroke-[2]" />
            </div>
          </div>

          {/* STEP 3: ACT (Bottom Left in reference flow, executed after verify) */}
          <div className="relative flex flex-col text-left group">
            <div className="mb-3 space-y-1">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                3. Act
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-snug">
                Execute multi-step tasks across apps with precise orchestration.
              </p>
            </div>

            {/* Visual Card 3 */}
            <div className="relative w-full h-[260px] sm:h-[280px] rounded-2xl bg-[#0d0b14] border border-[#232032] p-4 flex flex-col items-center justify-center overflow-hidden shadow-inner group-hover:border-[#3d3754] transition-colors">
              <div className="relative w-28 h-36 flex items-center justify-center">
                <img
                  src="/osmoo_bot_transparent.png"
                  alt="OSMOO Acting"
                  className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.95)]"
                />

                {/* Floating Action Badges */}
                <div className="absolute -left-3 top-2 p-1.5 rounded-lg bg-[#191724] border border-[#353048] shadow-lg text-purple-300">
                  <Search className="w-3.5 h-3.5" />
                </div>
                <div className="absolute -right-3 top-4 p-1.5 rounded-lg bg-[#191724] border border-[#353048] shadow-lg text-amber-300">
                  <Wand2 className="w-3.5 h-3.5" />
                </div>
                <div className="absolute -left-2 bottom-3 p-1.5 rounded-lg bg-[#191724] border border-[#353048] shadow-lg text-emerald-300">
                  <Terminal className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#161422] border border-[#2b273b] text-[10px] text-zinc-300 font-mono">
                <Cpu className="w-3 h-3 text-emerald-400" />
                <span>Deterministic Sandboxed Execution</span>
              </div>
            </div>
          </div>

          {/* STEP 4: VERIFY (Bottom Right in 2x2 grid) */}
          <div className="relative flex flex-col text-left group">
            <div className="mb-3 space-y-1">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                4. Verify
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-snug">
                Enforces zero-leak, deterministic safety rules before execution.
              </p>
            </div>

            {/* Visual Card 4 */}
            <div className="relative w-full h-[260px] sm:h-[280px] rounded-2xl bg-[#0d0b14] border border-[#232032] p-5 flex flex-col justify-center overflow-hidden shadow-inner group-hover:border-[#3d3754] transition-colors">
              <div className="rounded-xl bg-[#07060a] border border-[#201d2d] p-3.5 space-y-2.5 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#1b1926]">
                  <div className="flex items-center gap-2 text-white font-semibold">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Security Sandbox</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-500/10">PASSED</span>
                </div>

                <div className="space-y-1.5 text-[11px] text-zinc-400">
                  <div className="flex justify-between">
                    <span>Zero telemetry audit:</span>
                    <span className="text-emerald-400">100% CLEAN</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Filesystem mutations:</span>
                    <span className="text-zinc-300">SANDBOXED</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reversibility check:</span>
                    <span className="text-emerald-400">READY</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Connecting Arrow <- Step 3 (Desktop only) */}
            <div className="hidden md:flex absolute -left-5 top-[58%] -translate-y-1/2 z-20 text-zinc-600 bg-[#07060a] p-1 rounded-full border border-[#232032]">
              <ArrowLeft className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
        </div>

        {/* ─── BOTTOM CTA BUTTON MATCHING REFERENCE ─── */}
        <div className="mt-12 sm:mt-14">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate?.('contact')}
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
