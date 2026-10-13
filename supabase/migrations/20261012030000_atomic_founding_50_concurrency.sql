-- Migration: 20261012030000_atomic_founding_50_concurrency.sql
-- Description: Implement deterministic, concurrency-safe advisory locking and row locking
-- to strictly guarantee that no more than 50 Founding 50 memberships can EVER be allocated,
-- even under high concurrent load or simultaneous transaction execution.

-- Dedicated unique transaction/advisory lock constant for Founding 50 allocation
-- Hash of 'osmoo_founding_50_lock' -> 4294967050
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
begin
  -- 1. Acquire transaction-level advisory xact lock to serialize concurrent executions of this allocation
  perform pg_advisory_xact_lock(hashtext('osmoo_founding_50_allocation_mutex'));

  -- 2. Count already confirmed founding 50 members under serialized protection
  select count(*) into current_count
  from public.early_access_requests
  where is_founding_50 = true;

  if current_count < max_founding_count then
    remaining_slots := max_founding_count - current_count;

    -- 3. Lock candidate rows with FOR UPDATE to prevent concurrent modification,
    -- ordering deterministically by verified_at asc, created_at asc
    update public.early_access_requests
    set is_founding_50 = true,
        founding_50_granted_at = timezone('utc'::text, now())
    where id in (
      select id from public.early_access_requests
      where is_verified = true and is_founding_50 = false
      order by coalesce(verified_at, created_at) asc
      limit remaining_slots
      for update skip locked
    );
  end if;
end;
$$;

-- Atomic verification procedure with synchronized row-level locking
create or replace function public.verify_early_access_token(
  target_token_hash text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  target_record public.early_access_requests%rowtype;
  now_utc timestamptz := timezone('utc'::text, now());
begin
  if target_token_hash is null or length(target_token_hash) < 32 then
    return jsonb_build_object(
      'success', false,
      'status', 'invalid',
      'error', 'Invalid verification token format'
    );
  end if;

  -- 1. Find and lock the target record FOR UPDATE to prevent race conditions on the same token
  select * into target_record
  from public.early_access_requests
  where verification_token_hash = target_token_hash
  for update;

  if not found then
    return jsonb_build_object(
      'success', false,
      'status', 'invalid',
      'error', 'Verification link is invalid or has already been used'
    );
  end if;

  -- 2. Check if already verified
  if target_record.is_verified = true then
    return jsonb_build_object(
      'success', true,
      'status', 'already_verified',
      'email', target_record.email,
      'is_founding_50', target_record.is_founding_50,
      'message', 'Email address has already been verified'
    );
  end if;

  -- 3. Check if expired
  if target_record.verification_token_expires_at is not null and target_record.verification_token_expires_at < now_utc then
    return jsonb_build_object(
      'success', false,
      'status', 'expired',
      'email', target_record.email,
      'error', 'Verification link has expired. Please request a new one.'
    );
  end if;

  -- 4. Mark as verified, clear single-use token hash
  update public.early_access_requests
  set is_verified = true,
      verified_at = now_utc,
      verification_token_hash = null,
      verification_token_expires_at = null,
      status = 'verified'
  where id = target_record.id;

  -- 5. Trigger serialized atomic Founding 50 allocation
  perform public.assign_founding_50_rewards();

  -- 6. Re-query to get updated founding 50 status
  select * into target_record
  from public.early_access_requests
  where id = target_record.id;

  return jsonb_build_object(
    'success', true,
    'status', 'verified',
    'email', target_record.email,
    'first_name', target_record.first_name,
    'is_founding_50', target_record.is_founding_50,
    'message', 'Your email has been verified successfully!'
  );
end;
$$;
