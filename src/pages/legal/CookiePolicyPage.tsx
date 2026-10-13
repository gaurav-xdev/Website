import { LegalLayout } from './LegalLayout'

interface CookiePolicyPageProps {
  onNavigate?: (route: string) => void
}

export function CookiePolicyPage({ onNavigate }: CookiePolicyPageProps) {
  const handleOpenBanner = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('osmoo:open-cookie-banner'))
    }
  }

  return (
    <LegalLayout
      title="Cookie & Storage Policy"
      subtitle="Complete, accurate disclosure of cookies, browser local storage, and tracking technologies actually deployed on the OSMOO website."
      activeRoute="legal/cookies"
      onNavigate={onNavigate}
    >
      {/* 1. What are Cookies and Local Storage? */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-[#1f1c2d] pb-2">
          1. Scope & Factual Reality
        </h2>
        <p>
          This Cookie & Storage Policy explains how <strong className="text-white">Osmiora Computational Systems</strong> uses cookies, browser local storage (<code className="text-purple-300">localStorage</code>), and related browser technologies on the website <code className="text-purple-300">osmoo.in</code>.
        </p>
        <div className="p-4 rounded-2xl bg-[#0f0d18] border border-purple-500/20 text-purple-200">
          <strong className="text-white block mb-1">Our Tracking Architecture Fact Sheet:</strong>
          We do not deploy invasive third-party cross-site advertising trackers, behavioral tracking pixels (such as Meta Pixel or TikTok Tracker), or third-party ad networks on this website. We respect user autonomy and privacy by default.
        </div>
      </section>

      {/* 2. Technologies Actually Used */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-[#1f1c2d] pb-2">
          2. Technologies Actually Deployed on this Website
        </h2>
        <p>
          Below is a complete, truthful inventory of every storage item set by our application:
        </p>

        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs border border-[#201d2e] rounded-xl overflow-hidden">
            <thead className="bg-[#12101c] text-white font-mono uppercase">
              <tr>
                <th className="p-3 border-b border-[#201d2e]">Key / Name</th>
                <th className="p-3 border-b border-[#201d2e]">Type</th>
                <th className="p-3 border-b border-[#201d2e]">Purpose & Category</th>
                <th className="p-3 border-b border-[#201d2e]">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1b2b] text-zinc-300">
              <tr>
                <td className="p-3 font-mono font-bold text-purple-300">osmoo_sound_enabled</td>
                <td className="p-3">localStorage</td>
                <td className="p-3">
                  <strong className="text-white">Strictly Necessary (Functional):</strong> Remembers whether you have enabled or muted ambient sound effects across page reloads.
                </td>
                <td className="p-3 font-mono text-zinc-400">Persistent (Local)</td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-bold text-purple-300">osmoo_cookie_consent</td>
                <td className="p-3">localStorage</td>
                <td className="p-3">
                  <strong className="text-white">Strictly Necessary (Compliance):</strong> Records your cookie banner decision so you are not repeatedly prompted on subsequent visits.
                </td>
                <td className="p-3 font-mono text-zinc-400">Persistent (Local)</td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-bold text-purple-300">osmoo_auth_token</td>
                <td className="p-3">localStorage</td>
                <td className="p-3">
                  <strong className="text-white">Strictly Necessary (Security):</strong> Stores your cryptographic Supabase session JWT when you sign in via email OTP.
                </td>
                <td className="p-3 font-mono text-zinc-400">Session / Refresh Token</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. Third-Party Analytics & Web Fonts */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-[#1f1c2d] pb-2">
          3. External Services & Fonts
        </h2>
        <ul className="list-disc pl-5 space-y-2 text-zinc-300">
          <li>
            <strong className="text-white">Google Fonts CDN:</strong> To render our typographic hierarchy, our website requests font assets directly from Google Fonts CDN (<code className="text-purple-300">fonts.googleapis.com</code> and <code className="text-purple-300">fonts.gstatic.com</code>). Google may log standard technical HTTP requests to serve font files. No tracking cookies are delivered by our application via this CDN.
          </li>
          <li>
            <strong className="text-white">Vercel Edge Network:</strong> Our hosting platform monitors aggregate traffic, server response times, and edge cache hit ratios at the infrastructure level to maintain reliable service delivery.
          </li>
        </ul>
      </section>

      {/* 4. Managing and Modifying Your Preferences */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-[#1f1c2d] pb-2">
          4. Changing or Withdrawing Consent
        </h2>
        <p>
          You may modify or withdraw your preferences at any moment. Because our storage is local, clearing your browser cache or utilizing the interactive tool below will immediately update your preferences:
        </p>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleOpenBanner}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-md shadow-purple-900/30"
          >
            Open Interactive Cookie Preferences
          </button>
        </div>

        <p className="text-xs text-zinc-400 pt-2">
          Alternatively, you can configure your browser to block or alert you about cookies and local storage. Note that disabling strictly necessary local storage will prevent the website from remembering your authentication session and audio settings.
        </p>
      </section>
    </LegalLayout>
  )
}
