-- ==============================================================================
-- OSMOO Migration: 20261013000000_founding_50_hard_cap_expiry.sql
-- Description:
-- 1. Create dedicated founding_entitlements table with strict audit metadata,
--    12-month calculated expiration (grant_timestamp + 12 months), and unique
--    constraint per user to prevent duplicate founding rewards.
-- 2. Upgrade assign_founding_50_rewards() to enforce strict 50 hard cap,
--    atomic advisory locking, and grant creation.
-- 3. Implement get_founding_50_status() to provide database-authoritative
--    remaining slots and cap status.
-- 4. Implement request-time user entitlement evaluation function:
--    get_effective_user_entitlements(target_user_id) which separates paid Pro
--    from Founding Pro and enforces expiry immediately.
-- 5. Implement idempotent maintenance job: expire_stale_founding_grants().
-- ==============================================================================

-- 1. Dedicated Founding Entitlements Table
create table if not exists public.founding_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  waitlist_request_id uuid references public.early_access_requests(id) on delete set null,
  entitlement_source text not null default 'founding_50',
  tier text not null default 'pro',
  status text not null default 'active', -- 'active' | 'expired' | 'revoked'
  granted_at timestamptz not null default timezone('utc'::text, now()),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  revocation_reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  -- Strictly enforce one founding entitlement per authenticated user
  constraint unique_user_founding_grant unique (user_id)
);

comment on table public.founding_entitlements is 'Authoritative ledger of Founding 50 12-month Pro grants with strict expiration and audit trail.';

-- Indexes for performance and expiration queries
create index if not exists founding_entitlements_user_id_idx on public.founding_entitlements(user_id);
create index if not exists founding_entitlements_status_expires_idx on public.founding_entitlements(status, expires_at);

-- Enable RLS
alter table public.founding_entitlements enable row level security;

-- Users can view their own founding entitlement status
drop policy if exists "Users can view own founding entitlement" on public.founding_entitlements;
create policy "Users can view own founding entitlement"
  on public.founding_entitlements
  for select
  to authenticated
  using ( (select auth.uid()) = user_id );

-- Insert/Update/Delete restricted strictly to service_role (backend RPCs)


-- 2. Function to Get Authoritative Remaining Founding 50 Slots (Public/Anon/Auth)
create or replace function public.get_founding_50_status()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  max_cap constant integer := 50;
  allocated_count integer;
  remaining_slots integer;
  is_capped boolean;
begin
  -- Total allocated is the number of confirmed founding members in early_access_requests
  -- or registered founding_entitlements
  select count(*) into allocated_count
  from public.early_access_requests
  where is_founding_50 = true;

  remaining_slots := greatest(0, max_cap - allocated_count);
  is_capped := (remaining_slots <= 0);

  return jsonb_build_object(
    'total_capacity', max_cap,
    'allocated_count', allocated_count,
    'remaining_slots', remaining_slots,
    'is_full', is_capped
  );
end;
$$;

-- Grant execute to anon and authenticated
grant execute on function public.get_founding_50_status() to anon, authenticated, service_role;


-- 3. Atomic Allocation Procedure Under Concurrency Lock
create or replace function public.assign_founding_50_rewards()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  max_founding_count constant integer := 50;
  current_count integer;
  remaining_slots integer;
  cand record;
  cand_user_id uuid;
  grant_now timestamptz;
  grant_expiry timestamptz;
begin
  -- 1. Acquire transaction-level advisory mutex to serialize concurrent allocation calls
  perform pg_advisory_xact_lock(hashtext('osmoo_founding_50_allocation_mutex'));

  -- 2. Count already confirmed founding 50 members under serialized protection
  select count(*) into current_count
  from public.early_access_requests
  where is_founding_50 = true;

  if current_count < max_founding_count then
    remaining_slots := max_founding_count - current_count;

    -- Iterate deterministically over earliest verified signups
    for cand in
      select id, email, created_at, verified_at
      from public.early_access_requests
      where is_verified = true and is_founding_50 = false
      order by coalesce(verified_at, created_at) asc
      limit remaining_slots
      for update skip locked
    loop
      grant_now := timezone('utc'::text, now());
      grant_expiry := grant_now + interval '12 months';

      -- Mark early_access_requests
      update public.early_access_requests
      set is_founding_50 = true,
          founding_50_granted_at = grant_now
      where id = cand.id;

      -- If an auth.user exists matching this email, link and grant 12-month Pro entitlement
      select id into cand_user_id
      from auth.users
      where lower(email) = lower(cand.email)
      limit 1;

      if cand_user_id is not null then
        -- Insert into founding_entitlements with exact 12-month expiry
        insert into public.founding_entitlements (
          user_id,
          waitlist_request_id,
          entitlement_source,
          tier,
          status,
          granted_at,
          expires_at,
          metadata
        )
        values (
          cand_user_id,
          cand.id,
          'founding_50',
          'pro',
          'active',
          grant_now,
          grant_expiry,
          jsonb_build_object('waitlist_email', cand.email, 'verified_at', cand.verified_at)
        )
        on conflict (user_id) do nothing;

        -- Also ensure feature flags are active in public.entitlements
        insert into public.entitlements (user_id, feature_key, is_enabled)
        values
          (cand_user_id, 'local_neural_companion', true),
          (cand_user_id, 'priority_inference', true),
          (cand_user_id, 'continuous_context', true)
        on conflict (user_id, feature_key)
        do update set is_enabled = true, updated_at = grant_now;
      end if;
    end loop;
  end if;
end;
$$;


-- 4. Request-Time Entitlement Evaluation (Coexistence of Paid Pro and Founding Pro)
create or replace function public.get_effective_user_entitlements(target_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  now_utc timestamptz := timezone('utc'::text, now());
  has_active_paid_sub boolean := false;
  paid_sub_record record;
  founding_record record;
  has_valid_founding boolean := false;
  effective_tier text := 'free';
  pro_source text := null;
  pro_expires_at timestamptz := null;
begin
  -- A. Check for actively valid paid subscription
  select * into paid_sub_record
  from public.subscriptions
  where user_id = target_user_id
    and status in ('active', 'trialing')
    and (current_period_end is null or current_period_end > now_utc)
  order by created_at desc
  limit 1;

  if found then
    has_active_paid_sub := true;
    effective_tier := coalesce(paid_sub_record.plan_id, 'pro');
    pro_source := 'paid_subscription';
    pro_expires_at := paid_sub_record.current_period_end;
  end if;

  -- B. Check Founding 50 entitlement
  select * into founding_record
  from public.founding_entitlements
  where user_id = target_user_id
    and status = 'active'
    and expires_at > now_utc
  limit 1;

  if found then
    has_valid_founding := true;
    -- If no paid sub or if founding expires after current paid period, record details
    if not has_active_paid_sub then
      effective_tier := 'pro';
      pro_source := 'founding_50';
      pro_expires_at := founding_record.expires_at;
    end if;
  end if;

  return jsonb_build_object(
    'user_id', target_user_id,
    'effective_tier', effective_tier,
    'is_pro', (effective_tier in ('pro', 'max', 'enterprise')),
    'has_paid_subscription', has_active_paid_sub,
    'has_founding_50', has_valid_founding,
    'active_source', pro_source,
    'expires_at', pro_expires_at,
    'evaluated_at', now_utc
  );
end;
$$;

grant execute on function public.get_effective_user_entitlements(uuid) to authenticated, service_role;


-- 5. Idempotent Scheduled Cleanup: Expire Stale Founding Grants
create or replace function public.expire_stale_founding_grants()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  now_utc timestamptz := timezone('utc'::text, now());
  expired_count integer := 0;
  rec record;
  has_paid boolean;
begin
  -- Find active founding grants whose expires_at is in the past
  for rec in
    select id, user_id, expires_at
    from public.founding_entitlements
    where status = 'active'
      and expires_at <= now_utc
    for update
  loop
    -- Mark founding grant expired (never delete history)
    update public.founding_entitlements
    set status = 'expired',
        updated_at = now_utc
    where id = rec.id;

    expired_count := expired_count + 1;

    -- Check if user has a separate active paid subscription
    select exists (
      select 1 from public.subscriptions
      where user_id = rec.user_id
        and status in ('active', 'trialing')
        and (current_period_end is null or current_period_end > now_utc)
    ) into has_paid;

    -- If no paid subscription exists, turn off priority features in public.entitlements
    if not has_paid then
      update public.entitlements
      set is_enabled = false,
          updated_at = now_utc
      where user_id = rec.user_id
        and feature_key in ('priority_inference', 'continuous_context');
    end if;
  end loop;

  return expired_count;
end;
$$;

grant execute on function public.expire_stale_founding_grants() to service_role;
