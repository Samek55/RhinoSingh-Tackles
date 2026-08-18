-- customers_update_all was `using (true) with check (true)` — despite its own
-- comment claiming "anon can upsert its own customer row," it actually let any
-- anon/authenticated caller overwrite ANY customer's row (any phone), not just
-- the one tied to a booking they submitted. Replaces direct insert/update
-- access with a narrow SECURITY DEFINER upsert RPC, matching this codebase's
-- existing claim_zoho_sync/claim_booking_status pattern — the client can only
-- ever upsert exactly (phone, full_name), never touch another row's identity
-- or any other column, and can't run an arbitrary UPDATE at all anymore.
create or replace function public.upsert_customer(p_phone text, p_full_name text)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.customers (phone, full_name, last_booking_at)
  values (p_phone, p_full_name, now())
  on conflict (phone) do update
    set full_name = excluded.full_name,
        last_booking_at = now();
$$;

revoke all on function public.upsert_customer(text, text) from public;
grant execute on function public.upsert_customer(text, text) to anon, authenticated, service_role;

drop policy if exists customers_upsert_all on public.customers;
drop policy if exists customers_update_all on public.customers;

-- customers_select_all is untouched — UserManagement's Customers tab still
-- reads directly, same as before.
