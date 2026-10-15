import { useState, useEffect, useCallback } from 'react'
import {
  ShieldAlert,
  Users,
  Award,
  MessageSquare,
  CreditCard,
  History,
  RefreshCw,
  LogOut,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Server,
  Lock,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import { getSupabase } from '../lib/supabase/client'
import {
  fetchAdminOverview,
  fetchAdminWaitlist,
  fetchAdminContacts,
  updateAdminContact,
  fetchAdminPayments,
  fetchAdminAuditLogs,
  type AdminOverviewStats,
  type AdminWaitlistEntry,
  type AdminContactEntry,
  type AdminPaymentEvent,
  type AdminAuditLogEntry,
} from '../lib/api/adminClient'
import { soundEngine } from '../utils/soundEngine'

interface AdminDashboardPageProps {
  onNavigate?: (tab: string) => void
}

type AdminTab = 'overview' | 'waitlist' | 'contacts' | 'payments' | 'audit'

export function AdminDashboardPage({ onNavigate }: AdminDashboardPageProps) {
  // Authentication & Authorization states
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [authChecking, setAuthChecking] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)

  // Login form state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginMethod, setLoginMethod] = useState<'password' | 'magic_link'>('password')
  const [magicLinkSent, setMagicLinkSent] = useState(false)

  // Dashboard active tab
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Data states
  const [overview, setOverview] = useState<AdminOverviewStats | null>(null)
  const [overviewError, setOverviewError] = useState<string | null>(null)

  // Waitlist tab state
  const [waitlistData, setWaitlistData] = useState<AdminWaitlistEntry[]>([])
  const [waitlistTotal, setWaitlistTotal] = useState(0)
  const [waitlistPage, setWaitlistPage] = useState(1)
  const [waitlistTotalPages, setWaitlistTotalPages] = useState(1)
  const [waitlistSearch, setWaitlistSearch] = useState('')
  const [waitlistFilter, setWaitlistFilter] = useState<'all' | 'verified' | 'unverified' | 'founding50'>('all')
  const [waitlistLoading, setWaitlistLoading] = useState(false)

  // Contacts tab state
  const [contactsData, setContactsData] = useState<AdminContactEntry[]>([])
  const [contactsTotal, setContactsTotal] = useState(0)
  const [contactsPage, setContactsPage] = useState(1)
  const [contactsTotalPages, setContactsTotalPages] = useState(1)
  const [contactsSearch, setContactsSearch] = useState('')
  const [contactsStatus, setContactsStatus] = useState<string>('all')
  const [contactsLoading, setContactsLoading] = useState(false)
  const [updatingContactId, setUpdatingContactId] = useState<string | null>(null)

  // Payments tab state
  const [paymentEvents, setPaymentEvents] = useState<AdminPaymentEvent[]>([])
  const [paymentsTotal, setPaymentsTotal] = useState(0)
  const [paymentsPage, setPaymentsPage] = useState(1)
  const [paymentsTotalPages, setPaymentsTotalPages] = useState(1)
  const [paymentsLoading, setPaymentsLoading] = useState(false)

  // Audit tab state
  const [auditLogs, setAuditLogs] = useState<AdminAuditLogEntry[]>([])
  const [auditLoading, setAuditLoading] = useState(false)

  // 1. Initial auth check
  useEffect(() => {
    async function checkCurrentSession() {
      setAuthChecking(true)
      try {
        const supabase = getSupabase()
        if (!supabase) {
          setAuthToken(null)
          setIsAuthorized(null)
          return
        }
        const { data: { session } } = await supabase.auth.getSession()
        if (session && session.access_token) {
          setAuthToken(session.access_token)
          setUserEmail(session.user?.email || null)
          // Verify with overview endpoint to validate admin role
          const res = await fetchAdminOverview(session.access_token)
          if (res.success && res.data) {
            setIsAuthorized(true)
            setOverview(res.data)
          } else {
            setIsAuthorized(false)
            setAuthError(res.error || 'Access denied: caller does not possess administrative privileges.')
          }
        } else {
          setAuthToken(null)
          setIsAuthorized(null)
        }
      } catch (err: unknown) {
        setAuthError(err instanceof Error ? err.message : 'Session verification failed')
      } finally {
        setAuthChecking(false)
      }
    }

    checkCurrentSession()
  }, [])

  // 2. Fetch Tab Data
  const loadTabData = useCallback(async (tab: AdminTab, token: string) => {
    if (tab === 'overview') {
      const res = await fetchAdminOverview(token)
      if (res.success && res.data) {
        setOverview(res.data)
        setOverviewError(null)
      } else {
        setOverviewError(res.error || 'Failed to load overview')
      }
    } else if (tab === 'waitlist') {
      setWaitlistLoading(true)
      const res = await fetchAdminWaitlist(token, {
        page: waitlistPage,
        pageSize: 20,
        search: waitlistSearch,
        filter: waitlistFilter,
      })
      if (res.success && res.data) {
        setWaitlistData(res.data.data)
        setWaitlistTotal(res.data.total)
        setWaitlistTotalPages(res.data.totalPages)
      }
      setWaitlistLoading(false)
    } else if (tab === 'contacts') {
      setContactsLoading(true)
      const res = await fetchAdminContacts(token, {
        page: contactsPage,
        pageSize: 20,
        search: contactsSearch,
        status: contactsStatus,
      })
      if (res.success && res.data) {
        setContactsData(res.data.data)
        setContactsTotal(res.data.total)
        setContactsTotalPages(res.data.totalPages)
      }
      setContactsLoading(false)
    } else if (tab === 'payments') {
      setPaymentsLoading(true)
      const res = await fetchAdminPayments(token, {
        page: paymentsPage,
        pageSize: 20,
      })
      if (res.success && res.data) {
        setPaymentEvents(res.data.recentEvents)
        setPaymentsTotal(res.data.total)
        setPaymentsTotalPages(res.data.totalPages)
      }
      setPaymentsLoading(false)
    } else if (tab === 'audit') {
      setAuditLoading(true)
      const res = await fetchAdminAuditLogs(token, 50)
      if (res.success && res.data) {
        setAuditLogs(res.data)
      }
      setAuditLoading(false)
    }
  }, [waitlistPage, waitlistSearch, waitlistFilter, contactsPage, contactsSearch, contactsStatus, paymentsPage])

  useEffect(() => {
    if (authToken && isAuthorized) {
      loadTabData(activeTab, authToken)
    }
  }, [authToken, isAuthorized, activeTab, loadTabData])

  const handleRefresh = async () => {
    if (!authToken) return
    setIsRefreshing(true)
    soundEngine.playClick()
    await loadTabData(activeTab, authToken)
    setIsRefreshing(false)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    setAuthError(null)
    soundEngine.playClick()

    try {
      const supabase = getSupabase()
      if (!supabase) {
        throw new Error('Supabase client is not configured in environment.')
      }

      if (loginMethod === 'password') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: loginEmail.trim(),
          password: loginPassword,
        })
        if (error) throw error
        if (data.session) {
          setAuthToken(data.session.access_token)
          setUserEmail(data.session.user.email || null)
          // Verify administrative access
          const res = await fetchAdminOverview(data.session.access_token)
          if (res.success && res.data) {
            setIsAuthorized(true)
            setOverview(res.data)
          } else {
            setIsAuthorized(false)
            setAuthError(res.error || 'Forbidden: account does not have administrative privileges.')
          }
        }
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email: loginEmail.trim(),
          options: {
            emailRedirectTo: `${window.location.origin}/#admin`,
          },
        })
        if (error) throw error
        setMagicLinkSent(true)
      }
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleSignOut = async () => {
    soundEngine.playClick()
    const supabase = getSupabase()
    if (supabase) {
      await supabase.auth.signOut()
    }
    setAuthToken(null)
    setUserEmail(null)
    setIsAuthorized(null)
    setOverview(null)
  }

  const handleUpdateContactStatus = async (id: string, newStatus: 'unread' | 'read' | 'resolved') => {
    if (!authToken) return
    setUpdatingContactId(id)
    soundEngine.playClick()

    const res = await updateAdminContact(authToken, { id, status: newStatus })
    if (res.success) {
      setContactsData((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus, updated_at: new Date().toISOString() } : c))
      )
    }
    setUpdatingContactId(null)
  }

  // Loading Session Skeleton
  if (authChecking) {
    return (
      <div className="min-h-screen w-full bg-[#07060a] flex items-center justify-center p-6 text-white font-mono">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          <p className="text-sm text-zinc-400">Verifying administrative security credentials...</p>
        </div>
      </div>
    )
  }

  // Not Logged In: Sleek Admin Login Portal
  if (!authToken || isAuthorized === null) {
    return (
      <div className="min-h-screen w-full bg-[#07060a] flex items-center justify-center p-4 sm:p-6 text-white">
        <div className="w-full max-w-md p-6 sm:p-8 rounded-2xl bg-[#0d0b14] border border-[#231f33] shadow-2xl space-y-6">
          <div className="flex items-center gap-3 border-b border-[#201d2d] pb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-950/40 border border-purple-800/40 flex items-center justify-center text-purple-300">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-purple-400">Restricted Internal System</div>
              <h1 className="text-lg font-bold tracking-tight text-white">OSMOO Control Room</h1>
            </div>
          </div>

          {authError && (
            <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-800/40 text-xs text-red-200 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {magicLinkSent ? (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-200 space-y-2">
              <p className="font-semibold text-emerald-300">Authentication Link Dispatched</p>
              <p>Check {loginEmail} for your secure one-time authorization link to sign in.</p>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5">Authorized Administrator Email</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@osmoo.in"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141120] border border-[#2b2540] text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              {loginMethod === 'password' && (
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1.5">Password</label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141120] border border-[#2b2540] text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-[#121116] font-medium text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loginLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  <span>{loginMethod === 'password' ? 'Authenticate' : 'Send One-Time Magic Link'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono pt-1">
                <button
                  type="button"
                  onClick={() => setLoginMethod(loginMethod === 'password' ? 'magic_link' : 'password')}
                  className="hover:text-purple-300 underline underline-offset-4"
                >
                  {loginMethod === 'password' ? 'Sign in with Magic Link' : 'Sign in with Password'}
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate?.('home')}
                  className="hover:text-zinc-200"
                >
                  Return to Home
                </button>
              </div>
            </form>
          )}

          <div className="text-[11px] text-zinc-400 font-mono text-center border-t border-[#1d1929] pt-4">
            Notice: All access attempts are rate-limited, logged, and cryptographically verified.
          </div>
        </div>
      </div>
    )
  }

  // Logged in but Forbidden (Non-Admin User)
  if (isAuthorized === false) {
    return (
      <div className="min-h-screen w-full bg-[#07060a] flex items-center justify-center p-6 text-white font-sans">
        <div className="max-w-md w-full p-8 rounded-2xl bg-[#0e0c15] border border-red-900/40 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-red-950/50 border border-red-800/40 flex items-center justify-center mx-auto text-red-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Access Denied (403 Forbidden)</h1>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Your authenticated identity (<span className="text-zinc-200 font-mono">{userEmail}</span>) does not possess server-side administrative authority.
          </p>
          <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800 text-xs text-zinc-400 text-left font-mono">
            To provision an administrator, insert your user UUID into the <code className="text-purple-300">public.admin_users</code> database table or add your address to the <code className="text-purple-300">ADMIN_EMAILS</code> environment variable.
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleSignOut}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-200 cursor-pointer"
            >
              Sign Out
            </button>
            <button
              onClick={() => onNavigate?.('home')}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-mono text-[#121116] cursor-pointer"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 3. Authorized Admin Dashboard View
  return (
    <div className="min-h-screen w-full bg-[#07060a] text-zinc-200 font-sans selection:bg-purple-900 selection:text-white pb-16">
      {/* Top Fixed Control Bar */}
      <header className="sticky top-0 z-40 w-full bg-[#0b0914]/90 backdrop-blur-md border-b border-[#201c30] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-950/60 border border-purple-800/60 flex items-center justify-center text-purple-300">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-white">OSMOO Control Room</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-950/60 border border-purple-800/60 text-purple-300">
                Admin
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-950/40 border border-amber-800/50 text-amber-300">
                Payments Disabled
              </span>
            </div>
            <div className="text-[11px] font-mono text-zinc-400">Authenticated: {userEmail}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            aria-label="Refresh Dashboard Data"
            className="p-2 rounded-xl bg-[#141122] hover:bg-[#1f1a35] border border-[#2c2642] text-zinc-300 hover:text-white transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-purple-400' : ''}`} />
          </button>
          <button
            onClick={handleSignOut}
            className="px-3 py-1.5 rounded-xl bg-[#1a1428] hover:bg-red-950/40 border border-[#2f2546] hover:border-red-800/50 text-xs font-mono text-zinc-300 hover:text-red-300 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#0f0d19] border border-[#231f35] overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: Server },
            { id: 'waitlist', label: 'Early Access Waitlist', icon: Users, badge: overview?.signups.total },
            { id: 'contacts', label: 'Inquiries', icon: MessageSquare, badge: overview?.contacts.unread },
            { id: 'payments', label: 'Payment Gateway', icon: CreditCard },
            { id: 'audit', label: 'Operational Audit', icon: History },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => {
                  soundEngine.playClick()
                  setActiveTab(tab.id as AdminTab)
                }}
                className={`px-4 py-2.5 rounded-xl font-mono text-xs font-medium flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-purple-600 text-[#121116] shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-[#181427]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive ? 'bg-white/20 text-white' : 'bg-purple-950 text-purple-300 border border-purple-800'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* ─── TAB 1: OVERVIEW ─── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {overviewError && (
              <div className="p-4 rounded-xl bg-red-950/30 border border-red-800/40 text-xs text-red-200">
                {overviewError}
              </div>
            )}

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Waitlist Total */}
              <div className="p-5 rounded-2xl bg-[#0f0d19] border border-[#231f35] space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span>Total Signups</span>
                  <Users className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-3xl font-black text-white">
                  {overview?.signups.total ?? '—'}
                </div>
                <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-2">
                  <span className="text-emerald-400 font-semibold">{overview?.signups.verified ?? 0} verified</span>
                  <span>•</span>
                  <span>{overview?.signups.unverified ?? 0} pending</span>
                </div>
              </div>

              {/* Founding 50 Slots */}
              <div className="p-5 rounded-2xl bg-[#0f0d19] border border-[#231f35] space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span>The Founding 50</span>
                  <Award className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-3xl font-black text-white">
                  {overview?.signups.founding50Claimed ?? 0} / {overview?.signups.founding50Cap ?? 50}
                </div>
                <div className="text-[11px] font-mono text-amber-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{overview?.signups.founding50Remaining ?? 50} spots remaining</span>
                </div>
              </div>

              {/* Inquiries */}
              <div className="p-5 rounded-2xl bg-[#0f0d19] border border-[#231f35] space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span>Contact Inquiries</span>
                  <MessageSquare className="w-4 h-4 text-sky-400" />
                </div>
                <div className="text-3xl font-black text-white">
                  {overview?.contacts.total ?? '—'}
                </div>
                <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-2">
                  <span className="text-amber-400 font-semibold">{overview?.contacts.unread ?? 0} unread</span>
                  <span>•</span>
                  <span>{overview?.contacts.resolved ?? 0} resolved</span>
                </div>
              </div>

              {/* Payments Gate Status */}
              <div className="p-5 rounded-2xl bg-[#0f0d19] border border-[#231f35] space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span>Payments Mode</span>
                  <CreditCard className="w-4 h-4 text-oxblood-400" />
                </div>
                <div className="text-2xl font-bold text-amber-400 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-amber-400" />
                  <span>DISABLED</span>
                </div>
                <div className="text-[11px] font-mono text-zinc-400">
                  Safe Gate: Desktop Pre-Launch
                </div>
              </div>
            </div>

            {/* Architecture Health Checklist */}
            <div className="p-6 rounded-2xl bg-[#0f0d19] border border-[#231f35] space-y-4">
              <h2 className="text-sm font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                <Server className="w-4 h-4 text-purple-400" />
                <span>Production Environment Health</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-4 rounded-xl bg-[#141122] border border-[#26203a] flex items-center justify-between">
                  <div>
                    <div className="text-white font-bold">Supabase PostgreSQL</div>
                    <div className="text-zinc-400 text-[11px]">RLS & Direct Write Lockdown Active</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-[11px]">
                    Connected
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#141122] border border-[#26203a] flex items-center justify-between">
                  <div>
                    <div className="text-white font-bold">Resend Transactional Mailer</div>
                    <div className="text-zinc-400 text-[11px]">Domain: osmoo.in (Verification emails)</div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] ${
                      overview?.system.emailConfigured
                        ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {overview?.system.emailConfigured ? 'Operational' : 'Setup Mode'}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#141122] border border-[#26203a] flex items-center justify-between">
                  <div>
                    <div className="text-white font-bold">Dodo Payments Engine</div>
                    <div className="text-zinc-400 text-[11px]">PAYMENTS_ENABLED = false (Server Gate)</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-950/60 border border-amber-800 text-amber-300 text-[11px]">
                    Pre-Launch Paused
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#141122] border border-[#26203a] flex items-center justify-between">
                  <div>
                    <div className="text-white font-bold">Server Environment</div>
                    <div className="text-zinc-400 text-[11px]">Node: {overview?.system.nodeEnv}</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-purple-950/60 border border-purple-800 text-purple-300 text-[11px]">
                    Vercel Edge/Serverless
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 2: WAITLIST ─── */}
        {activeTab === 'waitlist' && (
          <div className="space-y-4">
            {/* Search & Filters */}
            <div className="p-4 rounded-2xl bg-[#0f0d19] border border-[#231f35] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by email or name..."
                  value={waitlistSearch}
                  onChange={(e) => {
                    setWaitlistSearch(e.target.value)
                    setWaitlistPage(1)
                  }}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#141122] border border-[#2c2642] text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center gap-1 font-mono text-xs overflow-x-auto">
                {(['all', 'verified', 'unverified', 'founding50'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => {
                      soundEngine.playClick()
                      setWaitlistFilter(filter)
                      setWaitlistPage(1)
                    }}
                    className={`px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                      waitlistFilter === filter
                        ? 'bg-purple-600 text-[#121116] font-bold'
                        : 'text-zinc-400 hover:text-white hover:bg-[#181427]'
                    }`}
                  >
                    {filter === 'founding50' ? 'Founding 50' : filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Waitlist Table */}
            <div className="rounded-2xl bg-[#0f0d19] border border-[#231f35] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#141122] text-zinc-400 border-b border-[#231f35]">
                    <tr>
                      <th className="px-4 py-3 font-semibold">User Email</th>
                      <th className="px-4 py-3 font-semibold">Name</th>
                      <th className="px-4 py-3 font-semibold">Verification</th>
                      <th className="px-4 py-3 font-semibold">Founding 50</th>
                      <th className="px-4 py-3 font-semibold">Registered</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1b172a]">
                    {waitlistLoading ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                          <Loader2 className="w-5 h-5 animate-spin mx-auto text-purple-400 mb-2" />
                          <span>Loading waitlist cohort...</span>
                        </td>
                      </tr>
                    ) : waitlistData.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                          No waitlist signups matching this criteria.
                        </td>
                      </tr>
                    ) : (
                      waitlistData.map((row) => (
                        <tr key={row.id} className="hover:bg-[#141122]/50 transition-colors">
                          <td className="px-4 py-3 text-white font-medium">{row.email}</td>
                          <td className="px-4 py-3 text-zinc-400">{row.first_name || '—'}</td>
                          <td className="px-4 py-3">
                            {row.is_verified ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-950/70 border border-emerald-800 text-emerald-300">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Verified</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-zinc-800 text-zinc-400">
                                <Clock className="w-3 h-3" />
                                <span>Pending</span>
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {row.is_founding_50 ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-amber-950/70 border border-amber-800 text-amber-300 font-bold">
                                <Award className="w-3 h-3" />
                                <span>Founding 50</span>
                              </span>
                            ) : (
                              <span className="text-zinc-600">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-zinc-500">
                            {new Date(row.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-3 bg-[#120f1e] border-t border-[#231f35] flex items-center justify-between text-xs font-mono text-zinc-400">
                <div>
                  Total records: <span className="text-white font-bold">{waitlistTotal}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={waitlistPage <= 1 || waitlistLoading}
                    onClick={() => setWaitlistPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg bg-[#181427] hover:bg-[#201b33] disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span>
                    Page {waitlistPage} of {waitlistTotalPages}
                  </span>
                  <button
                    disabled={waitlistPage >= waitlistTotalPages || waitlistLoading}
                    onClick={() => setWaitlistPage((p) => Math.min(waitlistTotalPages, p + 1))}
                    className="p-1.5 rounded-lg bg-[#181427] hover:bg-[#201b33] disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 3: CONTACT INQUIRIES ─── */}
        {activeTab === 'contacts' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#0f0d19] border border-[#231f35] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search inquiries..."
                  value={contactsSearch}
                  onChange={(e) => {
                    setContactsSearch(e.target.value)
                    setContactsPage(1)
                  }}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#141122] border border-[#2c2642] text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center gap-1 font-mono text-xs">
                {['all', 'unread', 'read', 'resolved'].map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      soundEngine.playClick()
                      setContactsStatus(st)
                      setContactsPage(1)
                    }}
                    className={`px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                      contactsStatus === st
                        ? 'bg-purple-600 text-[#121116] font-bold'
                        : 'text-zinc-400 hover:text-white hover:bg-[#181427]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Inquiries List */}
            <div className="space-y-3">
              {contactsLoading ? (
                <div className="p-8 text-center text-zinc-500 font-mono text-xs rounded-2xl bg-[#0f0d19] border border-[#231f35]">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-purple-400 mb-2" />
                  <span>Loading inquiries...</span>
                </div>
              ) : contactsData.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 font-mono text-xs rounded-2xl bg-[#0f0d19] border border-[#231f35]">
                  No inquiries found in this view.
                </div>
              ) : (
                contactsData.map((inquiry) => (
                  <div
                    key={inquiry.id}
                    className="p-5 rounded-2xl bg-[#0f0d19] border border-[#231f35] space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1f1b2f] pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{inquiry.name}</span>
                          <span className="text-zinc-400 font-mono text-xs">&lt;{inquiry.email}&gt;</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-950/60 border border-purple-800 text-purple-300">
                            {inquiry.category}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-zinc-500 mt-0.5">
                          Received {new Date(inquiry.created_at).toLocaleString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <span
                          className={`px-2 py-0.5 rounded-md ${
                            inquiry.status === 'unread'
                              ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                              : inquiry.status === 'resolved'
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                              : 'bg-zinc-800 text-zinc-300'
                          }`}
                        >
                          {inquiry.status.toUpperCase()}
                        </span>

                        {inquiry.status !== 'resolved' && (
                          <button
                            disabled={updatingContactId === inquiry.id}
                            onClick={() => handleUpdateContactStatus(inquiry.id, 'resolved')}
                            className="px-2 py-1 rounded-md bg-[#19152a] hover:bg-emerald-900/40 text-zinc-300 hover:text-emerald-300 border border-[#2b2444] cursor-pointer"
                          >
                            Mark Resolved
                          </button>
                        )}

                        {inquiry.status === 'unread' && (
                          <button
                            disabled={updatingContactId === inquiry.id}
                            onClick={() => handleUpdateContactStatus(inquiry.id, 'read')}
                            className="px-2 py-1 rounded-md bg-[#19152a] hover:bg-zinc-700 text-zinc-300 border border-[#2b2444] cursor-pointer"
                          >
                            Mark Read
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed font-sans bg-[#131020] p-3 rounded-xl border border-[#221c35]">
                      {inquiry.message}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {contactsTotalPages > 1 && (
              <div className="p-3 bg-[#120f1e] rounded-xl border border-[#231f35] flex items-center justify-between text-xs font-mono text-zinc-400">
                <div>Total: {contactsTotal}</div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={contactsPage <= 1 || contactsLoading}
                    onClick={() => setContactsPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg bg-[#181427] hover:bg-[#201b33] disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span>
                    Page {contactsPage} of {contactsTotalPages}
                  </span>
                  <button
                    disabled={contactsPage >= contactsTotalPages || contactsLoading}
                    onClick={() => setContactsPage((p) => Math.min(contactsTotalPages, p + 1))}
                    className="p-1.5 rounded-lg bg-[#181427] hover:bg-[#201b33] disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 4: PAYMENT GATEWAY ─── */}
        {activeTab === 'payments' && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-[#0f0d19] border border-amber-900/40 text-xs font-mono space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Commercial Gate Active: Transactions Temporarily Disabled</span>
              </div>
              <p className="text-zinc-400 leading-relaxed font-sans">
                Paid checkouts are disabled via <code className="text-purple-300">PAYMENTS_ENABLED=false</code> until the OSMOO native desktop application is distributed. The table below represents read-only audit records of incoming webhook and processing events.
              </p>
            </div>

            <div className="rounded-2xl bg-[#0f0d19] border border-[#231f35] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#141122] text-zinc-400 border-b border-[#231f35]">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Event ID</th>
                      <th className="px-4 py-3 font-semibold">Type</th>
                      <th className="px-4 py-3 font-semibold">Provider</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Processed At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1b172a]">
                    {paymentsLoading ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                          <Loader2 className="w-5 h-5 animate-spin mx-auto text-purple-400 mb-2" />
                          <span>Auditing payment logs...</span>
                        </td>
                      </tr>
                    ) : paymentEvents.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                          Zero commercial transactions recorded during pre-launch period.
                        </td>
                      </tr>
                    ) : (
                      paymentEvents.map((evt) => (
                        <tr key={evt.id} className="hover:bg-[#141122]/50 transition-colors">
                          <td className="px-4 py-3 text-white font-mono">{evt.event_id}</td>
                          <td className="px-4 py-3 text-purple-300">{evt.event_type}</td>
                          <td className="px-4 py-3 text-zinc-400">{evt.provider}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] ${
                                evt.status === 'processed'
                                  ? 'bg-emerald-950/70 border border-emerald-800 text-emerald-300'
                                  : 'bg-red-950/70 border border-red-800 text-red-300'
                              }`}
                            >
                              {evt.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-zinc-500">
                            {new Date(evt.processed_at).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Payments Pagination */}
              <div className="p-3 bg-[#120f1e] border-t border-[#231f35] flex items-center justify-between text-xs font-mono text-zinc-400">
                <div>
                  Total events: <span className="text-white font-bold">{paymentsTotal}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={paymentsPage <= 1 || paymentsLoading}
                    onClick={() => setPaymentsPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg bg-[#181427] hover:bg-[#201b33] disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span>
                    Page {paymentsPage} of {paymentsTotalPages}
                  </span>
                  <button
                    disabled={paymentsPage >= paymentsTotalPages || paymentsLoading}
                    onClick={() => setPaymentsPage((p) => Math.min(paymentsTotalPages, p + 1))}
                    className="p-1.5 rounded-lg bg-[#181427] hover:bg-[#201b33] disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 5: AUDIT LOGS ─── */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#0f0d19] border border-[#231f35] flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-400">Security & Operational Action Trail</span>
              <span className="text-zinc-500">Last 50 recorded events</span>
            </div>

            <div className="rounded-2xl bg-[#0f0d19] border border-[#231f35] divide-y divide-[#1b172a] overflow-hidden">
              {auditLoading ? (
                <div className="p-8 text-center text-zinc-500 font-mono text-xs">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-purple-400 mb-2" />
                  <span>Loading audit trail...</span>
                </div>
              ) : auditLogs.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 font-mono text-xs">
                  No administrative audit records logged yet.
                </div>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="p-4 flex items-start justify-between gap-4 text-xs font-mono">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-purple-950/60 border border-purple-800 text-purple-300 font-bold">
                          {log.action}
                        </span>
                        {log.target_type && (
                          <span className="text-zinc-400 text-[11px]">
                            {log.target_type}:{log.target_id || ''}
                          </span>
                        )}
                      </div>
                      <div className="text-zinc-400 text-[11px]">
                        Actor: <span className="text-zinc-200">{log.admin_email}</span>
                      </div>
                    </div>
                    <div className="text-zinc-500 text-[11px] whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
