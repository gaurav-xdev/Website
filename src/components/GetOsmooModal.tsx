import { useState, useEffect, type FormEvent } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, CheckCircle, ArrowRight, Loader2, AlertCircle, Sparkles, Shield, Gift, Mail, RefreshCw, Flame } from 'lucide-react'
import { soundEngine } from '../utils/soundEngine'
import {
  submitEarlyAccess,
  resendVerificationEmail,
  fetchFounding50Status,
  type EarlyAccessResponseData,
  type Founding50StatusData,
} from '../lib/api/client'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
}

export function GetOsmooModal({ isOpen, onClose }: ModalProps) {
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [resendNotice, setResendNotice] = useState<string | null>(null)
  const [responseResult, setResponseResult] = useState<EarlyAccessResponseData | null>(null)
  const [serverMessage, setServerMessage] = useState<string | null>(null)
  const [foundingStatus, setFoundingStatus] = useState<Founding50StatusData | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchFounding50Status().then((res) => {
        if (res.success && res.data) {
          setFoundingStatus(res.data)
        }
      })
    }
  }, [isOpen])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email || isLoading) return

    setIsLoading(true)
    setErrorMessage(null)
    setResendNotice(null)

    const res = await submitEarlyAccess({
      email: email.trim(),
      firstName: firstName.trim() || undefined,
      source: 'website_waitlist_modal',
    })
    setIsLoading(false)

    if (!res.success) {
      setErrorMessage(
        res.error ||
          'Unable to submit waitlist registration. Please verify your connection or try again shortly.'
      )
      soundEngine.playClick()
      return
    }

    soundEngine.playSuccess()
    setResponseResult(res.data || null)
    setServerMessage(res.message || 'Waitlist spot confirmed.')
    setSubmitted(true)
  }

  const handleResend = async () => {
    if (!email || isResending) return
    setIsResending(true)
    setErrorMessage(null)
    setResendNotice(null)

    const res = await resendVerificationEmail(email.trim())
    setIsResending(false)

    if (!res.success) {
      setErrorMessage(res.error || 'Failed to resend verification link.')
      soundEngine.playClick()
      return
    }

    soundEngine.playSuccess()
    setResendNotice(res.message || 'A fresh verification email has been sent.')
  }

  const resetAndClose = () => {
    soundEngine.playClick()
    setSubmitted(false)
    setFirstName('')
    setEmail('')
    setErrorMessage(null)
    setResendNotice(null)
    setResponseResult(null)
    setServerMessage(null)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resetAndClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-lg bg-[#0e0c14] border border-[#262234] rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.95)] text-left overflow-hidden z-10"
          >
            {/* Ambient Corner Glow */}
            <div className="absolute -top-24 -right-24 w-52 h-52 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-lg text-white uppercase">OSMOO</span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  Early Access Waitlist
                </span>
              </div>
              <button
                type="button"
                onClick={resetAndClose}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!submitted ? (
              <>
                {/* ─── THE FOUNDING 50 OFFER BANNER ─── */}
                <div className={`mb-5 p-4 rounded-2xl border relative overflow-hidden shadow-lg ${
                  foundingStatus?.isFull
                    ? 'bg-[#15131c] border-zinc-700/50'
                    : 'bg-gradient-to-br from-[#1a132e] via-[#130f24] to-[#0d0a17] border-purple-500/40'
                }`}>
                  <div className="flex items-start gap-3 relative z-10">
                    <div className={`p-2 rounded-xl shrink-0 mt-0.5 border ${
                      foundingStatus?.isFull
                        ? 'bg-zinc-800/40 text-zinc-400 border-zinc-700/50'
                        : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                    }`}>
                      {foundingStatus?.isFull ? (
                        <Shield className="w-4 h-4 text-zinc-400" />
                      ) : (
                        <Gift className="w-4 h-4 text-purple-300" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono tracking-wider text-purple-300 uppercase font-bold">
                          THE FOUNDING 50
                        </span>
                        {foundingStatus?.isFull ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-semibold border border-zinc-700">
                            Founding 50 Full
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold flex items-center gap-1">
                            <Flame className="w-3 h-3 text-emerald-400" />
                            <span>
                              {foundingStatus !== null
                                ? `${foundingStatus.remainingSlots} of 50 spots remaining`
                                : 'First 50 verified signups'}
                            </span>
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug">
                        {foundingStatus?.isFull
                          ? 'The Founding 50 cohort has been reached.'
                          : 'The first 50 verified signups receive 12 months of OSMOO Pro free.'}
                      </h4>
                      <p className="text-[11px] sm:text-xs text-zinc-300 leading-relaxed pt-0.5">
                        {foundingStatus?.isFull
                          ? 'All 50 promotional 12-month Pro allocations have been reserved by verified members. Standard early access registration remains fully open below!'
                          : 'Join the waitlist and confirm your email. Qualifying members receive an authoritative 12-month Pro grant calculated from verification time.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-5">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-1 tracking-tight">
                    Reserve Your Place in the Cohort
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Native desktop AI companion for macOS and Windows 11. Built with local computation and zero telemetry.
                  </p>
                </div>

                {errorMessage && (
                  <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                    <span className="leading-relaxed">{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <div>
                    <label htmlFor="modal-name" className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      First Name <span className="text-zinc-500 font-normal">(Optional)</span>
                    </label>
                    <input
                      id="modal-name"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Alex"
                      disabled={isLoading}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#09080e] border border-[#232030] text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label htmlFor="modal-email" className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Work or Personal Email <span className="text-purple-400">*</span>
                    </label>
                    <input
                      id="modal-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@company.com"
                      disabled={isLoading}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#09080e] border border-[#232030] text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors disabled:opacity-50"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white text-black font-bold text-xs sm:text-sm hover:bg-zinc-200 transition-all active:scale-[0.98] shadow-md shadow-white/10 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Reserving Waitlist Spot...</span>
                      </>
                    ) : (
                      <>
                        <span>Join the Waitlist</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-4 pt-3 border-t border-[#1a1726] flex items-center justify-between text-[11px] text-zinc-500">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Zero spam. No telemetry.</span>
                  </div>
                  <a
                    href="#privacy"
                    onClick={resetAndClose}
                    className="text-purple-400 hover:text-purple-300 transition-colors underline underline-offset-2"
                  >
                    Privacy Information
                  </a>
                </div>
              </>
            ) : (
              /* Success / Recorded View */
              <div className="py-5 text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {responseResult?.isVerified
                      ? 'Email Already Verified'
                      : responseResult?.isDuplicate
                      ? 'Waitlist Spot Confirmed'
                      : 'Welcome to the Waitlist!'}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed">
                    {serverMessage || `We have recorded ${email} for early access.`}
                  </p>
                </div>

                {/* Email Verification Box */}
                {!responseResult?.isVerified && (
                  <div className="p-3.5 rounded-xl bg-[#14121d] border border-purple-500/30 text-left max-w-sm mx-auto space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-purple-300">
                      <Mail className="w-4 h-4 text-purple-400" />
                      <span>Action Required: Verify Email</span>
                    </div>
                    <p className="text-[11px] text-zinc-300 leading-relaxed">
                      We dispatched a verification link to <span className="text-white font-medium">{email}</span>. Click the link in your inbox within 60 minutes to confirm your spot.
                    </p>

                    {resendNotice && (
                      <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{resendNotice}</span>
                      </div>
                    )}

                    {errorMessage && (
                      <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    <div className="pt-1 flex items-center justify-between text-[11px]">
                      <span className="text-zinc-500">Didn't receive the email?</span>
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={isResending}
                        className="text-purple-400 hover:text-purple-300 font-medium inline-flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {isResending ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-3 h-3" />
                            <span>Resend Email</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {responseResult?.isFounding50Eligible && (
                  <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 text-purple-200 text-xs max-w-sm mx-auto leading-relaxed">
                    <span className="font-bold text-white">★ Founding 50 Priority:</span> Your spot is in queue for the 12-month Pro reward. Confirming your email locks in your timestamp.
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={resetAndClose}
                    className="px-8 py-2.5 rounded-xl bg-white text-black text-xs sm:text-sm font-bold hover:bg-zinc-200 transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
