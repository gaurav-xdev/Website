import { describe, it, expect } from 'vitest'
import { sendSafeError } from '../../api/_lib/safeError.js'
import type { ApiResponse } from '../../api/_lib/types.js'

describe('Production Safe Error Redaction', () => {
  function createMockResponse() {
    let capturedStatus = 200
    let capturedJson: any = null

    const res = {
      status(code: number) {
        capturedStatus = code
        return res
      },
      json(data: any) {
        capturedJson = data
      },
      setHeader() {},
      send(body: any) {
        capturedJson = body
      },
    } as unknown as ApiResponse

    return {
      res,
      getStatus: () => capturedStatus,
      getJson: () => capturedJson,
    }
  }

  it('never leaks internal stack traces, SQL errors, or file paths in response payload', () => {
    const mock = createMockResponse()

    const rawError = new Error('FATAL: password authentication failed for user "postgres" at /var/app/internal/db.ts:42\nSELECT * FROM secret_keys WHERE token="sk_live_12345"')

    sendSafeError(mock.res, {
      status: 500,
      publicMessage: 'Failed to record your message. Please try again later.',
      internalError: rawError,
      context: {
        sqlQuery: 'SELECT * FROM users',
        secretKey: 'sk_live_abcdef123456789',
      },
    })

    expect(mock.getStatus()).toBe(500)
    const json = mock.getJson()

    expect(json.success).toBe(false)
    expect(json.error).toBe('Failed to record your message. Please try again later.')
    expect(json.requestId).toMatch(/^req_[0-9a-f]{16}$/)

    // Confirm that NO sensitive keywords leaked
    const payloadString = JSON.stringify(json)
    expect(payloadString).not.toContain('postgres')
    expect(payloadString).not.toContain('/var/app')
    expect(payloadString).not.toContain('secret_keys')
    expect(payloadString).not.toContain('sk_live')
    expect(payloadString).not.toContain('stack')
  })

  it('provides safe default message for unhandled 500 without publicMessage', () => {
    const mock = createMockResponse()

    sendSafeError(mock.res, {
      status: 500,
      internalError: new Error('Unexpected panic in libcore'),
    })

    const json = mock.getJson()
    expect(json.error).toBe('Something went wrong. Please try again later.')
    expect(json.requestId).toBeDefined()
  })
})
