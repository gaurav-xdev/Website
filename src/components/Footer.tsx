const CURRENT_YEAR = new Date().getFullYear()

interface FooterProps {
  onOpenModal: () => void
  onNavigate?: (route: string) => void
}

export function Footer({ onOpenModal, onNavigate }: FooterProps) {
  const currentYear = CURRENT_YEAR

  const handleLink = (route: string, isHash = false) => {
    if (isHash) {
      window.location.hash = route
    } else if (onNavigate) {
      onNavigate(route)
    } else {
      window.location.hash = route
    }
  }

  return (
    <footer className="relative w-full border-t border-[#1b1924] bg-[#07060a] pt-16 pb-12 px-4 sm:px-6 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-14 border-b border-[#181622]">
          {/* Brand Column (Left) */}
          <div className="md:col-span-4 space-y-4">
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
                className="inline-flex items-center justify-center px-5 py-2 rounded-full border border-purple-500/30 bg-[#14121c] text-white text-xs font-semibold hover:border-purple-300 hover:bg-[#1a1824] transition-all cursor-pointer"
              >
                Join the Waitlist
              </button>
            </div>
          </div>

          {/* Navigation Columns (Right) */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            {/* Column 1: Product */}
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
                  <button
                    onClick={() => handleLink('how-it-works')}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    How it Works
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleLink('pricing')}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    Pricing & Plans
                  </button>
                </li>
                <li>
                  <button
                    onClick={onOpenModal}
                    className="hover:text-white transition-colors text-left cursor-pointer text-purple-400"
                  >
                    The Founding 50
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 2: Platform */}
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
                  <button
                    onClick={() => handleLink('download')}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    Release Cohort
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleLink('faq')}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    Frequently Asked
                  </button>
                </li>
                <li>
                  <span className="text-zinc-500">Zero Telemetry Default</span>
                </li>
              </ul>
            </div>

            {/* Column 3: Legal & Governance */}
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-white mb-3">Legal & Policies</h4>
              <ul className="space-y-2 text-xs text-zinc-400">
                <li>
                  <button
                    onClick={() => handleLink('legal/privacy')}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleLink('legal/terms')}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    Terms of Use
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleLink('legal/cookies')}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    Cookie Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleLink('legal/ai-safety')}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    AI Safety Disclosure
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleLink('legal/refunds')}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    Subscriptions & Refunds
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleLink('legal/eula')}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    Desktop EULA
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Support & Grievances */}
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-white mb-3">Support</h4>
              <ul className="space-y-2 text-xs text-zinc-400">
                <li>
                  <a href="#contact" className="hover:text-white transition-colors">
                    Engineering Contact
                  </a>
                </li>
                <li>
                  <button
                    onClick={() => handleLink('legal/contact')}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    Privacy & Grievances
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('osmoo:open-cookie-banner'))
                      }
                    }}
                    className="hover:text-purple-300 transition-colors text-left cursor-pointer text-zinc-400"
                  >
                    Cookie Preferences
                  </button>
                </li>
                <li>
                  <span className="text-zinc-500">Enterprise SLA</span>
                </li>
                <li>
                  <span className="text-zinc-500">Mutual NDA</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Metadata & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span>All Systems Operational • Osmiora Computational Systems (India)</span>
          </div>

          <div className="flex items-center gap-4">
            <span>© {currentYear} OSMOO. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
