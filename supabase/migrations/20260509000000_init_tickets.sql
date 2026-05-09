-- TEDxZhenysPark: tickets schema
-- Tables, RLS, RPCs for issuing, activating and checking in tickets.

create type ticket_status as enum ('issued', 'activated', 'used');

create table public.tickets (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  status ticket_status not null default 'issued',
  category text,
  note text,
  holder_name text,
  holder_contact text,
  issued_by uuid default auth.uid() references auth.users(id) on delete set null,
  checked_in_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  activated_at timestamptz,
  used_at timestamptz
);

create index tickets_token_idx on public.tickets(token);
create index tickets_status_idx on public.tickets(status);

alter table public.tickets enable row level security;

-- Authenticated managers / scanners can do anything on tickets
create policy "auth_full_access" on public.tickets
  for all to authenticated
  using (true) with check (true);

-- ─── Public read by token (used by /t/[token] page) ─────────────────────────
create or replace function public.get_ticket_by_token(p_token text)
returns table(
  id uuid,
  token text,
  status ticket_status,
  holder_name text,
  holder_contact text,
  category text,
  created_at timestamptz,
  activated_at timestamptz,
  used_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select id, token, status, holder_name, holder_contact, category,
         created_at, activated_at, used_at
  from public.tickets
  where token = p_token;
$$;
grant execute on function public.get_ticket_by_token(text) to anon, authenticated;

-- ─── Activation: anon flips issued → activated, sets holder name ────────────
create or replace function public.activate_ticket(
  p_token text,
  p_holder_name text,
  p_holder_contact text default null
)
returns table(
  id uuid,
  token text,
  status ticket_status,
  holder_name text,
  holder_contact text,
  category text,
  activated_at timestamptz,
  used_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.tickets t
    set holder_name = coalesce(t.holder_name, p_holder_name),
        holder_contact = coalesce(t.holder_contact, p_holder_contact),
        status = case when t.status = 'issued' then 'activated' else t.status end,
        activated_at = case when t.status = 'issued' then now() else t.activated_at end
  where t.token = p_token;

  return query
    select t.id, t.token, t.status, t.holder_name, t.holder_contact,
           t.category, t.activated_at, t.used_at
    from public.tickets t
    where t.token = p_token;
end;
$$;
grant execute on function public.activate_ticket(text, text, text) to anon, authenticated;

-- ─── Check-in: authenticated only (volunteers / managers) ───────────────────
create or replace function public.check_in_ticket(p_token text)
returns table(
  id uuid,
  token text,
  status ticket_status,
  prev_status ticket_status,
  holder_name text,
  category text,
  used_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prev ticket_status;
begin
  select status into v_prev from public.tickets where token = p_token;
  if v_prev is null then
    return;
  end if;

  if v_prev = 'activated' then
    update public.tickets
      set status = 'used',
          used_at = now(),
          checked_in_by = auth.uid()
    where token = p_token;
  end if;

  return query
    select t.id, t.token, t.status, v_prev, t.holder_name, t.category, t.used_at
    from public.tickets t where t.token = p_token;
end;
$$;
revoke execute on function public.check_in_ticket(text) from anon;
grant execute on function public.check_in_ticket(text) to authenticated;
