-- Server-verified OTPs for purposes where client-side comparison isn't enough
-- (pin-reset, work-completion). Backs the new verify-otp edge function.
-- RLS is enabled with no policies, so only the service-role key (used inside
-- send-otp/verify-otp) can read/write this table — same convention as
-- otp_send_log.
create table if not exists public.otp_codes (
  id bigint generated always as identity primary key,
  phone text not null,
  purpose text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists otp_codes_phone_purpose_idx
  on public.otp_codes (phone, purpose);

alter table public.otp_codes enable row level security;
