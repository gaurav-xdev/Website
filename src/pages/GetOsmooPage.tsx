import { useState } from 'react'
import { motion } from 'motion/react'
import { Sparkles, ExternalLink, Laptop, Cpu, FileText, Terminal, Info, Gift, Users } from 'lucide-react'

interface GetOsmooPageProps {
  onNavigate?: (tab: string) => void
  onOpenModal?: () => void
}

export function GetOsmooPage({ onNavigate, onOpenModal }: GetOsmooPageProps) {
  const [targetOS, setTargetOS] = useState<'mac' | 'win'>('mac')

  const handleWaitlistClick = () => {
    if (onOpenModal) {
      onOpenModal()
    }
  }

  return (
    <div className="relative w-full min-h-screen py-16 sm:py-24 px-4 sm:px-6 md:px-8 flex flex-col items-center justify-center overflow-hidden">
      {/* Background atmospheric ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[520px] bg-purple-950/20 rounded-full blur-[170px] pointer-events-none" />

      {/* Main Framed Stage Container matching Reference Page 4 */}
      <div className="relative w-full max-w-4xl rounded-[32px] sm:rounded-[40px] bg-[#07060a]/90 border border-[#201d2d] p-6 sm:p-10 md:p-14 shadow-[0_25px_70px_rgba(0,0,0,0.9)] flex flex-col items-center text-center">
        {/* ─── TITLE & HEADING ─── */}
        <div className="mb-6 space-y-3 max-w-xl">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-[-0.04em] leading-[0.95] text-white">
            EARLY ACCESS
          </h1>
          <div className="flex items-center justify-center gap-2 text-xs font-mono">
            <span className="text-zinc-400">Release Status</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              Private Waitlist Cohort (macOS & Windows)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 font-sans tracking-tight max-w-md mx-auto leading-relaxed">
            OSMOO is in active developer preview. Join the waitlist to receive access as invitations are released.
          </p>
        </div>

        {/* ─── THE FOUNDING 50 OFFER SHOWCASE ─── */}
        <div className="mb-8 w-full max-w-xl p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#1a132e] via-[#120e21] to-[#0a0812] border border-purple-500/40 text-left relative overflow-hidden shadow-2xl">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-start gap-4 relative z-10">
            <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0 mt-0.5">
              <Gift className="w-5 h-5 text-purple-300" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono tracking-wider text-purple-300 uppercase font-bold">
                  THE FOUNDING 50
                </span>
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold">
                  Launch Benefit
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                The first 50 verified signups get 12 months of OSMOO Pro free.
              </h2>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Join the OSMOO early access waitlist. The first 50 eligible users who verify their email will receive a complimentary 12-month OSMOO Pro reward when it becomes available.
              </p>
            </div>
          </div>
        </div>

        {/* ─── DUAL CTA BUTTONS MATCHING REFERENCE ─── */}
        <div className="mb-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-md">
          {/* OS Switcher toggle */}
          <div className="w-full sm:w-auto flex items-center p-1 rounded-full bg-[#12101c] border border-[#262238] text-xs font-medium">
            <button
              type="button"
              onClick={() => setTargetOS('mac')}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                targetOS === 'mac'
                  ? 'bg-purple-600 text-white font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              macOS (Apple Silicon)
            </button>
            <button
              type="button"
              onClick={() => setTargetOS('win')}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                targetOS === 'win'
                  ? 'bg-purple-600 text-white font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Windows 11 (64-bit)
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleWaitlistClick}
              type="button"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white text-black font-semibold text-xs sm:text-sm shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:bg-zinc-100 transition-all cursor-pointer"
            >
              <Users className="w-4 h-4 stroke-[2.5]" />
              <span>Join the Waitlist</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleWaitlistClick}
              type="button"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-full bg-[#171424] border border-[#2f2a44] text-zinc-300 hover:text-white font-medium text-xs sm:text-sm hover:border-[#453d64] transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Claim Pro Reward</span>
            </motion.button>
          </div>
        </div>

        {/* Release Integrity Status Notice */}
        <div className="mb-10 w-full max-w-xl p-3.5 rounded-xl bg-[#110f1c] border border-[#27223b] text-zinc-300 text-xs flex items-start gap-2.5 text-left">
          <Info className="w-4 h-4 shrink-0 text-purple-400 mt-0.5" />
          <div className="text-[12px] leading-relaxed">
            <span className="font-semibold text-white">Preview Access Status:</span> Desktop binaries are distributed selectively to approved research and pilot partners. Direct installer downloads and SHA-256 integrity checksums will be published upon commercial release certification.
          </div>
        </div>

        {/* ─── 6 CARDS GRID MATCHING REFERENCE PAGE 4 ─── */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 text-left">
          {/* Card 1: Supported OS */}
          <div className="rounded-2xl bg-[#0c0a13] border border-[#201d2e] p-5 shadow-inner hover:border-[#38314e] transition-colors">
            <div className="flex items-center gap-2.5 mb-2">
              <Laptop className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">Supported OS</h3>
            </div>
            <div className="space-y-1 text-xs text-zinc-400 font-mono">
              <div className="flex justify-between">
                <span>macOS 14+ (Sonoma/Sequoia):</span>
                <span className="text-emerald-400">Apple Silicon M1-M4</span>
              </div>
              <div className="flex justify-between">
                <span>Windows 11 (Build 22621+):</span>
                <span className="text-emerald-400">DirectML & DX12</span>
              </div>
            </div>
          </div>

          {/* Card 2: Hardware requirements */}
          <div className="rounded-2xl bg-[#0c0a13] border border-[#201d2e] p-5 shadow-inner hover:border-[#38314e] transition-colors">
            <div className="flex items-center gap-2.5 mb-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">Hardware requirements</h3>
            </div>
            <div className="space-y-1 text-xs text-zinc-400 font-mono">
              <div className="flex justify-between">
                <span>Memory footprint:</span>
                <span className="text-zinc-300">8GB Unified / 16GB Rec.</span>
              </div>
              <div className="flex justify-between">
                <span>GPU Acceleration:</span>
                <span className="text-zinc-300">Metal 3 / RTX DirectML</span>
              </div>
            </div>
          </div>

          {/* Card 3: Installation Overview */}
          <div className="md:col-span-2 rounded-2xl bg-[#0c0a13] border border-[#201d2e] p-5 shadow-inner hover:border-[#38314e] transition-colors">
            <div className="flex items-center gap-2.5 mb-2">
              <Terminal className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">Installation Overview</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Standard native desktop application requiring zero kernel extensions or root escalation. Installs to user application space with local sandboxing. Integrates with system keychain for encrypted credential storage.
            </p>
          </div>

          {/* Card 4: Free vs. Pro */}
          <div className="rounded-2xl bg-[#0c0a13] border border-[#201d2e] p-5 shadow-inner hover:border-[#38314e] transition-colors">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white tracking-tight">Free vs. Pro</h3>
              <button
                type="button"
                onClick={() => onNavigate?.('pricing')}
                className="text-[10px] text-purple-400 hover:text-purple-300 font-mono flex items-center gap-1 cursor-pointer"
              >
                <span>Compare</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Free plan delivers essential on-device companion capabilities. Pro ($24/mo) unlocks high-throughput continuous memory, multi-project indexing, and priority updates. The Founding 50 provides 12 months Pro free to early verified members.
            </p>
          </div>

          {/* Card 5: Release Notes */}
          <div className="rounded-2xl bg-[#0c0a13] border border-[#201d2e] p-5 shadow-inner hover:border-[#38314e] transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">Release Notes</h3>
            </div>
            <div className="space-y-1.5 text-xs text-zinc-400 font-mono">
              <div className="flex items-center justify-between hover:text-purple-300 cursor-pointer transition-colors">
                <span>Release Notes v0.9.4 Preview</span>
                <span className="text-[10px] text-purple-400">View</span>
              </div>
              <div className="flex items-center justify-between text-zinc-600">
                <span>v0.9.0 Alpha (Archived)</span>
                <span className="text-[10px]">Oct 2026</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── BOTTOM CTA BUTTON MATCHING REFERENCE ─── */}
        <div className="mt-12 sm:mt-14">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate?.('home')}
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
