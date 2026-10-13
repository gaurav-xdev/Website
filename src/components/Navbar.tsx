import { useState, useEffect } from 'react'
import { Menu, X, Volume2, VolumeX, User, CheckCircle2 } from 'lucide-react'
import { soundEngine } from '../utils/soundEngine'
import { getCurrentSession, subscribeToAuth } from '../lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface NavbarProps {
  activePage: string
  onNavigate: (page: string) => void
  onOpenModal: () => void
  onOpenAuthModal?: () => void
}

export function Navbar({ activePage, onNavigate, onOpenModal, onOpenAuthModal }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isSoundOn, setIsSoundOn] = useState(false)
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null)

  useEffect(() => {
    setIsSoundOn(soundEngine.isEnabled())
    const unsubscribeSound = soundEngine.subscribe((val) => setIsSoundOn(val))

    getCurrentSession().then((session) => {
      setCurrentUser(session?.user ?? null)
    })

    const unsubscribeAuth = subscribeToAuth((_event, session) => {
      setCurrentUser(session?.user ?? null)
    })

    return () => {
      unsubscribeSound()
      unsubscribeAuth()
    }
  }, [])

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'how-it-works', label: 'How it Works' },
    { id: 'privacy', label: 'Privacy & Security' },
    { id: 'faq', label: 'FAQ' },
    { id: 'pricing', label: 'Pricing' },
  ]

  const handleLinkClick = (id: string) => {
    soundEngine.playClick()
    onNavigate(id)
    setMobileMenuOpen(false)
    window.location.hash = `#${id}`
  }

  const handleSoundToggle = () => {
    soundEngine.toggle()
  }

  return (
    <header className="relative z-30 w-full flex items-center justify-between px-4 sm:px-8 md:px-12 pt-5 sm:pt-7 pb-3 select-none pointer-events-auto">
      {/* Brand Logo */}
      <button
        type="button"
        onClick={() => handleLinkClick('home')}
        className="text-[16px] sm:text-[17px] tracking-[0.06em] font-extrabold text-[#ededed] uppercase hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-2"
      >
        <span>OSMOO</span>
      </button>

      {/* Desktop Navigation Links */}
      <nav className="hidden md:flex items-center gap-6 lg:gap-8" aria-label="Main Navigation">
        {navLinks.map((item) => {
          const isActive = activePage === item.id
          return (
            <div key={item.id} className="relative flex flex-col items-center">
              <button
                type="button"
                onClick={() => handleLinkClick(item.id)}
                className={`text-[13px] sm:text-[14px] font-medium transition-colors pb-1 cursor-pointer ${
                  isActive ? 'text-white' : 'text-[#9e9ca5] hover:text-[#d3d2db]'
                }`}
              >
                {item.label}
              </button>
              {isActive && (
                <span className="absolute bottom-0 w-full h-[2px] bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
              )}
            </div>
          )
        })}
      </nav>

      {/* Right Actions: Sound Toggle + Pill CTA + Mobile Toggle */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Subtle Audio Toggle */}
        <button
          type="button"
          onClick={handleSoundToggle}
          title={isSoundOn ? 'Sound effects enabled (Click to mute)' : 'Sound effects disabled (Click to enable)'}
          aria-label={isSoundOn ? 'Disable audio effects' : 'Enable audio effects'}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[11px] font-medium transition-all cursor-pointer ${
            isSoundOn
              ? 'border-purple-500/40 bg-purple-950/40 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
              : 'border-[#2d2b37] bg-[#121118]/70 text-[#858392] hover:text-[#c4c2d0] hover:border-[#403e4d]'
          }`}
        >
          {isSoundOn ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-purple-300" />
              <span className="hidden sm:inline text-[11px]">Audio On</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 opacity-70" />
              <span className="hidden sm:inline text-[11px]">Audio Off</span>
            </>
          )}
        </button>

        {/* Account / Session Button */}
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick()
            onOpenAuthModal?.()
          }}
          title={currentUser ? `Signed in as ${currentUser.email}` : 'Account profile and sign in'}
          aria-label={currentUser ? `Account: ${currentUser.email}` : 'Open account authentication session'}
          className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] sm:text-[12px] font-medium transition-all active:scale-[0.97] cursor-pointer ${
            currentUser
              ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-200 hover:border-emerald-400'
              : 'border-[#2d2b38] bg-[#121118]/80 text-[#d0ceda] hover:border-purple-400 hover:text-white'
          }`}
        >
          {currentUser ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline max-w-[120px] truncate">
                {currentUser.email?.split('@')[0] || 'Account'}
              </span>
            </>
          ) : (
            <>
              <User className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Account</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            soundEngine.playClick()
            onOpenModal()
          }}
          className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-purple-500/40 bg-[#1a1920]/90 text-[#ebeaef] text-[11px] sm:text-[12px] font-medium hover:border-purple-300 hover:bg-[#23212c] transition-all active:scale-[0.97] cursor-pointer"
        >
          Join the Waitlist
        </button>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          aria-label="Toggle mobile menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 mx-4 mt-2 p-4 rounded-2xl bg-[#0c0a13] border border-[#232032] shadow-2xl z-50 flex flex-col gap-2">
          {navLinks.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleLinkClick(item.id)}
              className={`text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                activePage === item.id
                  ? 'bg-purple-600/20 text-white font-bold border border-purple-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2 border-t border-[#1a1726] space-y-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false)
                soundEngine.playClick()
                onOpenAuthModal?.()
              }}
              className={`w-full py-2.5 rounded-xl border font-semibold text-xs text-center cursor-pointer flex items-center justify-center gap-1.5 ${
                currentUser
                  ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-200'
                  : 'border-purple-500/30 bg-purple-950/20 text-purple-200'
              }`}
            >
              {currentUser ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="truncate max-w-[200px]">{currentUser.email}</span>
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5 text-purple-400" />
                  <span>Account / Sign In</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false)
                soundEngine.playClick()
                onOpenModal()
              }}
              className="w-full py-2.5 rounded-xl bg-white text-black font-semibold text-xs text-center cursor-pointer"
            >
              Join the Waitlist
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
