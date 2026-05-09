-- Fix "column reference 'status' is ambiguous" (SQLSTATE 42702) in check_in_ticket.
-- Inside a plpgsql RETURNS TABLE function, the OUT names (status, token, holder_name, …)
-- become local variables that shadow same-named table columns. Qualify every column
-- reference with the `t.` alias so Postgres resolves them unambiguously.

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
  select t.status into v_prev from public.tickets t where t.token = p_token;
  if v_prev is null then
    return;
  end if;

  if v_prev = 'activated' then
    update public.tickets t
      set status = 'used',
          used_at = now(),
          checked_in_by = auth.uid()
    where t.token = p_token;
  end if;

  return query
    select t.id, t.token, t.status, v_prev, t.holder_name, t.category, t.used_at
    from public.tickets t where t.token = p_token;
end;
$$;
