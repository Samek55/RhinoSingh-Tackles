-- Records which professional has paid to unlock which booking's contact info.
-- A row's mere existence is the unlock — nothing else on `booking` changes.
create table if not exists public.lead_unlocks (
  id bigint generated always as identity primary key,
  booking_id integer not null,
  professional_phone text not null,
  pidx text not null,
  amount int not null,
  created_at timestamptz not null default now(),
  constraint lead_unlocks_pidx_unique unique (pidx),
  constraint lead_unlocks_booking_professional_unique unique (booking_id, professional_phone)
);

alter table public.lead_unlocks enable row level security;

-- Anon can check unlock status directly (isLeadUnlocked, client-side read) —
-- but only the service role (khalti-confirm-lead-unlock, after verifying a
-- real completed payment) can insert. No anon insert policy at all.
create policy lead_unlocks_select_all on public.lead_unlocks
  for select to anon, authenticated
  using (true);
