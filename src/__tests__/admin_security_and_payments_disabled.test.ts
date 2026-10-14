import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { verifyAdminCaller } from '../../api/_lib/adminAuth.js'
import { arePaymentsEnabled } from '../../api/_lib/plans.js'
import checkoutHandler from '../../api/checkout.js'
import type { ApiRequest, ApiResponse } from '../../api/_lib/types.js'

describe('Admin Security, Authorization & Pre-Launch Payment Gate', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    vi.restoreAllMocks()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  describe('Server-Side Payment Feature Flag (arePaymentsEnabled)', () => {
    it('defaults strictly to false when PAYMENTS_ENABLED is not set', () => {
      delete process.env.PAYMENTS_ENABLED
      expect(arePaymentsEnabled()).toBe(false)
    })

    it('returns false for non-"true" values like "false", "0", "disabled", "yes"', () => {
      process.env.PAYMENTS_ENABLED = 'false'
      expect(arePaymentsEnabled()).toBe(false)

      process.env.PAYMENTS_ENABLED = '0'
      expect(arePaymentsEnabled()).toBe(false)

      process.env.PAYMENTS_ENABLED = 'disabled'
      expect(arePaymentsEnabled()).toBe(false)

      process.env.PAYMENTS_ENABLED = 'True'
      expect(arePaymentsEnabled()).toBe(false)
    })

    it('returns true strictly when PAYMENTS_ENABLED === "true"', () => {
      process.env.PAYMENTS_ENABLED = 'true'
      expect(arePaymentsEnabled()).toBe(true)
    })
  })

  describe('api/checkout.ts Pre-Launch Enforcement', () => {
    function createMockRes() {
      const mock = {
        statusCode: 200,
        headers: {} as Record<string, string>,
        body: null as any,
        setHeader: vi.fn((key: string, value: string) => {
          mock.headers[key.toLowerCase()] = value
          return mock as unknown as ApiResponse
        }),
        status: vi.fn((code: number) => {
          mock.statusCode = code
          return mock as unknown as ApiResponse
        }),
        json: vi.fn((data: unknown) => {
          mock.body = data
          return mock as unknown as ApiResponse
        }),
      }
      return mock as unknown as ApiResponse & { statusCode: number; body: any; headers: Record<string, string> }
    }

    it('rejects paid pro checkout attempts with 403 when payments are disabled', async () => {
      delete process.env.PAYMENTS_ENABLED
      const req = {
        method: 'POST',
        headers: {},
        body: { planId: 'pro', billingInterval: 'month' },
      } as ApiRequest
      const res = createMockRes()

      await checkoutHandler(req, res)

      expect(res.statusCode).toBe(403)
      expect(res.body.success).toBe(false)
      expect(res.body.code).toBe('PAYMENTS_DISABLED')
      expect(res.body.paymentsDisabled).toBe(true)
      expect(res.body.error).toContain('Paid checkouts are temporarily disabled')
    })

    it('rejects paid max checkout attempts with 403 when payments are disabled', async () => {
      process.env.PAYMENTS_ENABLED = 'false'
      const req = {
        method: 'POST',
        headers: {},
        body: { planId: 'max', billingInterval: 'year' },
      } as ApiRequest
      const res = createMockRes()

      await checkoutHandler(req, res)

      expect(res.statusCode).toBe(403)
      expect(res.body.success).toBe(false)
      expect(res.body.code).toBe('PAYMENTS_DISABLED')
      expect(res.body.paymentsDisabled).toBe(true)
    })

    it('allows Free plan activation even when payments are disabled', async () => {
      delete process.env.PAYMENTS_ENABLED
      const req = {
        method: 'POST',
        headers: {},
        body: { planId: 'free' },
      } as ApiRequest
      const res = createMockRes()

      await checkoutHandler(req, res)

      expect(res.statusCode).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.planId).toBe('free')
      expect(res.body.data.checkoutUrl).toBe('/#download')
    })

    it('routes Enterprise tier requests to contact flow even when payments are disabled', async () => {
      delete process.env.PAYMENTS_ENABLED
      const req = {
        method: 'POST',
        headers: {},
        body: { planId: 'enterprise' },
      } as ApiRequest
      const res = createMockRes()

      await checkoutHandler(req, res)

      expect(res.statusCode).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.planId).toBe('enterprise')
      expect(res.body.data.checkoutUrl).toContain('#contact')
    })
  })

  describe('Admin Authentication & Authorization Gate (verifyAdminCaller)', () => {
    it('rejects requests missing Authorization header with 401', async () => {
      const req = { headers: {} } as ApiRequest
      const result = await verifyAdminCaller(req)

      expect(result.authorized).toBe(false)
      expect(result.status).toBe(401)
      expect(result.error).toContain('Missing or malformed authentication header')
    })

    it('rejects requests with malformed Authorization header with 401', async () => {
      const req = { headers: { authorization: 'Basic dXNlcjpwYXNz' } } as ApiRequest
      const result = await verifyAdminCaller(req)

      expect(result.authorized).toBe(false)
      expect(result.status).toBe(401)
    })

    it('rejects requests with empty Bearer token with 401', async () => {
      const req = { headers: { authorization: 'Bearer   ' } } as ApiRequest
      const result = await verifyAdminCaller(req)

      expect(result.authorized).toBe(false)
      expect(result.status).toBe(401)
    })

    it('returns 503 when Supabase admin is not configured', async () => {
      delete process.env.SUPABASE_SERVICE_ROLE_KEY
      delete process.env.SUPABASE_URL
      const req = { headers: { authorization: 'Bearer some-test-jwt-token' } } as ApiRequest
      const result = await verifyAdminCaller(req)

      expect(result.authorized).toBe(false)
      expect(result.status).toBe(503)
      expect(result.error).toContain('not configured')
    })
  })

  describe('Admin Migration RLS & Security Locks', () => {
    const migrationPath = path.resolve(
      process.cwd(),
      'supabase/migrations/20261014000000_admin_and_launch_hardening.sql'
    )
    const sql = fs.readFileSync(migrationPath, 'utf-8')

    it('creates admin_users table with strict RLS and grants only to service_role', () => {
      expect(sql).toContain('create table if not exists public.admin_users')
      expect(sql).toContain('alter table public.admin_users enable row level security;')
      expect(sql).toContain('revoke all on public.admin_users from anon, authenticated, public;')
      expect(sql).toContain('grant all on public.admin_users to service_role;')
    })

    it('creates admin_audit_logs table with strict RLS and grants only to service_role', () => {
      expect(sql).toContain('create table if not exists public.admin_audit_logs')
      expect(sql).toContain('alter table public.admin_audit_logs enable row level security;')
      expect(sql).toContain('revoke all on public.admin_audit_logs from anon, authenticated, public;')
      expect(sql).toContain('grant all on public.admin_audit_logs to service_role;')
    })

    it('adds status columns to contact_messages and locks down RLS', () => {
      expect(sql).toContain('add column if not exists status text not null default \'unread\';')
      expect(sql).toContain('contact_messages_status_check')
      expect(sql).toContain('alter table public.contact_messages enable row level security;')
      expect(sql).toContain('revoke all on public.contact_messages from anon, authenticated, public;')
      expect(sql).toContain('grant all on public.contact_messages to service_role;')
    })
  })

  describe('Search Engine Protection (robots.txt)', () => {
    const robotsPath = path.resolve(process.cwd(), 'public/robots.txt')
    const robotsContent = fs.readFileSync(robotsPath, 'utf-8')

    it('explicitly disallows indexing of admin and api routes', () => {
      expect(robotsContent).toContain('Disallow: /admin')
      expect(robotsContent).toContain('Disallow: /api/')
    })
  })
})
