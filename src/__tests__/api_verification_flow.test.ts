import { describe, it, expect } from 'vitest'
import verifyHandler from '../../api/verify-early-access.js'
import resendHandler from '../../api/resend-verification.js'
import type { ApiRequest, ApiResponse } from '../../api/_lib/types.js'

function createMockHttp(options: {
  method: string
  url?: string
  body?: any
  headers?: Record<string, string>
}) {
  let statusCode = 200
  let responseData: any = null
  let headers: Record<string, string> = {}

  const req = {
    method: options.method,
    url: options.url || '/',
    body: options.body,
    headers: {
      'x-forwarded-for': '127.0.0.1',
      ...(options.headers || {}),
    },
  } as unknown as ApiRequest

  const res = {
    status(code: number) {
      statusCode = code
      return res
    },
    json(data: any) {
      responseData = data
    },
    setHeader(key: string, val: string) {
      headers[key] = val
    },
    send(data: any) {
      responseData = data
    },
  } as unknown as ApiResponse

  return {
    req,
    res,
    getStatus: () => statusCode,
    getData: () => responseData,
    getHeaders: () => headers,
  }
}

describe('Verify & Resend Verification Serverless API', () => {
  describe('GET/POST /api/verify-early-access', () => {
    it('rejects unsupported HTTP methods (including GET) with 405 Method Not Allowed', async () => {
      const mockGet = createMockHttp({ method: 'GET', url: '/api/verify-early-access' })
      await verifyHandler(mockGet.req, mockGet.res)
      expect(mockGet.getStatus()).toBe(405)
      expect(mockGet.getData().error).toMatch(/Method Not Allowed/i)

      const mockDelete = createMockHttp({ method: 'DELETE' })
      await verifyHandler(mockDelete.req, mockDelete.res)
      expect(mockDelete.getStatus()).toBe(405)
    })

    it('rejects requests missing token parameter with 400 Bad Request', async () => {
      const mock = createMockHttp({ method: 'POST', body: {} })
      await verifyHandler(mock.req, mock.res)

      expect(mock.getStatus()).toBe(400)
      expect(mock.getData().status).toBe('invalid')
      expect(mock.getData().error).toMatch(/token/i)
    })

    it('rejects malformed or short tokens with 400 Bad Request', async () => {
      const mock = createMockHttp({
        method: 'POST',
        body: { token: 'short_token' },
      })
      await verifyHandler(mock.req, mock.res)

      expect(mock.getStatus()).toBe(400)
      expect(mock.getData().status).toBe('invalid')
    })

    it('rejects non-hexadecimal tokens to prevent injection attempts', async () => {
      const mock = createMockHttp({
        method: 'POST',
        body: { token: 'g'.repeat(64) }, // 'g' is not hex
      })
      await verifyHandler(mock.req, mock.res)

      expect(mock.getStatus()).toBe(400)
      expect(mock.getData().status).toBe('invalid')
    })
  })

  describe('POST /api/resend-verification', () => {
    it('rejects invalid email formats with 400 Bad Request', async () => {
      const mock = createMockHttp({
        method: 'POST',
        body: { email: 'invalid-email' },
      })
      await resendHandler(mock.req, mock.res)

      expect(mock.getStatus()).toBe(400)
      expect(mock.getData().error).toBe('Validation failed')
    })

    it('protects against email enumeration when address does not exist', async () => {
      const mock = createMockHttp({
        method: 'POST',
        body: { email: 'nonexistent.user.audit@osmoo.in' },
      })
      await resendHandler(mock.req, mock.res)

      // Must return HTTP 200 with generic confirmation so attackers cannot harvest registered emails
      expect(mock.getStatus()).toBe(200)
      expect(mock.getData().success).toBe(true)
      expect(mock.getData().message).toContain('If an early access registration exists')
    })
  })
})
