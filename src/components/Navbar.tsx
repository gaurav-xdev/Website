import { useState, useEffect } from 'react'
import { Menu, X, Volume2, VolumeX } from 'lucide-react'
import { soundEngine } from '../utils/soundEngine'

interface NavbarProps {
  activePage: string
  onNavigate: (page: string) => void
  onOpenModal: () => void
}

export function Navbar({ activePage, onNavigate, onOpenModal }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isSoundOn, setIsSoundOn] = useState(false)

  useEffect(() => {
    setIsSoundOn(soundEngine.isEnabled())
    const unsubscribe = soundEngine.subscribe((val) => setIsSoundOn(val))
    return unsubscribe
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
    <header className="relative z-30 w-full flex items-center justify-between px-4 sm:px-8 md:px-12 pt-5 sm:pt-7 pb-3 select-none">
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

        <button
          type="button"
          onClick={() => {
            soundEngine.playClick()
            onOpenModal()
          }}
          className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-[#3a3842] bg-[#1a1920]/80 text-[#ebeaef] text-[11px] sm:text-[12px] font-medium hover:border-zinc-400 hover:bg-[#23212c] transition-all active:scale-[0.97] cursor-pointer"
        >
          Get OSMOO
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
          <div className="pt-2 border-t border-[#1a1726]">
            <button
              type="button"
              onClick={() => {
                handleLinkClick('download')
              }}
              className="w-full py-2.5 rounded-xl bg-white text-black font-semibold text-xs text-center cursor-pointer"
            >
              Download OSMOO v0.9.4
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
