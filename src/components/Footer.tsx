interface FooterProps {
  onOpenModal: () => void
}

export function Footer({ onOpenModal }: FooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative w-full border-t border-[#1b1924] bg-[#07060a] pt-16 pb-12 px-4 sm:px-6 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-14 border-b border-[#181622]">
          {/* Brand Column (Left) */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="text-xl font-extrabold tracking-wider text-white uppercase select-none">
                OSMOO
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#1e1c28] text-zinc-400">
                Operating Companion
              </span>
            </div>

            <p className="text-xs sm:text-sm text-zinc-400 max-w-sm leading-relaxed">
              Your AI operating companion, integrated directly into your desktop workflow. Built for developers, designers, and researchers who value uncompromised privacy and low latency.
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={onOpenModal}
                className="inline-flex items-center justify-center px-5 py-2 rounded-full border border-[#302e3e] bg-[#14121c] text-white text-xs font-semibold hover:border-zinc-300 hover:bg-[#1a1824] transition-all cursor-pointer"
              >
                Request Early Access
              </button>
            </div>
          </div>

          {/* Navigation Columns (Right) */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-white mb-3">Product</h4>
              <ul className="space-y-2 text-xs text-zinc-400">
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    Core Features
                  </a>
                </li>
                <li>
                  <a href="#ecosystem" className="hover:text-white transition-colors">
                    Eco-system
                  </a>
                </li>
                <li>
                  <a href="#home" className="hover:text-white transition-colors">
                    Interactive 3D Stage
                  </a>
                </li>
                <li>
                  <button
                    onClick={onOpenModal}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    Early Access Cohort
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-white mb-3">Platform</h4>
              <ul className="space-y-2 text-xs text-zinc-400">
                <li>
                  <span className="text-zinc-500">macOS 14+ (M-Series)</span>
                </li>
                <li>
                  <span className="text-zinc-500">Windows 11 (DirectML)</span>
                </li>
                <li>
                  <span className="text-zinc-500">Zero-Telemetry Mode</span>
                </li>
                <li>
                  <span className="text-zinc-500">AES-256 Neural Vault</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-white mb-3">Support</h4>
              <ul className="space-y-2 text-xs text-zinc-400">
                <li>
                  <a href="#contact" className="hover:text-white transition-colors">
                    Engineering Inquiries
                  </a>
                </li>
                <li>
                  <span className="text-zinc-500">Enterprise SLA</span>
                </li>
                <li>
                  <span className="text-zinc-500">Mutual NDA</span>
                </li>
                <li>
                  <span className="text-zinc-500">Release v0.9.4</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Metadata & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span>All Systems Operational • Osmiora Computational Systems</span>
          </div>

          <div className="flex items-center gap-4">
            <span>© {currentYear} OSMOO. All rights reserved.</span>
            {/* Sparkle icon */}
            <svg
              className="w-4 h-4 text-zinc-400"
              viewBox="0 0 39 39"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M19.5 0C19.5 10.7695 28.2305 19.5 39 19.5C28.2305 19.5 19.5 28.2305 19.5 39C19.5 28.2305 10.7695 19.5 0 19.5C10.7695 19.5 19.5 10.7695 19.5 0Z"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>
      </div>
    </footer>
  )
}
