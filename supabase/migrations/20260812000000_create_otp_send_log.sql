-- Backs the send-otp edge function's per-phone rate limit. RLS is enabled with
-- no policies, so only the service-role key (used inside the edge function)
-- can read/write this table — anon/authenticated clients have no access.
create table if not exists public.otp_send_log (
  id bigint generated always as identity primary key,
  phone text not null,
  sent_at timestamptz not null default now()
);

create index if not exists otp_send_log_phone_sent_at_idx
  on public.otp_send_log (phone, sent_at);

alter table public.otp_send_log enable row level security;
