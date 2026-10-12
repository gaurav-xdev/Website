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
import { Navbar } from './components/Navbar'

// Dedicated Pages
import { HowItWorksPage } from './pages/HowItWorksPage'
import { PrivacySecurityPage } from './pages/PrivacySecurityPage'
import { FaqPage } from './pages/FaqPage'
import { GetOsmooPage } from './pages/GetOsmooPage'
import { PricingPage } from './pages/PricingPage'

import { PersistentCompanionScene, type CompanionExpression } from './components/PersistentCompanionScene'

export type PageRoute = 'home' | 'how-it-works' | 'privacy' | 'faq' | 'pricing' | 'download'

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageRoute>('home')
  const [companionExpression, setCompanionExpression] = useState<CompanionExpression>('neutral')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Listen to URL hash routing for direct page linking (e.g. #/pricing or #pricing)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase()
      if (['how-it-works', 'privacy', 'faq', 'pricing', 'download'].includes(hash)) {
        setCurrentPage(hash as PageRoute)
        setCompanionExpression('neutral')
        setIsModalOpen(false)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else if (hash === 'home' || hash === '') {
        setCurrentPage('home')
        setCompanionExpression('neutral')
        setIsModalOpen(false)
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
    })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [currentPage])

  const navigateTo = (page: string) => {
    const clean = page.replace(/^#\/?/, '') as PageRoute
    setCurrentPage(clean)
    setCompanionExpression('neutral')
    setIsModalOpen(false)
    window.location.hash = `#${clean}`
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen w-full bg-[#050508] text-[#ebeaef] font-sans selection:bg-white selection:text-black flex flex-col justify-between">
      {/* ─── GLOBAL TOP NAVIGATION ─── */}
      <div className="w-full max-w-[1440px] mx-auto">
        <Navbar
          activePage={currentPage}
          onNavigate={navigateTo}
          onOpenModal={() => setIsModalOpen(true)}
        />
      </div>

      {/* ─── PERSISTENT SCROLL-LINKED 3D COMPANION ─── */}
      <PersistentCompanionScene currentPage={currentPage} expression={companionExpression} />

      {/* ─── CONDITIONAL MULTI-PAGE ROUTING ─── */}
      <main className="flex-1 w-full flex flex-col">
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
                        onClick={() => navigateTo('download')}
                        className="relative inline-flex items-center justify-center px-7 py-2.5 rounded-full bg-white text-[#0a0a0c] text-[13px] font-semibold hover:bg-zinc-200 transition-all active:scale-95 shadow-[0_0_24px_rgba(255,255,255,0.35)] hover:shadow-[0_0_34px_rgba(255,255,255,0.55)] cursor-pointer"
                      >
                        Get OSMOO
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sparkle Star */}
                <div className="absolute bottom-6 right-8 z-10 pointer-events-none select-none">
                  <svg
                    className="w-8 h-8 sm:w-9 sm:h-9 text-[#8c8d8f]/80"
                    viewBox="0 0 39 39"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M19.5 0C19.5 10.7695 28.2305 19.5 39 19.5C28.2305 19.5 19.5 28.2305 19.5 39C19.5 28.2305 10.7695 19.5 0 19.5C10.7695 19.5 19.5 10.7695 19.5 0Z"
                      fill="currentColor"
                    />
                  </svg>
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

        {/* PAGE 2: PRIVACY & SECURITY */}
        {currentPage === 'privacy' && (
          <PrivacySecurityPage onNavigate={navigateTo} />
        )}

        {/* PAGE 3: FREQUENTLY ASKED QUESTIONS */}
        {currentPage === 'faq' && (
          <FaqPage onNavigate={navigateTo} />
        )}

        {/* PAGE 4: GET OSMOO DOWNLOAD HUB */}
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
            onSelectPlan={(plan) => {
              console.log('Selected plan:', plan)
              navigateTo('download')
            }}
          />
        )}
      </main>

      {/* ─── GLOBAL LUXURY FOOTER ─── */}
      <Footer onOpenModal={() => setIsModalOpen(true)} />

      {/* Interactive Waitlist / Access Modal */}
      <GetOsmooModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
