# OSMOO — System Architecture & Component Interactions

**Status:** Architecture Specification  
**Project:** OSMOO (Osmiora Computational Systems)  
**Document:** `docs/ARCHITECTURE.md`  

---

## 1. System Topology Overview

OSMOO is designed as a distributed, secure system bridging high-performance marketing/onboarding web experiences, a resilient subscription/entitlement backend, and future desktop application clients.

```mermaid
flowchart TD
    subgraph ClientLayer["Client Layer"]
        Browser["User Web Browser\n(React 19 + Three.js + GSAP)"]
        DesktopApp["OSMOO Desktop Companion\n(Native / Electron Client)"]
    end

    subgraph EdgeCDN["Edge & CDN Gateway (Cloudflare / Vercel Edge)"]
        WAF["WAF & DDoS Shield"]
        AssetCache["Edge Static Asset Cache\n(HTML, JS, Shaders, 3D GLTF)"]
        RateLimiter["IP Rate Limiter & Geo-Rules"]
    end

    subgraph APILayer["Backend API Gateway (Node.js LTS 22+ / Hono Server)"]
        AuthModule["Better Auth Engine\n(Sessions, 2FA, Magic Links)"]
        PaymentModule["Payment & Entitlements\n(Dodo Payments / Stripe)"]
        LicenseModule["Desktop Activation & License Service"]
        TurnstileValidator["Turnstile Challenge Validator"]
    end

    subgraph DataLayer["Data & Persistence Tier"]
        PostgresDB[("Managed PostgreSQL 16+\n(Neon / Supabase)\nUsers, Subs, Audit Logs")]
        ConnectionPool["PgBouncer / Connection Pooler"]
    end

    subgraph ExternalServices["External Partner Infrastructure (Proposed / Pending Credentials)"]
        DodoPay["Dodo Payments / Stripe\n(Merchant of Record)"]
        TurnstileAPI["Cloudflare Turnstile API"]
        TransactionalEmail["Resend / Postmark\n(Verification & Invoices)"]
        Sentry["Sentry Error Tracking"]
    end

    Browser -->|HTTPS / Assets| EdgeCDN
    EdgeCDN --> AssetCache
    EdgeCDN -->|Dynamic API Requests| APILayer

    DesktopApp -->|License Activation & Sync| APILayer

    APILayer --> AuthModule
    APILayer --> PaymentModule
    APILayer --> LicenseModule
    APILayer --> TurnstileValidator

    AuthModule --> ConnectionPool --> PostgresDB
    PaymentModule --> ConnectionPool --> PostgresDB
    LicenseModule --> ConnectionPool --> PostgresDB

    PaymentModule <-->|Signed Webhooks & Checkout| DodoPay
    TurnstileValidator -->|Secret Verification| TurnstileAPI
    AuthModule -->|Magic Links & Notifications| TransactionalEmail
    APILayer -.->|Crash Reports & Spans| Sentry
```

---

## 2. Component Interaction & Data Flows

### 2.1 Web Presentation & 3D Canvas Mounting Flow
1. **Initial Page Delivery**: The user's browser requests `https://osmoo.in`. Cloudflare / Vercel Edge serves the pre-compressed HTML shell, CSS, and hashed JS chunks (`stale-while-revalidate`).
2. **Smooth Scroll & Animation Binding**:
   - `Lenis` initializes the smooth scrolling context on window DOM.
   - `GSAP ScrollTrigger` registers callbacks hooked into `Lenis`'s requestAnimationFrame (RAF) ticker.
3. **WebGL Canvas Initialization**:
   - `Canvas` mounts asynchronously without blocking primary hero text rendering.
   - WebGL capability detection tests for `WebGL2RenderingContext`.
   - If WebGL fails or crashes, a graceful CSS poster fallback renders.
   - 3D assets (Draco-compressed `.glb`, environment maps) load progressively using Drei's `useGLTF.preload`.

---

### 2.2 User Registration & Authentication Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as User Browser
    participant Edge as Edge CDN / WAF
    participant API as Hono API Gateway
    participant Turnstile as Cloudflare Turnstile
    participant DB as PostgreSQL Database
    participant Email as Email Service (Resend)

    User->>User: Solves Turnstile challenge widget
    User->>Edge: POST /api/auth/sign-up (Email, Password/MagicLink, TurnstileToken)
    Edge->>API: Route to Auth Handler
    API->>Turnstile: Verify TurnstileToken (Secret Key)
    Turnstile-->>API: { success: true }
    alt Turnstile verification failed
        API-->>User: 400 Bad Request (Invalid verification challenge)
    else Challenge passed
        API->>DB: Query existing user (anti-enumeration check)
        API->>DB: Insert User (Argon2id hashed password) + create pending verification token
        API->>Email: Send verification link / OTP
        API-->>User: 201 Created (Check inbox for verification)
    end
```

---

### 2.3 Subscription Checkout & Webhook Entitlement Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Authenticated User
    participant App as OSMOO Frontend
    participant API as OSMOO API Backend
    participant Dodo as Dodo Payments API
    participant DB as PostgreSQL Database

    User->>App: Clicks "Subscribe to Pro Plan"
    App->>API: POST /api/checkout/session (plan_id: "plan_pro_monthly")
    API->>API: Validate session & fetch authoritative price from DB
    API->>Dodo: Create Checkout Session (customer_email, plan_id, return_url)
    Dodo-->>API: { checkout_url: "https://checkout.dodopayments.com/..." }
    API-->>App: { checkout_url }
    App->>User: Redirects user to Dodo Payments Checkout

    User->>Dodo: Completes payment (UPI / Card / NetBanking)
    Dodo-->>User: Redirects back to return_url (Pending confirmation state)

    par Asynchronous Webhook Processing
        Dodo->>API: POST /api/webhooks/dodo (Headers: webhook-signature, webhook-id)
        API->>API: Verify HMAC signature using Webhook Secret
        alt Invalid Signature
            API-->>Dodo: 401 Unauthorized
        else Valid Signature
            API->>DB: Check idempotency table (event_id)
            alt Event already processed
                API-->>Dodo: 200 OK (Duplicate acknowledged)
            else New Event
                API->>DB: Begin Database Transaction
                API->>DB: Upsert Subscriptions (status: 'active', current_period_end)
                API->>DB: Record Transaction Log (payment_id, amount, status)
                API->>DB: Record processed webhook_events (event_id)
                API->>DB: Commit Transaction
                API-->>Dodo: 200 OK
            end
        end
    end
```

---

### 2.4 Desktop Companion Device Linking Flow
1. **Device Identification**: The OSMOO desktop app generates an ephemeral device code and hardware fingerprint.
2. **Browser Pairing**: The user visits `https://osmoo.in/pair` while logged in and enters the device code.
3. **Cryptographic Token Issuance**: The server verifies the active subscription, writes a `device_sessions` record, and returns a signed Ed25519 or JWT refresh token to the desktop app.
4. **Heartbeat & Entitlement Check**: The desktop application periodically checks entitlement validity with the server every 24 hours. If canceled or past due, access gracefully downgrades.
