-- Closes the gap the customers/blocked_customers migration (20260813000002)
-- self-documented and deliberately deferred: "a blocked customer can still
-- currently submit a new booking." A BEFORE INSERT trigger enforces it at
-- the database level regardless of insertion path (the client currently
-- inserts directly, not through an RPC), matching this codebase's own
-- recurring lesson that a client-side-only check is not real enforcement.
--
-- booking.phone and blocked_customers.phone are both already normalized to
-- bare 10-digit form (confirmed: BookingDetail.tsx validates/stores
-- `cleanNumber`, toggle-customer-block stores via cleanPhone()) — no
-- normalization needed in the comparison itself.
create or replace function public.reject_blocked_customer_booking()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (select 1 from blocked_customers where phone = new.phone) then
    raise exception 'This phone number is not eligible to submit a booking. Please contact support if you believe this is a mistake.'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_reject_blocked_customer_booking on public.booking;
create trigger trg_reject_blocked_customer_booking
  before insert on public.booking
  for each row
  execute function public.reject_blocked_customer_booking();
