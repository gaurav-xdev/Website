-- ==============================================================================
-- OSMOO Production Database Schema & Row-Level Security (RLS) Policies
-- Migration: 20261012000000_init_osmoo_schema.sql
-- ==============================================================================

-- 1. Profiles Table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

comment on table public.profiles is 'User profile records associated with Supabase auth users.';

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies for profiles
create policy "Users can view their own profile"
  on public.profiles
  for select
  to authenticated
  using ( (select auth.uid()) = id );

create policy "Users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using ( (select auth.uid()) = id )
  with check ( (select auth.uid()) = id );

create policy "Users can insert their own profile"
  on public.profiles
  for insert
  to authenticated
  with check ( (select auth.uid()) = id );

-- Automatic profile sync trigger on auth.users creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, created_at, updated_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    now(),
    now()
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- 2. Plans Catalog Table
create table if not exists public.plans (
  id text primary key,
  name text not null,
  description text,
  price_cents integer not null default 0,
  currency text not null default 'usd',
  interval text not null default 'month', -- 'month' | 'year' | 'one_time'
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now())
);

comment on table public.plans is 'Authoritative plan catalog for OSMOO tiers (Free, Pro, Max, Enterprise).';

alter table public.plans enable row level security;

-- Plans are publicly readable by everyone
create policy "Anyone can read active plans"
  on public.plans
  for select
  to anon, authenticated
  using ( is_active = true );

-- Restrict plan modifications to service_role (writes denied to regular users)


-- 3. Subscriptions Table
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id text not null references public.plans(id),
  provider text not null default 'dodo_payments', -- 'dodo_payments' | 'manual'
  external_subscription_id text,
  external_customer_id text,
  status text not null default 'active', -- 'active' | 'trialing' | 'past_due' | 'canceled' | 'paused'
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists subscriptions_user_id_idx on public.subscriptions(user_id);
create index if not exists subscriptions_ext_sub_idx on public.subscriptions(external_subscription_id);

alter table public.subscriptions enable row level security;

-- Users can view only their own subscriptions
create policy "Users can view own subscriptions"
  on public.subscriptions
  for select
  to authenticated
  using ( (select auth.uid()) = user_id );

-- Writes strictly restricted to backend service_role operations


-- 4. Entitlements Table
create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  feature_key text not null, -- 'local_neural_companion' | 'priority_inference' | 'full_os_integration' | 'enterprise_support'
  is_enabled boolean not null default true,
  source_subscription_id uuid references public.subscriptions(id) on delete set null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  unique(user_id, feature_key)
);

create index if not exists entitlements_user_id_idx on public.entitlements(user_id);

alter table public.entitlements enable row level security;

-- Users can view only their own entitlements
create policy "Users can view own entitlements"
  on public.entitlements
  for select
  to authenticated
  using ( (select auth.uid()) = user_id );

-- Writes restricted to service_role


-- 5. Payment Events (Idempotency & Audit)
create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'dodo_payments',
  event_id text not null unique,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz not null default timezone('utc'::text, now()),
  status text not null default 'processed', -- 'processed' | 'ignored' | 'failed'
  error_message text
);

create index if not exists payment_events_event_id_idx on public.payment_events(event_id);

alter table public.payment_events enable row level security;
-- No user access policies created: completely unaccessible to anon and authenticated roles.
-- Only server service_role can query or insert payment events.


-- 6. Contact Messages
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  category text not null,
  message text not null,
  ip_hash text,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists contact_messages_email_idx on public.contact_messages(email);

alter table public.contact_messages enable row level security;

-- Public insertion permitted via backend endpoint (or authenticated/anon insert)
create policy "Anyone can insert contact messages"
  on public.contact_messages
  for insert
  to anon, authenticated
  with check ( length(email) > 3 and length(message) > 0 and length(message) <= 5000 );

-- Reading and deletion restricted to service_role


-- 7. Early Access Requests
create table if not exists public.early_access_requests (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text not null default 'website_hero_modal',
  ip_hash text,
  status text not null default 'pending', -- 'pending' | 'invited' | 'revoked'
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists early_access_email_idx on public.early_access_requests(email);

alter table public.early_access_requests enable row level security;

-- Anonymous and authenticated visitors can submit early access email
create policy "Anyone can submit early access request"
  on public.early_access_requests
  for insert
  to anon, authenticated
  with check ( length(email) > 3 and length(email) <= 255 );

-- Reading and modifications restricted to service_role


-- 8. Seed Plans with Authoritative Tiers
insert into public.plans (id, name, description, price_cents, currency, interval, is_active, metadata)
values
  ('free', 'Free', 'Personal AI operating foundation with essential local companion capabilities.', 0, 'usd', 'month', true, '{"max_devices": 1, "tier": "free"}'::jsonb),
  ('pro', 'Pro', 'Full neural capabilities, continuous context engine, and workflow acceleration.', 2400, 'usd', 'month', true, '{"max_devices": 3, "tier": "pro"}'::jsonb),
  ('max', 'Max (Proposed)', 'Advanced multi-model orchestration, unlimited offline compute, and zero latency.', 4900, 'usd', 'month', true, '{"max_devices": 10, "tier": "max", "status": "proposed"}'::jsonb),
  ('enterprise', 'Enterprise', 'Dedicated on-premise neural engine, custom integrations, and SLA.', 0, 'usd', 'month', true, '{"custom": true, "tier": "enterprise"}'::jsonb)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  price_cents = excluded.price_cents,
  interval = excluded.interval,
  is_active = excluded.is_active,
  metadata = excluded.metadata;
