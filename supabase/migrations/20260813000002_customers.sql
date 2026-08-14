-- Customer directory + block list for UserManagement's Customers tab.
-- RocketSingh has no existing customer-identity table (only booking rows) —
-- this is upserted from booking.full_name/phone whenever a booking is
-- created (see createBookingSupabase.ts), so it stays in sync going forward
-- without needing a backfill of historical bookings.
create table if not exists public.customers (
  phone text primary key,
  full_name text,
  first_seen_at timestamptz not null default now(),
  last_booking_at timestamptz not null default now()
);

alter table public.customers enable row level security;

-- Anon can upsert its own customer row at booking-creation time (same trust
-- level as inserting the booking itself), but blocking/unblocking only
-- happens through the superadmin-gated toggle-customer-block edge function.
create policy customers_upsert_all on public.customers
  for insert to anon, authenticated
  with check (true);

create policy customers_update_all on public.customers
  for update to anon, authenticated
  using (true)
  with check (true);

create policy customers_select_all on public.customers
  for select to anon, authenticated
  using (true);

create table if not exists public.blocked_customers (
  phone text primary key,
  blocked_at timestamptz not null default now(),
  blocked_by text
);

-- RLS on, no anon policies — only the toggle-customer-block edge function
-- (service role) can read/write this table. Note: this records block status
-- for UserManagement's UI only — the booking-submission flow does not yet
-- check this table, so a blocked customer can still currently submit a new
-- booking. Wiring an actual booking-time block check is a separate task.
alter table public.blocked_customers enable row level security;
