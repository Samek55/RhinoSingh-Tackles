-- Staff (career/admin/superadmin) auth: single Postgres source of truth,
-- replacing Firebase Auth + Realtime Database users/{uid}. Entirely separate
-- from public.professional (that's the unrelated marketplace/Lead Fee system).
create extension if not exists pgcrypto;

create table if not exists public.admin (
  id bigint generated always as identity primary key,
  full_name text not null,
  phone text not null unique,
  role text not null check (role in ('career', 'admin', 'superadmin')),
  status text not null default 'Active'
    check (status in ('Pending', 'Active', 'Inactive', 'Rejected')),
  pin_hash text,
  failed_attempts int not null default 0,
  locked_until timestamptz,
  created_at timestamptz not null default now()
);

-- RLS on, zero policies (service-role only) — matches public.professional's
-- convention, not HomeSewa's open-USING(true)-plus-column-revoke pattern,
-- since nothing here is ever written to directly by a client.
alter table public.admin enable row level security;

create table if not exists public.admin_sessions (
  token uuid primary key default gen_random_uuid(),
  phone text not null,
  role text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists admin_sessions_phone_idx on public.admin_sessions (phone);

alter table public.admin_sessions enable row level security;

-- Extend the existing atomic lockout RPC (20260813000001) to the new table.
create or replace function public.record_login_attempt_failure(
  p_table text,
  p_id bigint,
  p_max_attempts int,
  p_lockout_minutes int
) returns table (failed_attempts int, locked_until timestamptz)
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_table not in ('professional', 'admin') then
    raise exception 'record_login_attempt_failure: unsupported table %', p_table;
  end if;

  return query execute format(
    'update %I
       set failed_attempts = failed_attempts + 1,
           locked_until = case
             when failed_attempts + 1 >= $2 then now() + ($3 || '' minutes'')::interval
             else locked_until
           end
     where id = $1
     returning failed_attempts, locked_until',
    p_table
  ) using p_id, p_max_attempts, p_lockout_minutes;
end;
$$;

-- Data migration: existing Firebase staff accounts, role+phone only. No
-- pin_hash — each must use AdminForgotPin.tsx (phone + SMS OTP) before first
-- login. full_name is a placeholder pending real names. Phone 1111111111
-- (test data) is deliberately excluded, not migrated.
insert into public.admin (full_name, phone, role, status) values
  ('Staff 9276389459', '9276389459', 'admin', 'Active'),
  ('Staff 9137652849', '9137652849', 'superadmin', 'Active'),
  ('Staff 9806022233', '9806022233', 'career', 'Active'),
  ('Staff 9808982141', '9808982141', 'career', 'Active'),
  ('Staff 9876543210', '9876543210', 'career', 'Active'),
  ('Staff 9358585679', '9358585679', 'career', 'Active')
on conflict (phone) do nothing;

-- New superadmin seed, per explicit user request. Weak PIN is a deliberate
-- user choice, not an oversight. crypt(..., gen_salt('bf')) produces a
-- standard $2a$/$2b$ bcrypt hash, interoperable with bcryptjs.compareSync
-- server-side.
insert into public.admin (full_name, phone, role, status, pin_hash)
values ('Super Admin', '9852024365', 'superadmin', 'Active', extensions.crypt('111111', extensions.gen_salt('bf')))
on conflict (phone) do nothing;
