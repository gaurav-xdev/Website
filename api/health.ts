import type { ApiRequest, ApiResponse } from './_lib/types.js'
import { isSupabaseAdminConfigured } from './_lib/supabaseAdmin.js'
import { isDodoConfigured, isDodoWebhookConfigured } from './_lib/dodoPayments.js'

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const resendConfigured = Boolean(
    process.env.RESEND_API_KEY &&
    process.env.RESEND_API_KEY.startsWith('re_') &&
    !process.env.RESEND_API_KEY.includes('your_resend')
  )

  return res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      supabase: isSupabaseAdminConfigured() ? 'connected' : 'unconfigured',
      dodoPayments: isDodoConfigured() ? 'live_ready' : 'setup_mode',
      dodoWebhook: isDodoWebhookConfigured() ? 'configured' : 'unconfigured',
      resendEmail: resendConfigured ? 'configured' : 'unconfigured',
    },
    version: '1.0.0',
    product: 'OSMOO — AI Operating Companion',
  })
}
