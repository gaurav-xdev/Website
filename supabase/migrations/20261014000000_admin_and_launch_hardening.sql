-- ==============================================================================
-- OSMOO Migration: 20261014000000_admin_and_launch_hardening.sql
-- Description: Non-public administrative authorization, audit logging,
-- contact message status tracking, and strict RLS lockdown.
-- ==============================================================================

-- 1. Contact Messages enhancements for administrative workflow
alter table public.contact_messages
  add column if not exists status text not null default 'unread';

alter table public.contact_messages
  add column if not exists notes text;

alter table public.contact_messages
  add column if not exists updated_at timestamptz not null default timezone('utc'::text, now());

-- Add check constraint for valid contact message states if not present
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'contact_messages_status_check'
  ) then
    alter table public.contact_messages
      add constraint contact_messages_status_check
      check (status in ('unread', 'read', 'resolved'));
  end if;
end;
$$;

create index if not exists contact_messages_status_idx on public.contact_messages(status);
create index if not exists contact_messages_created_at_idx on public.contact_messages(created_at desc);

-- Restrict contact_messages strictly to service_role (prevent public reads/writes)
alter table public.contact_messages enable row level security;
revoke all on public.contact_messages from anon, authenticated, public;
grant all on public.contact_messages to service_role;


-- 2. Dedicated Admin Users Table (Explicit Database-backed Authorization)
create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  email text not null unique,
  role text not null default 'admin' check (role in ('admin', 'superadmin')),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists admin_users_email_idx on public.admin_users(lower(email));
create index if not exists admin_users_user_id_idx on public.admin_users(user_id);

-- Restrict admin_users strictly to service_role (no anon or regular authenticated access)
alter table public.admin_users enable row level security;
revoke all on public.admin_users from anon, authenticated, public;
grant all on public.admin_users to service_role;


-- 3. Dedicated Admin Operational Audit Log
create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_email text not null,
  action text not null,
  target_type text,
  target_id text,
  details jsonb not null default '{}'::jsonb,
  ip_hash text,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists admin_audit_logs_created_at_idx on public.admin_audit_logs(created_at desc);
create index if not exists admin_audit_logs_admin_email_idx on public.admin_audit_logs(lower(admin_email));

-- Restrict admin_audit_logs strictly to service_role
alter table public.admin_audit_logs enable row level security;
revoke all on public.admin_audit_logs from anon, authenticated, public;
grant all on public.admin_audit_logs to service_role;
