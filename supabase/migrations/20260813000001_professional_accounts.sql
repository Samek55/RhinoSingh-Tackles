-- Professional accounts: phone+PIN login for Nepal professionals, entirely
-- separate from RocketSingh's existing Firebase staff auth (career/admin/
-- superadmin). Linked back to the workforce application row via workforce_uin.
create table if not exists public.professional (
  id bigint generated always as identity primary key,
  full_name text not null,
  phone text not null unique,
  pin_hash text,
  status text not null default 'Pending',
  failed_attempts int not null default 0,
  locked_until timestamptz,
  workforce_uin integer references public.workforce (uin),
  created_at timestamptz not null default now()
);

-- RLS on, no anon policies at all — every read/write to this table goes
-- through a service-role edge function (professional-login, set-pin,
-- approve/reject-professional, toggle-professional-status).
alter table public.professional enable row level security;

-- Session tokens for logged-in professionals — RocketSingh's equivalent of a
-- Firebase session, but scoped to professionals since they have no Firebase
-- account. A bearer token issued by professional-login, checked by every
-- other professional-facing edge function (set-pin, khalti functions, etc.).
create table if not exists public.professional_sessions (
  token uuid primary key default gen_random_uuid(),
  phone text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists professional_sessions_phone_idx
  on public.professional_sessions (phone);

alter table public.professional_sessions enable row level security;

-- Generic atomic "record a failed login attempt, lock out past a threshold"
-- helper — used by professional-login (and reusable for any future
-- phone+PIN-style table). Single UPDATE statement is inherently atomic, so
-- concurrent failed attempts from the same account can't under-count.
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
  if p_table not in ('professional') then
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

revoke all on function public.record_login_attempt_failure(text, bigint, int, int) from public;
grant execute on function public.record_login_attempt_failure(text, bigint, int, int) to service_role;

-- Atomic "verify this OTP attempt" counter — single UPDATE...RETURNING so
-- concurrent verify calls against the same code can't race past the 5-try cap.
create or replace function public.increment_otp_attempts(p_id bigint)
returns int
language sql
security definer
set search_path = public
as $$
  update public.otp_codes set attempts = attempts + 1 where id = p_id returning attempts;
$$;

revoke all on function public.increment_otp_attempts(bigint) from public;
grant execute on function public.increment_otp_attempts(bigint) to service_role;
