import { type ReactNode } from 'react'
import { ArrowLeft, Shield, FileText, Cookie, AlertTriangle, HelpCircle, RefreshCw, Scale } from 'lucide-react'

interface LegalLayoutProps {
  title: string
  subtitle: string
  effectiveDate?: string
  lastUpdated?: string
  version?: string
  badge?: string
  activeRoute: string
  onNavigate?: (route: string) => void
  children: ReactNode
}

export function LegalLayout({
  title,
  subtitle,
  effectiveDate = 'October 12, 2026',
  lastUpdated = 'October 12, 2026',
  version = '1.0.0 (Pre-Launch Baseline)',
  badge = 'Official Policy',
  activeRoute,
  onNavigate,
  children,
}: LegalLayoutProps) {
  const legalNavLinks = [
    { id: 'legal/privacy', label: 'Privacy Policy', icon: Shield },
    { id: 'legal/terms', label: 'Terms of Use', icon: FileText },
    { id: 'legal/cookies', label: 'Cookie Policy', icon: Cookie },
    { id: 'legal/ai-safety', label: 'AI & Automation Safety', icon: AlertTriangle },
    { id: 'legal/contact', label: 'Privacy & Grievances', icon: HelpCircle },
    { id: 'legal/refunds', label: 'Subscriptions & Refunds', icon: RefreshCw },
    { id: 'legal/eula', label: 'Desktop EULA (Preview)', icon: Scale },
  ]

  return (
    <div className="relative w-full min-h-screen py-16 sm:py-24 px-4 sm:px-6 md:px-8 flex flex-col items-center justify-start overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] bg-purple-950/15 rounded-full blur-[170px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative w-full max-w-5xl rounded-[32px] sm:rounded-[40px] bg-[#07060a]/95 border border-[#201d2d] p-6 sm:p-10 md:p-14 shadow-[0_25px_70px_rgba(0,0,0,0.9)] flex flex-col items-start text-left">
        {/* Navigation Breadcrumb & Back Button */}
        <div className="w-full flex items-center justify-between pb-6 mb-8 border-b border-[#1b1928]">
          <button
            type="button"
            onClick={() => onNavigate?.('home')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm text-zinc-400 hover:text-white transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Return to OSMOO Overview</span>
          </button>

          <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-500">
            <span>Jurisdiction:</span>
            <span className="text-purple-300 font-semibold">Republic of India</span>
          </div>
        </div>

        {/* Sub-Navigation Tabs across Legal Policies */}
        <nav aria-label="Legal documents navigation" className="w-full mb-10 overflow-x-auto pb-2">
          <div className="flex items-center gap-2 min-w-max p-1 rounded-2xl bg-[#0e0c15] border border-[#221f2f]">
            {legalNavLinks.map((item) => {
              const Icon = item.icon
              const isActive = activeRoute === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate?.(item.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-purple-600 text-[#121116] font-bold shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        </nav>

        {/* Document Header */}
        <header className="mb-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151222] border border-[#2c2642] text-[11px] font-mono text-purple-300">
            <span>{badge}</span>
            <span>•</span>
            <span>Version {version}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-[-0.035em] text-white leading-[1.05]">
            {title}
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 font-sans tracking-tight leading-relaxed">
            {subtitle}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-[11px] font-mono text-zinc-500">
            <div>
              <span className="text-zinc-600">Effective Date: </span>
              <span className="text-zinc-400">{effectiveDate}</span>
            </div>
            <div>
              <span className="text-zinc-600">Last Updated: </span>
              <span className="text-zinc-400">{lastUpdated}</span>
            </div>
            <div>
              <span className="text-zinc-600">Published By: </span>
              <span className="text-zinc-400">Osmiora Computational Systems</span>
            </div>
          </div>
        </header>

        {/* Main Document Body */}
        <main className="w-full space-y-10 text-zinc-300 leading-relaxed text-xs sm:text-sm">
          {children}
        </main>

        {/* Document Footer Note */}
        <footer className="w-full mt-14 pt-8 border-t border-[#1b1928] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div>
            Questions or requests? Contact{' '}
            <button
              type="button"
              onClick={() => onNavigate?.('legal/contact')}
              className="text-purple-400 hover:underline"
            >
              contact@osmoo.in
            </button>
          </div>
          <div>© {new Date().getFullYear()} Osmiora Computational Systems. All rights reserved.</div>
        </footer>
      </div>
    </div>
  )
}
