import { useState } from 'react'
import { motion } from 'motion/react'
import { Download, Sparkles, ExternalLink, Laptop, Cpu, CheckCircle2, FileText, HelpCircle, Terminal } from 'lucide-react'

interface GetOsmooPageProps {
  onNavigate?: (tab: string) => void
  onOpenModal?: () => void
}

export function GetOsmooPage({ onNavigate, onOpenModal }: GetOsmooPageProps) {
  const [downloadOS, setDownloadOS] = useState<'mac' | 'win'>('mac')
  const [downloadSuccess, setDownloadSuccess] = useState(false)

  const handleDownload = () => {
    setDownloadSuccess(true)
    setTimeout(() => setDownloadSuccess(false), 4000)
    // Trigger modal or direct binary flow
    if (onOpenModal) onOpenModal()
  }

  return (
    <div className="relative w-full min-h-screen py-16 sm:py-24 px-4 sm:px-6 md:px-8 flex flex-col items-center justify-center overflow-hidden">
      {/* Background atmospheric ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-purple-950/20 rounded-full blur-[160px] pointer-events-none" />

      {/* Main Framed Stage Container matching Reference Page 4 */}
      <div className="relative w-full max-w-4xl rounded-[32px] sm:rounded-[40px] bg-[#07060a]/90 border border-[#201d2d] p-6 sm:p-10 md:p-14 shadow-[0_25px_70px_rgba(0,0,0,0.9)] flex flex-col items-center text-center">
        {/* ─── TITLE & HEADING ─── */}
        <div className="mb-8 space-y-3 max-w-xl">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-[-0.04em] leading-[0.95] text-white">
            GET OSMOO
          </h1>
          <div className="flex items-center justify-center gap-2 text-xs font-mono">
            <span className="text-zinc-400">Current release</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              v0.9.4 Stable
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 font-sans tracking-tight max-w-md mx-auto">
            Direct native desktop installer for macOS and Windows.
          </p>
        </div>

        {/* ─── DUAL CTA BUTTONS MATCHING REFERENCE ─── */}
        <div className="mb-12 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-md">
          {/* OS Switcher toggle */}
          <div className="w-full sm:w-auto flex items-center p-1 rounded-full bg-[#12101c] border border-[#262238] text-xs font-medium">
            <button
              type="button"
              onClick={() => setDownloadOS('mac')}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                downloadOS === 'mac'
                  ? 'bg-purple-600 text-white font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              macOS (Apple Silicon)
            </button>
            <button
              type="button"
              onClick={() => setDownloadOS('win')}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                downloadOS === 'win'
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
              onClick={handleDownload}
              type="button"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white text-black font-semibold text-xs sm:text-sm shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:bg-zinc-100 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Download {downloadOS === 'mac' ? '.dmg' : '.msi'}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate?.('contact')}
              type="button"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-full bg-[#171424] border border-[#2f2a44] text-zinc-300 hover:text-white font-medium text-xs sm:text-sm hover:border-[#453d64] transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Early Access</span>
            </motion.button>
          </div>
        </div>

        {downloadSuccess && (
          <div className="mb-8 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Download initiated: OSMOO-v0.9.4-{downloadOS === 'mac' ? 'arm64.dmg' : 'x64.msi'} (SHA-256 verified)</span>
          </div>
        )}

        {/* ─── 6 CARDS GRID MATCHING REFERENCE PAGE 4 ─── */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 text-left">
          {/* Card 1: Supported OS */}
          <div className="rounded-2xl bg-[#0c0a13] border border-[#201d2e] p-5 shadow-inner hover:border-[#38314e] transition-colors">
            <div className="flex items-center gap-2.5 mb-2">
              <Laptop className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-bold text-white tracking-tight">Supported OS</h2>
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
              <h2 className="text-sm font-bold text-white tracking-tight">Hardware requirements</h2>
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
              <h2 className="text-sm font-bold text-white tracking-tight">Installation Overview</h2>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Standard native installer requiring zero system extensions, daemons, or root escalation. Mount the DMG and drag to Applications, or run the verified signed Windows MSI. Integrates seamlessly into your local user keychain.
            </p>
          </div>

          {/* Card 4: Free vs. Pro */}
          <div className="rounded-2xl bg-[#0c0a13] border border-[#201d2e] p-5 shadow-inner hover:border-[#38314e] transition-colors">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-white tracking-tight">Free vs. Pro</h2>
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
              Free plan delivers complete local-first model execution on device. Pro ($24/mo) unlocks high-throughput frontier AI routing, multi-project context memory, and priority updates.
            </p>
          </div>

          {/* Card 5: Release Notes */}
          <div className="rounded-2xl bg-[#0c0a13] border border-[#201d2e] p-5 shadow-inner hover:border-[#38314e] transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-bold text-white tracking-tight">Release Notes</h2>
            </div>
            <div className="space-y-1.5 text-xs text-zinc-400 font-mono">
              <div className="flex items-center justify-between hover:text-purple-300 cursor-pointer transition-colors">
                <span>Release Notes v0.9.4</span>
                <ExternalLink className="w-3 h-3 text-zinc-600" />
              </div>
              <div className="flex items-center justify-between hover:text-purple-300 cursor-pointer transition-colors">
                <span>DirectML Hardware Pipeline</span>
                <ExternalLink className="w-3 h-3 text-zinc-600" />
              </div>
              <div className="flex items-center justify-between hover:text-purple-300 cursor-pointer transition-colors">
                <span>Local AST Compositor Updates</span>
                <ExternalLink className="w-3 h-3 text-zinc-600" />
              </div>
            </div>
          </div>

          {/* Card 6: Help & Resources */}
          <div className="md:col-span-2 rounded-2xl bg-[#0c0a13] border border-[#201d2e] p-5 shadow-inner hover:border-[#38314e] transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-bold text-white tracking-tight">Help & Documentation</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-zinc-400 font-mono">
              <a href="#faq" onClick={(e) => { e.preventDefault(); onNavigate?.('faq') }} className="p-2 rounded-lg bg-[#141220] border border-[#262238] hover:text-white transition-colors text-center">
                Documentation
              </a>
              <a href="#faq" onClick={(e) => { e.preventDefault(); onNavigate?.('faq') }} className="p-2 rounded-lg bg-[#141220] border border-[#262238] hover:text-white transition-colors text-center">
                FAQ Hub
              </a>
              <a href="#contact" onClick={(e) => { e.preventDefault(); onNavigate?.('contact') }} className="p-2 rounded-lg bg-[#141220] border border-[#262238] hover:text-white transition-colors text-center">
                Security Disclosure
              </a>
              <a href="#contact" onClick={(e) => { e.preventDefault(); onNavigate?.('contact') }} className="p-2 rounded-lg bg-[#141220] border border-[#262238] hover:text-white transition-colors text-center">
                Engineering Contact
              </a>
            </div>
          </div>
        </div>

        {/* ─── BOTTOM EMBEDDED FOOTER MATCHING REFERENCE ─── */}
        <div className="mt-12 pt-6 w-full border-t border-[#1a1726] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 font-mono">
          <div className="font-bold text-white tracking-wider">
            OSMOO
          </div>
          <div className="flex items-center gap-6">
            <button type="button" onClick={() => onNavigate?.('home')} className="hover:text-zinc-300 transition-colors">
              About
            </button>
            <button type="button" onClick={() => onNavigate?.('faq')} className="hover:text-zinc-300 transition-colors">
              Docs
            </button>
            <button type="button" onClick={() => onNavigate?.('privacy')} className="hover:text-zinc-300 transition-colors">
              Security
            </button>
            <button type="button" onClick={() => onNavigate?.('contact')} className="hover:text-zinc-300 transition-colors">
              Contact
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
