-- 20260818000001 compared admin_sessions.token (uuid) against p_session_token
-- (text) with no cast, so every call — valid token or not — errored out with
-- "operator does not exist: uuid = text" instead of either succeeding or
-- cleanly rejecting. Caught by a live probe against the deployed function
-- immediately after that migration went out, before any real booking
-- completion hit it. Casts explicitly, and treats a null or malformed
-- (non-UUID) token as "not a valid session" rather than letting the cast
-- itself throw an uncaught exception.
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
  valid_session boolean := false;
begin
  begin
    select exists(
      select 1 from admin_sessions
       where token = p_session_token::uuid
         and expires_at > now()
    ) into valid_session;
  exception when invalid_text_representation then
    valid_session := false;
  end;

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
