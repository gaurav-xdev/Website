-- Migration: 20261012020000_secure_email_verification.sql
-- Description: Add single-use verification token hash, token expiration,
-- and resend tracking columns for early_access_requests.

-- Add verification_token_hash (SHA-256 hex string)
alter table if exists public.early_access_requests
  add column if not exists verification_token_hash text;

-- Add verification_token_expires_at
alter table if exists public.early_access_requests
  add column if not exists verification_token_expires_at timestamptz;

-- Add verification_sent_at (to enforce resend cooldowns)
alter table if exists public.early_access_requests
  add column if not exists verification_sent_at timestamptz;

-- Index token hash for fast, unique lookup
create index if not exists early_access_token_hash_idx
  on public.early_access_requests (verification_token_hash)
  where verification_token_hash is not null;

-- Atomic verification function: validates token hash, checks expiry, marks verified,
-- clears token hash, and automatically triggers Founding 50 election.
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

  -- Find the record matching this hash
  select * into target_record
  from public.early_access_requests
  where verification_token_hash = target_token_hash;

  if not found then
    return jsonb_build_object(
      'success', false,
      'status', 'invalid',
      'error', 'Verification link is invalid or has already been used'
    );
  end if;

  -- Check if already verified
  if target_record.is_verified = true then
    return jsonb_build_object(
      'success', true,
      'status', 'already_verified',
      'email', target_record.email,
      'is_founding_50', target_record.is_founding_50,
      'message', 'Email address has already been verified'
    );
  end if;

  -- Check if expired
  if target_record.verification_token_expires_at is not null and target_record.verification_token_expires_at < now_utc then
    return jsonb_build_object(
      'success', false,
      'status', 'expired',
      'email', target_record.email,
      'error', 'Verification link has expired. Please request a new one.'
    );
  end if;

  -- Mark as verified, clear single-use token hash
  update public.early_access_requests
  set is_verified = true,
      verified_at = now_utc,
      verification_token_hash = null,
      verification_token_expires_at = null,
      status = 'verified'
  where id = target_record.id;

  -- Trigger Founding 50 quota evaluation
  perform public.assign_founding_50_rewards();

  -- Re-query to get updated founding 50 status
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
