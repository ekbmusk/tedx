-- Add tier and per-tier order_no to tickets.
-- Sequences are per-tier (PS-001, VIP-001, ST-001).
-- Existing rows get tier=null, order_no=null and stay backwards-compatible.

alter table public.tickets
  add column tier text check (tier in ('pre-sale','vip','standard')),
  add column order_no text;

create unique index tickets_order_no_idx on public.tickets(order_no);

create sequence if not exists tickets_seq_pre_sale;
create sequence if not exists tickets_seq_vip;
create sequence if not exists tickets_seq_standard;

create or replace function public.next_order_no(p_tier text)
returns text
language plpgsql security definer set search_path = public
as $$
declare v_n bigint;
begin
  if auth.uid() is null then
    raise exception 'unauthenticated';
  end if;
  v_n := case p_tier
    when 'pre-sale' then nextval('tickets_seq_pre_sale')
    when 'vip'      then nextval('tickets_seq_vip')
    when 'standard' then nextval('tickets_seq_standard')
    else null
  end;
  if v_n is null then
    raise exception 'invalid tier: %', p_tier;
  end if;
  return case p_tier
    when 'pre-sale' then 'PS-'  || lpad(v_n::text, 3, '0')
    when 'vip'      then 'VIP-' || lpad(v_n::text, 3, '0')
    when 'standard' then 'ST-'  || lpad(v_n::text, 3, '0')
  end;
end;
$$;

revoke all on function public.next_order_no(text) from public;
grant execute on function public.next_order_no(text) to authenticated;

-- Extend get_ticket_by_token to return tier and order_no
create or replace function public.get_ticket_by_token(p_token text)
returns table(
  id uuid,
  token text,
  status ticket_status,
  holder_name text,
  holder_contact text,
  category text,
  tier text,
  order_no text,
  created_at timestamptz,
  activated_at timestamptz,
  used_at timestamptz
)
language sql security definer set search_path = public
as $$
  select id, token, status, holder_name, holder_contact, category, tier, order_no,
         created_at, activated_at, used_at
  from public.tickets
  where token = p_token;
$$;
