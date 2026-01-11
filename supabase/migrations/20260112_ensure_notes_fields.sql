-- Ensure notes column exists in invoices
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'invoices' and column_name = 'notes') then
    alter table public.invoices add column notes text;
  end if;
end $$;

-- Ensure settings column exists in tenants
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'tenants' and column_name = 'settings') then
    alter table public.tenants add column settings jsonb default '{}'::jsonb;
  end if;
end $$;
