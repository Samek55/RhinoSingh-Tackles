-- Atomic compare-and-swap for booking.status, keyed on the real primary key
-- (bookingid). updateBookingStatusSB.ts today does a plain unconditional
-- update, which would let a double-submitted WorkCompletionOTP confirmation
-- fire notifyJobCompleted twice — this makes the update conditional on the
-- expected current status so only the first caller wins.
create or replace function public.claim_booking_status(
  p_booking_id integer,
  p_from_status text,
  p_to_status text,
  p_extra jsonb default '{}'::jsonb
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_count int;
begin
  update booking
     set status = p_to_status,
         completion_photos = coalesce(p_extra->>'completion_photos', completion_photos)
   where bookingid = p_booking_id
     and status = p_from_status;

  get diagnostics updated_count = row_count;
  return updated_count > 0;
end;
$$;

revoke all on function public.claim_booking_status(integer, text, text, jsonb) from public;
grant execute on function public.claim_booking_status(integer, text, text, jsonb) to anon, authenticated, service_role;
