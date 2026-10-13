# OSMOO — Windows Desktop Application Authentication & Entitlement Contract
**Parent Entity:** Osmiora Computational Systems  
**Canonical Domain:** `https://osmoo.in`  
**Identity Provider:** Supabase Auth (PostgreSQL backend)  
**Document Classification:** Technical Architecture & Integration Specification  

---

## 1. Executive Summary & Purpose

This contract defines the unified identity, authorization, and entitlement architecture bridging the **OSMOO Web Platform** (`https://osmoo.in`) and the **OSMOO Windows Desktop Application** (`osmoo.exe`).

### Fundamental Architectural Rules
1. **Single Identity:** A user registered on `https://osmoo.in` (via Supabase Email OTP or Google OAuth) has the exact same user identity, profile, and subscription entitlements on the Windows desktop application.
2. **No Embedded WebViews for Credentials:** The desktop application **must never** prompt for Google passwords or third-party OAuth credentials in an embedded browser or custom form. Authentication must execute in the user's default system browser using standard OAuth 2.0 with PKCE (Proof Key for Code Exchange, RFC 7636).
3. **No Client-Side Subscription Authority:** Entitlements (e.g. Free, Pro, Max, Enterprise, Founding 50) are server-authoritative and cryptographic. The desktop client cannot self-grant features; it validates signed JWT claims or queries the authenticated Supabase database protected by PostgreSQL Row Level Security (RLS).
4. **Zero Unencrypted Token Storage:** Refresh tokens and access tokens on Windows must never be saved in plaintext files (e.g. JSON in AppData or Registry). They must be secured using the **Windows Credential Locker** (`Windows.Security.Credentials.PasswordVault`) or the **Data Protection API (DPAPI)** (`CryptProtectData`).

---

## 2. Authentication Flow: Desktop ↔ Browser (PKCE Flow)

```
┌─────────────────────────────────┐                ┌───────────────────────────────┐
│     OSMOO Windows Desktop       │                │      User Default Browser     │
│          (osmoo.exe)            │                │       (Chrome/Edge/Brave)     │
└────────────────┬────────────────┘                └──────────────┬────────────────┘
                 │                                                │
   1. Generate PKCE Verifier &    │                               │
      Challenge (RFC 7636)        │                               │
                 │                                                │
   2. Open System Browser         ├──────────────────────────────>│ 3. User navigates to
      osmoo.in/auth/desktop-login │                               │    https://osmoo.in/auth/desktop-login
                                  │                               │    User chooses Google or Email OTP
                                  │                               │    Completes sign-in on osmoo.in
                                  │                               │
   5. Listen for callback via     │                               │ 4. Supabase Auth redirects browser to:
      custom URI scheme or        │<──────────────────────────────┤    osmoo://auth/callback?code=...
      loopback HTTP listener      │                               │    OR http://127.0.0.1:port/callback
                 │                                                │
   6. Exchange Code + Verifier    │
      at Supabase Auth Endpoint   │
                 │
   7. Receive JWT + Refresh Token │
      Store in Windows Credential │
      Vault (DPAPI / PasswordVault)
```

### Detailed Flow Steps:

### Step 1: Code Verifier & Challenge Generation (in `osmoo.exe`)
The desktop client generates a cryptographically random string (43 to 128 characters) as `code_verifier`, and hashes it using SHA-256 to create `code_challenge`:
$$\text{code\_challenge} = \text{Base64URLEncode}(\text{SHA256}(\text{code\_verifier}))$$

### Step 2: System Browser Launch
The application initiates the user's default browser via `Process.Start` / `ShellExecute`:
```
https://<supabase-project-id>.supabase.co/auth/v1/authorize?
  provider=google
  &response_type=code
  &client_id=<supabase-anon-key>
  &code_challenge=<code_challenge>
  &code_challenge_method=S256
  &redirect_to=osmoo://auth/callback
```
*(Or routed through `https://osmoo.in/auth/desktop?challenge=...`)*

### Step 3: Callback Interception
The desktop application supports two standard interception strategies:

#### Option A: Custom Protocol Scheme (Recommended for Native Windows Apps)
- Register `osmoo://` protocol handler in Windows Registry:
  `HKEY_CURRENT_USER\Software\Classes\osmoo\shell\open\command` -> `"C:\Program Files\OSMOO\osmoo.exe" "%1"`
- When authentication completes, the browser is redirected to:
  `osmoo://auth/callback?code=AUTH_CODE`
- The OS passes the URI arguments to `osmoo.exe`.

#### Option B: Ephemeral Loopback Web Server (Standard for CLI and Desktop)
- Application opens a temporary TCP listener on `http://127.0.0.1:PORT` (e.g. dynamic port between 49152-65535).
- Redirect URI is set to `http://127.0.0.1:PORT/callback`.
- When the redirect lands, the local HTTP listener captures the authorization code, serves a beautiful `"Login Successful — You may return to OSMOO"` HTML confirmation page, and closes the listener.

### Step 4: Token Exchange
`osmoo.exe` sends a `POST` request to Supabase Auth token endpoint:
```http
POST https://<supabase-project-id>.supabase.co/auth/v1/token?grant_type=pkce
Content-Type: application/json
apikey: <SUPABASE_ANON_KEY>

{
  "auth_code": "AUTH_CODE",
  "code_verifier": "RAW_CODE_VERIFIER"
}
```

The response returns:
- `access_token` (Short-lived JWT, 1 hour)
- `refresh_token` (Long-lived secret)
- `user` (User profile metadata and ID)

---

## 3. Secure Windows Credential Storage

Under no circumstances should tokens be stored in plaintext. The Windows application must use one of the following native APIs:

### 1. Windows Credential Locker (UWP / WinUI 3 / Modern C#)
```csharp
using Windows.Security.Credentials;

var vault = new PasswordVault();
var credential = new PasswordCredential("OSMOO_Identity", user.Email, refreshToken);
vault.Add(credential);
```

### 2. Windows Data Protection API (DPAPI) (WPF / WinForms / Rust / C++ / Go)
```csharp
using System.Security.Cryptography;
using System.Text;

byte[] rawBytes = Encoding.UTF8.GetBytes(refreshToken);
// Protect data tied specifically to current Windows user account
byte[] encryptedData = ProtectedData.Protect(
    rawBytes, 
    entropy: Encoding.UTF8.GetBytes("OSMOO_DPAPI_SALT"), 
    scope: DataProtectionScope.CurrentUser
);

File.WriteAllBytes(Path.Combine(appDataDir, "session.bin"), encryptedData);
```

---

## 4. Server-Authoritative Entitlement Verification

Once authenticated, `osmoo.exe` validates user subscription tier and capabilities:

### Querying Entitlements via Supabase Client
The desktop client attaches the `access_token` in the Authorization header (`Bearer <access_token>`).

PostgreSQL Row Level Security (RLS) ensures the desktop app can only query records belonging to `auth.uid()`:

```sql
SELECT 
  tier,
  status,
  is_founding_50,
  current_period_end
FROM user_entitlements
WHERE user_id = auth.uid();
```

### Entitlement Hierarchy:
| Tier | Offline Grace Period | AI Model Allocation | Voice Synthesis | Vision & Screen Context |
| :--- | :--- | :--- | :--- | :--- |
| **Free** | 24 Hours | Standard 3.5 class | 500 characters/day | Not Included |
| **Pro** | 7 Days | Full High-Speed Reasoners | Unlimited Realtime | Active Screen Inspection |
| **Max** | 14 Days | Dedicated Low-Latency Pool | Multi-Speaker Neural | Full Automated OS Agent |
| **Enterprise** | Custom SLA | Custom Models & On-Prem | Full Custom Synthesis | Dedicated Corporate Isolation |
| **Founding 50** | Permanent Pro Perks | Special Founding Badge | Priority Latency | Lifetime Early Access |

### Token Refresh Cycle:
1. `osmoo.exe` monitors `access_token` expiration.
2. 5 minutes before expiration, the desktop background worker requests a refreshed token using `refresh_token`.
3. If the user revokes the session on `https://osmoo.in` or their subscription lapses, the next token refresh fails, and `osmoo.exe` gracefully transitions to the Free tier or prompts to re-authenticate.

---

## 5. Security Checklist for Desktop Release Engineering

- [x] **Universal Origin Verification:** Web endpoints and desktop OAuth callbacks only accept URLs conforming to `https://osmoo.in` or `osmoo://` protocol.
- [x] **No Hardcoded Admin Keys:** Desktop builds include only the public `VITE_SUPABASE_ANON_KEY`. `SUPABASE_SERVICE_ROLE_KEY` is strictly confined to Vercel Serverless Functions.
- [x] **Binary Signing:** The Windows installer (`osmoo-setup.exe`) and executable (`osmoo.exe`) must be signed with an EV (Extended Validation) Authenticode Certificate issued to **Osmiora Computational Systems** to eliminate Microsoft SmartScreen warnings.
- [x] **Windows Defender / SmartScreen Compliance:** Application includes standard application manifest specifying `requestedExecutionLevel level="asInvoker"` (no elevated UAC required for standard companion execution).
