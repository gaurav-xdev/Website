import crypto from 'node:crypto'

export interface VerificationTokenPayload {
  token: string
  tokenHash: string
  expiresAt: string // ISO string
}

/**
 * Generates a high-entropy, 256-bit cryptographic token.
 * Returns the raw token (to be sent via email only) and its SHA-256 hash (to be stored in DB).
 */
export function generateVerificationToken(expiryMinutes = 60): VerificationTokenPayload {
  const token = crypto.randomBytes(32).toString('hex')
  const tokenHash = hashVerificationToken(token)
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000).toISOString()

  return { token, tokenHash, expiresAt }
}

/**
 * Hashes a token using SHA-256 for secure constant-time DB lookup
 */
export function hashVerificationToken(token: string): string {
  return crypto.createHash('sha256').update(token.trim()).digest('hex')
}

export interface SendVerificationEmailParams {
  email: string
  firstName?: string
  verificationUrl: string
  isFounding50Eligible?: boolean
}

export interface EmailDispatchResult {
  sent: boolean
  id?: string
  error?: string
  simulated?: boolean
  reason?: string
}

/**
 * Sends the early access verification email via Resend transactional email API.
 * Never throws; returns status object. Never leaks API keys.
 */
export async function sendEarlyAccessVerificationEmail(
  params: SendVerificationEmailParams
): Promise<EmailDispatchResult> {
  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

  if (!apiKey || !apiKey.startsWith('re_') || apiKey.includes('your_resend')) {
    return {
      sent: false,
      simulated: true,
      reason: 'Resend API key not configured or placeholder detected',
    }
  }

  const subject = params.isFounding50Eligible
    ? 'Verify your email to secure your Founding 50 spot — OSMOO'
    : 'Verify your email for OSMOO Early Access'

  const greeting = params.firstName ? `Hi ${params.firstName},` : 'Hello,'

  const foundingBanner = params.isFounding50Eligible
    ? `\n★ THE FOUNDING 50: You are currently queued for 12 months of OSMOO Pro complimentary access. Verify your email to lock in your eligibility!\n`
    : ''

  const textBody = `${greeting}\n
Thank you for joining the OSMOO Early Access Waitlist.
${foundingBanner}
Please verify your email address by clicking the link below:
${params.verificationUrl}

This verification link will expire in 60 minutes.

If you did not request early access for OSMOO, please disregard this email.

— Osmiora Computational Systems
https://osmoo.in
`

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OSMOO Early Access Verification</title>
</head>
<body style="background-color: #07080a; color: #ebeaef; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 40px 20px;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #121118; border: 1px solid #282535; border-radius: 16px; overflow: hidden; padding: 36px 32px; box-shadow: 0 10px 40px rgba(0,0,0,0.6);">
    <tr>
      <td>
        <div style="font-size: 18px; font-weight: 800; letter-spacing: 0.1em; color: #ffffff; text-transform: uppercase; margin-bottom: 24px;">
          OSMOO
        </div>

        <h1 style="font-size: 22px; font-weight: 700; color: #ffffff; margin: 0 0 16px 0; line-height: 1.25;">
          Verify your email address
        </h1>

        <p style="font-size: 14px; line-height: 1.6; color: #9e9ca5; margin: 0 0 20px 0;">
          ${greeting} Thank you for requesting early access to OSMOO — the AI operating companion integrated into your workspace.
        </p>

        ${
          params.isFounding50Eligible
            ? `
        <div style="background: rgba(168, 85, 247, 0.12); border: 1px solid rgba(168, 85, 247, 0.35); border-radius: 12px; padding: 16px; margin: 0 0 24px 0;">
          <div style="font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #c084fc; margin-bottom: 4px;">
            ★ The Founding 50 Priority
          </div>
          <p style="font-size: 13px; color: #e9d5ff; margin: 0; line-height: 1.5;">
            You are queued for the <strong>Founding 50</strong> benefit: 12 months of OSMOO Pro complimentary upon launch. Verify your email to finalize eligibility.
          </p>
        </div>`
            : ''
        }

        <div style="text-align: center; margin: 32px 0;">
          <a href="${params.verificationUrl}" style="display: inline-block; background-color: #ffffff; color: #0a0a0c; font-size: 14px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 9999px; box-shadow: 0 4px 20px rgba(255,255,255,0.25);">
            Verify My Email & Confirm Spot
          </a>
        </div>

        <p style="font-size: 12px; line-height: 1.5; color: #6e6d78; margin: 24px 0 0 0; word-break: break-all;">
          Or paste this link into your browser:<br>
          <a href="${params.verificationUrl}" style="color: #a855f7; text-decoration: underline;">${params.verificationUrl}</a>
        </p>

        <p style="font-size: 11px; line-height: 1.5; color: #52515b; margin: 24px 0 0 0; border-top: 1px solid #1f1d29; padding-top: 20px;">
          This link will expire in 60 minutes. If you did not request early access, you can safely ignore this email.<br><br>
          © ${new Date().getFullYear()} Osmiora Computational Systems. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: params.email,
        subject,
        text: textBody,
        html: htmlBody,
      }),
    })

    const data = await res.json() as { id?: string; message?: string; name?: string; statusCode?: number }

    if (!res.ok) {
      return {
        sent: false,
        error: data.message || `Resend error (${res.status})`,
      }
    }

    return {
      sent: true,
      id: data.id,
    }
  } catch (err: unknown) {
    return {
      sent: false,
      error: err instanceof Error ? err.message : 'Network error reaching Resend',
    }
  }
}
