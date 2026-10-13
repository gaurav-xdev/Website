import { useState, type FormEvent } from 'react'
import { motion } from 'motion/react'
import { Mail, Send, CheckCircle2, Clock, ShieldCheck, Loader2, AlertCircle } from 'lucide-react'
import { submitContact } from '../lib/api/client'
import { soundEngine } from '../utils/soundEngine'

export function ContactSection() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('Enterprise Pilot')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [serverMessage, setServerMessage] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name || !email || !message || isLoading) return

    setIsLoading(true)
    setErrorMessage(null)

    const res = await submitContact({
      name,
      email,
      category: subject,
      message,
    })

    setIsLoading(false)

    if (!res.success) {
      setErrorMessage(res.error || 'Failed to submit inquiry. Please try again.')
      soundEngine.playClick()
      return
    }

    soundEngine.playSuccess()
    setServerMessage(res.message || 'Inquiry transmitted and queued.')
    setSent(true)
  }

  return (
    <section id="contact" className="relative w-full py-24 sm:py-32 px-4 sm:px-6 md:px-8 border-t border-[#1b1924]">
      {/* Background Glow */}
      <div className="absolute bottom-1/4 left-1/3 w-[500px] h-[500px] bg-purple-950/15 rounded-full blur-[180px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-6xl mx-auto"
      >
        {/* Section Header */}
        <div className="flex flex-col items-center text-center space-y-4 mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#2b2938] bg-[#14131b]/80 backdrop-blur-md">
            <Mail className="w-3.5 h-3.5 text-zinc-300" />
            <span className="text-[12px] font-semibold text-zinc-300 tracking-wider uppercase">
              Direct Communication
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase max-w-2xl leading-[1.05]">
            Initiate Contact With Engineering.
          </h2>

          <p className="text-sm sm:text-base text-zinc-400 max-w-xl leading-relaxed">
            Have questions regarding on-premise deployments, hardware acceleration, or preview access? Connect with the core team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Details & SLA Info (Left) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-7 rounded-2xl border border-[#22202d] bg-[#0c0b11]/80 shadow-xl space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Osmiora Computational Systems</h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Pioneering autonomous human-computer symbiosis through low-latency desktop neural architectures.
                </p>
              </div>

              <div className="space-y-4 pt-2 border-t border-[#1a1824]">
                <div className="flex items-start gap-3.5 text-xs sm:text-sm text-zinc-300">
                  <div className="p-2 rounded-lg bg-[#161420] border border-[#262434] text-zinc-300">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Inquiries</div>
                    <div className="text-zinc-400 text-xs">contact@osmoo.in</div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 text-xs sm:text-sm text-zinc-300">
                  <div className="p-2 rounded-lg bg-[#161420] border border-[#262434] text-zinc-300">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Response Latency</div>
                    <div className="text-zinc-400 text-xs">Direct reply within 24 business hours</div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 text-xs sm:text-sm text-zinc-300">
                  <div className="p-2 rounded-lg bg-[#161420] border border-[#262434] text-zinc-300">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Confidentiality Guarantee</div>
                    <div className="text-zinc-400 text-xs">Enterprise inquiries handled under strict mutual NDA</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Status Pill */}
            <div className="p-5 rounded-2xl border border-[#1e1c28] bg-[#09080d] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-medium text-zinc-300">Operating System Binary v0.9.4 Preview</span>
              </div>
              <span className="text-[11px] font-mono text-zinc-400">STATUS: STABLE</span>
            </div>
          </div>

          {/* Interactive Contact Form (Right) */}
          <div className="lg:col-span-7">
            <div className="p-7 sm:p-9 rounded-2xl border border-[#22202d] bg-[#0c0b11] shadow-2xl relative">
              {!sent ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-name" className="block text-xs font-semibold text-zinc-300 mb-2">
                        Your Name
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        disabled={isLoading}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Dr. Jordan Vance"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#07060a] border border-[#242230] text-white text-xs sm:text-sm placeholder-zinc-600 focus:outline-none focus:border-zinc-300 transition-colors disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <label htmlFor="contact-email" className="block text-xs font-semibold text-zinc-300 mb-2">
                        Corporate or Institutional Email
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        disabled={isLoading}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="jordan@research.org"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#07060a] border border-[#242230] text-white text-xs sm:text-sm placeholder-zinc-600 focus:outline-none focus:border-zinc-300 transition-colors disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-topic" className="block text-xs font-semibold text-zinc-300 mb-2">
                      Inquiry Focus
                    </label>
                    <select
                      id="contact-topic"
                      value={subject}
                      disabled={isLoading}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#07060a] border border-[#242230] text-white text-xs sm:text-sm focus:outline-none focus:border-zinc-300 transition-colors disabled:opacity-50"
                    >
                      <option value="Enterprise Pilot">Enterprise Cohort Pilot (10+ Workstations)</option>
                      <option value="Research & Academic">Laboratory & Research Collaboration</option>
                      <option value="Developer Platform">Custom Plugin / Extension Ecosystem</option>
                      <option value="General Inquiries">General Architecture & Security Questions</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="block text-xs font-semibold text-zinc-300 mb-2">
                      Message / Workflow Details
                    </label>
                    <textarea
                      id="contact-message"
                      rows={4}
                      required
                      disabled={isLoading}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Outline your operating environment (macOS/Windows), required toolchain integrations, and workload objectives..."
                      className="w-full px-4 py-2.5 rounded-xl bg-[#07060a] border border-[#242230] text-white text-xs sm:text-sm placeholder-zinc-600 focus:outline-none focus:border-zinc-300 transition-colors resize-none leading-relaxed disabled:opacity-50"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-white text-black font-bold text-xs sm:text-sm hover:bg-zinc-200 transition-all active:scale-[0.98] shadow-lg shadow-white/5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Transmitting Inquiry...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Transmit Engineering Inquiry</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="py-12 text-center space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Inquiry Transmitted</h3>
                  <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
                    {serverMessage || `Thank you, ${name || 'Researcher'}. Your inquiry has been routed to the technical team. We will review your operating environment details and respond to ${email} within 24 hours.`}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSent(false)
                      setMessage('')
                      setServerMessage(null)
                    }}
                    className="mt-4 px-6 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors cursor-pointer"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
