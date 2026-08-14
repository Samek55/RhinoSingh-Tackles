-- Staff-recorded deal terms (RocketSingh has no equivalent column yet) —
-- Zoho sync triggers off this being set.
alter table public.booking add column if not exists deal_amount numeric;
alter table public.booking add column if not exists deal_note text;

-- Zoho sync bookkeeping, ported 1:1 from HomeSewa's schema. Internal/admin-only
-- — revoked from anon/authenticated select, same pattern as deal_amount.
alter table public.booking add column if not exists zoho_invoice_id text;
alter table public.booking add column if not exists zoho_customer_id text;
alter table public.booking add column if not exists zoho_sync_status text;
alter table public.booking add column if not exists zoho_sync_error text;
alter table public.booking add column if not exists zoho_synced_at timestamptz;

revoke select (deal_amount, deal_note, zoho_invoice_id, zoho_customer_id, zoho_sync_status, zoho_sync_error, zoho_synced_at)
  on public.booking from anon, authenticated;

-- Atomic claim so a duplicate webhook delivery or a double-tapped "Retry Sync"
-- can't create two Zoho invoices for the same booking. RocketSingh's booking
-- PK is `bookingid` (not `booking_id` like HomeSewa's), adjusted accordingly.
create or replace function public.claim_zoho_sync(p_booking_id integer)
returns boolean
language sql
security definer
set search_path = public
as $$
  update booking
     set zoho_sync_status = 'syncing'
   where bookingid = p_booking_id
     and zoho_invoice_id is null
     and zoho_sync_status is distinct from 'syncing'
  returning true;
$$;

revoke all on function public.claim_zoho_sync(integer) from public;
grant execute on function public.claim_zoho_sync(integer) to service_role;
