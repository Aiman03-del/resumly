create table public.api_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  route text not null,
  usage_date date not null default (timezone('utc', now()))::date,
  count integer not null default 0 check (count >= 0),
  primary key (user_id, route, usage_date)
);

alter table public.api_usage enable row level security;
create policy "Users can read their own API usage"
  on public.api_usage for select to authenticated
  using (auth.uid() = user_id);
grant select on public.api_usage to authenticated;

create table public.credit_balances (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance integer not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now()
);

alter table public.credit_balances enable row level security;
create policy "Users can read their own credit balance"
  on public.credit_balances for select to authenticated
  using (auth.uid() = user_id);
grant select on public.credit_balances to authenticated;

create table public.payments (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('sslcommerz', 'lemonsqueezy')),
  provider_ref text not null,
  pack_id text not null,
  credits integer not null check (credits > 0),
  amount numeric(12, 2) not null check (amount > 0),
  currency text not null check (currency in ('BDT', 'USD')),
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'refunded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_ref)
);

alter table public.payments enable row level security;
create policy "Users can read their own payments"
  on public.payments for select to authenticated
  using (auth.uid() = user_id);
grant select on public.payments to authenticated;

create function public.increment_api_usage(p_route text)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  usage_count integer;
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  if p_route is null or length(p_route) = 0 then
    raise exception 'Route is required' using errcode = '22023';
  end if;

  insert into public.api_usage (user_id, route, usage_date, count)
  values (current_user_id, p_route, (now() at time zone 'utc')::date, 1)
  on conflict (user_id, route, usage_date)
  do update set count = public.api_usage.count + 1
  returning count into usage_count;

  return usage_count;
end;
$$;
revoke all on function public.increment_api_usage(text) from public;
grant execute on function public.increment_api_usage(text) to authenticated;

create function public.consume_credit()
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  update public.credit_balances
  set balance = balance - 1, updated_at = now()
  where user_id = current_user_id and balance > 0;

  return found;
end;
$$;
revoke all on function public.consume_credit() from public;
grant execute on function public.consume_credit() to authenticated;

create function public.grant_credits(
  p_user uuid,
  p_provider text,
  p_ref text,
  p_pack text,
  p_credits integer,
  p_amount numeric,
  p_currency text
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  credited_user uuid;
begin
  if p_user is null or p_provider not in ('sslcommerz', 'lemonsqueezy')
    or p_ref is null or p_pack is null or p_credits <= 0 or p_amount <= 0
    or p_currency not in ('BDT', 'USD') then
    raise exception 'Invalid credit grant' using errcode = '22023';
  end if;

  insert into public.payments (user_id, provider, provider_ref, pack_id, credits, amount, currency, status)
  values (p_user, p_provider, p_ref, p_pack, p_credits, p_amount, p_currency, 'paid')
  on conflict (provider, provider_ref) do update
    set status = 'paid', updated_at = now()
    where public.payments.status = 'pending'
      and public.payments.user_id = excluded.user_id
      and public.payments.pack_id = excluded.pack_id
      and public.payments.credits = excluded.credits
      and public.payments.amount = excluded.amount
      and public.payments.currency = excluded.currency
  returning user_id into credited_user;

  if credited_user is null then
    return false;
  end if;

  insert into public.credit_balances (user_id, balance)
  values (credited_user, p_credits)
  on conflict (user_id) do update
    set balance = public.credit_balances.balance + excluded.balance,
        updated_at = now();

  return true;
end;
$$;
revoke all on function public.grant_credits(uuid, text, text, text, integer, numeric, text) from public, anon, authenticated;
grant execute on function public.grant_credits(uuid, text, text, text, integer, numeric, text) to service_role;

create function public.refund_credits(p_provider text, p_ref text)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  refunded_user uuid;
  refunded_credits integer;
begin
  update public.payments
  set status = 'refunded', updated_at = now()
  where provider = p_provider and provider_ref = p_ref and status = 'paid'
  returning user_id, credits into refunded_user, refunded_credits;

  if refunded_user is null then
    return false;
  end if;

  update public.credit_balances
  set balance = greatest(balance - refunded_credits, 0), updated_at = now()
  where user_id = refunded_user;

  return true;
end;
$$;
revoke all on function public.refund_credits(text, text) from public, anon, authenticated;
grant execute on function public.refund_credits(text, text) to service_role;