-- Create Sale Orders Table
create table if not exists public.sale_orders (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references public.tenants on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  order_number text not null,
  date date default CURRENT_DATE not null,
  due_date date,
  party_id uuid references public.parties on delete set null,
  party_name text,
  status text check (status in ('open', 'converted', 'overdue', 'cancelled')) default 'open',
  
  subtotal numeric(12, 2) default 0,
  total_gst numeric(12, 2) default 0,
  grand_total numeric(12, 2) default 0,
  
  notes text,
  unique(tenant_id, order_number)
);

create index if not exists idx_sale_orders_tenant on public.sale_orders(tenant_id);

-- Create Sale Order Items Table
create table if not exists public.sale_order_items (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references public.tenants on delete cascade not null,
  sale_order_id uuid references public.sale_orders on delete cascade not null,
  product_id uuid references public.products on delete set null,
  
  description text not null,
  quantity numeric(10, 2) not null,
  unit_price numeric(10, 2) not null,
  gst_rate numeric(5, 2) default 0,
  tax_amount numeric(10, 2) default 0,
  total_amount numeric(10, 2) not null
);

create index if not exists idx_sale_order_items_tenant on public.sale_order_items(tenant_id);

-- Enable RLS
alter table public.sale_orders enable row level security;
alter table public.sale_order_items enable row level security;

-- Policies
create policy "Tenant isolation for sale_orders" on public.sale_orders
  for all using (tenant_id = get_my_tenant_id());

create policy "Tenant isolation for sale_order_items" on public.sale_order_items
  for all using (tenant_id = get_my_tenant_id());
