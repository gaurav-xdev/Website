# OSMOO — Open Decisions, Governance & Unresolved Dependencies

**Status:** Governance & Tracking Document  
**Project:** OSMOO (Osmiora Computational Systems)  
**Document:** `docs/OPEN_DECISIONS.md`  

---

## 1. Unresolved Technical & Architectural Decisions

| Decision Topic | Current Recommendation | Trade-offs & Alternatives | Decision Owner | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend Framework Architecture** | Maintain Vite 8 + React 19 SPA with separate backend API | **Option A**: Vite SPA + Node API (Fastest HMR, zero SSR WebGL friction).<br>**Option B**: Next.js 15 App Router (Single deployment repository, SSR for marketing SEO). | Engineering Lead | **Awaiting Decision** |
| **Payment Provider Selection** | Primary: Dodo Payments<br>Fallback: Stripe | **Dodo Payments**: Native India UPI recurring + global tax MoR.<br>**Stripe**: Higher brand familiarity, but complex recurring compliance for Indian cards. | Finance / Founder | **Awaiting Decision** |
| **Authentication Strategy** | Better Auth with self-hosted PostgreSQL sessions | **Better Auth**: Zero vendor lock-in, full database ownership, easy device linking.<br>**Clerk / Supabase Auth**: Managed hosted service, higher recurring cost at scale. | Security Lead | **Awaiting Decision** |
| **Hosting & Deployment** | Cloudflare Pages / Vercel Edge for Web; Railway/Fly for API | **Vercel**: Seamless fullstack integration.<br>**Cloudflare + Railway**: Lower egress cost, zero compute lock-in. | DevOps Lead | **Awaiting Decision** |

---

## 2. External Dependencies, Credentials & Blockers

| Dependency Item | Current Verified Status | Required Action Before Implementation | Impact |
| :--- | :--- | :--- | :--- |
| **Domain Registration (`osmoo.in`)** | **NXDOMAIN (Unresolved via Public DNS)** | Confirm domain ownership at registrar; delegate authoritative nameservers to Cloudflare. (Note: NXDOMAIN indicates unconfigured DNS nameservers, not definitive proof of domain unregistration). | **BLOCKER** for live TLS, production custom domain, and email DKIM. |
| **Dodo Payments Merchant Account** | **Unverified / Missing Credentials** | Complete merchant verification/underwriting, KYC, and obtain Live & Test API keys + Webhook signing secret. | **BLOCKER** for live checkout and real provider webhook tests. (Mock testing remains available). |
| **Cloudflare Turnstile** | **Unverified / Missing SiteKey** | Register domain `osmoo.in` in Cloudflare Turnstile dashboard; obtain SiteKey and SecretKey. | Required for live bot protection. |
| **Database Instance (PostgreSQL 16+)** | **Unprovisioned** | Provision Neon or Supabase project; obtain pooled connection string URL. | Required for schema migrations and data persistence. |
| **Transactional Email (Resend/Postmark)** | **Unprovisioned** | Create account, add DNS SPF/DKIM verification for `@osmoo.in`. | Required for live verification emails and receipts. |

---

## 3. Legal, Privacy & Compliance Prerequisites

1. **Terms of Service & Privacy Policy**: Must be drafted and approved under Indian DPDP Act 2023 and GDPR guidelines before collecting user accounts or handling payments.
2. **Age & Consent Policy**: Because OSMOO is an AI companion, guidelines regarding minor user access and parent consent must be legally clarified.
3. **Refund & Cancellation Policy**: Clear refund terms (e.g. 14-day refund window or proration rules) must be published to satisfy payment provider merchant guidelines.
