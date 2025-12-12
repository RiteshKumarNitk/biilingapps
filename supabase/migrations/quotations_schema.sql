
-- --------------------------------------------------------------------------------
-- 10. QUOTATIONS / ESTIMATES
-- --------------------------------------------------------------------------------

create table if not exists public.quotations (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references public.tenants on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  quotation_number text not null,
  date date default CURRENT_DATE not null,
  valid_until date,
  party_id uuid references public.parties on delete set null,
  party_name text,
  status text check (status in ('draft', 'sent', 'accepted', 'rejected', 'converted')) default 'draft',
  
  subtotal numeric(12, 2) default 0,
  total_gst numeric(12, 2) default 0,
  discount_amount numeric(12, 2) default 0,
  grand_total numeric(12, 2) default 0,
  
  notes text,
  unique(tenant_id, quotation_number)
);

create index if not exists idx_quotations_tenant on public.quotations(tenant_id);

create table if not exists public.quotation_items (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references public.tenants on delete cascade not null,
  quotation_id uuid references public.quotations on delete cascade not null,
  product_id uuid references public.products on delete set null,
  
  description text not null,
  quantity numeric(10, 2) not null,
  unit_price numeric(10, 2) not null,
  gst_rate numeric(5, 2) default 0,
  tax_amount numeric(10, 2) default 0,
  total_amount numeric(10, 2) not null
);

create index if not exists idx_quotation_items_tenant on public.quotation_items(tenant_id);

-- RLS Policies
alter table public.quotations enable row level security;
alter table public.quotation_items enable row level security;

do $$ begin
  drop policy if exists "Tenant isolation for quotations" on public.quotations;
  drop policy if exists "Tenant isolation for quotation_items" on public.quotation_items;
end $$;

create policy "Tenant isolation for quotations" on public.quotations
  for all using (tenant_id = get_my_tenant_id());

create policy "Tenant isolation for quotation_items" on public.quotation_items
  for all using (tenant_id = get_my_tenant_id());
