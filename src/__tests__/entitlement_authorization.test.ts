import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { linkFounding50Account, getPaymentEventStatus } from '../../api/_lib/supabaseAdmin.js'

describe('Entitlement Function Authorization & Account Linking Security', () => {
  const migrationPath = path.resolve(
    process.cwd(),
    'supabase/migrations/20261013010000_production_remediation.sql'
  )
  const migrationSql = fs.readFileSync(migrationPath, 'utf-8')

  it('restricts get_effective_user_entitlements so authenticated users cannot query foreign user UUIDs', () => {
    expect(migrationSql).toContain('create or replace function public.get_effective_user_entitlements')
    // Asserts cross-user check
    expect(migrationSql).toMatch(/auth\.role\(\)\s*=\s*'authenticated'\s*and\s*\(auth\.uid\(\)\s*is null\s*or\s*auth\.uid\(\)\s*<>\s*target_user_id\)/)
    expect(migrationSql).toContain("raise exception 'Access denied: cannot query entitlements of another user'")
    expect(migrationSql).toContain("using errcode = '42501'")
  })

  it('sets explicit safe search_path and revokes permissions from public and anon on sensitive functions', () => {
    expect(migrationSql).toContain('set search_path = public, auth')
    expect(migrationSql).toContain(
      'revoke execute on function public.get_effective_user_entitlements(uuid) from public, anon;'
    )
    expect(migrationSql).toContain(
      'grant execute on function public.get_effective_user_entitlements(uuid) to authenticated, service_role;'
    )
  })

  it('restricts administrative allocation and cleanup functions exclusively to service_role', () => {
    expect(migrationSql).toContain(
      'revoke execute on function public.assign_founding_50_rewards() from public, anon, authenticated;'
    )
    expect(migrationSql).toContain(
      'grant execute on function public.assign_founding_50_rewards() to service_role;'
    )
    expect(migrationSql).toContain(
      'revoke execute on function public.expire_stale_founding_grants() from public, anon, authenticated;'
    )
    expect(migrationSql).toContain(
      'grant execute on function public.expire_stale_founding_grants() to service_role;'
    )
  })

  it('upgrades handle_new_user trigger to link verified Founding 50 waitlist recipients automatically', () => {
    expect(migrationSql).toContain('create or replace function public.handle_new_user()')
    expect(migrationSql).toContain('from public.early_access_requests')
    expect(migrationSql).toContain('where lower(email) = lower(new.email)')
    expect(migrationSql).toContain('and is_verified = true')
    expect(migrationSql).toContain('and is_founding_50 = true')
    expect(migrationSql).toContain('insert into public.founding_entitlements')
    expect(migrationSql).toContain('interval \'12 months\'')
    expect(migrationSql).toContain('local_neural_companion')
    expect(migrationSql).toContain('priority_inference')
    expect(migrationSql).toContain('continuous_context')
  })

  it('provides standalone link_founding_50_account RPC with strict caller authorization', () => {
    expect(migrationSql).toContain('create or replace function public.link_founding_50_account')
    expect(migrationSql).toMatch(/auth\.role\(\)\s*=\s*'authenticated'\s*and\s*\(auth\.uid\(\)\s*is null\s*or\s*auth\.uid\(\)\s*<>\s*target_user_id\)/)
    expect(migrationSql).toContain('revoke execute on function public.link_founding_50_account(uuid) from public, anon;')
    expect(migrationSql).toContain('grant execute on function public.link_founding_50_account(uuid) to authenticated, service_role;')
  })

  it('handles linkFounding50Account and getPaymentEventStatus gracefully in unconfigured mode', async () => {
    const linkResult = await linkFounding50Account('11111111-1111-1111-1111-111111111111')
    expect(linkResult.success).toBe(false)

    const statusResult = await getPaymentEventStatus('nonexistent-event')
    expect(statusResult.exists).toBe(false)
  })

  it('revokes direct public write access on waitlist, entitlements, subscriptions, and payment tables', () => {
    // Assert drop of permissive insert policies
    expect(migrationSql).toContain('drop policy if exists "Anyone can submit early access request" on public.early_access_requests;')

    // Assert revocation of all write permissions on sensitive tables
    expect(migrationSql).toContain('revoke insert, update, delete, truncate on public.early_access_requests from anon, authenticated, public;')
    expect(migrationSql).toContain('revoke insert, update, delete, truncate on public.founding_entitlements from anon, authenticated, public;')
    expect(migrationSql).toContain('revoke insert, update, delete, truncate on public.entitlements from anon, authenticated, public;')
    expect(migrationSql).toContain('revoke insert, update, delete, truncate on public.subscriptions from anon, authenticated, public;')
    expect(migrationSql).toContain('revoke insert, update, delete, truncate on public.payment_events from anon, authenticated, public;')

    // Assert operational grants to service_role
    expect(migrationSql).toContain('grant all on public.early_access_requests to service_role;')
    expect(migrationSql).toContain('grant all on public.founding_entitlements to service_role;')
    expect(migrationSql).toContain('grant all on public.entitlements to service_role;')
    expect(migrationSql).toContain('grant all on public.subscriptions to service_role;')
    expect(migrationSql).toContain('grant all on public.payment_events to service_role;')
  })

  it('restricts verify_early_access_token RPC exclusively to service_role', () => {
    expect(migrationSql).toContain(
      'revoke execute on function public.verify_early_access_token(text) from public, anon, authenticated;'
    )
    expect(migrationSql).toContain(
      'grant execute on function public.verify_early_access_token(text) to service_role;'
    )
  })
})

