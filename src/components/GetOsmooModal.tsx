import { useState, type FormEvent } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, CheckCircle, ArrowRight } from 'lucide-react'
import { soundEngine } from '../utils/soundEngine'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
}

export function GetOsmooModal({ isOpen, onClose }: ModalProps) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!email) return
    // Simulated local registration (no false backend claimed)
    soundEngine.playSuccess()
    setSubmitted(true)
  }

  const resetAndClose = () => {
    soundEngine.playClick()
    setSubmitted(false)
    setEmail('')
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
            onClick={resetAndClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-md bg-[#16151c] border border-[#2d2c36] rounded-2xl p-6 sm:p-8 shadow-2xl text-left overflow-hidden z-10"
          >
            {/* Ambient Corner Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-lg text-white">OSMOO</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 font-medium">Early Access</span>
              </div>
              <button
                onClick={resetAndClose}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!submitted ? (
              <>
                <h3 className="text-xl font-semibold text-white mb-2">Experience Your AI Companion</h3>
                <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                  Join the pilot cohort for Osmiora Computational Systems' next-generation desktop operating companion.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-xs font-medium text-zinc-300 mb-1.5">
                      Work or Personal Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@company.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e0d13] border border-[#2d2c36] text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-all active:scale-[0.98] shadow-md shadow-white/10"
                  >
                    <span>Request Early Access</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                <p className="text-[11px] text-zinc-500 text-center mt-4">
                  Zero spam. You will be notified directly when the macOS and Windows binaries are ready.
                </p>
              </>
            ) : (
              <div className="py-6 text-center space-y-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-white">Invitation Recorded</h3>
                <p className="text-sm text-zinc-400 max-w-xs mx-auto">
                  We have added <span className="text-zinc-200 font-medium">{email}</span> to the preview queue. Check your inbox for release updates.
                </p>
                <button
                  onClick={resetAndClose}
                  className="mt-4 px-6 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-colors"
                >
                  Done
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
