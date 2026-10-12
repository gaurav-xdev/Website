import { ArrowRight, Terminal, Search, Wand2 } from 'lucide-react'

export function PipelineSection() {
  const pipeline = [
    {
      id: 'observe',
      stage: 'Stage 1',
      title: 'OBSERVE',
      renderVisual: () => (
        <div className="relative w-full h-full flex flex-col items-center justify-center py-2">
          {/* Subtle sensory field pulse */}
          <div className="absolute w-36 h-36 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="w-32 h-44 sm:w-36 sm:h-48 relative flex items-center justify-center">
            <img
              src="/osmoo_bot_transparent.png"
              alt="OSMOO Observing"
              className="w-full h-full object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.95)]"
            />
          </div>
        </div>
      ),
    },
    {
      id: 'plan',
      stage: 'Stage 2',
      title: 'PLAN',
      renderVisual: () => (
        <div className="relative w-full h-full p-2 flex flex-col items-center justify-center">
          {/* Simulated Task Decomposition Card matching reference */}
          <div className="w-full rounded-2xl bg-[#09080e] border border-[#232030] p-3.5 space-y-2 shadow-inner text-left font-mono">
            <div className="flex items-center justify-between pb-2 border-b border-[#1b1926] text-[10px] text-zinc-400">
              <span className="font-semibold text-zinc-300">task_graph.json</span>
              <span className="text-purple-400 font-bold">READY</span>
            </div>
            <div className="space-y-2 text-[10px]">
              <div className="flex items-center gap-2 text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
                <span className="truncate">1. Map component AST</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />
                <span className="truncate">2. Safe sandbox pipeline</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-500">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 flex-shrink-0" />
                <span className="truncate">3. Unit regression checks</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'act',
      stage: 'Stage 3',
      title: 'ACT',
      renderVisual: () => (
        <div className="relative w-full h-full flex flex-col items-center justify-center py-2">
          {/* Active companion surrounded by floating tool badges matching reference */}
          <div className="relative w-32 h-44 sm:w-36 sm:h-48 flex items-center justify-center">
            <img
              src="/osmoo_bot_transparent.png"
              alt="OSMOO Acting"
              className="w-full h-full object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.95)]"
            />

            {/* Floating Tool Badge 1: Search / Inspect */}
            <div className="absolute -left-2 top-8 p-2 rounded-xl bg-[#191724]/90 border border-[#38334a] shadow-xl text-purple-300 backdrop-blur-md">
              <Search className="w-4 h-4" />
            </div>

            {/* Floating Tool Badge 2: Magic Wand / Generate */}
            <div className="absolute -right-2 top-6 p-2 rounded-xl bg-[#191724]/90 border border-[#38334a] shadow-xl text-amber-300 backdrop-blur-md">
              <Wand2 className="w-4 h-4" />
            </div>

            {/* Floating Tool Badge 3: Terminal Execution */}
            <div className="absolute -left-1 bottom-4 p-2 rounded-xl bg-[#191724]/90 border border-[#38334a] shadow-xl text-emerald-300 backdrop-blur-md">
              <Terminal className="w-4 h-4" />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'verify',
      stage: 'Stage 4',
      title: 'VERIFY',
      renderVisual: () => (
        <div className="relative w-full h-full p-2 flex flex-col items-center justify-center">
          {/* Verification Badge Card matching reference */}
          <div className="w-full rounded-2xl bg-[#09080e] border border-[#232030] p-3 space-y-2.5 shadow-inner text-left">
            <div className="flex items-center gap-2.5 pb-2 border-b border-[#1b1926]">
              <div className="w-8 h-8 rounded-full bg-[#151320] border border-[#2e2a40] flex items-center justify-center overflow-hidden flex-shrink-0">
                <img
                  src="/osmoo_bot_transparent.png"
                  alt="Verified Companion"
                  className="w-7 h-7 object-contain scale-125"
                />
              </div>
              <div>
                <div className="text-[11px] font-bold text-white leading-tight">
                  Deterministic Output
                </div>
                <div className="text-[9px] text-zinc-500 font-mono">
                  Sandbox v0.9.4 Certified
                </div>
              </div>
            </div>

            <div className="space-y-1.5 text-[10px] text-zinc-400 font-mono pt-0.5">
              <div className="flex items-center justify-between">
                <span>AST verification:</span>
                <span className="text-emerald-400 font-bold">PASSED</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Memory safety:</span>
                <span className="text-emerald-400 font-bold">PASSED</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Execution budget:</span>
                <span className="text-zinc-300 font-bold">42ms</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ]

  return (
    <section className="relative w-full py-20 sm:py-32 px-4 sm:px-6 md:px-8 flex flex-col items-center justify-center overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-purple-950/15 rounded-full blur-[160px] pointer-events-none" />

      <div className="relative w-full max-w-6xl mx-auto flex flex-col items-center">
        {/*
          SECTION HEADLINE MATCHING REFERENCE IMAGE EXACTLY:
          "MORE THAN A CHAT WINDOW"
        */}
        <div className="text-center mb-16 sm:mb-20 space-y-2">
          <h2 className="text-[36px] sm:text-[52px] md:text-[64px] font-black uppercase tracking-[-0.04em] leading-[0.98] text-white">
            MORE THAN A
            <br />
            CHAT WINDOW
          </h2>
        </div>

        {/* ─── 4-STAGE PIPELINE CARDS SEQUENCE ─── */}
        <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-3">
          {pipeline.map((item, idx) => (
            <div key={item.id} className="flex flex-col lg:flex-row items-center gap-3 w-full lg:w-auto flex-1">
              {/* Card Container */}
              <div className="w-full h-[320px] rounded-[22px] bg-[#0c0b11] border border-[#232030] p-5 flex flex-col justify-between shadow-[0_15px_35px_rgba(0,0,0,0.7)] hover:border-[#38344c] transition-all duration-300">
                {/* Card Title */}
                <div className="text-center">
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">
                    {item.title}
                  </h3>
                </div>

                {/* Card Center Visual */}
                <div className="flex-1 w-full flex items-center justify-center overflow-hidden">
                  {item.renderVisual()}
                </div>

                {/* Card Footer Stage Label */}
                <div className="text-center pt-2 border-t border-[#191724]">
                  <span className="text-[11px] font-mono text-zinc-500 tracking-wider">
                    {item.stage}
                  </span>
                </div>
              </div>

              {/* Connecting Arrow (hidden after last item) */}
              {idx < pipeline.length - 1 && (
                <div className="hidden lg:flex items-center justify-center text-zinc-600 px-1">
                  <ArrowRight className="w-4 h-4 stroke-[1.5]" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
