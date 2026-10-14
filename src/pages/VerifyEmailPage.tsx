import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { CheckCircle, AlertCircle, Clock, Loader2, ArrowRight, RefreshCw, Mail, Sparkles, Shield } from 'lucide-react'
import { verifyEarlyAccess, resendVerificationEmail, type VerificationResult } from '../lib/api/client'
import { soundEngine } from '../utils/soundEngine'

interface VerifyEmailPageProps {
  onNavigate: (tab: string) => void
}

/**
 * Safely extracts verification token from hash query (#verify?token=...) or standard search query (?token=...)
 */
export function extractVerificationTokenFromUrl(hash: string, search = ''): string | null {
  const cleanHash = (hash || '').trim()
  let token: string | null = null

  if (cleanHash.includes('?')) {
    const hashQuery = cleanHash.slice(cleanHash.indexOf('?') + 1)
    const hashParams = new URLSearchParams(hashQuery)
    token = hashParams.get('token')
  } else if (cleanHash.includes('token=')) {
    const match = cleanHash.match(/token=([a-fA-F0-9]+)/)
    if (match) token = match[1]
  }

  if (!token && search) {
    const searchParams = new URLSearchParams(search)
    token = searchParams.get('token')
  }

  return token ? token.trim() : null
}

export function VerifyEmailPage({ onNavigate }: VerifyEmailPageProps) {
  const [status, setStatus] = useState<'verifying' | 'verified' | 'already_verified' | 'expired' | 'invalid'>('verifying')
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Resend form state for expired / invalid links
  const [resendEmail, setResendEmail] = useState('')
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState<string | null>(null)
  const [resendError, setResendError] = useState<string | null>(null)

  useEffect(() => {
    const extractedToken = extractVerificationTokenFromUrl(window.location.hash, window.location.search)

    if (!extractedToken) {
      setStatus('invalid')
      setErrorMessage('No verification token provided in the URL.')
      return
    }

    if (!/^[a-fA-F0-9]{32,128}$/.test(extractedToken)) {
      setStatus('invalid')
      setErrorMessage('Verification token format is malformed or invalid.')
      return
    }

    // Call serverless verification endpoint
    let isMounted = true
    verifyEarlyAccess(extractedToken).then((res) => {
      if (!isMounted) return

      if (res.success && res.data) {
        setStatus(res.data.status)
        setResult(res.data)
        soundEngine.playSuccess()
      } else {
        const failureStatus = res.data?.status || 'invalid'
        setStatus(failureStatus)
        setErrorMessage(res.error || 'Verification link is invalid or expired.')
        if (res.data?.email) {
          setResendEmail(res.data.email)
        }
        soundEngine.playClick()
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resendEmail || isResending) return

    setIsResending(true)
    setResendError(null)
    setResendSuccess(null)

    const res = await resendVerificationEmail(resendEmail.trim())
    setIsResending(false)

    if (!res.success) {
      setResendError(res.error || 'Failed to dispatch new verification link.')
      soundEngine.playClick()
      return
    }

    soundEngine.playSuccess()
    setResendSuccess(res.message || 'A fresh verification link has been sent to your email.')
  }

  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center px-4 py-16 sm:py-24 select-none">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative w-full max-w-lg bg-[#0e0c15] border border-[#262235] rounded-3xl p-6 sm:p-10 shadow-[0_25px_80px_rgba(0,0,0,0.9)] text-center overflow-hidden"
      >
        {/* Glow */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>OSMOO Early Access Verification</span>
        </div>

        {/* STATE 1: VERIFYING */}
        {status === 'verifying' && (
          <div className="py-8 space-y-4">
            <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto" />
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Verifying Your Access Link...
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed">
              Validating cryptographic token hash and checking Founding 50 eligibility.
            </p>
          </div>
        )}

        {/* STATE 2: VERIFIED SUCCESSFULLY */}
        {(status === 'verified' || status === 'already_verified') && (
          <div className="py-4 space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
                {status === 'already_verified' ? 'Email Already Verified!' : 'Verification Successful!'}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
                {result?.firstName ? `Welcome, ${result.firstName}. ` : ''}
                Your spot on the OSMOO early access waitlist is confirmed for{' '}
                <span className="text-white font-semibold">{result?.email}</span>.
              </p>
            </div>

            {/* Founding 50 Badge if Granted */}
            {result?.isFounding50 && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 via-purple-900/20 to-[#120f22] border border-purple-500/40 text-left space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono tracking-wider text-purple-300 uppercase font-bold">
                    ★ THE FOUNDING 50 CONFIRMED
                  </span>
                </div>
                <p className="text-xs text-purple-100 font-medium leading-relaxed">
                  You are among the first 50 verified signups! You will receive a complimentary 12-month OSMOO Pro license upon initial release.
                </p>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-[#14121d] border border-[#252233] text-left text-xs text-zinc-400 space-y-2">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-purple-400" />
                <span>Next Release Phase</span>
              </div>
              <p className="leading-relaxed text-[11px]">
                You will receive an automated invitation with direct signed binary download keys as soon as the first cohort opens.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="w-full py-3 px-6 rounded-xl bg-white text-black font-bold text-xs sm:text-sm hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              <span>Return to OSMOO Home</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STATE 3: EXPIRED LINK */}
        {status === 'expired' && (
          <div className="py-4 space-y-5">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
              <Clock className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
                Verification Link Expired
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
                Verification links are valid for 60 minutes for cryptographic security. Enter your email below to receive a new link.
              </p>
            </div>

            <form onSubmit={handleResend} className="space-y-3 max-w-sm mx-auto text-left">
              <div>
                <label htmlFor="resend-email-expired" className="block text-xs font-semibold text-zinc-300 mb-1">
                  Your Waitlist Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="resend-email-expired"
                    type="email"
                    required
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#09080e] border border-[#262235] text-white text-xs sm:text-sm focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              {resendSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
                  {resendSuccess}
                </div>
              )}

              {resendError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                  {resendError}
                </div>
              )}

              <button
                type="submit"
                disabled={isResending}
                className="w-full py-2.5 px-4 rounded-xl bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending Fresh Link...</span>
                  </>
                ) : (
                  <span>Send New Verification Email</span>
                )}
              </button>
            </form>
          </div>
        )}

        {/* STATE 4: INVALID / CORRUPTED LINK */}
        {status === 'invalid' && (
          <div className="py-4 space-y-5">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
                Invalid Verification Link
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
                {errorMessage || 'This link is either malformed or has already been used to verify a waitlist spot.'}
              </p>
            </div>

            <form onSubmit={handleResend} className="space-y-3 max-w-sm mx-auto text-left">
              <div>
                <label htmlFor="resend-email-invalid" className="block text-xs font-semibold text-zinc-300 mb-1">
                  Request New Link via Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="resend-email-invalid"
                    type="email"
                    required
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#09080e] border border-[#262235] text-white text-xs sm:text-sm focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              {resendSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
                  {resendSuccess}
                </div>
              )}

              {resendError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                  {resendError}
                </div>
              )}

              <button
                type="submit"
                disabled={isResending}
                className="w-full py-2.5 px-4 rounded-xl bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending Fresh Link...</span>
                  </>
                ) : (
                  <span>Send New Verification Link</span>
                )}
              </button>
            </form>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="text-xs text-zinc-400 hover:text-white transition-colors underline underline-offset-4"
              >
                Return to Home
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
