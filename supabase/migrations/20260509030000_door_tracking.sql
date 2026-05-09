-- Per-door check-in tracking + monitor aggregate.
-- Adds tickets.door, expands check_in_ticket to accept the volunteer's selected door,
-- and exposes monitor_stats() for the live dashboard.

alter table public.tickets
  add column if not exists door text;

create index if not exists tickets_door_idx on public.tickets(door);

-- Replace check_in_ticket: drop the old single-arg signature, recreate with
-- optional p_door. Return shape extended with tier/order_no/door so the
-- scanner can show richer success cards.
drop function if exists public.check_in_ticket(text);

create or replace function public.check_in_ticket(
  p_token text,
  p_door text default null
)
returns table(
  id uuid,
  token text,
  status ticket_status,
  prev_status ticket_status,
  holder_name text,
  category text,
  tier text,
  order_no text,
  door text,
  used_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prev ticket_status;
begin
  select t.status into v_prev from public.tickets t where t.token = p_token;
  if v_prev is null then
    return;
  end if;

  if v_prev = 'activated' then
    update public.tickets t
      set status = 'used',
          used_at = now(),
          checked_in_by = auth.uid(),
          door = coalesce(p_door, t.door)
    where t.token = p_token;
  end if;

  return query
    select t.id, t.token, t.status, v_prev,
           t.holder_name, t.category, t.tier, t.order_no, t.door, t.used_at
    from public.tickets t where t.token = p_token;
end;
$$;
revoke execute on function public.check_in_ticket(text, text) from anon;
grant execute on function public.check_in_ticket(text, text) to authenticated;

-- Aggregated counts for the monitor page.
create or replace function public.monitor_stats()
returns table(
  status ticket_status,
  tier text,
  door text,
  cnt bigint
)
language sql
security definer
set search_path = public
as $$
  select t.status, t.tier, t.door, count(*)::bigint as cnt
  from public.tickets t
  group by t.status, t.tier, t.door;
$$;
revoke execute on function public.monitor_stats() from anon;
grant execute on function public.monitor_stats() to authenticated;
