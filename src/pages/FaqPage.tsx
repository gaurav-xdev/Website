import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronDown, HelpCircle } from 'lucide-react'

interface FaqPageProps {
  onNavigate?: (tab: string) => void
}

export function FaqPage({ onNavigate }: FaqPageProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      category: 'Product',
      question: 'What is OSMOO and how does it integrate with my operating system?',
      answer:
        'OSMOO is a native desktop operating companion designed for low-latency human-computer workflow collaboration. Unlike browser-bound chat tabs, it runs directly as a background OS process with screen perception and accessibility hooks, letting you plan, refactor code, and coordinate tools with zero context switching.',
    },
    {
      category: 'Compatibility',
      question: 'Which operating systems and hardware configurations are supported?',
      answer:
        'OSMOO natively supports macOS 14+ (optimized for Apple Silicon M1/M2/M3/M4 chips with Metal acceleration) and Windows 11 64-bit (utilizing DirectML and DirectX 12 hardware acceleration). Linux Wayland/X11 support is currently in development for release v1.0.',
    },
    {
      category: 'Installation',
      question: 'How do I install and configure the native runtime?',
      answer:
        'Download the official macOS .dmg or Windows .msi package from our Download hub. Installation requires no background daemons or sudo elevation beyond standard OS accessibility and terminal automation permissions.',
    },
    {
      category: 'AI Providers',
      question: 'Can I use local models, or connect my own frontier API keys?',
      answer:
        'Both modes are fully supported. You can run quantized local models (such as Llama 3, Mistral, or Phi) entirely on-device via local ONNX/DirectML runtimes with zero internet requirement, or provide your own API keys for Claude, GPT, or Gemini through an encrypted keychain vault.',
    },
    {
      category: 'Voice',
      question: 'Does OSMOO support voice input and real-time audio interaction?',
      answer:
        'Yes. OSMOO includes on-device Whisper speech-to-text with instantaneous hotkey push-to-talk (⌘ + Space by default) and natural low-latency voice synthesis for hands-free workflow feedback.',
    },
    {
      category: 'Privacy',
      question: 'Is any code, screen data, or telemetry transmitted to external servers?',
      answer:
        'No. OSMOO enforces a strict zero-telemetry policy. Your codebase, screen frames, terminal outputs, and chat histories never leave your device unless you explicitly prompt an external AI model with your own API credentials.',
    },
    {
      category: 'Product Questions',
      question: 'How does OSMOO differ from traditional web-based AI chat interfaces?',
      answer:
        'Traditional AI chat windows force you into copy-paste fatigue and have zero awareness of your desktop state. OSMOO observes your active editor AST, analyzes workspace diffs in real time, and executes dry-run verified pipeline steps across your actual tools.',
    },
    {
      category: 'Compatibility Integrations',
      question: 'Which IDEs, terminals, and design tools work with OSMOO?',
      answer:
        'OSMOO includes deep integrations with VS Code, Cursor, Xcode, JetBrains IDEs, Neovim, Warp, Ghostty, iTerm2, Figma, and Raycast, communicating over local Unix domain sockets and OS accessibility APIs.',
    },
    {
      category: 'Pricing',
      question: 'What subscription plans are available, and is there a free version?',
      answer:
        'We offer a permanent Free plan ($0/mo) for local-first individual use, a Pro plan ($24/mo) for power users requiring high-throughput frontier routing, a proposed Max plan ($49/mo), and customized Enterprise deployments. Visit our Pricing page for a side-by-side comparison.',
    },
    {
      category: 'Support',
      question: 'Where can I report bugs, request features, or get engineering assistance?',
      answer:
        'You can reach our core engineering team directly through the Contact page, participate in our GitHub community discussions, or file urgent regression tickets via support@osmoo.ai.',
    },
    {
      category: 'Security Questions',
      question: 'How are execution sandboxes enforced and how are secrets protected?',
      answer:
        'All automated actions run in isolated dry-run sandboxes with AST verification before filesystem commits. Secrets and API tokens are encrypted in hardware-backed storage (macOS Keychain and Windows Credential Manager with AES-256-GCM).',
    },
  ]

  const toggleIndex = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="relative w-full min-h-screen py-16 sm:py-24 px-4 sm:px-6 md:px-8 flex flex-col items-center justify-center overflow-hidden">
      {/* Background atmospheric ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-purple-950/20 rounded-full blur-[160px] pointer-events-none" />

      {/* Main Framed Stage Container matching Reference Page 3 */}
      <div className="relative w-full max-w-4xl rounded-[32px] sm:rounded-[40px] bg-[#07060a]/90 border border-[#201d2d] p-6 sm:p-10 md:p-14 shadow-[0_25px_70px_rgba(0,0,0,0.9)] flex flex-col items-center text-center">
        {/* ─── TITLE & HEADING ─── */}
        <div className="mb-10 sm:mb-14 space-y-4 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151222] border border-[#2c2642] text-[11px] font-mono text-purple-300">
            <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
            <span>Knowledge Base & Support</span>
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-[-0.04em] leading-[0.95] text-white">
            FREQUENTLY
            <br />
            ASKED
            <br />
            QUESTIONS
          </h1>
        </div>

        {/* ─── ACCORDION LIST MATCHING REFERENCE ─── */}
        <div className="w-full space-y-3 text-left">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx
            return (
              <div
                key={idx}
                className={`rounded-2xl bg-[#0c0a13] border transition-all duration-200 overflow-hidden ${
                  isOpen ? 'border-[#3e3856] bg-[#0f0c18]' : 'border-[#1f1c2d] hover:border-[#2e2942]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleIndex(idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3 pr-4">
                    <span className="text-xs font-mono text-purple-400 font-semibold px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">
                      {faq.category}
                    </span>
                    <span className="text-sm sm:text-base font-bold text-white tracking-tight">
                      {faq.question}
                    </span>
                  </div>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-zinc-500 flex-shrink-0"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-[#1a1726]">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>

        {/* ─── BOTTOM NAV / PRICING CTA ─── */}
        <div className="mt-12 sm:mt-14 flex flex-col sm:flex-row items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate?.('pricing')}
            type="button"
            className="px-8 py-3.5 rounded-full bg-white text-black font-semibold text-sm tracking-tight shadow-[0_0_25px_rgba(255,255,255,0.25)] hover:bg-zinc-100 transition-all cursor-pointer"
          >
            View Pricing Plans
          </motion.button>
          <button
            type="button"
            onClick={() => onNavigate?.('contact')}
            className="text-xs text-zinc-400 hover:text-white font-mono transition-colors"
          >
            Have more questions? Ask Engineering →
          </button>
        </div>
      </div>
    </div>
  )
}
