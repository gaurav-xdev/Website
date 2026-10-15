import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Cookie, ShieldCheck, Check, Settings2, ExternalLink } from 'lucide-react'

export interface CookiePreferences {
  essential: true // Always true, cannot be disabled
  analytics: boolean
  decided: boolean
}

const STORAGE_KEY = 'osmoo_cookie_consent'

export function getStoredCookiePreferences(): CookiePreferences {
  if (typeof window === 'undefined') {
    return { essential: true, analytics: false, decided: false }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        essential: true,
        analytics: Boolean(parsed.analytics),
        decided: Boolean(parsed.decided),
      }
    }
  } catch {
    // ignore json or storage errors
  }
  return { essential: true, analytics: false, decided: false }
}

export function saveCookiePreferences(prefs: { analytics: boolean }) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        essential: true,
        analytics: prefs.analytics,
        decided: true,
        updatedAt: new Date().toISOString(),
      })
    )
    window.dispatchEvent(new CustomEvent('osmoo:cookie-consent-updated', { detail: prefs }))
  } catch {
    // storage error fallback
  }
}

interface CookieConsentBannerProps {
  onNavigate?: (route: string) => void
}

export function CookieConsentBanner({ onNavigate }: CookieConsentBannerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showCustomizer, setShowCustomizer] = useState(false)
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false)

  useEffect(() => {
    const current = getStoredCookiePreferences()
    if (!current.decided) {
      setIsOpen(true)
    }
    setAnalyticsEnabled(current.analytics)

    const handleOpenCustomizer = () => {
      setIsOpen(true)
      setShowCustomizer(true)
    }

    window.addEventListener('osmoo:open-cookie-banner', handleOpenCustomizer)
    return () => window.removeEventListener('osmoo:open-cookie-banner', handleOpenCustomizer)
  }, [])

  const handleAcceptAll = () => {
    saveCookiePreferences({ analytics: true })
    setAnalyticsEnabled(true)
    setIsOpen(false)
    setShowCustomizer(false)
  }

  const handleRejectNonEssential = () => {
    saveCookiePreferences({ analytics: false })
    setAnalyticsEnabled(false)
    setIsOpen(false)
    setShowCustomizer(false)
  }

  const handleSaveCustom = () => {
    saveCookiePreferences({ analytics: analyticsEnabled })
    setIsOpen(false)
    setShowCustomizer(false)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.aside
        aria-label="Cookie and storage preferences"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-lg z-50 rounded-2xl bg-[#0f0d17]/95 border border-[#2b273c] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.9)] backdrop-blur-xl text-left"
      >
        <div className="flex items-start gap-3 mb-3">
          <div className="p-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 shrink-0 mt-0.5">
            <Cookie className="w-4 h-4 text-purple-300" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <span>Privacy & Storage Preferences</span>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                DPDP 2023 Aligned
              </span>
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed mt-1">
              We use strictly necessary browser storage to maintain secure authentication and audio preferences. Optional measurement technologies remain disabled unless you grant explicit consent.
            </p>
          </div>
        </div>

        {showCustomizer && (
          <div className="mb-4 space-y-2.5 pt-3 border-t border-[#1c182a] text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0a0812] border border-[#221e32]">
              <div>
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Strictly Necessary Storage</span>
                </div>
                <div className="text-[11px] text-zinc-400">
                  Authentication tokens (Supabase OTP) and local sound settings.
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                Always Active
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0a0812] border border-[#221e32]">
              <div>
                <div className="font-semibold text-white">Performance & Analytics</div>
                <div className="text-[11px] text-zinc-400">
                  Aggregated telemetry and usage diagnostics (currently zero active third-party trackers).
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={analyticsEnabled}
                  onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate?.('legal/cookies')}
              className="text-[11px] text-zinc-400 hover:text-white underline underline-offset-2 flex items-center gap-1 transition-colors"
            >
              <span>Cookie Policy</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </button>
            <span className="text-zinc-600">•</span>
            <button
              type="button"
              onClick={() => setShowCustomizer(!showCustomizer)}
              className="text-[11px] text-purple-300 hover:text-purple-200 flex items-center gap-1 transition-colors"
            >
              <Settings2 className="w-3 h-3" />
              <span>{showCustomizer ? 'Hide Details' : 'Manage Preferences'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {showCustomizer ? (
              <button
                type="button"
                onClick={handleSaveCustom}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-[#121116] text-xs font-semibold transition-colors flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Choice</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleRejectNonEssential}
                  className="px-3 py-1.5 rounded-xl bg-[#171424] hover:bg-[#201c34] text-zinc-300 hover:text-white text-xs font-medium border border-[#2d2844] transition-colors"
                >
                  Essential Only
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="px-3.5 py-1.5 rounded-xl bg-white text-black hover:bg-zinc-200 text-xs font-bold transition-colors"
                >
                  Accept All
                </button>
              </>
            )}
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  )
}
