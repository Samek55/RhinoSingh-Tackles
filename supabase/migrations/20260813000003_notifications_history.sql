-- Audit log for every push sent via the send-notification edge function.
-- RLS on, no anon policies — only the edge function (service role) writes here.
create table if not exists public.notifications (
  id bigint generated always as identity primary key,
  title text,
  body text,
  screen text,
  link_id text,
  audience text,
  audience_service text,
  audience_city text,
  audience_phone text,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;
