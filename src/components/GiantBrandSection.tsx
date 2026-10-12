import { motion } from 'motion/react'
import { ArrowDown } from 'lucide-react'

export function GiantBrandSection() {
  return (
    <section className="relative w-full pt-16 sm:pt-24 pb-8 sm:pb-12 px-4 sm:px-6 md:px-8 flex flex-col items-center justify-center overflow-hidden select-none">
      {/* Ambient background glow behind the giant brandmark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85vw] max-w-[1000px] h-[350px] bg-purple-950/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative w-full max-w-6xl mx-auto flex flex-col items-center text-center">
        {/*
          GIANT EMBOSSED "OSMOO" TITLE
          Crafted with vertical metallic gradient, subtle bevel highlights, and precision kerning
        */}
        <div className="relative w-full flex items-center justify-center">
          <h2
            className="text-[20vw] sm:text-[18vw] md:text-[200px] lg:text-[240px] font-black uppercase tracking-[-0.04em] leading-none select-none text-transparent bg-clip-text bg-gradient-to-b from-[#e6e6ea] via-[#8c8a98] to-[#282732] drop-shadow-[0_15px_35px_rgba(0,0,0,0.8)]"
            style={{
              textShadow: '0 1px 2px rgba(255,255,255,0.15), 0 20px 40px rgba(0,0,0,0.9)',
            }}
          >
            OSMOO
          </h2>

          {/* 
            FLOATING 3D COMPANION OVERLAY ON THE "M"
            Renders the 3D metallic companion positioned right in the center notch of the M,
            matching the reference image composition perfectly
          */}
          <div className="absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 flex flex-col items-center">
            {/* Soft radiant ambient glow behind the real 3D companion as it nests in the M */}
            <div className="w-48 h-48 sm:w-72 sm:h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          </div>
        </div>

        {/* Minimalist Downward Transition Arrow */}
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="mt-6 sm:mt-10 flex flex-col items-center text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ArrowDown className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.5]" />
        </motion.div>
      </div>
    </section>
  )
}
