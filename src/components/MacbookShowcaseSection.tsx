import { motion } from 'motion/react'
import {
  Terminal,
  Layers,
  FolderGit2,
  Cpu,
  Sparkles,
  Command,
  Shield,
  Eye,
  CheckCircle2,
} from 'lucide-react'

export function MacbookShowcaseSection() {
  return (
    <section className="relative w-full py-16 sm:py-24 px-4 sm:px-6 md:px-8 flex flex-col items-center justify-center overflow-hidden">
      {/* Ambient background light beneath the hardware */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[75vw] max-w-[900px] h-[400px] bg-purple-900/15 rounded-full blur-[160px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-5xl mx-auto flex flex-col items-center"
      >
        {/*
          PRECISION MACBOOK PRO HARDWARE MOCKUP
          Crafted with aluminum unibody styling, slim display bezels, camera notch, and realistic lighting
        */}
        <div className="w-full flex flex-col items-center filter drop-shadow-[0_30px_60px_rgba(0,0,0,0.95)]">
          {/* 1. DISPLAY LID ENCLOSURE */}
          <div className="relative w-full aspect-[16/10] max-h-[640px] rounded-[18px] sm:rounded-[24px] p-[10px] sm:p-[14px] bg-[#141416] border border-[#2e2e34] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] flex flex-col">
            {/* Display Bezel Interior */}
            <div className="relative w-full h-full rounded-[10px] sm:rounded-[14px] bg-[#0c0b12] border border-[#201f28] overflow-hidden flex flex-col shadow-inner">
              {/* Camera Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 sm:w-36 h-3 sm:h-4 bg-[#141416] rounded-b-xl z-30 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#050508] border border-[#2a2a30]" />
              </div>

              {/* ─── macOS MENU BAR ─── */}
              <div className="relative z-20 w-full h-6 sm:h-7 px-4 flex items-center justify-between bg-black/40 backdrop-blur-md border-b border-white/5 text-[10px] sm:text-[11px] text-zinc-300 font-medium select-none">
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="font-bold text-white"></span>
                  <span className="font-bold text-white">OSMOO</span>
                  <span className="hidden sm:inline hover:text-white transition-colors cursor-pointer">File</span>
                  <span className="hidden sm:inline hover:text-white transition-colors cursor-pointer">Edit</span>
                  <span className="hidden sm:inline hover:text-white transition-colors cursor-pointer">View</span>
                  <span className="hidden sm:inline hover:text-white transition-colors cursor-pointer">Window</span>
                  <span className="hidden sm:inline hover:text-white transition-colors cursor-pointer">Help</span>
                </div>
                <div className="flex items-center gap-3 text-zinc-400 font-mono text-[9px] sm:text-[10px]">
                  <span>DirectML 60 FPS</span>
                  <span>100%</span>
                  <span>Thu 15:42</span>
                </div>
              </div>

              {/* ─── macOS DESKTOP WALLPAPER & WORKSPACE SURFACE ─── */}
              <div className="relative flex-1 w-full p-2 sm:p-4 md:p-6 flex items-center justify-center bg-[#0d0914] overflow-hidden">
                {/* macOS Atmospheric Wallpaper Elements matching reference */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#3b1735]/40 via-[#1b1226]/60 to-[#0e0918] pointer-events-none" />
                <div className="absolute -bottom-10 left-1/4 w-[500px] h-48 bg-rose-600/20 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute -top-10 right-1/4 w-[450px] h-48 bg-purple-600/20 rounded-full blur-[110px] pointer-events-none" />

                {/* ─── ACTIVE OSMOO NATIVE DESKTOP WINDOW ─── */}
                <div className="relative w-full h-full max-w-[94%] rounded-xl sm:rounded-2xl bg-[#0f0e15]/95 border border-[#2b2838] shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex overflow-hidden">
                  {/* Window Sidebar */}
                  <div className="w-14 sm:w-44 bg-[#0a0910] border-r border-[#201d2a] p-2 sm:p-3 flex flex-col justify-between select-none">
                    <div>
                      {/* Window Traffic Lights */}
                      <div className="flex items-center gap-1.5 mb-4 pl-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                      </div>

                      {/* Navigation Items */}
                      <div className="space-y-1">
                        {[
                          { label: 'Workspace', icon: Layers, active: true },
                          { label: 'Tasks', icon: FolderGit2, active: false },
                          { label: 'Terminal', icon: Terminal, active: false },
                          { label: 'Models', icon: Cpu, active: false },
                          { label: 'Security', icon: Shield, active: false },
                        ].map((item, idx) => {
                          const Icon = item.icon
                          return (
                            <div
                              key={idx}
                              className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                item.active
                                  ? 'bg-[#1e1b29] text-white'
                                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="hidden sm:inline">{item.label}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="hidden sm:flex items-center gap-2 px-2 py-1 text-[10px] text-zinc-500 font-mono border-t border-[#181622] pt-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>v0.9.4 Native</span>
                    </div>
                  </div>

                  {/* Window Main Workspace & Chat */}
                  <div className="flex-1 flex flex-col justify-between p-3 sm:p-5 bg-[#0e0d15] overflow-hidden">
                    {/* Top Workspace Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-[#1c1a26]">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-white tracking-tight">
                          Active Neural Session
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#1f1d2b] text-purple-300">
                          Sandbox #04
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                        <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                        <span className="font-mono">LISTENING</span>
                      </div>
                    </div>

                    {/* Chat Stream & Action Steps */}
                    <div className="my-auto py-3 space-y-3 font-sans text-xs">
                      {/* User Request Bubble */}
                      <div className="flex justify-end">
                        <div className="max-w-[85%] sm:max-w-[70%] px-3.5 py-2 rounded-2xl rounded-tr-sm bg-[#221e30] border border-[#353048] text-white text-[11px] sm:text-xs">
                          Inspect open repository diffs and prepare safe verified deployment.
                        </div>
                      </div>

                      {/* Companion Execution Status Card */}
                      <div className="flex justify-start">
                        <div className="max-w-[90%] sm:max-w-[80%] p-3 rounded-2xl rounded-tl-sm bg-[#15131f] border border-[#272336] space-y-2 text-[11px] sm:text-xs">
                          <div className="flex items-center gap-2 text-zinc-300 font-semibold">
                            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                            <span>Contextual Plan Generated</span>
                          </div>
                          <p className="text-zinc-400 text-[10px] sm:text-[11px] leading-relaxed">
                            Captured AST from VS Code. Analyzed 14 changed modules, generated sandbox unit verification, zero security regressions detected.
                          </p>
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              className="px-3 py-1 rounded-md bg-purple-600 hover:bg-purple-500 text-[#121116] font-semibold text-[10px] transition-colors"
                            >
                              Execute Pipeline
                            </button>
                            <span className="text-[10px] text-zinc-500 font-mono">
                              Press ⌘↵ to approve
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Input Bar */}
                    <div className="pt-2 border-t border-[#1c1a26] flex items-center gap-2">
                      <div className="flex-1 px-3 py-1.5 rounded-xl bg-[#09080e] border border-[#222030] text-[11px] text-zinc-400 flex items-center justify-between">
                        <span>Direct natural command or shortcut...</span>
                        <Command className="w-3 h-3 text-zinc-600" />
                      </div>
                    </div>
                  </div>

                  {/* ─── FLOATING DESKTOP COMPANION HUD WIDGET ─── */}
                  <div className="hidden md:flex w-52 bg-[#12101a] border-l border-[#242132] p-4 flex-col justify-between select-none">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-full flex items-center justify-between text-[10px] font-mono text-zinc-500 pb-2 border-b border-[#1c1a26]">
                        <span>HUD COMPANION</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      </div>

                      {/* Companion Graphic Thumbnail */}
                      <div className="my-3 w-24 h-28 relative flex items-center justify-center">
                        <img
                          src="/osmoo_bot_transparent.png"
                          alt="OSMOO Companion HUD"
                          className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.95)]"
                        />
                      </div>

                      <div className="text-[11px] font-bold text-white mb-1">
                        OSMOO AI
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-tight">
                        Observing active workspace context.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="p-2 rounded-lg bg-[#0a0910] border border-[#1e1c2a] text-[9px] text-zinc-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        <span>All sandboxes verified</span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#0a0910] border border-[#1e1c2a] text-[9px] text-zinc-400 flex items-center gap-1.5">
                        <Eye className="w-3 h-3 text-purple-400 flex-shrink-0" />
                        <span>Zero telemetry active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. LAPTOP LOWER CHASSIS & KEYBOARD BASE */}
          <div className="relative w-[104%] h-3 sm:h-4.5 bg-gradient-to-b from-[#2a2a30] to-[#16161a] rounded-b-xl border-t border-[#40404a] shadow-[0_12px_24px_rgba(0,0,0,0.8)] flex items-center justify-center">
            {/* Display Notch Opener Groove */}
            <div className="w-14 sm:w-20 h-1 sm:h-1.5 bg-[#0e0e11] rounded-b-md border-x border-b border-[#2e2e36]" />
          </div>

          {/* 3. HARDWARE BASE GLOW & AMBIENT SHADOW */}
          <div className="w-[85%] h-6 bg-purple-900/10 blur-xl rounded-full mt-1 pointer-events-none" />
        </div>
      </motion.div>
    </section>
  )
}
