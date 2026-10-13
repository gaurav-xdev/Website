import { useState, useEffect } from 'react'
import Lenis from 'lenis'
import { HeroScene } from './components/HeroScene'
import { GiantBrandSection } from './components/GiantBrandSection'
import { MacbookShowcaseSection } from './components/MacbookShowcaseSection'
import { PipelineSection } from './components/PipelineSection'
import { EcosystemSection } from './components/EcosystemSection'
import { ContactSection } from './components/ContactSection'
import { Footer } from './components/Footer'
import { GetOsmooModal } from './components/GetOsmooModal'
import { AuthModal } from './components/AuthModal'
import { CookieConsentBanner } from './components/CookieConsentBanner'
import { Navbar } from './components/Navbar'

// Dedicated Pages
import { HowItWorksPage } from './pages/HowItWorksPage'
import { PrivacySecurityPage } from './pages/PrivacySecurityPage'
import { FaqPage } from './pages/FaqPage'
import { GetOsmooPage } from './pages/GetOsmooPage'
import { PricingPage } from './pages/PricingPage'

// Dedicated Legal Pages
import { PrivacyPolicyPage } from './pages/legal/PrivacyPolicyPage'
import { TermsOfUsePage } from './pages/legal/TermsOfUsePage'
import { CookiePolicyPage } from './pages/legal/CookiePolicyPage'
import { AiSafetyPage } from './pages/legal/AiSafetyPage'
import { ContactLegalPage } from './pages/legal/ContactLegalPage'
import { RefundsPage } from './pages/legal/RefundsPage'
import { EulaPage } from './pages/legal/EulaPage'
import { VerifyEmailPage } from './pages/VerifyEmailPage'

import { PersistentCompanionScene, type CompanionExpression } from './components/PersistentCompanionScene'
import { soundEngine } from './utils/soundEngine'

export type PageRoute =
  | 'home'
  | 'how-it-works'
  | 'privacy'
  | 'faq'
  | 'pricing'
  | 'download'
  | 'verify'
  | 'legal/privacy'
  | 'legal/terms'
  | 'legal/cookies'
  | 'legal/ai-safety'
  | 'legal/contact'
  | 'legal/refunds'
  | 'legal/eula'

const VALID_ROUTES: PageRoute[] = [
  'how-it-works',
  'privacy',
  'faq',
  'pricing',
  'download',
  'verify',
  'legal/privacy',
  'legal/terms',
  'legal/cookies',
  'legal/ai-safety',
  'legal/contact',
  'legal/refunds',
  'legal/eula',
]

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageRoute>('home')
  const [companionExpression, setCompanionExpression] = useState<CompanionExpression>('neutral')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  // Listen to URL hash routing for direct page linking (e.g. #/pricing or #legal/privacy)
  useEffect(() => {
    const handleHashChange = () => {
      // Check if URL contains OAuth fragments like #access_token= or #error=
      const rawHash = window.location.hash
      if (rawHash.includes('access_token=') || rawHash.includes('error=')) {
        // Supabase client handles parsing this token via detectSessionInUrl: true.
        // We open AuthModal so user immediately sees their authenticated session.
        setIsAuthModalOpen(true)
        // Clean fragment from URL bar after Supabase picks it up
        setTimeout(() => {
          if (window.history && window.history.replaceState) {
            window.history.replaceState(null, '', window.location.pathname + window.location.search)
          }
        }, 500)
        return
      }

      const hash = rawHash.replace(/^#\/?/, '').toLowerCase()
      if (VALID_ROUTES.includes(hash as PageRoute)) {
        setCurrentPage(hash as PageRoute)
        setCompanionExpression('neutral')
        setIsModalOpen(false)
        setIsAuthModalOpen(false)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else if (hash === 'home' || hash === '') {
        setCurrentPage('home')
        setCompanionExpression('neutral')
        setIsModalOpen(false)
        setIsAuthModalOpen(false)
      }
    }

    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // Initialize Lenis smooth luxury scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [])

  const navigateTo = (tab: string) => {
    soundEngine.playClick()
    const targetRoute = tab.toLowerCase() as PageRoute
    if (VALID_ROUTES.includes(targetRoute)) {
      window.location.hash = targetRoute
      setCurrentPage(targetRoute)
      setCompanionExpression('neutral')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (tab === 'home') {
      window.location.hash = 'home'
      setCurrentPage('home')
      setCompanionExpression('neutral')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      // Anchor scroll fallback (e.g. #features, #ecosystem, #contact)
      const element = document.getElementById(tab)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      } else {
        window.location.hash = 'home'
        setCurrentPage('home')
      }
    }
  }

  const isLegalPage = currentPage.startsWith('legal/')

  return (
    <div className="relative min-h-screen w-full bg-[#07080a] text-[#EBEAEF] flex flex-col font-sans selection:bg-purple-500/30 selection:text-white">
      {/* ─── GLOBAL FIXED NAVIGATION BAR ─── */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center w-full px-2 sm:px-4 pointer-events-none pt-3 sm:pt-4">
        <Navbar
          activePage={currentPage}
          onNavigate={navigateTo}
          onOpenModal={() => setIsModalOpen(true)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />
      </div>

      {/* ─── PERSISTENT SCROLL-LINKED 3D COMPANION (Hidden on text-heavy legal views) ─── */}
      {!isLegalPage && (
        <PersistentCompanionScene currentPage={currentPage} expression={companionExpression} />
      )}

      {/* ─── CONDITIONAL MULTI-PAGE ROUTING ─── */}
      <main className="flex-1 w-full flex flex-col pt-16 sm:pt-20">
        {/* PAGE: HOME (FLAGSHIP HERO + 3D MODEL CANVAS + DESKTOP SHOWCASE) */}
        {currentPage === 'home' && (
          <div className="w-full flex flex-col">
            {/* HERO CONTAINER */}
            <div className="w-full flex items-center justify-center p-2 sm:p-4 md:p-5 select-none">
              <div
                id="home-stage"
                className="relative w-full h-[calc(100vh-6rem)] sm:h-[calc(100vh-7rem)] min-h-[640px] max-w-[1440px] rounded-[22px] sm:rounded-[32px] border border-[#23212d]/80 bg-[#07080a] overflow-hidden flex flex-col justify-between shadow-[0_0_80px_rgba(0,0,0,0.85)]"
              >
                {/* 3D WAVE BACKGROUND & 3D CHARACTER */}
                <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
                  <HeroScene />
                </div>

                {/* Atmosphere */}
                <div className="absolute top-[28%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[460px] bg-[#221f2d]/35 rounded-full blur-[130px] pointer-events-none z-0" />

                {/* Stage Hero Title */}
                <div className="relative z-10 flex-1 flex flex-col justify-end items-center pb-8 sm:pb-14 px-3 sm:px-4 pointer-events-none">
                  <div className="pointer-events-auto flex flex-col items-center text-center space-y-3 sm:space-y-3.5 max-w-4xl mx-auto">
                    <h1 className="text-[32px] sm:text-[58px] md:text-[76px] font-black tracking-[-0.045em] leading-[0.95] text-[#ebeaef] uppercase">
                      YOUR COMPUTER.
                      <br />
                      REIMAGINED.
                    </h1>

                    <p className="text-[12px] sm:text-[15px] md:text-[16px] text-[#7a7a7a] font-normal tracking-[0.01em] max-w-2xl mx-auto leading-relaxed whitespace-normal sm:whitespace-nowrap px-2">
                      OSMOO: Your AI operating companion, integrated directly into your workflow.
                    </p>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playClick()
                          setIsModalOpen(true)
                        }}
                        className="relative inline-flex items-center justify-center px-7 py-2.5 rounded-full bg-white text-[#0a0a0c] text-[13px] font-semibold hover:bg-zinc-200 transition-all active:scale-95 shadow-[0_0_24px_rgba(255,255,255,0.35)] hover:shadow-[0_0_34px_rgba(255,255,255,0.55)] cursor-pointer"
                      >
                        Join the Waitlist
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Giant Brand Stage */}
            <GiantBrandSection />

            {/* MacBook Hardware Showcase */}
            <MacbookShowcaseSection />

            {/* Pipeline Section */}
            <div id="features" className="w-full">
              <PipelineSection />
            </div>

            {/* Ecosystem Section */}
            <div id="ecosystem" className="w-full">
              <EcosystemSection onOpenModal={() => setIsModalOpen(true)} />
            </div>

            {/* Contact Section */}
            <div id="contact" className="w-full">
              <ContactSection />
            </div>
          </div>
        )}

        {/* PAGE 1: HOW OSMOO WORKS */}
        {currentPage === 'how-it-works' && (
          <HowItWorksPage onNavigate={navigateTo} />
        )}

        {/* PAGE 2: PRIVACY & SECURITY ARCHITECTURE */}
        {currentPage === 'privacy' && (
          <PrivacySecurityPage onNavigate={navigateTo} />
        )}

        {/* PAGE 3: FREQUENTLY ASKED QUESTIONS */}
        {currentPage === 'faq' && (
          <FaqPage onNavigate={navigateTo} />
        )}

        {/* PAGE 4: GET OSMOO DOWNLOAD & EARLY ACCESS HUB */}
        {currentPage === 'download' && (
          <GetOsmooPage
            onNavigate={navigateTo}
            onOpenModal={() => setIsModalOpen(true)}
          />
        )}

        {/* DEDICATED PRICING PAGE (FREE, PRO, MAX, ENTERPRISE) */}
        {currentPage === 'pricing' && (
          <PricingPage
            onNavigate={navigateTo}
            onHoverPlan={setCompanionExpression}
            activeExpression={companionExpression}
            onOpenEarlyAccessModal={() => setIsModalOpen(true)}
            onSelectPlan={(plan) => {
              if (plan.toLowerCase() === 'enterprise') {
                navigateTo('contact')
              } else {
                navigateTo('download')
              }
            }}
          />
        )}

        {/* PAGE: SECURE EMAIL VERIFICATION */}
        {currentPage === 'verify' && (
          <VerifyEmailPage onNavigate={navigateTo} />
        )}

        {/* ─── DEDICATED PRODUCTION LEGAL ROUTES ─── */}
        {currentPage === 'legal/privacy' && (
          <PrivacyPolicyPage onNavigate={navigateTo} />
        )}

        {currentPage === 'legal/terms' && (
          <TermsOfUsePage onNavigate={navigateTo} />
        )}

        {currentPage === 'legal/cookies' && (
          <CookiePolicyPage onNavigate={navigateTo} />
        )}

        {currentPage === 'legal/ai-safety' && (
          <AiSafetyPage onNavigate={navigateTo} />
        )}

        {currentPage === 'legal/contact' && (
          <ContactLegalPage onNavigate={navigateTo} />
        )}

        {currentPage === 'legal/refunds' && (
          <RefundsPage onNavigate={navigateTo} />
        )}

        {currentPage === 'legal/eula' && (
          <EulaPage onNavigate={navigateTo} />
        )}
      </main>

      {/* ─── GLOBAL LUXURY FOOTER ─── */}
      <Footer onOpenModal={() => setIsModalOpen(true)} onNavigate={navigateTo} />

      {/* Interactive Waitlist / Access Modal */}
      <GetOsmooModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Supabase Email OTP Auth & Account Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Cookie Consent Banner */}
      <CookieConsentBanner onNavigate={navigateTo} />
    </div>
  )
}
