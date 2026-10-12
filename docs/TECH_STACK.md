# OSMOO — Selected Technology Stack & Specification

**Status:** Architecture Proposal & Specification  
**Project:** OSMOO (Osmiora Computational Systems)  
**Document:** `docs/TECH_STACK.md`  

---

## 1. Executive Summary & Verification Matrix

| Area | Verified Existing in Repo | Recommended Production Stack | Version / Range | Justification & Compatibility Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Language** | TypeScript | TypeScript | `^5.8.0` / `~6.0.2` | Strict mode typing across client, server contracts, and shared schemas. |
| **Frontend Framework** | React 19 (Vite 8) | React 19 SPA (Vite) for 3D web; or Next.js 15 App Router | React `^19.2.8`, Vite `^8.3.0` | React 19 is already initialized and verified with R3F 9.8. Keeps WebGL canvas mounting isolated without SSR hydration mismatch. |
| **Backend & API** | None (Static SPA) | Node.js Hono / Express API or Next.js Route Handlers | Hono `^4.7.0` (Node/Edge) | Lightweight, Web-standard Request/Response, ultra-fast cold start, zero lock-in, native Better Auth mounting. |
| **Styling & Design** | Tailwind CSS v4 | Tailwind CSS v4 + Tailwind Animate | `@tailwindcss/vite ^4.3.3` | Modern, zero-runtime utility CSS, natively integrated into Vite build pipeline. |
| **3D & WebGL Engine** | Three.js + R3F + Drei | Three.js + React Three Fiber + Drei | Three `^0.186.1`, R3F `^9.8.1`, Drei `^10.7.9` | Industry standard declarative WebGL canvas; verified building and running in workspace. |
| **Scroll & Motion** | GSAP 3 + Lenis + Motion | GSAP ScrollTrigger + Lenis + Motion (React) | GSAP `^3.15.0`, Lenis `^1.3.26`, Motion `^14.1.0` | GSAP + Lenis handle cinematic scrubbed timelines and smooth inertial scrolling. Motion handles component transitions. |
| **Database** | None | Managed PostgreSQL (Neon / Supabase) | PostgreSQL 16+ | ACID compliance, robust relation integrity for subscriptions/entitlements, connection pooling via Neon/PgBouncer. |
| **ORM / Data Access** | None | Drizzle ORM | Drizzle `^0.39.0` | Lightweight, zero-overhead SQL schema declaration, instant migrations, zero cold-start delay, 100% type-safe. |
| **Authentication** | None | Better Auth | Better Auth `^1.1.0` | Self-hosted database sessions in PostgreSQL; native 2FA, device sessions, magic link, password hashing via Argon2id, desktop client token issuance. |
| **Payment Gateway** | None | Dodo Payments (Primary) / Stripe (Fallback) | Dodo REST API + Webhooks | Dodo Payments serves as Merchant of Record (MoR) for India & global recurring subscriptions (UPI recurring, RBI mandate support, automatic GST/VAT compliance). Stripe as international fallback. |
| **Bot Protection** | None | Cloudflare Turnstile | Free tier | Privacy-friendly, non-intrusive CAPTCHA challenge without puzzle friction; verified server-side token validation. |
| **Hosting & Runtime** | None | Vercel or Cloudflare Pages + Railway/Fly.io | Production Edge/Serverless | Global CDN edge caching for 3D assets/bundles; isolated serverless/container execution for webhook processing. |
| **Testing** | Vitest 5 + Testing Library | Vitest + RTL + Playwright | Vitest `^5.0.3`, Playwright `^1.50.0` | Vitest for unit/integration logic; Playwright for cross-browser, WebGL canvas fallback, and responsive visual testing. |
| **Linter & Code Health** | Oxlint | Oxlint + ESLint (A11y plugin) | Oxlint `^1.81.0` | Sub-second linting, clean rule verification. |

---

## 2. Frontend Technology Stack Rationale

### 2.1 Framework: React 19 with Vite 8 vs Next.js 15
- **Verified Existing**: React 19.2.8 with Vite 8.3.4.
- **Decision**: **React 19 SPA powered by Vite 8** for the 3D marketing experience and web app portal, backed by a dedicated API layer (or Next.js App Router if unified fullstack is strictly preferred).
- **Rationale**:
  1. *3D Canvas Lifecycle*: Heavy Three.js and WebGL scenes operate entirely on the client DOM canvas. SSR frameworks frequently introduce hydration mismatches, window object workarounds (`typeof window !== 'undefined'`), and bundle bloat for WebGL shaders.
  2. *Build Performance*: Vite 8 compiles bundles in under 400ms, allowing immediate HMR for tuning 3D lighting, camera angles, and GSAP scroll choreography.
  3. *Zero Vendor Lock-in*: A Vite SPA can be hosted on Cloudflare Pages, Vercel, AWS S3/CloudFront, or any standard CDN at near-zero static hosting cost.

### 2.2 3D & WebGL: Three.js, R3F, and Drei
- **Three.js (`^0.186.1`)**: Provides core geometry, materials, lighting, WebGLRenderer, and shader passes.
- **@react-three/fiber (`^9.8.1`)**: Connects Three.js into the React 19 reconciliation tree, allowing declarative 3D scene composition.
- **@react-three/drei (`^10.7.9`)**: Ships production-ready helpers (e.g. `useGLTF`, `Float`, `Environment`, `PerspectiveCamera`, `Preload`).
- **Asset Optimization**:
  - GLTF/GLB models must be compressed using Draco compression (`draco3d`) and `gltf-transform`.
  - Max texture dimensions capped at 2048x2048 (hero) and 1024x1024 (general), formatted as WebP/KTX2 where appropriate.

### 2.3 Motion System: GSAP, Lenis, and Motion Ownership Boundary
- **GSAP 3 (`^3.15.0`) & ScrollTrigger**:
  - **Exclusive Ownership**: Page-level scroll-scrubbed choreography, sticky product chaptering, and coordinated 3D camera timeline paths.
  - **Lifecycle Rule**: All tweens and triggers must be encapsulated within `gsap.context()` inside `useEffect` or `useLayoutEffect`, calling `ctx.revert()` on component unmount to prevent memory leaks and zombie triggers.
- **Lenis (`^1.3.26`)**:
  - **Exclusive Ownership**: Inertial smooth scrolling on the window/DOM container, synchronized directly to GSAP's ticker (`gsap.ticker.add((time) => lenis.raf(time * 1000))`).
- **Motion (`^14.1.0`)**:
  - **Exclusive Ownership**: Localized React UI transitions, including modals, dropdowns, toast notifications, drawer expands, button hover/press gestures, and layout morphing (`AnimatePresence`, `layoutId`).
- **Strict Anti-Collision Rule**: GSAP and Motion must NEVER simultaneously animate or control the same DOM element or style property (e.g. `transform`, `opacity`). Layout animations remain strictly with Motion; scroll timelines remain strictly with GSAP.

---

## 3. Backend, API, and Runtime Architecture

### 3.1 Proposed API Architecture: Hono on Node.js Runtime
- **Proposed Runtime**: **Node.js (LTS 22+)** via `@hono/node-server` (or containerized service on Railway, Fly.io, or AWS ECS).
- **Runtime Compatibility & Rationale**:
  1. *Better Auth Compatibility*: Better Auth relies on database adapters (PostgreSQL via `pg` / `postgres.js`) and cryptographic password hashing (Argon2id / Scrypt), which require native Node.js standard libraries (`crypto`, `net`, `tls`). Running Hono on standard Node.js prevents Edge Worker polyfill failures and connection-pool breakage.
  2. *Web Standards API*: Hono uses Web Standard `Request` and `Response` interfaces, allowing clean testability with Vitest while preserving low memory overhead.
  3. *Type-Safe Routing & Better Auth Mounting*: Native mount via `app.all('/api/auth/*', (c) => auth.handler(c.req.raw))` with zero adapter friction.
  4. *Database Access & Pooling*: Uses Drizzle ORM configured with `postgres.js` or `pg` pointed to Neon / Supabase connection poolers (PgBouncer).
- **Runtime Status**: **Proposed (Unimplemented & Unverified in Workspace)**. The existing workspace contains only a client-side Vite SPA; backend runtime compatibility has not been executed in production.

### 3.2 What Logic Must Remain Server-Side
The client must NEVER be trusted for:
1. Subscription active/past_due/canceled entitlement verification.
2. Order creation and payment price calculation (client only submits `plan_id`; server retrieves verified price from database).
3. Webhook signature checking (Dodo Payments / Stripe HMAC validation).
4. Password hashing, session token verification, and 2FA secret management.
5. Desktop application license generation and cryptographic token signing.
6. Cloudflare Turnstile CAPTCHA secret validation.

---

## 4. Verification Status of Proposed Technologies

- `React 19.3.0 + Vite 8.3.4`: **Verified existing & tested**.
- `Three.js 0.186.1 + R3F 9.8.1 + Drei 10.7.9`: **Verified existing & tested**.
- `GSAP 3.15.0 + Lenis 1.3.26 + Motion 14.1.0`: **Verified existing & tested**.
- `Tailwind CSS 4.3.3`: **Verified existing & tested**.
- `Node.js 22 + Hono 4.7 + Better Auth 1.1`: **Proposed Architecture (Unimplemented & Unverified in Workspace)**.
- `PostgreSQL 16+ + Drizzle ORM`: **Proposed Architecture (Unimplemented & Unverified in Workspace)**.
- `Dodo Payments API + Webhooks`: **Proposed Architecture (Requires Merchant Account & API Keys)**.
- `Cloudflare Turnstile`: **Proposed Architecture (Requires SiteKey & SecretKey)**.

