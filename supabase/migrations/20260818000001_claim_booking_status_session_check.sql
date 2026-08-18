-- claim_booking_status was security definer, granted to anon/authenticated,
-- with no caller-identity check at all inside it — only a from-status compare
-- guarding the write. Anyone holding the app's public anon key could call it
-- directly (supabase.rpc bypasses the calling screen's own useRequireRole
-- client gate entirely) and forge any booking's status transition — including
-- marking a job "Completed" without ever going through WorkCompletionOTP's
-- OTP verification. Adds a real server-side check: the caller must present a
-- live, unexpired admin_sessions token (only staff ever complete/cancel a
-- booking through this RPC — WorkCompletionOTP.tsx is its only caller).
create or replace function public.claim_booking_status(
  p_booking_id integer,
  p_from_status text,
  p_to_status text,
  p_extra jsonb default '{}'::jsonb,
  p_session_token text default null
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_count int;
  valid_session boolean;
begin
  select exists(
    select 1 from admin_sessions
     where token = p_session_token
       and expires_at > now()
  ) into valid_session;

  if not valid_session then
    raise exception 'Invalid or expired session' using errcode = '28000';
  end if;

  update booking
     set status = p_to_status,
         completion_photos = coalesce(p_extra->>'completion_photos', completion_photos)
   where bookingid = p_booking_id
     and status = p_from_status;

  get diagnostics updated_count = row_count;
  return updated_count > 0;
end;
$$;

revoke all on function public.claim_booking_status(integer, text, text, jsonb, text) from public;
grant execute on function public.claim_booking_status(integer, text, text, jsonb, text) to anon, authenticated, service_role;

-- Drop the old 4-arg overload — Postgres treats a different argument list as
-- a distinct function, so the unprotected version would otherwise remain
-- callable side-by-side with the new one.
drop function if exists public.claim_booking_status(integer, text, text, jsonb);
