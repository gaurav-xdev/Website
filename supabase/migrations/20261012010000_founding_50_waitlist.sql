-- Migration: 20261012010000_founding_50_waitlist.sql
-- Description: Extend early_access_requests table for Founding 50 waitlist reward tracking,
-- first_name support, verification status, and server-side eligibility.

-- Add first_name column if not exists
alter table if exists public.early_access_requests
  add column if not exists first_name text;

-- Add is_verified flag (defaults to false until email OTP verified)
alter table if exists public.early_access_requests
  add column if not exists is_verified boolean not null default false;

-- Add verified_at timestamp
alter table if exists public.early_access_requests
  add column if not exists verified_at timestamptz;

-- Add is_founding_50 eligibility status
alter table if exists public.early_access_requests
  add column if not exists is_founding_50 boolean not null default false;

-- Add founding_50_granted_at timestamp
alter table if exists public.early_access_requests
  add column if not exists founding_50_granted_at timestamptz;

-- Index for ordering verified signups to determine the first 50
create index if not exists early_access_founding_50_idx
  on public.early_access_requests (is_verified, verified_at asc, created_at asc)
  where is_verified = true;

-- Update RLS insert policy check to accommodate first_name
drop policy if exists "Anyone can submit early access request" on public.early_access_requests;
create policy "Anyone can submit early access request"
  on public.early_access_requests
  for insert
  to anon, authenticated
  with check (
    length(email) > 3 and
    length(email) <= 255 and
    (first_name is null or length(first_name) <= 100)
  );

-- Function to check and assign Founding 50 reward reliably (limit: 50 verified signups)
create or replace function public.assign_founding_50_rewards()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  max_founding_count constant integer := 50;
  current_count integer;
begin
  -- Count already confirmed founding 50 members
  select count(*) into current_count
  from public.early_access_requests
  where is_founding_50 = true;

  if current_count < max_founding_count then
    -- Elect the earliest verified signups up to the remaining cap
    update public.early_access_requests
    set is_founding_50 = true,
        founding_50_granted_at = timezone('utc'::text, now())
    where id in (
      select id from public.early_access_requests
      where is_verified = true and is_founding_50 = false
      order by coalesce(verified_at, created_at) asc
      limit (max_founding_count - current_count)
    );
  end if;
end;
$$;
