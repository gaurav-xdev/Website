-- ==============================================================================
-- OSMOO Migration: 20261013010000_production_remediation.sql
-- Description:
-- 1. Enhance payment_events table with state transitions (pending, processing,
--    processed, failed), retry counts, and audit timestamps.
-- 2. Secure get_effective_user_entitlements(target_user_id) with strict
--    authorization checks (authenticated callers can only query their own uid;
--    service_role may query any user). Set search_path = public, auth.
-- 3. Lock down administrative functions (assign_founding_50_rewards,
--    expire_stale_founding_grants): revoke execute from public/anon/authenticated,
--    grant only to service_role.
-- 4. Automatic Founding 50 account linking: upgrade handle_new_user() trigger
--    to automatically link verified Founding 50 early access signups upon account
--    registration.
-- 5. Add public.link_founding_50_account(target_user_id) RPC for idempotent
--    linking of existing accounts.
-- ==============================================================================

-- 1. Enhance payment_events table
alter table public.payment_events
  add column if not exists retry_count integer not null default 0,
  add column if not exists last_error text,
  add column if not exists updated_at timestamptz not null default timezone('utc'::text, now());

create index if not exists payment_events_status_idx on public.payment_events(status);
create index if not exists payment_events_event_id_status_idx on public.payment_events(event_id, status);

-- 2. Secure get_effective_user_entitlements
create or replace function public.get_effective_user_entitlements(target_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
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
  -- Authorization check:
  -- Authenticated users are strictly forbidden from querying entitlements of other accounts.
  -- service_role / superuser (where auth.role() != 'authenticated') can query any user.
  if auth.role() = 'authenticated' and (auth.uid() is null or auth.uid() <> target_user_id) then
    raise exception 'Access denied: cannot query entitlements of another user' using errcode = '42501';
  end if;

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
    -- If no paid sub or if founding active, record details
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

-- Explicitly revoke from public and anon; grant strictly to authenticated and service_role
revoke execute on function public.get_effective_user_entitlements(uuid) from public, anon;
grant execute on function public.get_effective_user_entitlements(uuid) to authenticated, service_role;


-- 3. Lock down administrative functions
revoke execute on function public.assign_founding_50_rewards() from public, anon, authenticated;
grant execute on function public.assign_founding_50_rewards() to service_role;

revoke execute on function public.expire_stale_founding_grants() from public, anon, authenticated;
grant execute on function public.expire_stale_founding_grants() to service_role;


-- 4. Automatic Founding 50 account linking in auth trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  waitlist_rec record;
  grant_now timestamptz;
  grant_expiry timestamptz;
begin
  -- 1. Create default profile
  insert into public.profiles (id, display_name, created_at, updated_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    now(),
    now()
  )
  on conflict (id) do nothing;

  -- 2. Link Founding 50 entitlement if user's email was verified on waitlist
  if new.email is not null then
    select id, is_founding_50, is_verified, founding_50_granted_at
    into waitlist_rec
    from public.early_access_requests
    where lower(email) = lower(new.email)
      and is_verified = true
      and is_founding_50 = true
    order by created_at asc
    limit 1;

    if found then
      grant_now := coalesce(waitlist_rec.founding_50_granted_at, timezone('utc'::text, now()));
      grant_expiry := grant_now + interval '12 months';

      -- Only grant active entitlement if within 12-month window
      if grant_expiry > timezone('utc'::text, now()) then
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
          new.id,
          waitlist_rec.id,
          'founding_50',
          'pro',
          'active',
          grant_now,
          grant_expiry,
          jsonb_build_object(
            'waitlist_email', new.email,
            'linked_at', timezone('utc'::text, now())
          )
        )
        on conflict (user_id) do nothing;

        -- Activate Pro feature entitlements
        insert into public.entitlements (user_id, feature_key, is_enabled)
        values
          (new.id, 'local_neural_companion', true),
          (new.id, 'priority_inference', true),
          (new.id, 'continuous_context', true)
        on conflict (user_id, feature_key)
        do update set is_enabled = true, updated_at = timezone('utc'::text, now());
      end if;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- 5. Standalone RPC to link Founding 50 account for existing users
create or replace function public.link_founding_50_account(target_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  u_email text;
  waitlist_rec record;
  grant_now timestamptz;
  grant_expiry timestamptz;
  now_utc timestamptz := timezone('utc'::text, now());
begin
  -- Security check: callers must be service_role or the user themselves
  if auth.role() = 'authenticated' and (auth.uid() is null or auth.uid() <> target_user_id) then
    raise exception 'Access denied: cannot link account for another user' using errcode = '42501';
  end if;

  -- Fetch user email from auth.users
  select email into u_email
  from auth.users
  where id = target_user_id;

  if u_email is null then
    return jsonb_build_object('success', false, 'status', 'user_not_found');
  end if;

  -- Check if already actively linked
  if exists (
    select 1 from public.founding_entitlements
    where user_id = target_user_id
      and status = 'active'
      and expires_at > now_utc
  ) then
    return jsonb_build_object('success', true, 'status', 'already_linked');
  end if;

  -- Look up verified Founding 50 waitlist request
  select id, is_founding_50, is_verified, founding_50_granted_at
  into waitlist_rec
  from public.early_access_requests
  where lower(email) = lower(u_email)
    and is_verified = true
    and is_founding_50 = true
  order by created_at asc
  limit 1;

  if not found then
    return jsonb_build_object('success', false, 'status', 'not_founding_member');
  end if;

  grant_now := coalesce(waitlist_rec.founding_50_granted_at, now_utc);
  grant_expiry := grant_now + interval '12 months';

  if grant_expiry <= now_utc then
    return jsonb_build_object('success', false, 'status', 'expired');
  end if;

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
    target_user_id,
    waitlist_rec.id,
    'founding_50',
    'pro',
    'active',
    grant_now,
    grant_expiry,
    jsonb_build_object('waitlist_email', u_email, 'linked_at', now_utc)
  )
  on conflict (user_id) do update
  set status = 'active',
      expires_at = grant_expiry,
      updated_at = now_utc;

  insert into public.entitlements (user_id, feature_key, is_enabled)
  values
    (target_user_id, 'local_neural_companion', true),
    (target_user_id, 'priority_inference', true),
    (target_user_id, 'continuous_context', true)
  on conflict (user_id, feature_key)
  do update set is_enabled = true, updated_at = now_utc;

  return jsonb_build_object(
    'success', true,
    'status', 'linked',
    'expires_at', grant_expiry
  );
end;
$$;

revoke execute on function public.link_founding_50_account(uuid) from public, anon;
grant execute on function public.link_founding_50_account(uuid) to authenticated, service_role;
