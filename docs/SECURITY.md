# OSMOO — Security Policy, Threat Model & Controls

**Status:** Security Architecture Specification  
**Project:** OSMOO (Osmiora Computational Systems)  
**Document:** `docs/SECURITY.md`  

---

## 1. Threat Modeling & Mitigation Matrix

| Threat Category | Attack Vector | Mitigation Control | Verification Method | Residual Risk |
| :--- | :--- | :--- | :--- | :--- |
| **Cross-Site Scripting (XSS)** | Injected malicious JS into user profiles, support forms, or URLs. | React 19 automatic JSX escaping; strict Content Security Policy (`script-src 'self'`); no `dangerouslySetInnerHTML`. | Static analysis (oxlint), automated Playwright security scan. | Low. Zero unvalidated DOM injection points. |
| **Cross-Site Request Forgery (CSRF)** | Malicious third-party site invoking authenticated endpoints. | `SameSite=Lax` or `Strict` session cookies; CSRF token validation on mutating POST/PUT/DELETE requests via Better Auth. | Integration test with forged Origin/Referer headers. | Very Low. |
| **SQL Injection (SQLi)** | Malicious input crafted into raw database queries. | Strict parameterized queries via Drizzle ORM; zero concatenated raw SQL strings. | Automated code review and unit tests with SQL syntax payloads. | Negligible. |
| **Broken Access Control & IDOR** | User tampering with `subscription_id` or `user_id` in API URLs. | Server-side authorization queries: all database records queried with `WHERE id = $1 AND user_id = $session.user.id`. | Automated API tests attempting cross-tenant access. | Low. Strictly enforced at the data layer. |
| **Webhook Forgery & Replay** | Attacker sending fake `payment.succeeded` events to grant free access. | Cryptographic HMAC signature verification with webhook secret timestamp tolerance (< 5 min); database-backed event idempotency table. | Automated webhook tests with tampered headers and repeated payloads. | Low. Unsigned or delayed webhooks rejected with 401/400. |
| **Credential Stuffing & Brute Force** | Automated credential spraying against `/api/auth/sign-in`. | Cloudflare Turnstile token validation; IP + email rate limiting via sliding window (5 attempts / 15 min); Argon2id hashing. | Simulated brute-force script testing 429 Too Many Requests response. | Low. Managed by Edge + Application rate limiting. |
| **Account Enumeration** | Timing attacks or different error messages on password reset/login. | Constant-time responses; identical generic message ("If an account exists, a link has been sent"). | Test verifying identical response payloads and consistent latency. | Low. |
| **Server-Side Request Forgery (SSRF)** | Exploitation of webhook callbacks or image/avatar fetching. | Outbound requests restricted; no user-supplied arbitrary URL fetching on backend server. | Architectural isolation; disallow URL proxies. | Negligible. |
| **Supply Chain Vulnerability** | Compromised npm dependency packages. | Lockfile pinning (`package-lock.json`); automated `npm audit` in CI/CD pipeline; minimal dependency footprint. | Automated CI check failing on high/critical CVEs. | Medium. Managed by frequent automated patching. |
| **Secret & Key Leakage** | Committing API keys or DB credentials to source control. | Secret detection hooks; `.gitignore` enforcement; all secrets stored in runtime environment variables. | Automated git pre-commit scan and GitHub secret scanning. | Low. |

---

## 2. Secrets Management & Environment Security

1. **Zero Secret Exposure Rule**:
   - Secrets must NEVER exist in client-side code (`VITE_` prefix must only be used for public assets/keys like Turnstile SiteKey).
   - Database credentials, payment webhook secrets, and private signing keys must reside strictly in server-side environment variables.
2. **Environment Separation**:
   - `development`: Local sandbox keys, local test database.
   - `preview`: Staging database branch, payment provider Test Mode credentials.
   - `production`: High-entropy production keys, isolated production database with restricted IP access.

---

## 3. Recommended Security Headers & Content Security Policy (CSP)

The following HTTP response headers are proposed for the Edge/Gateway:

```http
Content-Security-Policy: default-src 'self'; script-src 'self' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' https://challenges.cloudflare.com https://api.dodopayments.com; worker-src 'self' blob:; frame-src https://challenges.cloudflare.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests;
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 0
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(self)
```

### CSP Rationale & Exception Boundaries:
1. **`worker-src 'self' blob:`**: Required specifically if Draco compression (`draco_decoder.wasm` / `three-stdlib`) or Troika multi-threaded SDF glyph generators spin up inline Web Workers from object URLs (`URL.createObjectURL(blob)`).
2. **`script-src 'self' https://challenges.cloudflare.com`**: Kept strictly without `'unsafe-inline'` or `'unsafe-eval'`. WASM policies (`'wasm-unsafe-eval'`) must NOT be added globally unless Draco or custom WebAssembly modules prove strictly incompatible in staging browser console audits.
3. **CSP Runtime Verification Status**: **Pending Browser Staging Verification**. Live browser console reporting (`Content-Security-Policy-Report-Only`) must be tested with full 3D models before enforcing blocking header in production.

---

## 4. Privacy, Consent & Age-Appropriate Compliance Considerations

Because OSMOO is an AI Operating Companion serving diverse audiences across jurisdictions (India DPDP Act 2023, EU GDPR, US COPPA/state privacy laws):
1. **Verifiable Parental Consent (VPC)**: Qualified legal review is required before onboarding minors under the age of majority in target jurisdictions.
2. **Data Minimization**: OSMOO does not store unnecessary telemetry, location history, or sensitive payment instrument numbers.
3. **Right to Erasure**: Hard-delete APIs must remove user profiles, session tokens, and scrub personally identifiable references from transaction audit logs.
