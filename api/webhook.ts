import type { ApiRequest, ApiResponse } from './_lib/types.js'
import { processWebhookEvent } from './_lib/dodoPayments.js'
import { sendSafeError } from './_lib/safeError.js'

async function getRawBody(req: ApiRequest): Promise<string> {
  if (typeof req.body === 'string') {
    return req.body
  }
  if (Buffer.isBuffer(req.body)) {
    return req.body.toString('utf-8')
  }
  if (typeof req.body === 'object' && req.body !== null) {
    return JSON.stringify(req.body)
  }

  // Fallback: Read stream if body parser did not run
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
    })
    req.on('end', () => {
      resolve(data)
    })
    req.on('error', (err) => {
      reject(err)
    })
  })
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const rawBody = await getRawBody(req)
    if (!rawBody) {
      return res.status(400).json({ error: 'Empty webhook request body' })
    }

    const result = await processWebhookEvent(rawBody, req.headers)
    return res.status(result.status).json({ message: result.message })
  } catch (err: unknown) {
    return sendSafeError(res, {
      status: 500,
      publicMessage: 'Webhook processing error',
      internalError: err,
    })
  }
}
