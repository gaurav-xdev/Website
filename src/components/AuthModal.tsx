import { useState, useEffect, type FormEvent } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Mail, KeyRound, User as UserIcon, LogOut, CheckCircle, AlertCircle, Loader2, Shield } from 'lucide-react'
import {
  sendEmailOtp,
  verifyEmailOtp,
  signOutUser,
  getCurrentSession,
  getSupabaseConfigStatus,
  subscribeToAuth,
  signInWithGoogle,
  getUserEntitlementStatus,
  type UserEntitlementDetails,
} from '../lib/supabase/client'
import { soundEngine } from '../utils/soundEngine'
import type { User } from '@supabase/supabase-js'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

type AuthStep = 'email' | 'otp' | 'profile'

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [step, setStep] = useState<AuthStep>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successNotice, setSuccessNotice] = useState<string | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [entitlements, setEntitlements] = useState<UserEntitlementDetails | null>(null)

  const configStatus = getSupabaseConfigStatus()

  // Sync session and entitlements on mount and changes
  useEffect(() => {
    getCurrentSession().then((session) => {
      if (session?.user) {
        setCurrentUser(session.user)
        setStep('profile')
        getUserEntitlementStatus(session.user.id).then(setEntitlements)
      }
    })

    const unsubscribe = subscribeToAuth((_event, session) => {
      if (session?.user) {
        setCurrentUser(session.user)
        setStep('profile')
        getUserEntitlementStatus(session.user.id).then(setEntitlements)
      } else {
        setCurrentUser(null)
        setEntitlements(null)
        setStep('email')
      }
    })

    return () => unsubscribe()
  }, [])

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setTimeout(() => {
      setResendCooldown((prev) => prev - 1)
    }, 1000)
    return () => clearTimeout(timer)
  }, [resendCooldown])

  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault()
    if (!email || isLoading) return

    setErrorMessage(null)
    setSuccessNotice(null)
    setIsLoading(true)

    const res = await sendEmailOtp(email)
    setIsLoading(false)

    if (!res.success) {
      setErrorMessage(res.error || 'Failed to send one-time code.')
      soundEngine.playClick()
      return
    }

    soundEngine.playSuccess()
    setSuccessNotice(`A 6-digit access code was dispatched to ${email}.`)
    setStep('otp')
    setResendCooldown(60)
  }

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault()
    if (!email || !otp || isLoading) return

    setErrorMessage(null)
    setIsLoading(true)

    const res = await verifyEmailOtp(email, otp)
    setIsLoading(false)

    if (!res.success) {
      setErrorMessage(res.error || 'Invalid or expired OTP code.')
      soundEngine.playClick()
      return
    }

    soundEngine.playSuccess()
    setCurrentUser(res.user ?? null)
    setStep('profile')
  }

  const handleSignOut = async () => {
    setIsLoading(true)
    await signOutUser()
    setIsLoading(false)
    soundEngine.playClick()
    setCurrentUser(null)
    setStep('email')
    setEmail('')
    setOtp('')
    setSuccessNotice(null)
  }

  const handleGoogleSignIn = async () => {
    setErrorMessage(null)
    setSuccessNotice(null)
    setIsLoading(true)

    const res = await signInWithGoogle()
    setIsLoading(false)

    if (!res.success) {
      setErrorMessage(res.error || 'Failed to initiate Google sign-in.')
      soundEngine.playClick()
      return
    }

    soundEngine.playSuccess()
    // If Supabase redirects, the browser will navigate to res.url
    if (res.url && typeof window !== 'undefined') {
      window.location.href = res.url
    }
  }

  const handleClose = () => {
    soundEngine.playClick()
    setErrorMessage(null)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-md bg-[#16151c] border border-[#2d2c36] rounded-2xl p-6 sm:p-8 shadow-2xl text-left overflow-hidden z-10"
          >
            {/* Ambient Glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-lg text-white">OSMOO</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-zinc-300 font-medium flex items-center gap-1">
                  <Shield className="w-3 h-3 text-purple-400" />
                  <span>Account Session</span>
                </span>
              </div>
              <button
                onClick={handleClose}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                aria-label="Close authentication modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Environment Notice if Supabase is unconfigured */}
            {!configStatus.isConfigured && (
              <div className="mb-5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs leading-relaxed space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>Supabase Environment Pending</span>
                </div>
                <p className="text-[11px] text-amber-200/80">
                  Configure <code className="bg-black/30 px-1 py-0.5 rounded">VITE_SUPABASE_URL</code> and{' '}
                  <code className="bg-black/30 px-1 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code> to enable live email OTP verification.
                </p>
              </div>
            )}

            {/* Error Banner */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Notice */}
            {successNotice && step === 'otp' && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-start gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successNotice}</span>
              </div>
            )}

            {/* STEP 1: Enter Email or Google */}
            {step === 'email' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1.5">Sign In or Create Account</h3>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    Access your OSMOO account, membership entitlements, and manage your connected desktop runtime companion.
                  </p>
                </div>

                {/* Google OAuth Button */}
                <div>
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading || !configStatus.isConfigured}
                    className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-[#201e28] hover:bg-[#2a2835] border border-[#393746] text-white font-medium text-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="#EA4335"
                        d="M12 5c1.54 0 2.94.57 4.03 1.51l3.02-3.02C17.21 1.76 14.77 1 12 1 7.42 1 3.51 3.63 1.63 7.45l3.66 2.84C6.18 7.35 8.86 5 12 5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.67 2.85c2.14-1.98 3.35-4.89 3.35-8.67z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.29 14.71c-.24-.72-.37-1.49-.37-2.71s.13-1.99.37-2.71L1.63 6.45C.59 8.52 0 10.84 0 12s.59 3.48 1.63 5.55l3.66-2.84z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c3.24 0 5.96-1.07 7.95-2.91l-3.67-2.85c-1.08.72-2.45 1.16-4.28 1.16-3.14 0-5.82-2.35-6.71-5.29L1.63 15.95C3.51 20.37 7.42 23 12 23z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="relative flex items-center justify-center">
                  <div className="border-t border-[#2d2c36] w-full" />
                  <span className="bg-[#16151c] px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                    or with Email Code
                  </span>
                </div>

                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label htmlFor="auth-email" className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Account Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        id="auth-email"
                        type="email"
                        required
                        disabled={isLoading || !configStatus.isConfigured}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@domain.com"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#0e0d13] border border-[#2d2c36] text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-zinc-300 transition-colors disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !configStatus.isConfigured}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-white/10"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending One-Time Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Send 6-Digit Code</span>
                        <KeyRound className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* STEP 2: Verify OTP */}
            {step === 'otp' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1.5">Enter Verification Code</h3>
                  <p className="text-xs text-zinc-400">
                    Enter the code sent to <span className="text-white font-medium">{email}</span>.
                  </p>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label htmlFor="auth-otp" className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      6-Digit Code
                    </label>
                    <input
                      id="auth-otp"
                      type="text"
                      required
                      maxLength={8}
                      autoFocus
                      disabled={isLoading}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.trim())}
                      placeholder="123456"
                      className="w-full tracking-widest text-center text-lg font-mono px-3.5 py-2.5 rounded-xl bg-[#0e0d13] border border-[#2d2c36] text-white placeholder-zinc-600 focus:outline-none focus:border-purple-400 transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-all active:scale-[0.98] disabled:opacity-50 shadow-md shadow-white/10"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Validating Code...</span>
                      </>
                    ) : (
                      <span>Verify & Authenticate</span>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-xs text-zinc-400 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep('email')}
                      className="hover:text-white transition-colors"
                    >
                      Change Email
                    </button>
                    <button
                      type="button"
                      disabled={resendCooldown > 0 || isLoading}
                      onClick={handleSendOtp}
                      className="hover:text-white disabled:opacity-40 transition-colors"
                    >
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* STEP 3: Authenticated Profile & Session Management */}
            {step === 'profile' && currentUser && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-[#0e0d13] border border-[#262432]">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-sm font-semibold text-white truncate">
                      {currentUser.email}
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono">
                      User ID: {currentUser.id.slice(0, 12)}...
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-2 border-b border-[#22202c]">
                    <span className="text-zinc-400">Authentication Method</span>
                    <span className="text-zinc-200 font-medium capitalize">
                      {currentUser.app_metadata?.provider === 'google' ? 'Google OAuth' : 'Supabase Email OTP'}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#22202c]">
                    <span className="text-zinc-400">Subscription Tier</span>
                    <span className={`font-semibold capitalize ${
                      entitlements?.isPro ? 'text-emerald-400' : 'text-zinc-300'
                    }`}>
                      {entitlements?.tier ? `${entitlements.tier.toUpperCase()} Tier` : 'Active Member'}
                    </span>
                  </div>
                  {entitlements?.source && (
                    <div className="flex justify-between py-2 border-b border-[#22202c]">
                      <span className="text-zinc-400">Access Entitlement</span>
                      <span className="text-purple-300 font-medium">
                        {entitlements.source}
                      </span>
                    </div>
                  )}
                  {entitlements?.expiresAt && (
                    <div className="flex justify-between py-2 border-b border-[#22202c]">
                      <span className="text-zinc-400">
                        {entitlements.isExpired ? 'Pro Access Expired On' : 'Pro Valid Until'}
                      </span>
                      <span className={`font-medium ${
                        entitlements.isExpired ? 'text-rose-400' : 'text-zinc-200'
                      }`}>
                        {new Date(entitlements.expiresAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-b border-[#22202c]">
                    <span className="text-zinc-400">Session Security</span>
                    <span className="text-zinc-200 font-medium">Encrypted JWT / RLS Active</span>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    onClick={handleSignOut}
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>

                  <button
                    onClick={handleClose}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors"
                  >
                    Close
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
